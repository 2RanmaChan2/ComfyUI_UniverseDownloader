import os
import re
import sys
import json
import time
import uuid
import math
import asyncio
import logging
import threading
import queue
import shutil
import subprocess
import ipaddress
import atexit
import stat
import socket
import collections
from concurrent.futures import ThreadPoolExecutor
from urllib.parse import urljoin, urlsplit, urlunsplit
from io import BytesIO
import requests
from PIL import Image
from aiohttp import web
import folder_paths

def validate_download_url(url):
    parsed = urlsplit(url)
    if parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password:
        raise ValueError("Solo se admiten enlaces HTTPS públicos")
    try:
        addresses = socket.getaddrinfo(parsed.hostname, parsed.port or 443, type=socket.SOCK_STREAM)
    except socket.gaierror as e:
        raise ValueError(f"No se pudo resolver el servidor de descarga: {e}") from e
    if not addresses or any(not ipaddress.ip_address(item[4][0]).is_global for item in addresses):
        raise ValueError("No se permiten direcciones de red privadas o locales")
    return parsed

def _strip_token_from_query(url):
    """Remove api keys from a URL query string (used when redirecting off-domain)."""
    parsed = urlsplit(url)
    if not parsed.query:
        return url
    kept = [
        part for part in parsed.query.split("&")
        if part and not part.split("=", 1)[0].lower() in ("token", "api_key", "apikey", "access_token")
    ]
    return urlunsplit((parsed.scheme, parsed.netloc, parsed.path, "&".join(kept), parsed.fragment))

def request_public_url(method, url, **kwargs):
    current_kwargs = dict(kwargs)
    original_host = urlsplit(url).hostname
    for _ in range(6):
        validate_download_url(url)
        response = requests.request(method, url, allow_redirects=False, **current_kwargs)
        if response.status_code not in (301, 302, 303, 307, 308):
            return response
        location = response.headers.get("Location")
        response.close()
        if not location:
            raise ValueError("Redirección de descarga sin destino")
        new_url = urljoin(url, location)
        new_host = urlsplit(new_url).hostname
        # If redirecting across domains or to storage buckets (AWS S3, CloudFront, R2),
        # strip Authorization header to prevent S3 400 Bad Request and credential leakage
        if new_host != original_host or any(cdn in (new_host or "").lower() for cdn in ["amazonaws.com", "cloudfront.net", "r2.cloudflarestorage.com"]):
            if "headers" in current_kwargs and current_kwargs["headers"]:
                headers_copy = dict(current_kwargs["headers"])
                headers_copy.pop("Authorization", None)
                headers_copy.pop("authorization", None)
                current_kwargs["headers"] = headers_copy
            # Also drop any token carried in the query string so credentials are
            # never forwarded to a CDN or a cross-domain host.
            new_url = _strip_token_from_query(new_url)
        url = new_url
    raise ValueError("Demasiadas redirecciones de descarga")

# Self-contained cache, preview and artifact helpers for Universe Downloader
MODELS_CACHE = {}
CACHE_LOCK = threading.RLock()
CACHE_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data", "models_cache.json")
MODEL_EXTS = {".safetensors", ".ckpt", ".pt", ".pth", ".bin", ".gguf"}
IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp"}
PREVIEW_EXECUTOR = ThreadPoolExecutor(max_workers=2)

def normalize_path(p):
    return os.path.normcase(os.path.abspath(p))

def load_cache():
    global MODELS_CACHE
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r", encoding="utf-8") as f:
                with CACHE_LOCK:
                    MODELS_CACHE = json.load(f)
        except Exception:
            with CACHE_LOCK:
                MODELS_CACHE = {}

def save_cache():
    with CACHE_LOCK:
        cache_copy = MODELS_CACHE.copy()
    safe_atomic_json_write(CACHE_FILE, cache_copy, indent=2, ensure_ascii=False)

def is_civitai_video_item(img_item):
    if not img_item:
        return False
    if isinstance(img_item, dict):
        url = img_item.get("url") or img_item.get("imageUrl") or img_item.get("src") or ""
        img_type = str(img_item.get("type", "")).lower()
        if "video" in img_type or img_type in ("mp4", "webm", "mov"):
            return True
        meta = img_item.get("metadata")
        if isinstance(meta, dict):
            if str(meta.get("format", "")).lower() in ("mp4", "webm", "video", "mov"):
                return True
            if meta.get("duration") or meta.get("hasSound") is not None or meta.get("audio"):
                return True
    elif isinstance(img_item, str):
        url = img_item
    else:
        return False
    if not url:
        return False
    clean_url = url.split("?")[0].lower()
    if any(clean_url.endswith(ext) for ext in (".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv", ".m4v")):
        return True
    if "/transcode=true" in url.lower() or "transcode=true" in url.lower():
        return True
    if "format=mp4" in url.lower() or "format=webm" in url.lower():
        return True
    return False

def extract_best_civitai_image(images_list):
    if not images_list or not isinstance(images_list, list):
        return ""
    def thumbnail_url(url):
        return url.replace("original=true", "width=450") if isinstance(url, str) else ""

    for item in images_list:
        if isinstance(item, dict):
            if not is_civitai_video_item(item):
                u = item.get("url") or item.get("imageUrl") or ""
                if u:
                    return thumbnail_url(u)
        elif isinstance(item, str) and item:
            if not is_civitai_video_item(item):
                return thumbnail_url(item)
    for item in images_list:
        if isinstance(item, dict):
            thumb = item.get("thumbnailUrl") or item.get("previewUrl") or item.get("poster")
            if thumb and not is_civitai_video_item(thumb):
                return thumbnail_url(thumb)
    return ""

def download_civitai_image(url, target_path):
    if not url:
        return False
    target_dir = os.path.dirname(target_path)
    if target_dir:
        os.makedirs(target_dir, exist_ok=True)
    clean_u = url.split("?")[0].lower()
    if any(clean_u.endswith(ext) for ext in (".mp4", ".webm", ".mov", ".mkv", ".avi", ".flv", ".wmv")):
        return False
    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Referer": "https://civitai.com/",
    }
    tmp_p = None
    for attempt in range(3):
        try:
            res = request_public_url("GET", url, headers=headers, timeout=15)
            if res.status_code == 200:
                if b"ftyp" in res.content[:32] or res.content.startswith(b"\x1aE\xdf\xa3") or "video" in res.headers.get("Content-Type", "").lower():
                    return False
                tmp_p = f"{target_path}.tmp_{os.getpid()}_{threading.get_ident()}_{time.time_ns()}"
                try:
                    pil_img = Image.open(BytesIO(res.content))
                    if pil_img.mode not in ("RGB", "RGBA"):
                        pil_img = pil_img.convert("RGB")
                    pil_img.save(tmp_p, format="PNG")
                except Exception:
                    return False
                if os.path.exists(tmp_p):
                    os.replace(tmp_p, target_path)
                    return True
            elif res.status_code in (429, 502, 503, 504):
                time.sleep(1.0 * (attempt + 1))
        except Exception:
            time.sleep(0.5)
        finally:
            if tmp_p and os.path.exists(tmp_p):
                try:
                    os.remove(tmp_p)
                except OSError:
                    pass
    return False

def cleanup_model_artifacts(full_path):
    try:
        target = os.path.abspath(os.path.normpath(full_path))
        root, filename = os.path.split(target)
        name, ext = os.path.splitext(filename)
        if os.path.exists(target) or ext.lower() not in MODEL_EXTS:
            return False
        sidecars = [
            os.path.join(root, f"{name}.civitai.info"),
            os.path.join(root, f"{filename}.civitai.info"),
            os.path.join(root, f"{name}.rgthree-info.json"),
            os.path.join(root, f"{filename}.rgthree-info.json"),
            os.path.join(root, f"{name}.metadata.json"),
            os.path.join(root, f"{filename}.metadata.json"),
        ]
        for img_ext in IMAGE_EXTS:
            sidecars.extend([
                os.path.join(root, f"{name}{img_ext}"),
                os.path.join(root, f"{name}.preview{img_ext}"),
                os.path.join(root, f"{filename}{img_ext}"),
                os.path.join(root, f"{filename}.preview{img_ext}")
            ])
        for sidecar in dict.fromkeys(sidecars):
            try:
                if not os.path.islink(sidecar):
                    try:
                        cur_m = os.stat(sidecar).st_mode
                        os.chmod(sidecar, cur_m | stat.S_IWUSR | stat.S_IRUSR)
                    except Exception:
                        pass
                os.remove(sidecar)
            except OSError:
                pass
        norm_key = normalize_path(target)
        with CACHE_LOCK:
            if norm_key in MODELS_CACHE:
                del MODELS_CACHE[norm_key]
                save_cache()
        return True
    except Exception:
        return False

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BIN_DIR = os.path.join(BASE_DIR, "bin")

# Active Aria2 processes registry for clean termination on exit / crash
ACTIVE_ARIA2_PROCS = set()
ARIA2_PROCS_LOCK = threading.Lock()

def cleanup_aria2_processes():
    with ARIA2_PROCS_LOCK:
        for p in list(ACTIVE_ARIA2_PROCS):
            try:
                if p.poll() is None:
                    p.kill()
            except Exception:
                pass
        ACTIVE_ARIA2_PROCS.clear()

atexit.register(cleanup_aria2_processes)

def get_aria2_executable():
    """Busca y resuelve la ruta al ejecutable aria2c exclusivamente en Linux (p. ej. Vast.ai / RunPod / Docker)."""
    # En Windows queda completamente deshabilitado el acelerador externo aria2c; se utiliza el motor nativo de Python
    if sys.platform == "win32":
        return None
    sys_which = shutil.which("aria2c")
    if sys_which:
        return sys_which
    linux_candidates = [
        "/usr/bin/aria2c",
        "/usr/local/bin/aria2c",
        "/workspace/bin/aria2c",
        os.path.join(sys.prefix, "bin", "aria2c"),
        os.path.join(BIN_DIR, "aria2c"),
        "/opt/conda/bin/aria2c",
        "/root/bin/aria2c",
        os.path.expanduser("~/.local/bin/aria2c")
    ]
    for candidate in linux_candidates:
        if os.path.exists(candidate) and os.access(candidate, os.X_OK):
            return candidate
    return None

def install_aria2_linux():
    """Instala aria2 en entornos Linux (p. ej. Vast.ai / RunPod / Docker) usando apt-get."""
    if sys.platform == "win32":
        return False, "Esta función solo está disponible en sistemas Linux (Vast.ai / RunPod / Docker). En Windows se utiliza el motor nativo de Python."
    existing = get_aria2_executable()
    if existing:
        return True, f"Aria2 ya está disponible en {existing}"
    if not shutil.which("apt-get"):
        return False, "El gestor de paquetes apt-get no está disponible en este sistema."
    try:
        env = dict(os.environ, DEBIAN_FRONTEND="noninteractive")
        cmd_update = ["apt-get", "update", "-qq"]
        subprocess.run(cmd_update, capture_output=True, timeout=60, check=False, env=env)
        cmd_install = ["apt-get", "install", "-y", "-qq", "aria2"]
        proc = subprocess.run(cmd_install, capture_output=True, text=True, timeout=120, env=env)
        if proc.returncode == 0:
            new_exe = get_aria2_executable()
            if new_exe:
                return True, f"Aria2 instalado con éxito en {new_exe}"
        return False, f"Fallo al instalar aria2 con apt-get: {proc.stderr[:300]}"
    except Exception as e:
        return False, f"Error durante la instalación de aria2: {e}"

_ARIA2_AUTO_INSTALL_ATTEMPTED = False

def ensure_aria2_binary():
    global _ARIA2_AUTO_INSTALL_ATTEMPTED
    if sys.platform == "win32":
        return None
    exe = get_aria2_executable()
    if not exe and not _ARIA2_AUTO_INSTALL_ATTEMPTED:
        _ARIA2_AUTO_INSTALL_ATTEMPTED = True
        try:
            is_root = (hasattr(os, "geteuid") and os.geteuid() == 0)
            if is_root and shutil.which("apt-get"):
                ok, _ = install_aria2_linux()
                if ok:
                    exe = get_aria2_executable()
        except Exception:
            pass
    return exe
DATA_DIR = os.path.join(BASE_DIR, "data")
HUB_SETTINGS_FILE = os.path.join(DATA_DIR, "hub_settings.json")
HUB_SETTINGS_LOCK = threading.RLock()

# Standard HTTP headers
DEFAULT_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"

# Ensure data directory exists
os.makedirs(DATA_DIR, exist_ok=True)

# ---------------------------------------------------------------------------
# 1. Hub Settings (Civitai API Key & Hugging Face Access Token)
# ---------------------------------------------------------------------------
def load_hub_settings():
    with HUB_SETTINGS_LOCK:
        if os.path.exists(HUB_SETTINGS_FILE):
            try:
                with open(HUB_SETTINGS_FILE, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                pass
        return {"civitai_token": "", "hf_token": ""}

def safe_atomic_json_write(filepath: str, data, indent: int = 2, ensure_ascii: bool = False, max_attempts: int = 5) -> bool:
    tmp_path = None
    try:
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        tmp_path = f"{filepath}.tmp_{os.getpid()}_{threading.get_ident()}_{time.time_ns()}"
        with open(tmp_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=indent, ensure_ascii=ensure_ascii)
            f.flush()
            os.fsync(f.fileno())
        for attempt in range(max_attempts):
            try:
                os.replace(tmp_path, filepath)
                return True
            except PermissionError:
                if attempt == max_attempts - 1:
                    raise
                time.sleep(0.08)
    except Exception as e:
        print(f"[Hub Backend] Error en guardado atómico de {filepath}: {e}")
        return False
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass
    return False

def save_hub_settings(data):
    with HUB_SETTINGS_LOCK:
        try:
            curr = load_hub_settings()
            if "civitai_token" in data:
                curr["civitai_token"] = (data["civitai_token"] or "").strip()
            if "hf_token" in data:
                curr["hf_token"] = (data["hf_token"] or "").strip()
            return safe_atomic_json_write(HUB_SETTINGS_FILE, curr, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"[Hub Settings] Error saving settings: {e}")
            return False

# ---------------------------------------------------------------------------
# ---------------------------------------------------------------------------
# 2. Universal Category Detector & Folder Resolver
# ---------------------------------------------------------------------------
def detect_model_category(filename="", model_type="", base_model="", repo_name="", tags=None, path_hint=""):
    """
    Universally and intelligently determines the target ComfyUI folder category and reason.
    Handles Civitai (.com/.red), Hugging Face repos/files, and direct links across all architectures.
    Returns: (category, reason)
    """
    fn = (filename or "").lower()
    ph = (path_hint or "").lower().replace("\\", "/").strip("/")
    mt = (model_type or "").upper()
    bm = (base_model or "").lower()
    tags = [str(t).lower() for t in (tags or [])]
    repo = (repo_name or "").lower()
    combined_path = f"/{ph}/{fn}".lower()
    tag_str = " ".join(tags)
    combined_text = f"{fn} {ph} {repo} {bm} {tag_str}".lower()

    # 1. VAE / Autoencoders (highest priority before repo DiT)
    vae_keywords = [
        "vae.safetensors", "ae.safetensors", "ae.sft", "ae.pt", "ae.pth",
        "vae.pt", "vae.pth", "taesd", "taef1", "taewan", "qwen_image_vae"
    ]
    is_vae_path = "/vae" in combined_path or "split_files/vae" in combined_path or "/autoencoder" in combined_path
    if mt == "VAE" or is_vae_path:
        return ("vae", "Detectado como VAE / Autoencoder (Ruta/Tipo)")
    if any(k in fn for k in vae_keywords) or re.search(r'(?:^|[\W_])(?:vae|ae|taesd|taef1|taewan)(?:[\W_]|\.|$)', fn, re.I):
        return ("vae", "Detectado como VAE / Autoencoder (Nombre de archivo)")
    if ("vae" in fn or "autoencoder" in fn) and not any(x in fn for x in ["diffusion_models", "checkpoint", "lora"]):
        return ("vae", "Detectado como VAE / Autoencoder")

    # 2. Text Encoders & CLIP (robust regex across Qwen, T5, CLIP, Gemma, LLaMA, etc.)
    text_enc_regex = (
        r'(?:^|[\W_])('
        r'qwen[\W_]*(?:2(?:\.5)?|3(?:\.06b)?|vl)?|'
        r'(?:google[\W_]*)?t5(?:[\W_]*(?:xxl|v1_1|fp16|fp8|base|large|small))?|'
        r'(?:open[\W_]*)?clip(?:[\W_]*(?:l|g|h|vit|bigg|base|pytorch))?|'
        r'gemma(?:[\W_]*[23])?|'
        r'llama(?:[\W_]*[23])?|'
        r'umt5|mt5|bert|glm4|text_encoder|textencoder|tokenizer'
        r')(?:[\W_]|$|\.)'
    )
    is_text_enc_path = (
        "/text_encoder" in combined_path or "/clip/" in combined_path or
        "split_files/text_encoders" in combined_path or "/tokenizer" in combined_path
    )
    if mt in ["CLIP", "TEXT_ENCODER", "TEXTENCODER"] or is_text_enc_path:
        return ("text_encoders", "Detectado como Text Encoder (Ruta/Carpeta)")
    if re.search(text_enc_regex, fn, re.I) or re.search(text_enc_regex, ph, re.I):
        return ("text_encoders", "Detectado como Text Encoder (CLIP/T5/Qwen/Gemma/LLaMA/UMT5)")

    # 3. Clip Vision (Image Encoders)
    if "/clip_vision" in combined_path or any(k in fn for k in ["clip_vision", "clip-vit-h", "clip-vit-bigg", "image_encoder", "ipadapter_clip"]):
        return ("clip_vision", "Detectado como CLIP Vision (Image Encoder)")

    # 4. LoRA / LyCORIS / LoCon / DoRA
    if mt in ["LORA", "LOCON", "DORA"] or "lora" in tags:
        return ("loras", f"Detectado como LoRA ({mt or 'LoRA'})")
    if any(k in fn for k in ["_lora", "-lora", ".lora", "lycoris", "locon", "dora", "adapter_model"]):
        return ("loras", "Detectado como LoRA (Nombre de archivo)")
    if "/lora" in combined_path or "/lycoris" in combined_path:
        return ("loras", "Detectado como LoRA (Ruta)")

    # 5. ControlNet & T2I-Adapter
    control_keywords = ["controlnet", "control_", "t2i_adapter", "t2i-adapter", "ip-adapter", "controlnet-union", "flux-controlnet"]
    if mt == "CONTROLNET" or "controlnet" in tags:
        return ("controlnet", "Detectado como ControlNet (Tipo/Tag)")
    if any(k in fn for k in control_keywords) or "/controlnet" in combined_path:
        return ("controlnet", "Detectado como ControlNet")

    # 6. Upscale Models
    upscale_keywords = ["esrgan", "ultrasharp", "remacri", "nomos", "dat2", "compact", "realcugan", "4x_", "4x-", "2x_", "8x_", "upscaler", "superscale"]
    if mt == "UPSCALER" or "upscaler" in tags:
        return ("upscale_models", "Detectado como Modelo Upscaler (Tipo)")
    if any(k in fn for k in upscale_keywords) or "/upscale" in combined_path:
        return ("upscale_models", "Detectado como Modelo Upscaler")

    # 7. Embeddings / Textual Inversion
    if mt in ["TEXTUALINVERSION", "EMBEDDING"] or "textual inversion" in tags:
        return ("embeddings", "Detectado como Embedding / Textual Inversion")
    if any(k in fn for k in ["embedding", "ti_"]) or "/embedding" in combined_path:
        return ("embeddings", "Detectado como Embedding")

    # 8. Modern DiT & Video Diffusion Models (Anima, Wan 2.1, Flux, SD3/3.5, Hunyuan, CogVideo, Mochi, LTX)
    # Repo matching ONLY applies if the file is NOT a subcomponent (VAE, text encoder, etc.)
    dit_architectures = [
        ("anima", "Anima DiT"),
        ("wan2.1", "Wan 2.1 Video"),
        ("wan2", "Wan 2 Video"),
        ("wan", "Wan Video"),
        ("flux.1", "Flux.1 Transformer"),
        ("flux1", "Flux.1 Transformer"),
        ("flux", "Flux Transformer"),
        ("sd3.5", "SD3.5 DiT"),
        ("sd3", "SD3 DiT"),
        ("hunyuanvideo", "HunyuanVideo"),
        ("hunyuan", "HunyuanVideo"),
        ("cogvideox", "CogVideoX"),
        ("cogvideo", "CogVideoX"),
        ("mochi", "Mochi Video"),
        ("ltx-video", "LTX Video"),
        ("ltxvideo", "LTX Video"),
        ("pixart", "PixArt DiT"),
        ("auraflow", "AuraFlow DiT"),
        ("chameleon", "Chameleon"),
        ("kolors", "Kolors")
    ]
    is_dit_path = "/diffusion_models" in combined_path or "split_files/diffusion_models" in combined_path or "transformer" in combined_path
    for arch_key, arch_label in dit_architectures:
        matched = False
        if arch_key == "wan":
            if re.search(r'(?:^|[\W_])wan(?:2(?:\.1)?)?(?:[\W_]|$)', fn, re.I) or \
               re.search(r'(?:^|[\W_])wan(?:2(?:\.1)?)?(?:[\W_]|$)', bm, re.I) or \
               re.search(r'(?:^|[\W_])wan(?:2(?:\.1)?)?(?:[\W_]|$)', repo, re.I) or \
               (re.search(r'(?:^|[\W_])wan(?:2(?:\.1)?)?(?:[\W_]|$)', combined_text, re.I) and is_dit_path):
                matched = True
        else:
            if arch_key in bm or arch_key in fn or arch_key in ph or (arch_key in combined_text and is_dit_path) or arch_key in repo:
                matched = True
        if matched:
            return ("diffusion_models", f"Detectado como DiT Diffusion Model ({arch_label})")

    if is_dit_path:
        return ("diffusion_models", "Detectado como Diffusion Model (Ruta)")

    # 9. GGUF Quantized Models
    if fn.endswith(".gguf"):
        if any(x in fn for x in ["t5", "qwen", "clip"]):
            return ("text_encoders", "Detectado como Text Encoder GGUF")
        if any(x in fn for x in ["flux", "anima", "wan", "sd3", "transformer"]):
            return ("diffusion_models", "Detectado como DiT Diffusion Model GGUF")
        return ("diffusion_models", "Detectado como Modelo Cuantizado GGUF")

    # 10. Modelos Base / Checkpoints (Arquitectura Anima DiT)
    if mt == "CHECKPOINT":
        base_label = base_model or "Modelo Base"
        return ("diffusion_models", f"Destino Anima DiT ({base_label})")

    for ckpt_base in ["illustrious", "pony", "sdxl", "sd 1.5", "sd 2.1", "sd xl"]:
        if ckpt_base in bm or ckpt_base in fn:
            return ("diffusion_models", f"Destino Anima DiT ({ckpt_base.upper()})")

    if fn.endswith((".safetensors", ".ckpt", ".pt", ".bin")):
        return ("diffusion_models", "Destino por defecto para modelos")

    return ("diffusion_models", "Destino por defecto")

def is_character_model(model_type="", tags=None, name="", trained_words=None):
    """
    Intelligently determines if a model or LoRA is a character model based on
    Civitai/HF tags, model type, and naming heuristics.
    """
    clean_tags = [str(t).strip().lower() for t in (tags or [])]
    tag_str = " ".join(clean_tags)
    
    char_indicators = [
        "character", "personaje", "anime character", "female character", 
        "male character", "game character", "video game character",
        "waifu", "husbando", "vtuber", "fictional character"
    ]
    for ind in char_indicators:
        if ind in clean_tags or ind in tag_str:
            return True
            
    name_lower = (name or "").lower()
    if any(k in name_lower for k in ["character", "personaje"]):
        return True

    return False

def resolve_character_lora_subfolder():
    """
    Scans the local ComfyUI models/loras directory to find the user's preferred
    character subfolder hierarchy. Defaults to 'anime/characters'.
    """
    try:
        loras_dir = get_target_directory_for_category("loras")
        if os.path.exists(loras_dir):
            if os.path.isdir(os.path.join(loras_dir, "anime", "characters")):
                return "anime/characters"
            if os.path.isdir(os.path.join(loras_dir, "characters")):
                return "characters"
            if os.path.isdir(os.path.join(loras_dir, "anime")):
                return "anime/characters"
            if os.path.isdir(os.path.join(loras_dir, "personajes")):
                return "personajes"
    except Exception:
        pass
    return "anime/characters"

def get_target_directory_for_category(category, subfolder=""):
    """
    Universally resolves the primary absolute writable path for any category or subfolder.
    Compatible with Windows, Linux (Vast.ai / RunPod / Colab), and extra_model_paths.
    """
    category = category.strip().replace("\\", "/").strip("/")
    if "/" in category:
        base_cat, sub = category.split("/", 1)
    else:
        base_cat, sub = category, ""

    base_cat = base_cat.strip().lower()

    if subfolder:
        clean_extra = subfolder.strip().replace("\\", "/").strip("/")
        if not sub:
            sub = clean_extra
        elif sub == clean_extra or sub.endswith("/" + clean_extra):
            pass
        elif clean_extra.startswith(sub + "/"):
            sub = clean_extra
        else:
            sub = f"{sub}/{clean_extra}".strip("/")

    if not base_cat or base_cat in (".", "..") or re.search(r'[<>:"|?*\x00-\x1f]', base_cat):
        raise ValueError("Categoría de modelos no válida")

    paths = []
    if hasattr(folder_paths, "folder_names_and_paths"):
        if base_cat in folder_paths.folder_names_and_paths:
            try:
                paths = folder_paths.get_folder_paths(base_cat) or []
            except Exception:
                paths = []
        elif base_cat == "text_encoders" and "clip" in folder_paths.folder_names_and_paths:
            try:
                paths = folder_paths.get_folder_paths("clip") or []
            except Exception:
                paths = []

    # Priorizar almacenamiento persistente en Vast.ai / RunPod (/workspace)
    workspace_candidates = [p for p in paths if p.startswith("/workspace") or "workspace" in p.lower()]
    ordered_paths = workspace_candidates + [p for p in paths if p not in workspace_candidates]

    target = None
    if base_cat == "diffusion_models":
        for p in ordered_paths:
            if os.path.basename(os.path.normpath(p)).lower() == "diffusion_models":
                target = p
                break
        if not target:
            target = os.path.join(folder_paths.models_dir, "diffusion_models")
    elif base_cat == "text_encoders":
        for p in ordered_paths:
            b_name = os.path.basename(os.path.normpath(p)).lower()
            if b_name in ("text_encoders", "clip"):
                target = p
                break
        if not target:
            te_dir = os.path.join(folder_paths.models_dir, "text_encoders")
            clip_dir = os.path.join(folder_paths.models_dir, "clip")
            if os.path.isdir(te_dir):
                target = te_dir
            elif os.path.isdir(clip_dir):
                target = clip_dir
            else:
                target = te_dir
    elif ordered_paths:
        for p in ordered_paths:
            if os.path.exists(p) and os.access(p, os.W_OK):
                target = p
                break
            parent = os.path.dirname(p)
            if os.path.exists(parent) and os.access(parent, os.W_OK):
                target = p
                break
        if not target:
            target = ordered_paths[0]
    else:
        target = os.path.join(folder_paths.models_dir, base_cat)

    base_target = os.path.realpath(target)
    if sub:
        clean_parts = [p for p in sub.strip("/\\").replace("\\", "/").split("/") if p]
        if any(p in (".", "..") or re.search(r'[<>:"|?*\x00-\x1f]', p) for p in clean_parts):
            raise ValueError("Subcarpeta de modelos no válida")
        target = os.path.join(target, *clean_parts)

    try:
        is_inside = os.path.commonpath([base_target, os.path.realpath(target)]) == base_target
    except ValueError:
        # Raised when the paths sit on different Windows drives.
        is_inside = False
    if not is_inside:
        raise ValueError("La carpeta de destino sale del directorio de modelos")
    os.makedirs(target, exist_ok=True)
    return os.path.normpath(target)

def get_model_folders_and_subfolders():
    """
    Universally returns all available ComfyUI model categories, their root directories,
    and all recursive subdirectories on disk.
    Compatible with Windows, Linux (Vast.ai / RunPod / Colab), and extra_model_paths.
    """
    models_root = folder_paths.models_dir
    registered = set(folder_paths.folder_names_and_paths.keys()) if hasattr(folder_paths, "folder_names_and_paths") else set()
    physical = set()
    if os.path.exists(models_root):
        try:
            for entry in os.listdir(models_root):
                full = os.path.join(models_root, entry)
                if os.path.isdir(full) and not entry.startswith("."):
                    physical.add(entry)
        except Exception:
            pass

    ignore_set = {"custom_nodes", "datasets", "configs", "temp", "input", "output"}
    all_categories = sorted(list(registered.union(physical).difference(ignore_set)))

    priority_order = [
        "diffusion_models", "loras", "text_encoders", "vae", "checkpoints", "controlnet",
        "clip_vision", "unet", "upscale_models", "embeddings", "gligen", "style_models",
        "photomaker", "audio_encoders", "frame_interpolation", "diffusers"
    ]
    sorted_cats = [c for c in priority_order if c in all_categories]
    sorted_cats += [c for c in all_categories if c not in priority_order]

    result = {}
    for cat in sorted_cats:
        target_dir = get_target_directory_for_category(cat)
        subdirs = []
        if os.path.exists(target_dir):
            try:
                for root, dirs, _ in os.walk(target_dir):
                    dirs[:] = [d for d in dirs if not d.startswith(".")]
                    rel = os.path.relpath(root, target_dir)
                    if rel != ".":
                        depth = len(rel.split(os.sep))
                        if depth <= 4:
                            subdirs.append(rel.replace("\\", "/"))
            except Exception:
                pass
        result[cat] = {
            "target_dir": target_dir,
            "subdirs": sorted(subdirs)
        }
    return result

def format_bytes_human(b):
    if not b or b <= 0:
        return "0 MB"
    if b < 1024 * 1024:
        return f"{b / 1024:.1f} KB"
    elif b < 1024 * 1024 * 1024:
        return f"{b / (1024 * 1024):.1f} MB"
    else:
        return f"{b / (1024 * 1024 * 1024):.2f} GB"

def sanitize_filename(filename):
    r"""
    Sanitizes filenames to prevent illegal characters, path traversal,
    and Windows filesystem errors (<, >, :, ", /, \, |, ?, *).
    """
    if not filename:
        return "model_file.safetensors"
    cleaned = filename.split("?")[0].split("#")[0].strip()
    cleaned = os.path.basename(cleaned.replace("\\", "/"))
    cleaned = re.sub(r'[<>:"/\\|?*\x00-\x1f]', '_', cleaned)
    cleaned = cleaned.strip(". ")
    if not cleaned:
        cleaned = "model_file.safetensors"
    return cleaned

def check_disk_space(target_dir, required_bytes):
    """
    Checks if target directory has enough disk space with a 250MB buffer.
    Returns (has_space: bool, free_bytes: int, required_bytes: int).
    """
    try:
        os.makedirs(target_dir, exist_ok=True)
        usage = shutil.disk_usage(target_dir)
        safety_margin = 250 * 1024 * 1024
        if usage.free < (required_bytes + safety_margin):
            return False, usage.free, required_bytes
        return True, usage.free, required_bytes
    except Exception:
        return True, 0, required_bytes

# ---------------------------------------------------------------------------
# 3. Download Task & Manager (Multi-Threaded Download Accelerator)
# ---------------------------------------------------------------------------
class DownloadTask:
    def __init__(self, task_id, url, filename, category, target_dir, cover_url=None, civitai_info=None, auth_token=None, provider="civitai", total_bytes=0, status="pending", downloaded_bytes=0, created_at=None):
        self.task_id = task_id
        self.url = url
        self.filename = filename
        self.category = category
        self.target_dir = target_dir
        self.target_path = os.path.join(target_dir, filename) if filename else ""
        self.preview_path = f"{os.path.splitext(self.target_path)[0]}.preview.png" if self.target_path else ""
        self.part_path = self.target_path + ".part" if self.target_path else ""
        self.state_path = self.part_path + ".state.json" if self.part_path else ""
        self.cover_url = cover_url
        self.civitai_info = civitai_info
        self.auth_token = auth_token
        self.provider = provider

        self.status = status  # pending, downloading, paused, completed, cancelled, error
        self.downloaded_bytes = downloaded_bytes
        self.total_bytes = total_bytes
        self.progress = (downloaded_bytes / total_bytes * 100.0) if (total_bytes and total_bytes > 0) else 0.0
        self.speed_bps = 0.0
        self.eta_seconds = 0
        self.error = None
        self.connections = 1
        self.created_at = created_at or time.time()
        self.segments = []

        self.pause_event = threading.Event()
        self.cancel_event = threading.Event()
        self.thread = None
        self.preview_future = None
        self._aria2_proc = None
        self.engine = "native_single"
        self.engine_details = "Nativo (1 stream)"
        self.engine_fallback_reason = None
        self.lock = threading.Lock()

    def to_dict(self):
        with self.lock:
            return {
                "task_id": self.task_id,
                "url": self.url,
                "filename": self.filename,
                "category": self.category,
                "target_path": self.target_path,
                "status": self.status,
                "downloaded_bytes": self.downloaded_bytes,
                "total_bytes": self.total_bytes,
                "progress": round(self.progress, 1),
                "speed_bps": self.speed_bps,
                "speed_formatted": self.format_speed(),
                "downloaded_formatted": format_bytes_human(self.downloaded_bytes),
                "total_formatted": format_bytes_human(self.total_bytes),
                "eta_formatted": self.format_eta(),
                "error": self.error,
                "cover_url": self.cover_url,
                "civitai_info": self.civitai_info,
                "preview_path": self.preview_path if self.preview_path and os.path.isfile(self.preview_path) else "",
                "provider": self.provider,
                "connections": self.connections,
                "engine": self.engine,
                "engine_details": self.engine_details,
                "engine_fallback_reason": self.engine_fallback_reason,
                "created_at": self.created_at
            }

    def format_speed(self):
        if self.status != "downloading" or self.speed_bps <= 0:
            return "0 MB/s"
        if self.speed_bps < 1024 * 1024:
            return f"{self.speed_bps / 1024:.1f} KB/s"
        return f"{self.speed_bps / (1024 * 1024):.2f} MB/s"

    def format_eta(self):
        if self.eta_seconds <= 0 or self.status != "downloading" or math.isinf(self.eta_seconds) or math.isnan(self.eta_seconds):
            return ""
        try:
            m, s = divmod(int(self.eta_seconds), 60)
            h, m = divmod(m, 60)
            if h > 0:
                return f"{h}h {m}m"
            elif m > 0:
                return f"{m}m {s}s"
            else:
                return f"{s}s"
        except Exception:
            return ""

    def pause(self):
        with self.lock:
            if self.status != "downloading":
                return False
            self.pause_event.set()
            if hasattr(self, '_aria2_proc') and self._aria2_proc and self._aria2_proc.poll() is None:
                try: self._aria2_proc.terminate()
                except Exception: pass
            self.status = "paused"
            self.speed_bps = 0.0
            return True

    def resume(self):
        with self.lock:
            if self.status not in ("paused", "error"):
                return False
            # A previous worker may still be draining (e.g. cancel() join timed
            # out). Starting a second one would corrupt the .part file, so the
            # resume is rejected instead of racing.
            if self.thread and self.thread.is_alive() and threading.current_thread() != self.thread:
                return False
            self.pause_event.clear()
            self.cancel_event.clear()
            self.status = "downloading"
            t = threading.Thread(target=self.run, daemon=True)
            self.thread = t
            t.start()
            return True

    def cancel(self):
        with self.lock:
            self.cancel_event.set()
            self.pause_event.clear()
            if hasattr(self, '_aria2_proc') and self._aria2_proc and self._aria2_proc.poll() is None:
                try: self._aria2_proc.kill()
                except Exception: pass
            self.status = "cancelled"
            self.speed_bps = 0.0
            thread = self.thread
        if thread and thread.is_alive() and threading.current_thread() != thread:
            try:
                thread.join(timeout=3.0)
            except Exception:
                pass
        for _ in range(3):
            if os.path.exists(self.part_path):
                try:
                    os.remove(self.part_path)
                    break
                except Exception:
                    time.sleep(0.2)
            else:
                break
        # Limpiar también archivo de control de aria2
        aria2_ctrl = self.part_path + ".aria2"
        if os.path.exists(aria2_ctrl):
            try: os.remove(aria2_ctrl)
            except Exception: pass
        if hasattr(self, '_aria2_proc') and self._aria2_proc:
            with ARIA2_PROCS_LOCK:
                ACTIVE_ARIA2_PROCS.discard(self._aria2_proc)
        if os.path.exists(self.state_path):
            try: os.remove(self.state_path)
            except Exception: pass
        try:
            HUB_MANAGER._cleanup_orphan_preview(self)
        except Exception:
            pass
        return True

    def _save_state(self):
        try:
            if self.status in ("paused", "downloading", "error"):
                tmp_sf = self.state_path + ".tmp"
                with open(tmp_sf, "w", encoding="utf-8") as sf:
                    json.dump({
                        "task_id": self.task_id,
                        "url": self.url,
                        "filename": self.filename,
                        "category": self.category,
                        "total_bytes": self.total_bytes,
                        "downloaded_bytes": self.downloaded_bytes,
                        "segments": self.segments
                    }, sf)
                os.replace(tmp_sf, self.state_path)
        except Exception:
            pass

    def run(self):
        self.status = "downloading"
        self.pause_event.clear()
        self.cancel_event.clear()
        self.error = None

        download_url = self.url
        headers = {
            "User-Agent": DEFAULT_USER_AGENT,
        }
        if "civitai." in self.url:
            headers["Referer"] = "https://civitai.com/"
            if self.auth_token and not str(self.auth_token).startswith("hf_"):
                # Token only in the Authorization header: appending it to the
                # query leaked it to the CDN and to the process table.
                headers["Authorization"] = f"Bearer {self.auth_token}"
        elif "huggingface.co" in self.url:
            headers["Referer"] = "https://huggingface.co/"
            if self.auth_token:
                headers["Authorization"] = f"Bearer {self.auth_token}"

        try:
            os.makedirs(self.target_dir, exist_ok=True)

            probe_headers = headers.copy()
            probe_headers["Range"] = "bytes=0-0"
            supports_range = False
            resolved_url = download_url

            try:
                with request_public_url("GET", download_url, headers=probe_headers, stream=True, timeout=20) as resp:
                    resolved_url = resp.url
                    content_type = resp.headers.get("Content-Type", "").lower()
                    if "text/html" in content_type or "auth.civitai.com" in resolved_url.lower():
                        raise ValueError("Civitai requiere API Key válida para este modelo (redirección a login detectada). Configura tu Civitai API Key obtenida en civitai.com/user/account en el botón ⚙️ API TOKENS.")

                    cr = resp.headers.get("Content-Range", "")
                    cl = resp.headers.get("Content-Length", "")
                    cd = resp.headers.get("Content-Disposition", "")

                    if cd and not self.filename:
                        m = re.findall(r'filename\*?=(?:UTF-8\'\')?"?([^";]+)"?', cd)
                        if m:
                            self.filename = sanitize_filename(m[-1].strip().strip('"'))
                            self.target_path = os.path.join(self.target_dir, self.filename)
                            self.part_path = self.target_path + ".part"
                            self.state_path = self.part_path + ".state.json"

                    if resp.status_code == 206 and cr:
                        total_m = re.search(r'/(\d+)', cr)
                        if total_m:
                            server_total = int(total_m.group(1))
                            if server_total > 1:
                                self.total_bytes = server_total
                            supports_range = True
                    elif resp.status_code == 200:
                        if cl and cl.isdigit() and int(cl) > 1 and not self.total_bytes:
                            self.total_bytes = int(cl)
                        if resp.headers.get("Accept-Ranges", "").lower() == "bytes":
                            supports_range = True
            except ValueError as ve:
                raise ve
            except Exception as pe:
                print(f"[Hub Downloader] Probe notice: {pe}")

            if self.cancel_event.is_set():
                self.status = "cancelled"
                return
            if self.pause_event.is_set():
                self.status = "paused"
                return

            # Check disk space before proceeding (accounting for existing partial download)
            if self.total_bytes > 0:
                current_part_size = 0
                if os.path.exists(self.part_path):
                    try:
                        current_part_size = os.path.getsize(self.part_path)
                    except Exception:
                        pass
                needed_bytes = max(0, self.total_bytes - current_part_size)
                has_space, free_b, req_b = check_disk_space(self.target_dir, needed_bytes)
                if not has_space:
                    raise Exception(f"Espacio insuficiente en disco. Libre: {format_bytes_human(free_b)}, Requerido: {format_bytes_human(req_b)}")

            # Smart connection count:
            # Files <= 250MB (e.g. LoRAs, VAEs, ControlNets) MUST use 1 single stream.
            # Multi-part 8 connections trigger Civitai CDN rate limits, 403s, and socket resets.
            # A single stream with auto-resume downloads an 82MB LoRA in seconds without issues.
            # Large models (> 250MB) can use 3 connections if range is supported.
            if self.total_bytes > 0 and self.total_bytes <= 250 * 1024 * 1024:
                num_conns = 1
            elif supports_range and self.total_bytes > 250 * 1024 * 1024:
                num_conns = 3
            else:
                num_conns = 1
            self.connections = num_conns

            # Respect the connection limit chosen for this file size and server.
            aria2_exe = None
            if sys.platform != "win32":
                aria2_exe = get_aria2_executable() or ensure_aria2_binary()
            used_aria2 = False
            trusted_host = urlsplit(self.url).hostname or ""
            trusted_provider = trusted_host in ("civitai.com", "huggingface.co") or trusted_host.endswith((".civitai.com", ".huggingface.co"))
            if aria2_exe and os.path.exists(aria2_exe) and trusted_provider:
                try:
                    self.engine = "aria2"
                    self.engine_details = f"Aria2 ({self.connections} conns)"
                    print(f"[Hub Downloader] Iniciando Aria2 ({self.connections} conexiones en Linux/Vast.ai) para {self.filename}")
                    self._run_aria2(resolved_url, headers)
                    used_aria2 = True
                except Exception as ae:
                    print(f"[Hub Downloader] Fallo en Aria2: {ae}. Limpiando archivo parcial y alternando a motor nativo...")
                    used_aria2 = False
                    self.engine_fallback_reason = str(ae)
                    if hasattr(self, '_aria2_proc') and self._aria2_proc:
                        with ARIA2_PROCS_LOCK:
                            ACTIVE_ARIA2_PROCS.discard(self._aria2_proc)
                    if os.path.exists(self.part_path):
                        try: os.remove(self.part_path)
                        except Exception: pass
                    aria2_ctrl = self.part_path + ".aria2"
                    if os.path.exists(aria2_ctrl):
                        try: os.remove(aria2_ctrl)
                        except Exception: pass
                    self.downloaded_bytes = 0

            if not used_aria2:
                if num_conns > 1:
                    self.engine = "native_accelerated"
                    self.engine_details = f"Nativo multi-stream ({num_conns} conns)"
                    self._run_accelerated(resolved_url, headers, num_conns)
                else:
                    self.engine = "native_single"
                    self.engine_details = "Nativo (1 stream)"
                    self._run_single_stream(resolved_url, headers)

            if self.pause_event.is_set():
                self.status = "paused"
                self.speed_bps = 0.0
                self._save_state()
                try:
                    HUB_MANAGER.save_tasks()
                except Exception: pass
                return

            if self.cancel_event.is_set():
                self.status = "cancelled"
                self.speed_bps = 0.0
                if os.path.exists(self.part_path):
                    try: os.remove(self.part_path)
                    except Exception: pass
                if os.path.exists(self.state_path):
                    try: os.remove(self.state_path)
                    except Exception: pass
                try:
                    HUB_MANAGER._cleanup_orphan_preview(self)
                except Exception:
                    pass
                try:
                    HUB_MANAGER.save_tasks()
                except Exception: pass
                return

            # Verification of completeness
            if self.total_bytes > 0 and self.downloaded_bytes < self.total_bytes:
                raise Exception(f"Incomplete download: received {self.downloaded_bytes} of {self.total_bytes} bytes")
            if self.downloaded_bytes < 100 * 1024 and self.filename.lower().endswith((".safetensors", ".ckpt", ".pt", ".bin", ".gguf")):
                raise Exception(f"Descarga incompleta o corrupta ({self.downloaded_bytes} bytes recibidos). Verifica la conexión o tu API Key.")

            # Finished successfully!
            if os.path.exists(self.part_path):
                if os.path.exists(self.target_path):
                    try:
                        cur_m = os.stat(self.target_path).st_mode
                        os.chmod(self.target_path, cur_m | stat.S_IWUSR | stat.S_IRUSR)
                        os.remove(self.target_path)
                    except Exception: pass
                # Robust replace loop with retry to handle Windows Defender / indexer file locks
                replaced = False
                for attempt in range(5):
                    try:
                        os.replace(self.part_path, self.target_path)
                        replaced = True
                        break
                    except PermissionError:
                        if attempt == 4:
                            raise
                        time.sleep(0.5)

            if os.path.exists(self.state_path):
                try: os.remove(self.state_path)
                except Exception: pass

            self.status = "completed"
            self.progress = 100.0
            self.speed_bps = 0.0
            try:
                HUB_MANAGER.save_tasks()
            except Exception: pass

            # The preview is normally fetched in parallel with the model download.
            # Keep this fallback for resumed/legacy tasks that have no preview worker.
            base_no_ext = os.path.splitext(self.target_path)[0]
            if (self.cover_url and not os.path.isfile(self.preview_path) and
                    (not self.preview_future or self.preview_future.done())):
                HUB_MANAGER._schedule_preview_fetch(self)

            # 2. Civitai info
            if self.civitai_info:
                try:
                    info_path = f"{base_no_ext}.civitai.info"
                    with open(info_path, "w", encoding="utf-8") as f:
                        json.dump({"civitai_data": self.civitai_info}, f, indent=2, ensure_ascii=False)
                    # Also write .rgthree-info.json for ComfyUI LoRA / prompt loader trigger words
                    words = self.civitai_info.get("trainedWords") or []
                    rg_path = f"{base_no_ext}.rgthree-info.json"
                    with open(rg_path, "w", encoding="utf-8") as f:
                        json.dump({"trainedWords": words}, f, indent=2, ensure_ascii=False)
                except Exception as e:
                    print(f"[Hub Downloader] Warning saving civitai.info / rgthree-info: {e}")

            # 3. Cache and ComfyUI reload
            try:
                norm_key = normalize_path(self.target_path)
                st = os.stat(self.target_path)
                with CACHE_LOCK:
                    MODELS_CACHE[norm_key] = {
                        "mtime": st.st_mtime,
                        "size_bytes": st.st_size,
                        "sha256": "",
                        "civitai_data": self.civitai_info or {"civitai_status": "found" if self.civitai_info else "none"}
                    }
                    save_cache()
            except Exception: pass

            try:
                if hasattr(folder_paths, "filename_list_cache") and isinstance(folder_paths.filename_list_cache, dict):
                    folder_paths.filename_list_cache.clear()
            except Exception: pass

            # Persist the completed status and any local preview path after preview handling.
            try:
                HUB_MANAGER.save_tasks()
            except Exception: pass

            print(f"[Hub Downloader] Successfully downloaded: {self.filename} -> {self.category}")

        except Exception as e:
            self.error = str(e)
            self.status = "error"
            self.speed_bps = 0.0
            try:
                HUB_MANAGER._cleanup_orphan_preview(self)
            except Exception:
                pass
            try:
                HUB_MANAGER.save_tasks()
            except Exception: pass
            print(f"[Hub Downloader] Error during download {self.filename}: {e}")

    def _run_aria2(self, resolved_url, headers):
        aria2_exe = get_aria2_executable() or ensure_aria2_binary()
        if not aria2_exe or not os.path.exists(aria2_exe):
            raise RuntimeError("aria2c no está disponible")

        os.makedirs(self.target_dir, exist_ok=True)
        part_fn = os.path.basename(self.part_path)

        cmd = [
            aria2_exe,
            "-c",
            "--continue=true",
            "-x", str(self.connections),
            "-s", str(self.connections),
            "-j", str(ARIA2_MAX_CONNECTIONS),
            "-k", "1M",
            "--file-allocation=none",
            "--summary-interval=1",
            "--auto-file-renaming=false",
            "--allow-overwrite=true",
            "--enable-http-keep-alive=false",
            "--http-no-cache=true",
            "--console-log-level=warn",
            f"--user-agent={DEFAULT_USER_AGENT}",
            "-d", self.target_dir,
            "-o", part_fn
        ]

        if "civitai." in self.url:
            cmd.extend(["--header", "Referer: https://civitai.com/"])
        elif "huggingface.co" in self.url:
            cmd.extend(["--header", "Referer: https://huggingface.co/"])

        target_host = (urlsplit(resolved_url).hostname or "").lower()
        is_storage_cdn = (
            target_host.startswith("b2.") or "cdn" in target_host or "xet" in target_host or
            "amazonaws.com" in target_host or "cloudfront.net" in target_host or
            "r2.cloudflarestorage.com" in target_host or "blob.core.windows.net" in target_host
        )
        if self.auth_token and not is_storage_cdn:
            cmd.extend(["--header", f"Authorization: Bearer {self.auth_token}"])

        cmd.append(resolved_url)

        popen_kwargs = {}
        if os.name == 'nt':
            startupinfo = subprocess.STARTUPINFO()
            startupinfo.dwFlags |= subprocess.STARTF_USESHOWWINDOW
            startupinfo.wShowWindow = 0
            popen_kwargs["startupinfo"] = startupinfo
            popen_kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW

        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True,
            encoding="utf-8",
            errors="replace",
            **popen_kwargs
        )
        self._aria2_proc = proc
        with ARIA2_PROCS_LOCK:
            ACTIVE_ARIA2_PROCS.add(proc)

        progress_rx = re.compile(
            r"\[#\w+\s+([0-9.]+[A-Za-z]+)\/([0-9.]+[A-Za-z]+)\(([0-9.]+)%\)\s+CN:(\d+)\s+DL:([0-9.]+[A-Za-z]+)(?:\s+ETA:([^\]]+))?\]"
        )

        def parse_val(s):
            m = re.match(r"([0-9.]+)\s*([A-Za-z]+)?", s.strip())
            if not m: return 0
            val = float(m.group(1))
            unit = (m.group(2) or '').lower()
            if 'g' in unit: return int(val * 1024 * 1024 * 1024)
            if 'm' in unit: return int(val * 1024 * 1024)
            if 'k' in unit: return int(val * 1024)
            return int(val)

        def parse_eta_sec(eta_s):
            if not eta_s: return 0
            tot = 0
            h_m = re.search(r"(\d+)h", eta_s)
            m_m = re.search(r"(\d+)m", eta_s)
            s_m = re.search(r"(\d+)s", eta_s)
            if h_m: tot += int(h_m.group(1)) * 3600
            if m_m: tot += int(m_m.group(1)) * 60
            if s_m: tot += int(s_m.group(1))
            return tot

        recent_logs = collections.deque(maxlen=20)
        try:
            try:
                for line in proc.stdout:
                    line_clean = line.strip()
                    if line_clean and not line_clean.startswith("*** Download Progress"):
                        recent_logs.append(line_clean)

                    if self.cancel_event.is_set() or self.pause_event.is_set():
                        try: proc.terminate()
                        except Exception: pass
                        break

                    m = progress_rx.search(line)
                    if m:
                        dl_str, tot_str, pct_str, cn_str, spd_str, eta_str = m.groups()
                        self.downloaded_bytes = parse_val(dl_str)
                        tot_b = parse_val(tot_str)
                        if tot_b > 0:
                            self.total_bytes = tot_b
                        self.progress = float(pct_str)
                        self.connections = int(cn_str)
                        self.speed_bps = float(parse_val(spd_str))
                        self.eta_seconds = parse_eta_sec(eta_str)
            except Exception as err:
                if proc.poll() is None:
                    try: proc.kill()
                    except Exception: pass
                raise err

            try:
                proc.wait(timeout=5)
            except Exception:
                if proc.poll() is None:
                    try: proc.kill()
                    except Exception: pass

            if self.cancel_event.is_set() or self.pause_event.is_set():
                return

            if proc.returncode != 0 and proc.returncode is not None:
                err_detail = ""
                for l in reversed(recent_logs):
                    if "status=" in l or "errorCode=" in l or "error" in l.lower() or "exception" in l.lower():
                        err_detail = l
                        break
                if not err_detail and recent_logs:
                    err_detail = recent_logs[-1]
                msg = f"aria2c error (código de salida {proc.returncode})"
                if err_detail:
                    msg += f": {err_detail}"
                raise RuntimeError(msg)

            if os.path.exists(self.part_path):
                actual_size = os.path.getsize(self.part_path)
                if actual_size > 0:
                    self.downloaded_bytes = actual_size
                    if not self.total_bytes or self.total_bytes <= 0:
                        self.total_bytes = actual_size
                    self.progress = 100.0
        finally:
            if not self.pause_event.is_set():
                aria2_ctrl = self.part_path + ".aria2"
                if os.path.exists(aria2_ctrl):
                    try: os.remove(aria2_ctrl)
                    except Exception: pass
            if hasattr(self, '_aria2_proc') and self._aria2_proc:
                with ARIA2_PROCS_LOCK:
                    ACTIVE_ARIA2_PROCS.discard(self._aria2_proc)

    def _run_accelerated(self, resolved_url, headers, num_conns):
        if not self.segments:
            if os.path.exists(self.state_path):
                try:
                    with open(self.state_path, "r", encoding="utf-8") as sf:
                        saved = json.load(sf)
                        self.segments = saved.get("segments", [])
                except Exception:
                    self.segments = []

        if self.segments and not os.path.exists(self.part_path):
            # The .part file is gone but the resume state still references
            # segments; keeping them would make the writer open a missing file.
            self.segments = []

        if not self.segments:
            if self.total_bytes <= 0:
                # Cannot segment unknown length; fallback to single stream
                self._run_single_stream(resolved_url, headers)
                return
            if not os.path.exists(self.part_path):
                os.makedirs(os.path.dirname(self.part_path) or ".", exist_ok=True)
                with open(self.part_path, "wb") as f:
                    f.seek(self.total_bytes - 1)
                    f.write(b'\0')
            if not os.path.exists(self.part_path):
                with open(self.part_path, "wb") as f:
                    f.seek(self.total_bytes - 1)
                    f.write(b'\0')

            seg_size = self.total_bytes // num_conns
            self.segments = []
            for i in range(num_conns):
                s = i * seg_size
                e = (self.total_bytes - 1) if i == num_conns - 1 else ((i + 1) * seg_size - 1)
                self.segments.append({"id": i, "start": s, "end": e, "current": s})

        self.downloaded_bytes = sum(max(0, s["current"] - s["start"]) for s in self.segments)
        if self.total_bytes > 0:
            self.progress = (self.downloaded_bytes / self.total_bytes) * 100.0

        write_queue = queue.Queue(maxsize=128)
        all_workers_done = threading.Event()

        def writer_loop():
            try:
                with open(self.part_path, "r+b") as f:
                    while True:
                        try:
                            item = write_queue.get(timeout=0.2)
                        except queue.Empty:
                            if self.cancel_event.is_set() or self.pause_event.is_set() or all_workers_done.is_set():
                                break
                            continue
                        if item is None:
                            break
                        off, data, seg = item
                        f.seek(off)
                        f.write(data)
                        seg["current"] = off + len(data)
                        write_queue.task_done()

                    # Drain queue completely on pause/exit to prevent zero-byte corruptions
                    while not write_queue.empty():
                        try:
                            item = write_queue.get_nowait()
                            if item and item is not None:
                                off, data, seg = item
                                f.seek(off)
                                f.write(data)
                                seg["current"] = off + len(data)
                                write_queue.task_done()
                        except queue.Empty:
                            break
                    f.flush()
            except Exception as we:
                self.error = f"Disk write error: {we}"
                self.cancel_event.set()

        writer_thread = threading.Thread(target=writer_loop, daemon=True)
        writer_thread.start()

        speed_lock = threading.Lock()
        bytes_window = [0]
        last_time = [time.time()]
        worker_errors = []

        def worker_segment(seg):
            max_seg_retries = 5
            for attempt in range(max_seg_retries):
                if self.cancel_event.is_set() or self.pause_event.is_set():
                    return
                s = seg["current"]
                e = seg["end"]
                if s > e:
                    return

                try:
                    worker_headers = headers.copy()
                    u_lower = resolved_url.lower()
                    if any(k in u_lower for k in ["amazonaws.com", "cloudfront.net", "r2.cloudflarestorage.com", "x-amz-", "signature="]):
                        worker_headers.pop("Authorization", None)
                    worker_headers["Range"] = f"bytes={s}-{e}"

                    with request_public_url("GET", resolved_url, headers=worker_headers, stream=True, timeout=30) as resp:
                        if resp.status_code != 206:
                            raise Exception(f"Segment HTTP {resp.status_code} is not 206 Partial Content")

                        curr = s
                        for chunk in resp.iter_content(chunk_size=128 * 1024):
                            if self.cancel_event.is_set() or self.pause_event.is_set():
                                break
                            if chunk:
                                queued_ok = False
                                while not (self.cancel_event.is_set() or self.pause_event.is_set()):
                                    try:
                                        write_queue.put((curr, chunk, seg), timeout=0.5)
                                        queued_ok = True
                                        break
                                    except queue.Full:
                                        continue
                                if not queued_ok or self.cancel_event.is_set() or self.pause_event.is_set():
                                    break
                                c_len = len(chunk)
                                curr += c_len

                                with speed_lock:
                                    self.downloaded_bytes += c_len
                                    bytes_window[0] += c_len
                                    now = time.time()
                                    dt = now - last_time[0]
                                    if dt >= 0.5:
                                        cur_speed = bytes_window[0] / dt
                                        self.speed_bps = cur_speed if self.speed_bps == 0 else (self.speed_bps * 0.7 + cur_speed * 0.3)
                                        bytes_window[0] = 0
                                        last_time[0] = now
                                        if self.total_bytes > 0:
                                            self.progress = (self.downloaded_bytes / self.total_bytes) * 100.0
                                            remaining = max(0, self.total_bytes - self.downloaded_bytes)
                                            if self.speed_bps > 0:
                                                self.eta_seconds = remaining / self.speed_bps
                    if seg["current"] > seg["end"]:
                        return
                except Exception as we:
                    if self.cancel_event.is_set() or self.pause_event.is_set():
                        return
                    if attempt == max_seg_retries - 1:
                        worker_errors.append(str(we))
                        return
                    time.sleep(1.0 * (attempt + 1))

        workers = []
        for seg in self.segments:
            if seg["current"] <= seg["end"]:
                t = threading.Thread(target=worker_segment, args=(seg,), daemon=True)
                workers.append(t)
                t.start()

        for t in workers:
            t.join()

        all_workers_done.set()
        try:
            write_queue.put(None, timeout=5.0)
        except queue.Full:
            # The writer died with a full queue; forcing it to stop avoids an
            # unbounded block on this thread (and therefore a stuck task).
            self.cancel_event.set()
        writer_thread.join(timeout=10.0)
        if writer_thread.is_alive():
            self.cancel_event.set()
            writer_thread.join(timeout=5.0)

        if worker_errors and not (self.cancel_event.is_set() or self.pause_event.is_set()):
            raise Exception(f"Error en hilo de descarga: {worker_errors[0]}")

        self._save_state()

    def _run_single_stream(self, resolved_url, headers):
        max_retries = 8
        retry_delay = 1.0

        for attempt in range(max_retries):
            if self.cancel_event.is_set() or self.pause_event.is_set():
                break

            start_byte = 0
            mode = "wb"
            if os.path.exists(self.part_path):
                start_byte = os.path.getsize(self.part_path)
                if start_byte > 0:
                    mode = "ab"

            self.downloaded_bytes = start_byte
            if self.total_bytes > 0 and self.downloaded_bytes >= self.total_bytes:
                # Fully downloaded!
                break

            stream_headers = headers.copy()
            u_lower = resolved_url.lower()
            if any(k in u_lower for k in ["amazonaws.com", "cloudfront.net", "r2.cloudflarestorage.com", "x-amz-", "signature="]):
                stream_headers.pop("Authorization", None)

            if start_byte > 0:
                stream_headers["Range"] = f"bytes={start_byte}-"

            try:
                with request_public_url("GET", resolved_url, headers=stream_headers, stream=True, timeout=30) as resp:
                    if resp.status_code == 416:
                        # Server rejected Range header; file may have changed or offset invalid. Reset from byte 0.
                        print(f"[Hub Downloader] HTTP 416 para {self.filename}. Reiniciando descarga desde inicio...")
                        if os.path.exists(self.part_path):
                            try: os.remove(self.part_path)
                            except Exception: pass
                        start_byte = 0
                        mode = "wb"
                        self.downloaded_bytes = 0
                        continue
                    if resp.status_code in (401, 403):
                        if os.path.exists(self.part_path) and os.path.getsize(self.part_path) < 100 * 1024:
                            try: os.remove(self.part_path)
                            except Exception: pass
                        raise PermissionError(f"HTTP {resp.status_code}: Acceso denegado o autenticación requerida. Configura tu API Token en 'API Tokens'.")
                    if resp.status_code == 404:
                        if os.path.exists(self.part_path) and os.path.getsize(self.part_path) < 100 * 1024:
                            try: os.remove(self.part_path)
                            except Exception: pass
                        raise FileNotFoundError(f"HTTP 404: El archivo no existe en el servidor remoto.")
                    if resp.status_code == 429:
                        retry_after = resp.headers.get("Retry-After")
                        wait_sec = int(retry_after) if retry_after and retry_after.isdigit() else int(retry_delay * 2)
                        time.sleep(min(wait_sec, 30))
                        continue
                    if resp.status_code not in (200, 206):
                        raise Exception(f"HTTP {resp.status_code}: {resp.reason}")

                    if resp.status_code == 200 and start_byte > 0:
                        mode = "wb"
                        start_byte = 0
                        self.downloaded_bytes = 0

                    if start_byte == 0 and not self.total_bytes:
                        cl = resp.headers.get("Content-Length")
                        if cl and cl.isdigit() and int(cl) > 1:
                            self.total_bytes = int(cl)

                    chunk_size = 128 * 1024
                    last_time = time.time()
                    bytes_window = 0

                    with open(self.part_path, mode) as f:
                        for chunk in resp.iter_content(chunk_size=chunk_size):
                            if self.cancel_event.is_set() or self.pause_event.is_set():
                                break
                            if chunk:
                                f.write(chunk)
                                chunk_len = len(chunk)
                                self.downloaded_bytes += chunk_len
                                bytes_window += chunk_len

                                now = time.time()
                                dt = now - last_time
                                if dt >= 0.5:
                                    cur_speed = bytes_window / dt
                                    self.speed_bps = cur_speed if self.speed_bps == 0 else (self.speed_bps * 0.7 + cur_speed * 0.3)
                                    bytes_window = 0
                                    last_time = now

                                    if self.total_bytes > 0:
                                        self.progress = (self.downloaded_bytes / self.total_bytes) * 100.0
                                        remaining = max(0, self.total_bytes - self.downloaded_bytes)
                                        if self.speed_bps > 0:
                                            self.eta_seconds = remaining / self.speed_bps

                    # Check if stream ended prematurely without completing
                    if self.cancel_event.is_set() or self.pause_event.is_set():
                        break

                    if self.total_bytes > 0 and self.downloaded_bytes < self.total_bytes:
                        print(f"[Hub Downloader] Connection dropped at {self.downloaded_bytes}/{self.total_bytes} bytes. Reconnecting (attempt {attempt + 1}/{max_retries})...")
                        time.sleep(retry_delay)
                        retry_delay = min(retry_delay * 1.5, 8.0)
                        continue
                    else:
                        # Full file received!
                        break
            except (PermissionError, FileNotFoundError) as fatal_e:
                raise fatal_e
            except Exception as e:
                if self.cancel_event.is_set() or self.pause_event.is_set():
                    break
                print(f"[Hub Downloader] Transient error on attempt {attempt + 1}: {e}. Retrying in {retry_delay}s...")
                time.sleep(retry_delay)
                retry_delay = min(retry_delay * 1.5, 8.0)
                if attempt == max_retries - 1:
                    raise e

class HubDownloadManager:
    def __init__(self):
        self.tasks = {}
        self.lock = threading.RLock()
        self.tasks_file = os.path.join(DATA_DIR, "hub_tasks.json")
        self.load_tasks()

    def _cleanup_orphan_preview(self, task):
        """Remove a task cover only when no matching model can still own it."""
        preview_path = getattr(task, "preview_path", "")
        target_path = getattr(task, "target_path", "")
        if not preview_path or not target_path:
            return False

        target_norm = os.path.normcase(os.path.abspath(target_path))
        if os.path.isfile(target_path):
            return False

        # Several model formats can share a basename and therefore a preview.
        # Keep that preview while another supported model with the same stem exists.
        root = os.path.dirname(target_path)
        task_stem = os.path.splitext(os.path.basename(target_path))[0].casefold()
        try:
            for filename in os.listdir(root):
                stem, ext = os.path.splitext(filename)
                sibling = os.path.normcase(os.path.abspath(os.path.join(root, filename)))
                if (sibling != target_norm and os.path.isfile(sibling) and
                        stem.casefold() == task_stem and ext.lower() in MODEL_EXTS):
                    return False
        except OSError:
            pass

        # A replacement task for the same destination may already be downloading.
        with self.lock:
            for other in self.tasks.values():
                if other is task:
                    continue
                other_path = getattr(other, "target_path", "")
                if (other_path and os.path.normcase(os.path.abspath(other_path)) == target_norm and
                        other.status in ("pending", "downloading", "paused")):
                    return False

        # This also purges stale Civitai/RG metadata and the model cache entry.
        # It only acts when the destination model is absent and no sibling model owns the sidecars.
        try:
            cleanup_model_artifacts(target_path)
        except Exception:
            pass

        try:
            if os.path.isfile(preview_path):
                try:
                    cur_m = os.stat(preview_path).st_mode
                    os.chmod(preview_path, cur_m | stat.S_IWUSR | stat.S_IRUSR)
                except Exception:
                    pass
                os.remove(preview_path)
                return True
        except OSError:
            pass
        return False

    def load_tasks(self):
        with self.lock:
            if os.path.exists(self.tasks_file):
                try:
                    needs_preview_path_migration = False
                    with open(self.tasks_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for item in data.get("tasks", []):
                            tid = item.get("task_id")
                            if not tid:
                                continue
                            status = item.get("status", "completed")
                            if status == "downloading":
                                status = "paused"
                            target_p = item.get("target_path", "")
                            task = DownloadTask(
                                task_id=tid,
                                url=item.get("url", ""),
                                filename=item.get("filename", ""),
                                category=item.get("category", "diffusion_models"),
                                target_dir=os.path.dirname(target_p) if target_p else get_target_directory_for_category(item.get("category", "diffusion_models")),
                                cover_url=item.get("cover_url"),
                                civitai_info=item.get("civitai_info"),
                                provider=item.get("provider", "direct"),
                                total_bytes=item.get("total_bytes", 0),
                                status=status,
                                downloaded_bytes=item.get("downloaded_bytes", 0),
                                created_at=item.get("created_at")
                            )
                            self.tasks[tid] = task
                            if task.status in ("cancelled", "error", "completed") and not os.path.isfile(task.target_path):
                                self._cleanup_orphan_preview(task)
                            elif os.path.isfile(task.preview_path):
                                needs_preview_path_migration = needs_preview_path_migration or item.get("preview_path") != task.preview_path
                            # Repair old completed history entries that only stored a remote URL.
                            elif task.cover_url:
                                self._schedule_preview_fetch(task)
                    if needs_preview_path_migration:
                        self.save_tasks()
                except Exception as e:
                    print(f"[Hub Manager] Notice loading tasks: {e}")

    def save_tasks(self):
        with self.lock:
            try:
                tasks_data = [t.to_dict() for t in self.tasks.values()]
                safe_atomic_json_write(self.tasks_file, {"tasks": tasks_data}, indent=2, ensure_ascii=False)
            except Exception as e:
                print(f"[Hub Manager] Notice saving tasks: {e}")

    def _schedule_preview_fetch(self, task):
        if not task.cover_url or not task.preview_path or os.path.isfile(task.preview_path):
            return
        if task.status in ("cancelled", "error", "completed") and not os.path.isfile(task.target_path):
            self._cleanup_orphan_preview(task)
            return
        if task.preview_future and not task.preview_future.done():
            return
        # cover_url comes from the client, so it must be treated as untrusted:
        # without this check the server could be used as a proxy for internal hosts.
        try:
            parsed = validate_download_url(task.cover_url)
        except Exception:
            return

        def fetch_preview():
            try:
                # Use Civitai's resized CDN variant so history thumbnails are quick
                # to fetch and small to serve; keep the original URL in task metadata.
                preview_url = str(parsed.geturl()).replace("original=true", "width=450")
                if download_civitai_image(preview_url, task.preview_path):
                    if task.status in ("cancelled", "error", "completed") and not os.path.isfile(task.target_path):
                        self._cleanup_orphan_preview(task)
                        return
                    with self.lock:
                        is_registered = self.tasks.get(task.task_id) is task
                    if not is_registered and not os.path.isfile(task.target_path):
                        self._cleanup_orphan_preview(task)
                        return
                    self.save_tasks()
            except Exception as e:
                print(f"[Hub Downloader] Warning saving preview for {task.filename}: {e}")

        try:
            task.preview_future = PREVIEW_EXECUTOR.submit(fetch_preview)
        except Exception as e:
            print(f"[Hub Downloader] Could not queue preview for {task.filename}: {e}")

    def start_download(self, url, filename, category, subfolder="", cover_url=None, civitai_info=None, provider="civitai", total_bytes=0):
        with self.lock:
            task_id = str(uuid.uuid4())[:8]
            target_dir = get_target_directory_for_category(category)
            category_dir = os.path.realpath(target_dir)
            if subfolder:
                clean_sub = subfolder.replace("\\", "/").strip("/")
                clean_parts = [p for p in clean_sub.split("/") if p]
                if any(p in (".", "..") or re.search(r'[<>:"|?*\x00-\x1f]', p) for p in clean_parts):
                    raise ValueError("Subcarpeta de descarga no válida")
                if clean_parts:
                    target_dir = os.path.join(target_dir, *clean_parts)

            try:
                is_inside = os.path.commonpath([category_dir, os.path.realpath(target_dir)]) == category_dir
            except ValueError:
                # Raised when the paths sit on different Windows drives.
                is_inside = False
            if not is_inside:
                raise ValueError("La subcarpeta sale del directorio de modelos")

            clean_filename = sanitize_filename(filename)
            target_path = os.path.join(target_dir, clean_filename)

            if os.path.exists(target_path):
                raise FileExistsError(f"El modelo ya existe: {target_path}")

            # Deduplicate: inspect existing tasks targeting the same file
            for existing_id, existing_task in list(self.tasks.items()):
                if existing_task.target_path == target_path:
                    if existing_task.status in ("downloading", "pending"):
                        print(f"[Hub Manager] Task already active for {clean_filename}: {existing_id}")
                        return existing_id
                    elif existing_task.status == "paused":
                        print(f"[Hub Manager] Reanudando tarea en pausa existente para {clean_filename}: {existing_id}")
                        self.resume_task(existing_id)
                        return existing_id
                    elif existing_task.status in ("error", "cancelled"):
                        # Clean up dead task before creating a new fresh one
                        del self.tasks[existing_id]

            task_id = str(uuid.uuid4())[:8]
            settings = load_hub_settings()
            auth_token = None
            if "civitai." in url:
                c_tok = settings.get("civitai_token", "")
                if c_tok and not c_tok.strip().startswith("hf_"):
                    auth_token = c_tok.strip()
            elif "huggingface.co" in url:
                h_tok = settings.get("hf_token", "")
                if not h_tok:
                    c_tok = settings.get("civitai_token", "")
                    if c_tok and c_tok.strip().startswith("hf_"):
                        h_tok = c_tok
                auth_token = h_tok.strip() if h_tok else None

            task = DownloadTask(
                task_id=task_id,
                url=url,
                filename=clean_filename,
                category=category,
                target_dir=target_dir,
                cover_url=cover_url,
                civitai_info=civitai_info,
                auth_token=auth_token,
                provider=provider,
                total_bytes=total_bytes
            )
            self.tasks[task_id] = task

            # Fetch the thumbnail in parallel, using the shared bounded preview pool.
            self._schedule_preview_fetch(task)

            t = threading.Thread(target=task.run, daemon=True)
            task.thread = t
            t.start()
            self.save_tasks()
            return task_id

    def pause_task(self, task_id):
        with self.lock:
            if task_id in self.tasks:
                ok = self.tasks[task_id].pause()
                self.save_tasks()
                return ok
        return False

    def resume_task(self, task_id):
        with self.lock:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                settings = load_hub_settings()
                if "civitai." in task.url:
                    task.auth_token = settings.get("civitai_token")
                elif "huggingface.co" in task.url:
                    task.auth_token = settings.get("hf_token")
                ok = task.resume()
                self.save_tasks()
                return ok
        return False

    def cancel_task(self, task_id):
        with self.lock:
            if task_id in self.tasks:
                ok = self.tasks[task_id].cancel()
                self.save_tasks()
                return ok
        return False

    def delete_task(self, task_id):
        with self.lock:
            if task_id in self.tasks:
                task = self.tasks[task_id]
                task.cancel()
                del self.tasks[task_id]
                self.save_tasks()
                return True
        return False

    def clear_tasks(self):
        with self.lock:
            removable = [tid for tid, t in self.tasks.items() if t.status in ("completed", "cancelled", "error")]
            for tid in removable:
                task = self.tasks[tid]
                self._cleanup_orphan_preview(task)
                if task.status in ("cancelled", "error"):
                    if os.path.exists(task.part_path):
                        try: os.remove(task.part_path)
                        except Exception: pass
                    if os.path.exists(task.state_path):
                        try: os.remove(task.state_path)
                        except Exception: pass
                del self.tasks[tid]
            self.save_tasks()
            return len(removable)

    def get_all_tasks(self):
        with self.lock:
            tasks = sorted(self.tasks.values(), key=lambda t: t.created_at, reverse=True)
            return [t.to_dict() for t in tasks]

HUB_MANAGER = HubDownloadManager()

# ---------------------------------------------------------------------------
# 4. Civitai API Handlers & URL Parsing
# ---------------------------------------------------------------------------
def civitai_api_request(url, params=None):
    settings = load_hub_settings()
    token = settings.get("civitai_token", "").strip()
    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Referer": "https://civitai.com/"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    res = requests.get(url, params=params, headers=headers, timeout=12)
    return res

_PREVIEW_PNG_CACHE = {}
_PREVIEW_PNG_LOCK = threading.Lock()
# Cap by total bytes: entry-count eviction allowed large PNGs to retain ~GBs.
PREVIEW_PNG_CACHE_MAX_BYTES = 64 * 1024 * 1024
_PREVIEW_PNG_CACHE_BYTES = 0

def _evict_preview_cache_locked(incoming_bytes=0):
    """Trim the preview cache. Caller must hold _PREVIEW_PNG_LOCK."""
    global _PREVIEW_PNG_CACHE_BYTES
    while _PREVIEW_PNG_CACHE and (
        _PREVIEW_PNG_CACHE_BYTES + incoming_bytes > PREVIEW_PNG_CACHE_MAX_BYTES
        or len(_PREVIEW_PNG_CACHE) > 150
    ):
        oldest_key = next(iter(_PREVIEW_PNG_CACHE))
        removed = _PREVIEW_PNG_CACHE.pop(oldest_key, b"")
        _PREVIEW_PNG_CACHE_BYTES -= len(removed)
        if _PREVIEW_PNG_CACHE_BYTES < 0:
            _PREVIEW_PNG_CACHE_BYTES = 0
        incoming_bytes = 0

def fetch_civitai_preview_png(url):
    """Fetch a Civitai or Hugging Face preview server-side and return normalized PNG bytes with caching."""
    global _PREVIEW_PNG_CACHE_BYTES
    clean_url = (url or "").strip()
    if not clean_url:
        raise ValueError("URL de vista previa vacía")

    with _PREVIEW_PNG_LOCK:
        if clean_url in _PREVIEW_PNG_CACHE:
            return _PREVIEW_PNG_CACHE[clean_url]
        # An oversized image can never be cached; drop it before decoding.
        if len(_PREVIEW_PNG_CACHE) >= 150 or _PREVIEW_PNG_CACHE_BYTES >= PREVIEW_PNG_CACHE_MAX_BYTES:
            _evict_preview_cache_locked()

    parsed = validate_download_url(clean_url)
    hostname = (parsed.hostname or "").lower().rstrip(".")
    is_civitai = hostname == "civitai.com" or "civitai." in hostname or hostname.endswith(".civitai.com")
    is_hf = hostname == "huggingface.co" or hostname.endswith(".huggingface.co")
    if not (is_civitai or is_hf):
        raise ValueError("La vista previa debe provenir de Civitai o Hugging Face")

    settings = load_hub_settings()
    headers = {"User-Agent": DEFAULT_USER_AGENT}
    if is_civitai:
        headers["Referer"] = "https://civitai.com/"
        c_tok = settings.get("civitai_token", "").strip()
        if c_tok and not c_tok.startswith("hf_"):
            headers["Authorization"] = f"Bearer {c_tok}"
    else:
        headers["Referer"] = "https://huggingface.co/"
        h_tok = settings.get("hf_token", "").strip()
        if not h_tok:
            c_tok = settings.get("civitai_token", "").strip()
            if c_tok and c_tok.startswith("hf_"):
                h_tok = c_tok
        if h_tok:
            headers["Authorization"] = f"Bearer {h_tok}"

    response = request_public_url(
        "GET",
        clean_url,
        headers=headers,
        timeout=(5, 15),
        stream=True
    )
    try:
        if response.status_code != 200:
            raise ValueError(f"Servidor respondió HTTP {response.status_code}")
        content_length = int(response.headers.get("Content-Length") or 0)
        if content_length > 15 * 1024 * 1024:
            raise ValueError("La imagen de vista previa supera el límite de tamaño")
        image_data = bytearray()
        for chunk in response.iter_content(64 * 1024):
            if chunk:
                image_data.extend(chunk)
                if len(image_data) > 15 * 1024 * 1024:
                    raise ValueError("La imagen de vista previa supera el límite de tamaño")
    finally:
        response.close()

    try:
        with Image.open(BytesIO(image_data)) as source:
            source.verify()
        with Image.open(BytesIO(image_data)) as source:
            if source.width * source.height > 20_000_000:
                raise ValueError("La resolución de la vista previa es demasiado grande")
            image = source.convert("RGBA" if "A" in source.getbands() else "RGB")
            output = BytesIO()
            image.save(output, format="PNG")
            png_bytes = output.getvalue()

            with _PREVIEW_PNG_LOCK:
                _evict_preview_cache_locked(len(png_bytes))
                _PREVIEW_PNG_CACHE_BYTES += len(png_bytes)
                _PREVIEW_PNG_CACHE[clean_url] = png_bytes
            return png_bytes
    except ValueError:
        raise
    except Exception as e:
        raise ValueError("Civitai no devolvió una imagen válida") from e

def parse_civitai_model_card(item):
    """
    Transforms a Civitai model object into a structured hub card.
    """
    model_id = item.get("id")
    name = item.get("name", "Sin Nombre")
    model_type = item.get("type", "Checkpoint")
    creator = item.get("creator", {}).get("username", "Anónimo")
    creator_avatar = item.get("creator", {}).get("image", "")
    stats = item.get("stats", {})
    nsfw = item.get("nsfw", False)
    tags = item.get("tags", [])

    versions = []
    for v in item.get("modelVersions", []):
        v_id = v.get("id")
        v_name = v.get("name", "v1.0")
        base_model = v.get("baseModel", "")
        trained_words = v.get("trainedWords", [])
        v_images = v.get("images", [])
        
        # Cover image and gallery (filtrar videos para que la portada siempre sea una imagen estática real)
        cover = extract_best_civitai_image(v_images)
        gallery = []
        for img in v_images:
            raw_url = img.get("url", "")
            is_vid = is_civitai_video_item(img)
            if raw_url and not is_vid:
                gallery.append(raw_url.replace("original=true", "width=450"))
            elif is_vid and (img.get("thumbnailUrl") or img.get("poster")):
                thumb = img.get("thumbnailUrl") or img.get("poster")
                if thumb and not is_civitai_video_item(thumb):
                    gallery.append(thumb.replace("original=true", "width=450"))
        if not cover and gallery:
            cover = gallery[0]

        # Files
        files = []
        for f in v.get("files", []):
            fname = f.get("name", "")
            ftype = f.get("type", "Model")
            fsize_kb = f.get("sizeKB", 0)
            fsize_bytes = int(fsize_kb * 1024) if fsize_kb else 0
            download_url = f.get("downloadUrl", "")

            # Intelligent category detection
            cat, reason = detect_model_category(
                filename=fname,
                model_type=model_type,
                base_model=base_model,
                tags=tags,
                path_hint=ftype
            )

            rec_subfolder = ""
            if cat == "loras" and is_character_model(model_type=model_type, tags=tags, name=name, trained_words=trained_words):
                rec_subfolder = resolve_character_lora_subfolder()
                reason = f"Detectado como LoRA de Personaje ({model_type or 'LoRA'}) → {rec_subfolder}"

            files.append({
                "filename": fname,
                "type": ftype,
                "size_bytes": fsize_bytes,
                "size_formatted": format_bytes_human(fsize_bytes),
                "download_url": download_url,
                "recommended_folder": cat,
                "recommended_subfolder": rec_subfolder,
                "reason": reason
            })

        versions.append({
            "id": v_id,
            "name": v_name,
            "base_model": base_model,
            "trained_words": trained_words,
            "cover_url": cover,
            "gallery": gallery,
            "files": files,
            "download_url": v.get("downloadUrl", "")
        })

    # Top cover image (preferencia versión 0, o primera versión con portada)
    top_cover = ""
    if versions and versions[0]["cover_url"]:
        top_cover = versions[0]["cover_url"]
    elif versions:
        for v in versions:
            if v.get("cover_url"):
                top_cover = v["cover_url"]
                break

    return {
        "id": model_id,
        "name": name,
        "type": model_type,
        "creator": creator,
        "creator_avatar": creator_avatar,
        "top_cover": top_cover,
        "stats": {
            "downloads": stats.get("downloadCount", 0),
            "thumbs_up": stats.get("thumbsUpCount", 0),
            "rating": stats.get("rating", 0)
        },
        "nsfw": nsfw,
        "tags": tags[:6],
        "versions": versions
    }

# ---------------------------------------------------------------------------
# 5. Hugging Face API Handlers & URL Parsing
# ---------------------------------------------------------------------------
def hf_api_request(url, params=None):
    settings = load_hub_settings()
    token = settings.get("hf_token", "").strip()
    headers = {
        "User-Agent": DEFAULT_USER_AGENT,
        "Referer": "https://huggingface.co/"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"

    res = requests.get(url, params=params, headers=headers, timeout=12)
    return res

_cached_local_indices = None
_cached_local_indices_time = 0

def get_cached_local_indices(max_age_sec=6.0):
    global _cached_local_indices, _cached_local_indices_time
    now = time.time()
    if _cached_local_indices is None or (now - _cached_local_indices_time) > max_age_sec:
        try:
            try:
                from . import link_bank
            except (ImportError, ValueError):
                import link_bank
            _cached_local_indices = link_bank.build_local_indices()
            _cached_local_indices_time = now
        except Exception as e:
            logging.warning("[Universe Downloader] Error construyendo índices locales: %s", e)
            return None
    return _cached_local_indices

def enrich_inspected_with_local_status(data):
    if not isinstance(data, dict):
        return data
    try:
        try:
            from . import link_bank
        except (ImportError, ValueError):
            import link_bank
        indices = get_cached_local_indices()
        if not indices:
            return data

        versions = data.get("versions") or []
        ver0 = versions[0] if versions else {}
        files = ver0.get("files") or []
        first_file = files[0] if files else {}

        model_id = str(data.get("id") or "").strip()
        version_id = str(ver0.get("id") or "").strip()
        filename = first_file.get("filename") or ""
        cat = first_file.get("recommended_folder") or ""
        size_bytes = int(first_file.get("size_bytes") or 0)

        entry = {
            "filename": filename,
            "files": files,
            "version_id": version_id,
            "model_id": model_id,
            "category": cat,
            "size_bytes": size_bytes
        }

        status, local_path, matched_fn = link_bank.find_local_for_entry(entry, indices)

        def _get_relpath(p):
            if not p:
                return ""
            norm = p.replace("\\", "/")
            idx = norm.lower().find("models/")
            if idx != -1:
                return norm[idx:]
            return os.path.basename(p)

        local_rel = _get_relpath(local_path)
        is_present = (status == "present")

        data["local_status"] = status
        data["local_path"] = local_path if is_present else ""
        data["local_relpath"] = local_rel if is_present else ""
        data["matched_filename"] = matched_fn
        data["already_downloaded"] = is_present

        for f in files:
            f_name = f.get("filename") or ""
            f_entry = {
                "filename": f_name,
                "version_id": version_id,
                "model_id": model_id,
                "category": f.get("recommended_folder") or cat,
                "size_bytes": int(f.get("size_bytes") or 0)
            }
            f_st, f_p, f_m = link_bank.find_local_for_entry(f_entry, indices)
            f["local_status"] = f_st
            f["local_path"] = f_p if f_st == "present" else ""
            f["local_relpath"] = _get_relpath(f_p) if f_st == "present" else ""
            f["already_downloaded"] = (f_st == "present")
            if f_st == "present" and not is_present:
                data["local_status"] = "present"
                data["local_path"] = f_p
                data["local_relpath"] = f["local_relpath"]
                data["already_downloaded"] = True
                data["matched_filename"] = f_m
    except Exception as e:
        logging.warning("[Universe Downloader] Error en enrich_inspected_with_local_status: %s", e)
    return data

# ---------------------------------------------------------------------------
# 6. Universal URL Inspector
# ---------------------------------------------------------------------------
def _inspect_universal_url_raw(raw_url):
    """
    Analyzes any pasted URL (Civitai, Hugging Face, or direct safetensors link)
    and extracts full download targets with intelligent folder placement.
    """
    url = raw_url.strip().strip('"\'<>')
    if not url:
        return {"status": "error", "message": "Por favor, introduce o pega un enlace válido."}

    # Normalizar enlaces sin protocolo
    if url.startswith(("civitai.", "www.civitai.", "huggingface.co", "www.huggingface.co")):
        url = "https://" + url
    validate_download_url(url)

    # 1. Civitai Model Version Direct (e.g. civitai.com/model-versions/128713 or /api/download/models/128713)
    m_civitai_ver = re.search(r'civitai\.[a-z]+/(?:model-versions|api/download/models|api/v1/model-versions)/(\d+)', url)
    if m_civitai_ver:
        version_id = m_civitai_ver.group(1)
        res = civitai_api_request(f"https://civitai.com/api/v1/model-versions/{version_id}")
        if res.status_code == 200:
            v_data = res.json()
            model_id = v_data.get("modelId")
            if model_id:
                m_res = civitai_api_request(f"https://civitai.com/api/v1/models/{model_id}")
                if m_res.status_code == 200:
                    parsed = parse_civitai_model_card(m_res.json())
                    parsed["versions"].sort(key=lambda x: 0 if str(x.get("id")) == str(version_id) else 1)
                    if parsed["versions"] and parsed["versions"][0].get("cover_url"):
                        parsed["top_cover"] = parsed["versions"][0]["cover_url"]
                    return {"status": "ok", "provider": "civitai", "data": parsed}
            # Fallback version format si el modelo padre no está accesible
            base_model = v_data.get("baseModel", "")
            files = []
            for f in v_data.get("files", []):
                fname = f.get("name", "")
                cat, reason = detect_model_category(filename=fname, base_model=base_model)
                rec_subfolder = ""
                if cat == "loras" and is_character_model(name=fname or v_data.get("name", "")):
                    rec_subfolder = resolve_character_lora_subfolder()
                    reason = f"Detectado como LoRA de Personaje → {rec_subfolder}"
                files.append({
                    "filename": fname,
                    "type": f.get("type", "Model"),
                    "size_bytes": int(f.get("sizeKB", 0) * 1024),
                    "size_formatted": format_bytes_human(int(f.get("sizeKB", 0) * 1024)),
                    "download_url": f.get("downloadUrl", url),
                    "recommended_folder": cat,
                    "recommended_subfolder": rec_subfolder,
                    "reason": reason
                })
            best_preview = extract_best_civitai_image(v_data.get("images", []))
            return {
                "status": "ok",
                "provider": "civitai",
                "data": {
                    "id": model_id or version_id,
                    "name": v_data.get("name", "Civitai Version"),
                    "type": "Checkpoint",
                    "creator": "Civitai",
                    "top_cover": best_preview,
                    "versions": [{
                        "id": version_id,
                        "name": v_data.get("name", ""),
                        "base_model": base_model,
                        "trained_words": v_data.get("trainedWords", []),
                        "files": files,
                        "cover_url": best_preview
                    }]
                }
            }
        elif res.status_code in (401, 403):
            return {"status": "error", "message": "Esta versión requiere autenticación o es NSFW/privada. Configura tu API Token en 'API Tokens'."}
        else:
            return {"status": "error", "message": f"No se pudo consultar Civitai para la versión {version_id} (HTTP {res.status_code})."}

    # 2. Civitai Model Page URL (e.g. civitai.com/models/12345 or /models/12345/versions/67890)
    m_civitai_model = re.search(r'civitai\.[a-z]+/models/(\d+)(?:/versions/(\d+))?', url)
    if m_civitai_model:
        model_id = m_civitai_model.group(1)
        sub_ver_id = m_civitai_model.group(2)
        res = civitai_api_request(f"https://civitai.com/api/v1/models/{model_id}")
        if res.status_code == 200:
            parsed = parse_civitai_model_card(res.json())
            # Check if specific version requested in path (/versions/ID) or query param (?modelVersionId=ID)
            target_ver_id = sub_ver_id
            if not target_ver_id:
                m_ver = re.search(r'modelVersionId=(\d+)', url)
                if m_ver:
                    target_ver_id = m_ver.group(1)
            if target_ver_id:
                parsed["versions"].sort(key=lambda x: 0 if str(x.get("id")) == str(target_ver_id) else 1)
                if parsed["versions"] and parsed["versions"][0].get("cover_url"):
                    parsed["top_cover"] = parsed["versions"][0]["cover_url"]
            return {"status": "ok", "provider": "civitai", "data": parsed}
        elif res.status_code in (401, 403):
            return {"status": "error", "message": "Este modelo requiere autenticación o es NSFW/privado. Configura tu API Token en 'API Tokens'."}
        elif res.status_code == 404:
            # Fallback: Check if the ID is actually a model-version ID
            v_res = civitai_api_request(f"https://civitai.com/api/v1/model-versions/{model_id}")
            if v_res.status_code == 200:
                v_data = v_res.json()
                real_model_id = v_data.get("modelId")
                if real_model_id:
                    m_res = civitai_api_request(f"https://civitai.com/api/v1/models/{real_model_id}")
                    if m_res.status_code == 200:
                        parsed = parse_civitai_model_card(m_res.json())
                        parsed["versions"].sort(key=lambda x: 0 if str(x.get("id")) == str(model_id) else 1)
                        if parsed["versions"] and parsed["versions"][0].get("cover_url"):
                            parsed["top_cover"] = parsed["versions"][0]["cover_url"]
                        return {"status": "ok", "provider": "civitai", "data": parsed}
            return {"status": "error", "message": f"Modelo {model_id} no encontrado en Civitai. Si es privado o NSFW, configura tu API Token."}
        else:
            return {"status": "error", "message": f"No se pudo consultar Civitai (HTTP {res.status_code})"}

    # 3. Hugging Face Direct File (blob, resolve or raw)
    m_hf_file = re.search(r'huggingface\.co/([^/]+/[^/]+)/(?:blob|resolve|raw)/([^/]+)/(.*)', url)
    if m_hf_file:
        repo_id, branch, file_path = m_hf_file.groups()
        # Clean query parameters (?download=true) and fragments
        clean_file_path = file_path.split("?")[0].split("#")[0]
        filename = sanitize_filename(os.path.basename(clean_file_path))
        direct_url = f"https://huggingface.co/{repo_id}/resolve/{branch}/{clean_file_path}"
        cat, reason = detect_model_category(filename=filename, repo_name=repo_id, path_hint=clean_file_path)
        rec_subfolder = ""
        if cat == "loras" and is_character_model(name=filename or repo_id):
            rec_subfolder = resolve_character_lora_subfolder()
            reason = f"Detectado como LoRA de Personaje → {rec_subfolder}"

        # Get file size via quick HEAD request with HF token if available
        size_bytes = 0
        try:
            head_headers = {"User-Agent": DEFAULT_USER_AGENT}
            settings = load_hub_settings()
            if settings.get("hf_token"):
                head_headers["Authorization"] = f"Bearer {settings['hf_token']}"
            head_res = request_public_url("HEAD", direct_url, timeout=7, headers=head_headers)
            if head_res.status_code == 200:
                size_bytes = int(head_res.headers.get("Content-Length", 0))
        except Exception:
            pass

        return {
            "status": "ok",
            "provider": "huggingface",
            "data": {
                "id": f"{repo_id}:{clean_file_path}",
                "repo_id": repo_id,
                "name": f"{repo_id}: {filename}",
                "type": cat.title(),
                "creator": repo_id.split("/")[0],
                "top_cover": "",
                "versions": [{
                    "id": f"{branch}:{clean_file_path}",
                    "name": branch,
                    "base_model": "",
                    "trained_words": [],
                    "files": [{
                        "filename": filename,
                        "type": "Model",
                        "size_bytes": size_bytes,
                        "size_formatted": format_bytes_human(size_bytes),
                        "download_url": direct_url,
                        "recommended_folder": cat,
                        "recommended_subfolder": rec_subfolder,
                        "reason": reason
                    }],
                    "cover_url": ""
                }]
            }
        }

    # 4. Hugging Face Repo (e.g. huggingface.co/circlestone-labs/Anima)
    m_hf_repo = re.search(r'huggingface\.co/([^/]+/[^/?#]+)', url)
    if m_hf_repo:
        repo_id = m_hf_repo.group(1)
        res = hf_api_request(f"https://huggingface.co/api/models/{repo_id}")
        if res.status_code == 200:
            d = res.json()
            siblings = d.get("siblings", [])
            tags = d.get("tags", [])
            model_files = []
            for s in siblings:
                rfn = s.get("rfilename", "")
                if any(rfn.lower().endswith(ext) for ext in [".safetensors", ".gguf", ".bin", ".pt", ".pth", ".ckpt"]):
                    fname = os.path.basename(rfn)
                    cat, reason = detect_model_category(filename=fname, repo_name=repo_id, tags=tags, path_hint=rfn)
                    rec_subfolder = ""
                    if cat == "loras" and is_character_model(tags=tags, name=fname or repo_id):
                        rec_subfolder = resolve_character_lora_subfolder()
                        reason = f"Detectado como LoRA de Personaje → {rec_subfolder}"
                    direct_url = f"https://huggingface.co/{repo_id}/resolve/main/{rfn}"
                    model_files.append({
                        "filename": fname,
                        "rfilename": rfn,
                        "type": "Model",
                        "size_bytes": 0,
                        "size_formatted": "Verificar",
                        "download_url": direct_url,
                        "recommended_folder": cat,
                        "recommended_subfolder": rec_subfolder,
                        "reason": reason
                    })

            return {
                "status": "ok",
                "provider": "huggingface",
                "data": {
                    "id": repo_id,
                    "repo_id": repo_id,
                    "name": repo_id,
                    "type": "Hugging Face Repo",
                    "creator": repo_id.split("/")[0],
                    "top_cover": "",
                    "stats": {
                        "downloads": d.get("downloads", 0),
                        "thumbs_up": d.get("likes", 0)
                    },
                    "tags": tags[:6],
                    "versions": [{
                        "id": "main",
                        "name": "Branch: main",
                        "base_model": "",
                        "trained_words": [],
                        "files": model_files,
                        "cover_url": ""
                    }]
                }
            }
        else:
            return {"status": "error", "message": f"No se pudo consultar el repositorio de Hugging Face (HTTP {res.status_code})"}

    # 5. Generic Direct URL (e.g. ending in .safetensors, .gguf)
    fn_match = re.search(r'/([^/?#]+\.(?:safetensors|gguf|ckpt|pt|bin))', url, re.IGNORECASE)
    filename = fn_match.group(1) if fn_match else "modelo_descargado.safetensors"
    cat, reason = detect_model_category(filename=filename)
    rec_subfolder = ""
    if cat == "loras" and is_character_model(name=filename):
        rec_subfolder = resolve_character_lora_subfolder()
        reason = f"Detectado como LoRA de Personaje → {rec_subfolder}"

    size_bytes = 0
    try:
        head_res = request_public_url("HEAD", url, timeout=5, headers={"User-Agent": DEFAULT_USER_AGENT})
        if head_res.status_code == 200:
            size_bytes = int(head_res.headers.get("Content-Length", 0))
    except Exception:
        pass

    return {
        "status": "ok",
        "provider": "direct",
        "data": {
            "id": f"direct:{filename}",
            "name": filename,
            "type": cat.title(),
            "creator": "Direct Link",
            "top_cover": "",
            "versions": [{
                "id": f"direct:{filename}",
                "name": "Enlace Directo",
                "base_model": "",
                "trained_words": [],
                "files": [{
                    "filename": filename,
                    "type": "Model",
                    "size_bytes": size_bytes,
                    "size_formatted": format_bytes_human(size_bytes),
                    "download_url": url,
                    "recommended_folder": cat,
                    "recommended_subfolder": rec_subfolder,
                    "reason": reason
                }],
                "cover_url": ""
            }]
        }
    }

def inspect_universal_url(raw_url):
    res = _inspect_universal_url_raw(raw_url)
    if isinstance(res, dict) and res.get("status") == "ok" and res.get("data"):
        enrich_inspected_with_local_status(res["data"])
    return res

def get_system_clipboard_urls():
    '''
    Lee URLs de modelos desde el historial del portapapeles de Windows (Win+V)
    y desde el portapapeles activo del sistema.
    '''
    results = []
    seen = set()
    url_regex = re.compile(
        r'(?:https?://[^\s<>\x22\x27{}|\\^`]+|(?:www\.)?(?:civitai\.(?:com|red)|huggingface\.co)/[^\s<>\x22\x27{}|\\^`]+)',
        re.IGNORECASE
    )

    if sys.platform == 'win32':
        ps_code = (
            'Add-Type -AssemblyName System.Runtime.WindowsRuntime\n'
            '$asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq \'AsTask\' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq \'IAsyncOperation`1\' })[0]\n'
            'Function Await($WinRtTask, $ResultType) {\n'
            '    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)\n'
            '    $netTask = $asTask.Invoke($null, @($WinRtTask))\n'
            '    $netTask.Wait(500) | Out-Null\n'
            '    $netTask.Result\n'
            '}\n'
            '[Windows.ApplicationModel.DataTransfer.Clipboard, Windows.ApplicationModel.DataTransfer, ContentType = WindowsRuntime] | Out-Null\n'
            '$items = @()\n'
            'try {\n'
            '    $hist = Await ([Windows.ApplicationModel.DataTransfer.Clipboard]::GetHistoryItemsAsync()) ([Windows.ApplicationModel.DataTransfer.ClipboardHistoryItemsResult])\n'
            '    if ($hist -and $hist.Items) {\n'
            '        foreach ($item in $hist.Items) {\n'
            '            try {\n'
            '                $text = Await ($item.Content.GetTextAsync()) ([string])\n'
            '                if ($text) { $items += $text }\n'
            '            } catch {}\n'
            '        }\n'
            '    }\n'
            '} catch {}\n'
            'try {\n'
            '    $single = Get-Clipboard\n'
            '    if ($single) { $items += ($single -join [Environment]::NewLine) }\n'
            '} catch {}\n'
            '$items | ConvertTo-Json -Compress\n'
        )
        try:
            res = subprocess.run(
                ['powershell', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', ps_code],
                capture_output=True, text=True, timeout=4
            )
            out = res.stdout.strip()
            if out:
                raw_items = json.loads(out)
                if isinstance(raw_items, str):
                    raw_items = [raw_items]
                for raw_text in raw_items:
                    if not isinstance(raw_text, str):
                        continue
                    for m in url_regex.finditer(raw_text):
                        u = m.group(0).rstrip('.,;!?)')
                        if not u.startswith('http://') and not u.startswith('https://'):
                            u = 'https://' + u
                        norm = u.lower().rstrip('/')
                        if norm not in seen:
                            seen.add(norm)
                            results.append(u)
        except Exception as e:
            logging.debug('[Universe Downloader] Error leyendo portapapeles: %s', e)

    elif sys.platform.startswith('linux'):
        for clip_cmd in [['wl-paste'], ['xclip', '-selection', 'clipboard', '-o'], ['xsel', '--clipboard', '--output']]:
            if shutil.which(clip_cmd[0]):
                try:
                    res = subprocess.run(clip_cmd, capture_output=True, text=True, timeout=1)
                    if res.returncode == 0 and res.stdout:
                        for m in url_regex.finditer(res.stdout):
                            u = m.group(0).rstrip('.,;!?)')
                            if not u.startswith(('http://', 'https://')):
                                u = 'https://' + u
                            norm = u.lower().rstrip('/')
                            if norm not in seen:
                                seen.add(norm)
                                results.append(u)
                        break
                except Exception:
                    pass

    return results


# ---------------------------------------------------------------------------
# 7. Route Registrations on PromptServer
# ---------------------------------------------------------------------------
ARIA2_MAX_CONNECTIONS = 8
NATIVE_MAX_CONNECTIONS = 3
_HUB_ROUTES_REGISTERED = False

def register_hub_routes(routes):
    global _HUB_ROUTES_REGISTERED
    if _HUB_ROUTES_REGISTERED:
        return
    _HUB_ROUTES_REGISTERED = True
    # 1. Settings Endpoints
    @routes.get("/universe_downloader/api/hub/settings")
    async def api_hub_get_settings(request):
        settings = load_hub_settings()
        c_tok = settings.get("civitai_token", "")
        h_tok = settings.get("hf_token", "")
        return web.json_response({
            "status": "ok",
            "settings": {
                "civitai_token_masked": f"{c_tok[:4]}...{c_tok[-4:]}" if len(c_tok) > 8 else ("Configurado" if c_tok else ""),
                "hf_token_masked": f"{h_tok[:4]}...{h_tok[-4:]}" if len(h_tok) > 8 else ("Configurado" if h_tok else ""),
                "has_civitai_token": bool(c_tok),
                "has_hf_token": bool(h_tok)
            }
        })

    @routes.post("/universe_downloader/api/hub/settings")
    async def api_hub_save_settings(request):
        try:
            data = await request.json()
            curr = load_hub_settings()
            # If token is omitted, empty, or sent as masked indicator, preserve current token
            c_new = (data.get("civitai_token") or "").strip()
            h_new = (data.get("hf_token") or "").strip()
            if c_new and "..." not in c_new and c_new != "Configurado":
                curr["civitai_token"] = c_new
            elif data.get("clear_civitai_token"):
                curr["civitai_token"] = ""

            if h_new and "..." not in h_new and h_new != "Configurado":
                curr["hf_token"] = h_new
            elif data.get("clear_hf_token"):
                curr["hf_token"] = ""

            ok = save_hub_settings(curr)
            return web.json_response({"status": "ok" if ok else "error"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 2. Folder list
    @routes.get("/universe_downloader/api/hub/folders")
    async def api_hub_get_folders(request):
        folders = get_model_folders_and_subfolders()
        return web.json_response({"status": "ok", "folders": folders})

    # 3. Civitai Search Endpoint
    @routes.get("/universe_downloader/api/hub/civitai/search")
    async def api_hub_civitai_search(request):
        q = request.rel_url.query.get("query", "").strip()
        m_type = request.rel_url.query.get("type", "All")
        base_model = request.rel_url.query.get("base_model", "All")
        sort = request.rel_url.query.get("sort", "Most Downloaded")
        period = request.rel_url.query.get("period", "AllTime")
        page = request.rel_url.query.get("page", "1")
        nsfw = request.rel_url.query.get("nsfw", "false").lower() == "true"

        params = {
            "limit": 20,
            "page": page,
            "sort": sort,
            "period": period,
            "nsfw": "true" if nsfw else "false"
        }
        if q:
            params["query"] = q
        if m_type != "All":
            params["types"] = m_type
        if base_model != "All":
            params["baseModels"] = base_model

        try:
            res = await asyncio.to_thread(civitai_api_request, "https://civitai.com/api/v1/models", params)
            if res.status_code == 200:
                raw_data = res.json()
                items = [parse_civitai_model_card(it) for it in raw_data.get("items", [])]
                return web.json_response({
                    "status": "ok",
                    "items": items,
                    "metadata": raw_data.get("metadata", {})
                })
            else:
                return web.json_response({"status": "error", "message": f"Civitai HTTP {res.status_code}"}, status=res.status_code)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 4. Hugging Face Search Endpoint
    @routes.get("/universe_downloader/api/hub/hf/search")
    async def api_hub_hf_search(request):
        q = request.rel_url.query.get("query", "").strip()
        try:
            limit = max(1, min(int(request.rel_url.query.get("limit", 20)), 50))
        except (TypeError, ValueError):
            limit = 20
        if not q:
            q = "illustrious"

        params = {
            "search": q,
            "limit": limit,
            "full": "true"
        }

        try:
            res = await asyncio.to_thread(hf_api_request, "https://huggingface.co/api/models", params)
            if res.status_code == 200:
                raw_items = res.json()
                results = []
                for it in raw_items:
                    repo_id = it.get("id", "")
                    results.append({
                        "id": repo_id,
                        "name": repo_id,
                        "author": it.get("author") or repo_id.split("/")[0],
                        "downloads": it.get("downloads", 0),
                        "likes": it.get("likes", 0),
                        "pipeline_tag": it.get("pipeline_tag", ""),
                        "tags": (it.get("tags") or [])[:5]
                    })
                return web.json_response({"status": "ok", "items": results})
            else:
                return web.json_response({"status": "error", "message": f"Hugging Face HTTP {res.status_code}"}, status=res.status_code)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 5. Hugging Face Repo Model Files Endpoint
    @routes.get("/universe_downloader/api/hub/hf/files")
    async def api_hub_hf_files(request):
        repo_id = request.rel_url.query.get("repo_id", "").strip()
        if not repo_id:
            return web.json_response({"status": "error", "message": "Falta repo_id"}, status=400)

        try:
            res = await asyncio.to_thread(hf_api_request, f"https://huggingface.co/api/models/{repo_id}")
            if res.status_code == 200:
                data = res.json()
                siblings = data.get("siblings", [])
                tags = data.get("tags", [])
                model_files = []
                for s in siblings:
                    rfn = s.get("rfilename", "")
                    if any(rfn.lower().endswith(ext) for ext in [".safetensors", ".gguf", ".bin", ".pt", ".pth", ".ckpt"]):
                        fname = os.path.basename(rfn)
                        cat, reason = detect_model_category(filename=fname, repo_name=repo_id, tags=tags, path_hint=rfn)
                        direct_url = f"https://huggingface.co/{repo_id}/resolve/main/{rfn}"
                        model_files.append({
                            "filename": fname,
                            "rfilename": rfn,
                            "download_url": direct_url,
                            "recommended_folder": cat,
                            "reason": reason
                        })
                return web.json_response({"status": "ok", "repo_id": repo_id, "files": model_files})
            else:
                return web.json_response({"status": "error", "message": f"Hugging Face HTTP {res.status_code}"}, status=res.status_code)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 6. Universal URL Inspector Endpoint
    @routes.get("/universe_downloader/api/hub/preview")
    async def api_hub_civitai_preview(request):
        image_url = request.rel_url.query.get("url", "").strip()
        if not image_url:
            return web.Response(status=400, text="Falta la URL de la imagen")
        try:
            image_data = await asyncio.to_thread(fetch_civitai_preview_png, image_url)
            return web.Response(
                body=image_data,
                content_type="image/png",
                headers={"Cache-Control": "public, max-age=3600", "X-Content-Type-Options": "nosniff"}
            )
        except ValueError as e:
            return web.Response(status=400, text=str(e))
        except Exception:
            return web.Response(status=502, text="No se pudo cargar la imagen de Civitai")

    @routes.get('/universe_downloader/api/hub/clipboard_links')
    @routes.post('/universe_downloader/api/hub/clipboard_links')
    async def api_hub_clipboard_links(request):
        try:
            urls = await asyncio.to_thread(get_system_clipboard_urls)
            return web.json_response({'status': 'ok', 'urls': urls})
        except Exception as e:
            logging.warning('[Universe Downloader] Error leyendo portapapeles: %s', e)
            return web.json_response({'status': 'error', 'urls': [], 'message': str(e)})

    @routes.post("/universe_downloader/api/hub/inspect_url")
    async def api_hub_inspect_url(request):
        try:
            body = await request.json()
            url = body.get("url", "").strip()
            res = await asyncio.to_thread(inspect_universal_url, url)
            if isinstance(res, dict) and res.get("status") == "ok" and res.get("data"):
                enrich_inspected_with_local_status(res["data"])
            return web.json_response(res)
        except ValueError as e:
            logging.warning("[Universe Downloader] No se pudo validar el enlace: %s", e)
            return web.json_response({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            logging.exception("[Universe Downloader] Falló la consulta al proveedor al analizar el enlace")
            return web.json_response({"status": "error", "message": f"No se pudo consultar el proveedor: {e}"}, status=502)

    # 7. Start Download Endpoint
    @routes.post("/universe_downloader/api/hub/download")
    async def api_hub_start_download(request):
        try:
            body = await request.json()
            url = body.get("url", "").strip()
            filename = body.get("filename", "").strip()
            category = body.get("category", "diffusion_models").strip()
            subfolder = body.get("subfolder", "").strip()
            cover_url = body.get("cover_url", "").strip()
            civitai_info = body.get("civitai_info")
            provider = body.get("provider", "civitai")
            total_bytes = 0
            try:
                total_bytes = int(body.get("total_bytes") or 0)
            except Exception:
                total_bytes = 0

            if not url or not filename:
                return web.json_response({"status": "error", "message": "Faltan parámetros requeridos (url, filename)"}, status=400)
            await asyncio.to_thread(validate_download_url, url)

            task_id = HUB_MANAGER.start_download(
                url=url,
                filename=filename,
                category=category,
                subfolder=subfolder,
                cover_url=cover_url,
                civitai_info=civitai_info,
                provider=provider,
                total_bytes=total_bytes
            )
            return web.json_response({
                "status": "ok",
                "task_id": task_id,
                "message": f"Descarga de '{filename}' iniciada en {category}"
            })
        except FileExistsError as e:
            return web.json_response({"status": "error", "message": str(e)}, status=409)
        except ValueError as e:
            return web.json_response({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 8. List Tasks Endpoint
    @routes.get("/universe_downloader/api/hub/tasks")
    async def api_hub_get_tasks(request):
        tasks = HUB_MANAGER.get_all_tasks()
        return web.json_response({"status": "ok", "tasks": tasks})

    # 9. Pause Task Endpoint
    @routes.post("/universe_downloader/api/hub/pause")
    async def api_hub_pause_task(request):
        try:
            body = await request.json()
            task_id = body.get("task_id", "")
            ok = HUB_MANAGER.pause_task(task_id)
            if not ok:
                return web.json_response({"status": "not_found", "message": "Tarea no encontrada"}, status=404)
            return web.json_response({"status": "ok"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 10. Resume Task Endpoint
    @routes.post("/universe_downloader/api/hub/resume")
    async def api_hub_resume_task(request):
        try:
            body = await request.json()
            task_id = body.get("task_id", "")
            ok = HUB_MANAGER.resume_task(task_id)
            if not ok:
                return web.json_response({"status": "not_found", "message": "Tarea no encontrada"}, status=404)
            return web.json_response({"status": "ok"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 11. Cancel Task Endpoint
    @routes.post("/universe_downloader/api/hub/cancel")
    async def api_hub_cancel_task(request):
        try:
            body = await request.json()
            task_id = body.get("task_id", "")
            ok = await asyncio.to_thread(HUB_MANAGER.cancel_task, task_id)
            if not ok:
                return web.json_response({"status": "not_found", "message": "Tarea no encontrada"}, status=404)
            return web.json_response({"status": "ok"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 12. Delete Task Endpoint
    @routes.post("/universe_downloader/api/hub/delete_task")
    async def api_hub_delete_task(request):
        try:
            body = await request.json()
            task_id = body.get("task_id", "")
            ok = await asyncio.to_thread(HUB_MANAGER.delete_task, task_id)
            if not ok:
                return web.json_response({"status": "not_found", "message": "Tarea no encontrada"}, status=404)
            return web.json_response({"status": "ok"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 12. Clear Finished Tasks Endpoint
    @routes.post("/universe_downloader/api/hub/clear_tasks")
    async def api_hub_clear_tasks(request):
        try:
            cleared = HUB_MANAGER.clear_tasks()
            return web.json_response({"status": "ok", "cleared": cleared})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    # 13. Aria2 Accelerator Status Endpoint
    @routes.get("/universe_downloader/api/hub/aria2_status")
    async def api_hub_aria2_status(request):
        try:
            if sys.platform == "win32":
                return web.json_response({
                    "status": "ok",
                    "aria2_available": False,
                    "executable": None,
                    "version": "",
                    "platform": "win32",
                    "can_install_linux": False,
                    "max_connections": 1
                })
            exe = get_aria2_executable()
            active = bool(exe and os.path.exists(exe))
            version_str = ""
            if active:
                try:
                    def _get_ver():
                        run_kwargs = {"capture_output": True, "text": True, "timeout": 5}
                        if os.name == 'nt':
                            run_kwargs["creationflags"] = subprocess.CREATE_NO_WINDOW
                        return subprocess.run([exe, "--version"], **run_kwargs)
                    res = await asyncio.to_thread(_get_ver)
                    if res.returncode == 0:
                        first_line = res.stdout.strip().splitlines()[0]
                        version_str = first_line
                except Exception:
                    pass
            can_install_linux = (sys.platform != "win32") and (not active) and bool(shutil.which("apt-get"))
            return web.json_response({
                "status": "ok",
                "aria2_available": active,
                "executable": exe if active else None,
                "version": version_str,
                "platform": sys.platform,
                "can_install_linux": can_install_linux,
                # Must match what run() actually uses, otherwise the UI lies.
                "max_connections": ARIA2_MAX_CONNECTIONS if active else NATIVE_MAX_CONNECTIONS
            })
        except Exception as e:
            return web.json_response({"status": "error", "aria2_available": False, "message": str(e)})

    # 13.1 Aria2 Auto-Installer Endpoint for Linux / Vast.ai
    @routes.post("/universe_downloader/api/hub/install_aria2")
    async def api_hub_install_aria2(request):
        try:
            allow_install = (
                os.environ.get("UNIVERSE_DOWNLOADER_ALLOW_ARIA2_INSTALL") or
                os.environ.get("UNIVERSE_STUDIO_ALLOW_ARIA2_INSTALL") or
                (sys.platform != "win32" and hasattr(os, "geteuid") and os.geteuid() == 0)
            )
            if not allow_install:
                return web.json_response({
                    "status": "error",
                    "message": "Instalación remota deshabilitada. Define UNIVERSE_DOWNLOADER_ALLOW_ARIA2_INSTALL=1 en el servidor si deseas permitirlo."
                }, status=403)
            if sys.platform == "win32":
                return web.json_response({"status": "error", "message": "Instalación de aria2 solo disponible en sistemas Linux (Vast.ai / RunPod / Docker). En Windows se utiliza el motor nativo de Python."}, status=400)
            
            ok, msg = await asyncio.to_thread(install_aria2_linux)
            exe = get_aria2_executable()
            return web.json_response({
                "status": "ok" if ok else "error",
                "message": msg,
                "aria2_available": bool(exe and os.path.exists(exe)),
                "executable": exe
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    try:
        from .link_bank import register_link_bank_routes
        register_link_bank_routes(routes)
    except Exception as e:
        import traceback
        print(f"[Universe Downloader] Could not register link bank routes: {e}")
        traceback.print_exc()

    print("[Universe Downloader] Downloader & Browser backend routes registered successfully.")
