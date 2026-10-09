# Universe Downloader Comfyui

Hub y gestor autónomo de descargas de modelos para ComfyUI (Civitai, Hugging Face y enlaces directos).
Compatible al 100% con **Windows** y **Linux (Vast.ai, RunPod, Google Colab, Docker)**.

---

## Características principales

- **Botón flotante lateral:** Un botón discreto y fijo en el centro a la extrema derecha de la pantalla para abrir y cerrar el panel con un solo clic.
- **Contador en tiempo real:** El botón flotante muestra un badge con el número de descargas activas en curso.
- **Integración con menú ComfyUI:** También disponible directamente desde el menú principal de ComfyUI (*Universe Downloader*).
- **Cierre rápido:** Tecla **`Escape`** o botón `✕` para cerrar inmediatamente.
- **Diseño Cyberpunk OLED:** Tema oscuro de alto contraste (`#000000`), bordes de precisión y acentos en violeta (`#a855f7`).
- **Análisis universal de enlaces:** Pega enlaces de Civitai (modelos, versiones o descargas directas) o repositorios de Hugging Face.
- **Detección inteligente de carpetas:** Auto-clasifica en `diffusion_models`, `loras`, `vae`, `text_encoders`, `checkpoints`, `controlnet`, `clip_vision`, etc.
- **Detección de archivos ya descargados:** Verifica si el modelo ya está en tu carpeta de modelos y te avisa con `✓ EN DISCO (No hace falta descargarlo)` para evitar descargas duplicadas.
- **Integración con portapapeles:** Botón `📋 Portapapeles` para capturar enlaces copiados.
- **Banco de Enlaces (Link Bank):** Guarda modelos como marcadores, compruébalos, descárgalos individualmente o en lote, e impórtalos/expórtalos en JSON.
- **Motor híbrido de descarga:**
  - *Nativo Multi-stream:* descarga acelerada en paralelo con cálculo de velocidad en tiempo real y tiempo estimado (ETA).
  - *Nativo Single-stream:* para LoRAs y archivos pequeños sin saturar el CDN.
  - *Aria2:* soporte para aceleración ultra-rápida (activable automáticamente en Linux con `apt install aria2`).
- **Metadatos y vistas previas automáticas:** Descarga en paralelo portadas `.preview.png`, datos `.civitai.info` y trigger words en `.rgthree-info.json` para nodos de ComfyUI.
- **Recarga inmediata:** ComfyUI detecta los nuevos modelos sin tener que reiniciar el servidor.

---

## Instalación

### En Linux / Vast.ai (Terminal)

1. Abre la terminal de tu instancia de Vast.ai:
   ```bash
   cd /workspace/ComfyUI/custom_nodes
   ```
2. Clona el repositorio:
   ```bash
   git clone https://github.com/2RanmaChan2/ComfyUI_UniverseDownloader.git
   ```
3. *(Opcional)* Instala Aria2 para máxima velocidad de descarga:
   ```bash
   apt-get update && apt-get install -y aria2
   ```
4. Reinicia ComfyUI en Vast.ai.
5. En el navegador, haz **`Ctrl + F5`** (o `Ctrl + Shift + R`) en la pestaña de ComfyUI. Verás el botón en el lateral derecho.

---

### En Windows (Local)

1. Clona o copia la carpeta dentro de:
   ```
   ComfyUI/custom_nodes/ComfyUI_UniverseDownloader
   ```
2. Inicia o reinicia ComfyUI.
3. En el navegador, presiona **`Ctrl + F5`** y haz clic en el botón flotante en el lateral derecho.

---

## Actualización (Update)

Para actualizar a la versión más reciente en cualquier momento (en Vast.ai o local):

```bash
cd /workspace/ComfyUI/custom_nodes/ComfyUI_UniverseDownloader
git pull
```

Luego simplemente haz un refresco forzado en tu navegador con **`Ctrl + F5`**.

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
