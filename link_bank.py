# Universe Downloader — Banco de Enlaces (Link Bank)
# Guarda enlaces de modelos (Civitai, Hugging Face, directos) para descargarlos cuando quieras.
# Detecta inteligentemente si ya están descargados en disco o en la caché de Universe Studio.
# Diseñado para portabilidad y uso con Vast.ai / RunPod / local.

import os
import json
import time
import uuid
import threading
import asyncio
from aiohttp import web
import folder_paths

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
LINK_BANK_FILE = os.path.join(DATA_DIR, "link_bank.json")
MODELS_CACHE_FILE = os.path.join(DATA_DIR, "models_cache.json")
LINK_BANK_LOCK = threading.RLock()

MODEL_EXTS = {".safetensors", ".ckpt", ".pt", ".bin", ".gguf"}

# ---------------------------------------------------------------------------
# Persistencia
# ---------------------------------------------------------------------------

def _default_bank():
    return {"links": []}


def load_link_bank():
    with LINK_BANK_LOCK:
        if os.path.exists(LINK_BANK_FILE):
            try:
                with open(LINK_BANK_FILE, "r", encoding="utf-8") as f:
                    data = json.load(f)
                if isinstance(data, dict) and isinstance(data.get("links"), list):
                    return data
            except Exception as e:
                print(f"[Link Bank] Error leyendo link_bank.json: {e}")
        return _default_bank()


def save_link_bank(data):
    with LINK_BANK_LOCK:
        tmp = None
        try:
            os.makedirs(DATA_DIR, exist_ok=True)
            tmp = f"{LINK_BANK_FILE}.tmp_{os.getpid()}_{threading.get_ident()}_{time.time_ns()}"
            with open(tmp, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.flush()
                os.fsync(f.fileno())
            for attempt in range(5):
                try:
                    os.replace(tmp, LINK_BANK_FILE)
                    return True
                except PermissionError:
                    if attempt == 4:
                        raise
                    time.sleep(0.08)
            return True
        except Exception as e:
            print(f"[Link Bank] Error guardando link_bank.json: {e}")
            return False
        finally:
            if tmp and os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except Exception:
                    pass


class _BankTransaction:
    """
    Serializes whole read-modify-write cycles over link_bank.json.

    LINK_BANK_LOCK alone only protected individual load/save calls, so two
    concurrent mutations both loaded the same snapshot and the second write
    silently discarded the first (lost update).
    """

    def __enter__(self):
        _BANK_TXN_LOCK.acquire()
        return self

    def __exit__(self, exc_type, exc, tb):
        _BANK_TXN_LOCK.release()
        return False


_BANK_TXN_LOCK = threading.Lock()


# ---------------------------------------------------------------------------
# Detección ultra-precisa de modelos locales en disco y models_cache.json
# ---------------------------------------------------------------------------

def _iter_model_roots():
    roots = []
    seen = set()

    def _add(path):
        if not path:
            return
        try:
            real = os.path.realpath(str(path))
        except Exception:
            real = str(path)
        if real not in seen and os.path.isdir(real):
            seen.add(real)
            roots.append(real)

    try:
        _add(folder_paths.models_dir)
    except Exception:
        pass

    try:
        fnap = getattr(folder_paths, "folder_names_and_paths", {}) or {}
        for _key, entry in fnap.items():
            paths = entry[0] if isinstance(entry, (tuple, list)) and entry else []
            for p in paths or []:
                _add(p)
    except Exception:
        pass

    return roots


def _load_models_cache():
    caches = []
    if os.path.exists(MODELS_CACHE_FILE):
        caches.append(MODELS_CACHE_FILE)
    sibling_cache = os.path.join(os.path.dirname(BASE_DIR), "ComfyUI_UniverseStudio", "data", "models_cache.json")
    if os.path.exists(sibling_cache):
        caches.append(sibling_cache)
    merged = {}
    for c_file in caches:
        try:
            with open(c_file, "r", encoding="utf-8") as f:
                c = json.load(f)
                if isinstance(c, dict):
                    merged.update(c)
        except Exception:
            pass
    return merged


def build_local_indices():
    """
    Construye índices completos de búsqueda:
      - filename_index: basename lower -> list of abs_paths
      - civitai_version_index: str(version_id) -> abs_path
      - civitai_model_index: str(model_id) -> list of abs_paths
      - sha256_index: sha256_lower -> abs_path
    """
    filename_index = {}
    for root in _iter_model_roots():
        try:
            for dirpath, _dirnames, filenames in os.walk(root):
                for fn in filenames:
                    ext = os.path.splitext(fn)[1].lower()
                    if ext not in MODEL_EXTS:
                        continue
                    key = fn.lower()
                    full = os.path.join(dirpath, fn)
                    filename_index.setdefault(key, []).append(full)
        except Exception:
            continue

    civitai_version_index = {}
    civitai_model_index = {}
    sha256_index = {}

    cache = _load_models_cache()
    for abs_path, meta in cache.items():
        if not isinstance(meta, dict):
            continue
        # Solo considerar si el archivo realmente existe en disco
        try:
            if not os.path.exists(abs_path):
                continue
        except Exception:
            continue

        c_data = meta.get("civitai_data") or {}
        v_id = c_data.get("version_id")
        m_id = c_data.get("model_id")
        h = meta.get("sha256")

        if v_id:
            civitai_version_index[str(v_id)] = abs_path
        if m_id:
            civitai_model_index.setdefault(str(m_id), []).append(abs_path)
        if h:
            sha256_index[str(h).lower()] = abs_path

    return {
        "filename_index": filename_index,
        "civitai_version_index": civitai_version_index,
        "civitai_model_index": civitai_model_index,
        "sha256_index": sha256_index,
    }


def _is_size_compatible(disk_size: int, expected_size: int) -> bool:
    """Valida si el tamaño en disco es congruente con el tamaño esperado."""
    if not expected_size or expected_size <= 0:
        return disk_size > 0
    tolerance = max(2 * 1024 * 1024, int(expected_size * 0.02))
    return abs(disk_size - expected_size) <= tolerance


def _expected_filenames_from_entry(entry):
    """
    Retorna los nombres de archivo esperados.
    Si la entrada tiene un filename principal explícito, solo busca ese
    para no generar falsos positivos con otros archivos del mismo modelo.
    """
    fn = (entry.get("filename") or "").strip()
    if fn:
        return [fn]

    names = []
    for f in entry.get("files") or []:
        if isinstance(f, dict):
            n = (f.get("filename") or f.get("name") or "").strip()
            if n:
                names.append(n)
        elif isinstance(f, str) and f.strip():
            names.append(f.strip())

    seen = set()
    out = []
    for n in names:
        k = str(n).lower()
        if k not in seen:
            seen.add(k)
            out.append(n)
    return out


def find_local_for_entry(entry, indices):
    """
    Busca si una entrada de Link Bank está presente localmente en disco.
    Criterios rigurosos para evitar falsos positivos entre archivos del mismo repo:
      1. Coincidencia por SHA256 (si está disponible y el archivo existe).
      2. Coincidencia por nombre de archivo exacto con validación de tamaño (> 0 y ±2%).
      3. Coincidencia por Version ID en models_cache ÚNICAMENTE si coincide
         el nombre de archivo o el tamaño es compatible.
      (El fallback ciego por model_id queda eliminado para evitar que el VAE
       bloquee la descarga de Text Encoders o DiTs del mismo modelo).
    Devuelve (status, local_path, matched_filename)
    """
    target_fn = (entry.get("filename") or "").strip().lower()
    version_id = str(entry.get("version_id") or "").strip()
    sha256 = str(entry.get("sha256") or "").strip().lower()
    size_bytes = int(entry.get("size_bytes") or 0)
    category = (entry.get("category") or "").split("/")[0].lower()

    # 1. SHA256 (Identificación criptográfica exacta)
    if sha256 and sha256 in indices.get("sha256_index", {}):
        path = indices["sha256_index"][sha256]
        if os.path.isfile(path) and os.path.getsize(path) > 0:
            return "present", path, os.path.basename(path)

    # 2. Búsqueda por Nombre de Archivo en directorios de ComfyUI
    names = _expected_filenames_from_entry(entry)
    candidates = []
    for fn in names:
        if not fn:
            continue
        base = os.path.basename(str(fn).replace("\\", "/")).lower()
        hits = indices.get("filename_index", {}).get(base) or []
        for h in hits:
            if not os.path.isfile(h):
                continue
            try:
                sz = os.path.getsize(h)
                if sz == 0:
                    continue  # Descartar archivos vacíos o corruptos
                candidates.append((base, h, sz))
            except OSError:
                continue

    if candidates:
        valid_candidates = []
        for base, path, sz in candidates:
            # Si se conoce el tamaño esperado, validar compatibilidad
            if size_bytes > 0 and not _is_size_compatible(sz, size_bytes):
                continue

            score = 0
            if size_bytes > 0 and _is_size_compatible(sz, size_bytes):
                score += 20
            if category and category in path.lower().replace("\\", "/"):
                score += 10
            valid_candidates.append((score, base, path))

        if valid_candidates:
            valid_candidates.sort(key=lambda x: -x[0])
            _, base, path = valid_candidates[0]
            return "present", path, base

    # 3. Civitai Version ID (Solo aceptado si valida tamaño o nombre)
    if version_id and version_id.lower() not in ("main", "master", "latest", "direct", ""):
        cached_paths = indices.get("civitai_version_index", {}).get(version_id)
        if cached_paths:
            if isinstance(cached_paths, str):
                cached_paths = [cached_paths]
            for p in cached_paths:
                if not os.path.isfile(p):
                    continue
                p_base = os.path.basename(p).lower()
                try:
                    p_size = os.path.getsize(p)
                except OSError:
                    continue

                name_match = (target_fn and p_base == target_fn)
                size_match = _is_size_compatible(p_size, size_bytes) if size_bytes > 0 else False

                if name_match or size_match:
                    return "present", p, os.path.basename(p)

    return "missing", "", ""


def refresh_entry_local_status(entry, indices=None):
    if indices is None:
        indices = build_local_indices()
    status, path, matched = find_local_for_entry(entry, indices)
    entry["local_status"] = status
    entry["local_path"] = path if status == "present" else ""
    entry["matched_filename"] = matched
    entry["checked_at"] = time.time()
    return entry


def refresh_all_local_status():
    with _BankTransaction():
        bank = load_link_bank()
        indices = build_local_indices()
        changed = False
        for entry in bank.get("links", []):
            old_status = entry.get("local_status")
            old_path = entry.get("local_path")
            refresh_entry_local_status(entry, indices)
            if entry.get("local_status") != old_status or entry.get("local_path") != old_path:
                changed = True
        if changed:
            save_link_bank(bank)
    return bank


# ---------------------------------------------------------------------------
# Enriquecimiento automático de enlaces con metadatos
# ---------------------------------------------------------------------------

def _enrich_entry_from_url(entry):
    """
    Si faltan filename, download_url o title, inspecciona la URL con inspect_universal_url
    de hub_backend para completar todos los campos automáticamente.
    """
    url = (entry.get("url") or "").strip()
    if not url:
        return entry

    # Si ya tiene nombre de archivo y URL de descarga, está completo
    if entry.get("filename") and entry.get("download_url") and entry.get("title"):
        return entry

    try:
        from .hub_backend import inspect_universal_url
        res = inspect_universal_url(url)
        if isinstance(res, dict) and res.get("status") == "ok":
            data = res.get("data") or {}
            ver = (data.get("versions") and data["versions"][0]) or {}
            file_obj = (ver.get("files") and ver["files"][0]) or {}

            if not entry.get("title"):
                entry["title"] = data.get("name") or file_obj.get("filename") or "Modelo"
            if not entry.get("creator"):
                entry["creator"] = data.get("creator") or ""
            if not entry.get("filename"):
                entry["filename"] = file_obj.get("filename") or ""
            if not entry.get("category"):
                entry["category"] = file_obj.get("recommended_folder") or "diffusion_models"
            if not entry.get("cover_url"):
                entry["cover_url"] = ver.get("cover_url") or data.get("top_cover") or ""
            if not entry.get("download_url"):
                entry["download_url"] = file_obj.get("download_url") or url
            if not entry.get("provider"):
                entry["provider"] = res.get("provider") or "direct"
            if not entry.get("size_bytes"):
                entry["size_bytes"] = int(file_obj.get("size_bytes") or 0)
            if not entry.get("size_formatted"):
                entry["size_formatted"] = file_obj.get("size_formatted") or ""
            if not entry.get("model_id"):
                entry["model_id"] = str(data.get("id") or "")
            if not entry.get("version_id"):
                entry["version_id"] = str(ver.get("id") or "")
            if not entry.get("files"):
                entry["files"] = ver.get("files") or []
            if not entry.get("trained_words"):
                entry["trained_words"] = ver.get("trained_words") or []
            if not entry.get("base_model"):
                entry["base_model"] = ver.get("base_model") or ""
    except Exception as e:
        print(f"[Link Bank] Aviso: auto-enriquecimiento no pudo completarse: {e}")

    # Fallback por si la inspección no obtuvo filename
    if not entry.get("filename"):
        clean_name = os.path.basename(url.split("?")[0].split("#")[0])
        ext = os.path.splitext(clean_name)[1].lower()
        if ext in MODEL_EXTS:
            entry["filename"] = clean_name
        else:
            entry["filename"] = (entry.get("title") or "modelo").strip() + ".safetensors"

    if not entry.get("download_url"):
        entry["download_url"] = url

    return entry


# ---------------------------------------------------------------------------
# CRUD y Operaciones del Banco
# ---------------------------------------------------------------------------

def _public_entry(entry):
    return {
        "id": entry.get("id"),
        "url": entry.get("url", ""),
        "title": entry.get("title", ""),
        "creator": entry.get("creator", ""),
        "filename": entry.get("filename", ""),
        "category": entry.get("category", "diffusion_models"),
        "cover_url": entry.get("cover_url", ""),
        "download_url": entry.get("download_url", ""),
        "provider": entry.get("provider", "direct"),
        "size_bytes": int(entry.get("size_bytes") or 0),
        "size_formatted": entry.get("size_formatted", ""),
        "notes": entry.get("notes", ""),
        "added_at": entry.get("added_at"),
        "checked_at": entry.get("checked_at"),
        "local_status": entry.get("local_status", "unknown"),
        "local_path": entry.get("local_path", ""),
        "matched_filename": entry.get("matched_filename", ""),
        "model_id": entry.get("model_id", ""),
        "version_id": entry.get("version_id", ""),
        "files": entry.get("files") or [],
        "trained_words": entry.get("trained_words") or [],
        "base_model": entry.get("base_model", ""),
    }


def list_links():
    bank = refresh_all_local_status()
    links = bank.get("links", [])
    # Ordenar: primero los pendientes (faltantes), luego los ya descargados, ambos por fecha reciente
    links.sort(key=lambda e: (
        0 if e.get("local_status") != "present" else 1,
        -(e.get("added_at") or 0),
    ))
    return [_public_entry(e) for e in links]


def add_link(payload):
    url = (payload.get("url") or "").strip()
    if not url:
        raise ValueError("Falta la URL del enlace")

    with _BankTransaction():
        bank = load_link_bank()
        indices = build_local_indices()

        norm_url = url.strip().lower().rstrip("/")
        model_id = str(payload.get("model_id") or "").strip()
        version_id = str(payload.get("version_id") or "").strip()

        payload_fn = (payload.get("filename") or "").strip().lower()
        payload_dl = (payload.get("download_url") or "").strip().lower()

        for e in bank.get("links", []):
            e_url = (e.get("url") or "").strip().lower().rstrip("/")
            e_dl = (e.get("download_url") or "").strip().lower()
            e_fn = (e.get("filename") or "").strip().lower()
            is_same_url = (e_url == norm_url) or (bool(payload_dl) and bool(e_dl) and e_dl == payload_dl)
            is_same_model_file = (
                bool(model_id) and str(e.get("model_id") or "") == model_id
                and (not version_id or not e.get("version_id") or str(e.get("version_id") or "") == version_id)
                and (not payload_fn or not e_fn or payload_fn == e_fn)
            )
            if is_same_url or (bool(payload_fn) and is_same_model_file and payload_fn == e_fn):
                refresh_entry_local_status(e, indices)
                save_link_bank(bank)
                return _public_entry(e), True

        files = payload.get("files") or []
    if isinstance(files, dict):
        files = [files]

    entry = {
        "id": uuid.uuid4().hex[:10],
        "url": url,
        "title": (payload.get("title") or payload.get("name") or "").strip(),
        "creator": (payload.get("creator") or "").strip(),
        "filename": (payload.get("filename") or "").strip(),
        "category": (payload.get("category") or payload.get("recommended_folder") or "").strip(),
        "cover_url": (payload.get("cover_url") or payload.get("top_cover") or "").strip(),
        "download_url": (payload.get("download_url") or "").strip(),
        "provider": (payload.get("provider") or "direct").strip(),
        "size_bytes": int(payload.get("size_bytes") or 0),
        "size_formatted": (payload.get("size_formatted") or "").strip(),
        "notes": (payload.get("notes") or "").strip(),
        "added_at": time.time(),
        "checked_at": 0,
        "local_status": "unknown",
        "local_path": "",
        "matched_filename": "",
        "model_id": str(payload.get("model_id") or ""),
        "version_id": str(payload.get("version_id") or ""),
        "files": files,
        "trained_words": payload.get("trained_words") or [],
        "base_model": (payload.get("base_model") or "").strip(),
    }

    # Auto-enriquecer si falta metadata importante.
    # Deliberately outside the transaction: it performs network requests and
    # must not block every other writer for its duration.
    _enrich_entry_from_url(entry)

    if not entry["category"]:
        entry["category"] = "diffusion_models"

    with _BankTransaction():
        bank = load_link_bank()
        norm_url = url.strip().lower().rstrip("/")
        model_id = str(entry.get("model_id") or "").strip()
        version_id = str(entry.get("version_id") or "").strip()
        entry_fn = (entry.get("filename") or "").strip().lower()
        entry_dl = (entry.get("download_url") or "").strip().lower()
        for e in bank.get("links", []):
            e_url = (e.get("url") or "").strip().lower().rstrip("/")
            e_dl = (e.get("download_url") or "").strip().lower()
            e_fn = (e.get("filename") or "").strip().lower()
            is_same_url = (e_url == norm_url) or (bool(entry_dl) and bool(e_dl) and e_dl == entry_dl)
            is_same_model_file = (
                bool(model_id) and str(e.get("model_id") or "") == model_id
                and (not version_id or not e.get("version_id") or str(e.get("version_id") or "") == version_id)
                and (not entry_fn or not e_fn or entry_fn == e_fn)
            )
            if is_same_url or (bool(entry_fn) and is_same_model_file and entry_fn == e_fn):
                indices = build_local_indices()
                refresh_entry_local_status(e, indices)
                save_link_bank(bank)
                return _public_entry(e), True

        indices = build_local_indices()
        refresh_entry_local_status(entry, indices)
        bank.setdefault("links", []).append(entry)
        save_link_bank(bank)
    return _public_entry(entry), False


def delete_link(link_id):
    with _BankTransaction():
        bank = load_link_bank()
        links = bank.get("links", [])
        for i, e in enumerate(links):
            if e.get("id") == link_id:
                del links[i]
                save_link_bank(bank)
                return True
    return False


def update_link(link_id, payload):
    with _BankTransaction():
        bank = load_link_bank()
        indices = build_local_indices()
        for e in bank.get("links", []):
            if e.get("id") == link_id:
                for key in ("notes", "title", "category", "filename", "download_url", "size_bytes", "cover_url"):
                    if key in payload and payload[key] is not None:
                        if key == "size_bytes":
                            try:
                                e[key] = int(payload[key] or 0)
                            except Exception:
                                pass
                        else:
                            e[key] = payload[key]
                refresh_entry_local_status(e, indices)
                save_link_bank(bank)
                return _public_entry(e)
    return None


def batch_download_missing_links():
    """
    Inicia la descarga de todos los modelos marcados como 'missing' en el banco.
    Utiliza el HUB_MANAGER (Aria2 acelerado) de Universe Studio.
    Devuelve lista de { id, title, task_id, status }
    """
    from .hub_backend import HUB_MANAGER

    bank = refresh_all_local_status()
    results = []

    for entry in bank.get("links", []):
        if entry.get("local_status") == "present":
            continue

        dl_url = entry.get("download_url") or entry.get("url") or ""
        fn = entry.get("filename") or ""
        cat = entry.get("category") or "diffusion_models"

        if not dl_url or not fn:
            # Intentar enriquecer
            _enrich_entry_from_url(entry)
            dl_url = entry.get("download_url") or entry.get("url") or ""
            fn = entry.get("filename") or ""
            cat = entry.get("category") or "diffusion_models"

        if not dl_url or not fn:
            results.append({
                "id": entry.get("id"),
                "title": entry.get("title"),
                "status": "error",
                "message": "Falta URL de descarga o nombre de archivo"
            })
            continue

        civitai_info = None
        if entry.get("title") or entry.get("trained_words"):
            civitai_info = {
                "civitai_status": "found",
                "model_name": entry.get("title") or fn,
                "base_model": entry.get("base_model") or "",
                "trained_words": entry.get("trained_words") or [],
                "model_id": entry.get("model_id") or ""
            }

        try:
            task_id = HUB_MANAGER.start_download(
                url=dl_url,
                filename=fn,
                category=cat,
                subfolder="",
                cover_url=entry.get("cover_url") or "",
                civitai_info=civitai_info,
                provider=entry.get("provider") or "direct",
                total_bytes=int(entry.get("size_bytes") or 0)
            )
            results.append({
                "id": entry.get("id"),
                "title": entry.get("title") or fn,
                "task_id": task_id,
                "status": "started"
            })
        except FileExistsError:
            entry["local_status"] = "present"
            results.append({
                "id": entry.get("id"),
                "title": entry.get("title") or fn,
                "status": "already_exists",
                "message": "Ya existe en disco"
            })
        except Exception as e:
            results.append({
                "id": entry.get("id"),
                "title": entry.get("title") or fn,
                "status": "error",
                "message": str(e)
            })

    with _BankTransaction():
        bank = load_link_bank()
        save_link_bank(bank)
    return results


# ---------------------------------------------------------------------------
# Rutas HTTP para Universe Studio
# ---------------------------------------------------------------------------

_LINK_BANK_ROUTES_REGISTERED = False

def register_link_bank_routes(routes):
    global _LINK_BANK_ROUTES_REGISTERED
    if _LINK_BANK_ROUTES_REGISTERED:
        return
    _LINK_BANK_ROUTES_REGISTERED = True

    @routes.get("/universe_downloader/api/hub/links")
    async def api_link_bank_list(request):
        try:
            links = await asyncio.to_thread(list_links)
            present = sum(1 for x in links if x.get("local_status") == "present")
            return web.json_response({
                "status": "ok",
                "links": links,
                "count": len(links),
                "present_count": present,
                "missing_count": len(links) - present,
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links")
    async def api_link_bank_add(request):
        try:
            body = await request.json()
            entry, existed = await asyncio.to_thread(add_link, body)
            return web.json_response({
                "status": "ok",
                "link": entry,
                "existed": existed,
                "message": "Ese enlace ya estaba en tu banco" if existed else "Enlace guardado en el banco",
            })
        except ValueError as e:
            return web.json_response({"status": "error", "message": str(e)}, status=400)
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links/check")
    async def api_link_bank_check(request):
        try:
            body = {}
            try:
                body = await request.json()
            except Exception:
                body = {}
            link_id = (body.get("id") or body.get("link_id") or "").strip()
            if link_id:
                def _check_one():
                    with _BankTransaction():
                        bank = load_link_bank()
                        target = None
                        for e in bank.get("links", []):
                            if e.get("id") == link_id:
                                target = e
                                break
                        if target is None:
                            return None
                        refresh_entry_local_status(target)
                        save_link_bank(bank)
                        return _public_entry(target)

                public = await asyncio.to_thread(_check_one)
                if public is None:
                    return web.json_response({"status": "error", "message": "Enlace no encontrado"}, status=404)
                return web.json_response({"status": "ok", "link": public})

            links = await asyncio.to_thread(list_links)
            present = sum(1 for x in links if x.get("local_status") == "present")
            return web.json_response({
                "status": "ok",
                "links": links,
                "count": len(links),
                "present_count": present,
                "missing_count": len(links) - present,
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links/update")
    async def api_link_bank_update(request):
        try:
            body = await request.json()
            link_id = (body.get("id") or body.get("link_id") or "").strip()
            if not link_id:
                return web.json_response({"status": "error", "message": "Falta id"}, status=400)
            entry = await asyncio.to_thread(update_link, link_id, body)
            if not entry:
                return web.json_response({"status": "error", "message": "Enlace no encontrado"}, status=404)
            return web.json_response({"status": "ok", "link": entry})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links/delete")
    async def api_link_bank_delete(request):
        try:
            body = await request.json()
            link_id = (body.get("id") or body.get("link_id") or "").strip()
            if not link_id:
                return web.json_response({"status": "error", "message": "Falta id"}, status=400)
            ok = await asyncio.to_thread(delete_link, link_id)
            if not ok:
                return web.json_response({"status": "error", "message": "Enlace no encontrado"}, status=404)
            return web.json_response({"status": "ok"})
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links/batch_download")
    async def api_link_bank_batch_download(request):
        try:
            results = await asyncio.to_thread(batch_download_missing_links)
            started_count = sum(1 for r in results if r.get("status") == "started")
            return web.json_response({
                "status": "ok",
                "results": results,
                "started_count": started_count,
                "total_processed": len(results),
                "message": f"Se han puesto en cola {started_count} descargas" if started_count else "No hay enlaces pendientes para descargar"
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.get("/universe_downloader/api/hub/links/export")
    async def api_link_bank_export(request):
        try:
            bank = await asyncio.to_thread(load_link_bank)
            content = json.dumps(bank, indent=2, ensure_ascii=False)
            return web.Response(
                text=content,
                content_type="application/json",
                headers={"Content-Disposition": 'attachment; filename="universe_downloader_link_bank.json"'}
            )
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    @routes.post("/universe_downloader/api/hub/links/import")
    async def api_link_bank_import(request):
        try:
            data = await request.json()
            imported_links = []
            if isinstance(data, dict) and isinstance(data.get("links"), list):
                imported_links = data["links"]
            elif isinstance(data, list):
                imported_links = data
            else:
                return web.json_response({"status": "error", "message": "Formato de archivo inválido. Se esperaba lista de enlaces."}, status=400)

            def _merge_imported(imported_links):
                with _BankTransaction():
                    bank = load_link_bank()
                    existing_urls = {str(e.get("url")).strip() for e in bank.get("links", []) if e.get("url")}
                    added = 0
                    for item in imported_links:
                        if not isinstance(item, dict):
                            continue
                        url = str(item.get("url") or "").strip()
                        if not url or url in existing_urls:
                            continue
                        item["id"] = uuid.uuid4().hex[:10]
                        item["added_at"] = time.time()
                        item["local_status"] = "unknown"
                        bank.setdefault("links", []).append(item)
                        existing_urls.add(url)
                        added += 1
                    save_link_bank(bank)
                return added

            added = await asyncio.to_thread(_merge_imported, imported_links)
            links = await asyncio.to_thread(list_links)
            return web.json_response({
                "status": "ok",
                "added_count": added,
                "total_count": len(links),
                "message": f"Se importaron {added} enlaces nuevos con éxito."
            })
        except Exception as e:
            return web.json_response({"status": "error", "message": str(e)}, status=500)

    print("[Universe Studio Link Bank] Routes registered successfully.")
