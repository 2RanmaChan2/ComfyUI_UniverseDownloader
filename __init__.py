"""
Universe Downloader Comfyui
Gestor y Hub de Descargas inteligente para ComfyUI (Civitai, Hugging Face, Enlaces directos).
Presiona 'g' dos veces rápido (gg) para abrir en el lienzo.
"""
import os
import sys
import logging

WEB_DIRECTORY = "./js"
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

try:
    from server import PromptServer
    from . import hub_backend
    from . import link_bank

    if hasattr(PromptServer, "instance") and PromptServer.instance:
        prompt_server = PromptServer.instance
        if hasattr(prompt_server, "routes"):
            hub_backend.register_hub_routes(prompt_server.routes)
            link_bank.register_link_bank_routes(prompt_server.routes)
            print("[Universe Downloader] Rutas y Hub de descargas registrados con éxito.")
except Exception as e:
    logging.exception(f"[Universe Downloader] Error al registrar rutas del Hub: {e}")

__all__ = ["WEB_DIRECTORY", "NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS"]
