# Universe Downloader Comfyui

Hub y gestor autónomo de descargas de modelos para ComfyUI (Civitai, Hugging Face y enlaces directos).
Compatible al 100% con **Windows** y **Linux (Vast.ai, RunPod, Google Colab, Docker)**.

---

## Características principales

- **Atajo ultra-rápido:** Presiona la tecla **`g` dos veces rápido (`gg`)** en cualquier parte del canvas para abrir o cerrar el panel al instante.
- **Botón en el menú:** También disponible directamente desde el menú principal de ComfyUI (*Universe Downloader (gg)*).
- **Diseño Cyberpunk OLED idéntico al Hub:** Tema oscuro de alto contraste (`#000000`), bordes de precisión y detalles en violeta (`#a855f7`).
- **Análisis universal de enlaces:** Pega enlaces de Civitai (modelos, versiones o descargas directas) o repositorios de Hugging Face.
- **Detección inteligente de destino:** Auto-clasifica en `diffusion_models`, `loras`, `vae`, `text_encoders`, `checkpoints`, `controlnet`, `clip_vision`, etc.
- **Detección de archivos ya descargados:** Verifica si el modelo ya está en tu carpeta de modelos y te avisa con `✓ EN DISCO (No hace falta descargarlo)` para evitar descargas redundantes.
- **Integración con portapapeles:** Botón `📋 Portapapeles` con soporte para historial en Windows y utilidades Linux (`wl-paste`, `xclip`, `xsel`).
- **Banco de Enlaces (Link Bank):** Guarda modelos como marcadores, compruébalos, descárgalos individualmente o en lote, e impórtalos/expórtalos en JSON.
- **Motor híbrido de descarga:**
  - *Nativo Multi-stream:* descarga acelerada en paralelo con cálculo de velocidad en tiempo real y tiempo estimado (ETA).
  - *Nativo Single-stream:* para LoRAs y archivos pequeños sin saturar el CDN de Civitai.
  - *Aria2:* soporte para aceleración ultra-rápida (activable automáticamente en Linux con `apt install aria2`).
- **Metadatos y vistas previas automáticas:** Descarga en paralelo portadas `.preview.png`, datos `.civitai.info` y trigger words en `.rgthree-info.json` para nodos de ComfyUI.
- **Recarga inmediata:** ComfyUI detecta los nuevos modelos sin tener que reiniciar el servidor.

---

## Instalación

### Opción 1: En Linux / Vast.ai (Recomendado vía Terminal)

1. Abre la terminal de tu instancia de Vast.ai (Jupyter Terminal o SSH):
   ```bash
   cd /workspace/ComfyUI/custom_nodes
   # O si tu ruta es diferente:
   # cd ~/ComfyUI/custom_nodes
   ```
2. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/ComfyUI_UniverseDownloader.git
   ```
3. *(Opcional)* Si quieres máxima velocidad de descarga con conexiones paralelas de Aria2:
   ```bash
   apt-get update && apt-get install -y aria2
   ```
4. Reinicia tu servidor ComfyUI en Vast.ai.
5. En el navegador, haz **`Ctrl + F5`** (o `Ctrl + Shift + R`) en la pestaña de ComfyUI y presiona **`gg`** rápido en el lienzo.

---

### Opción 2: En Windows (Local)

1. Copia o clona la carpeta `ComfyUI_UniverseDownloader` dentro de:
   ```
   ComfyUI/custom_nodes/
   ```
2. Inicia o reinicia ComfyUI.
3. En el navegador, abre ComfyUI y pulsa **`gg`** rápido.

---

## Dependencias

El custom node utiliza bibliotecas estándar de Python y las que ya incluye ComfyUI:
- `requests`
- `pillow`
- `aiohttp`

Si usas un entorno virtual limpio:
```bash
pip install -r requirements.txt
```
