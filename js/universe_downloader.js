import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

// ============================================================================
// MASTER CSS STYLESHEET (UNIVERSE CYBERPUNK THEME)
// ============================================================================
const MASTER_CSS = `
        :root {
            /* Pure Pitch Black (Super Negro Puro OLED) */
            --hk-bg: #000000;
            --hk-panel: #08080b;
            --hk-card: #111116;
            --hk-card-hover: #19191f;
            --hk-card-active: #21172e;
            --hk-surface-overlay: rgba(5, 5, 8, 0.94);

            /* Crisp Precision Borders */
            --hk-border: rgba(255, 255, 255, 0.11);
            --hk-border-subtle: rgba(255, 255, 255, 0.065);
            --hk-border-hover: rgba(168, 85, 247, 0.45);
            --hk-border-focus: #a855f7;

            /* High-Contrast Pure White Typography */
            --hk-white: #ffffff;
            --hk-text: #f8fafc;
            --hk-text-muted: #b8b5c3;
            --hk-text-dim: #95919f;

            /* Disciplined Modern Purple Accents */
            --hk-accent: #8b5cf6;
            --hk-accent-soft: rgba(139, 92, 246, 0.16);
            --hk-accent-gradient: linear-gradient(135deg, #a855f7, #7c3aed);
            --hk-accent-glow: 0 0 16px rgba(139, 92, 246, 0.4);
            --hk-purple: #a855f7;
            --hk-purple-deep: #7c3aed;
            --hk-purple-light: #d3b5ff;
            --hk-cyan: #a855f7;
            --hk-cyan-soft: rgba(168, 85, 247, 0.15);
            --hk-green: #10b981;
            --hk-danger: #ef4444;
            --hk-warning: #f59e0b;

            /* Standardized Typography Hierarchy */
            --hk-font-main: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            --hk-mono: "JetBrains Mono", "SF Mono", Consolas, monospace;
            --hk-sans: var(--hk-font-main);

            /* Consistent Geometry */
            --hk-radius-sm: 8px;
            --hk-radius: 10px;
            --hk-radius-lg: 14px;
            --hk-radius-xl: 20px;
        }

        /* Keep the studio reset isolated from the ComfyUI canvas and other nodes. */
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal,
            .hk-autocomplete-popup, #universe-toast-container),
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal,
            .hk-autocomplete-popup, #universe-toast-container) * {
            box-sizing: border-box;
        }

        /* Master Viewport Overlay (Horizontal Desktop Studio Shell) */
        #universe-downloader-overlay {
            position: fixed;
            inset: 0;
            z-index: 999999;
            background: var(--hk-bg);
            color: var(--hk-text);
            font-family: var(--hk-sans);
            display: flex;
            flex-direction: row; /* DOCK RAIL ON LEFT, MAIN VIEWPORT ON RIGHT */
            overflow: hidden;
            user-select: none;
            box-sizing: border-box;
            font-size: 13.5px;
            line-height: 1.45;
            -webkit-font-smoothing: antialiased;
        }

        /* Toast Notifications */
        #universe-toast-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 99999999;
            display: flex;
            flex-direction: column;
            gap: 8px;
            pointer-events: none;
        }
        .universe-toast {
            padding: 12px 18px;
            border-radius: var(--hk-radius);
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-left: 3px solid var(--hk-accent);
            color: var(--hk-text);
            font-family: var(--hk-sans);
            font-size: 13px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .universe-toast.success { border-left-color: var(--hk-green); }
        .universe-toast.error { border-left-color: var(--hk-danger); }

        /* ==================================================================== */
        /* ACTIVITY RAIL (LEFT VERTICAL DOCK - HIGH-END CREATIVE STUDIO)        */
        /* ==================================================================== */
        .hk-activity-rail {
            width: 92px;
            background: var(--hk-bg);
            border-right: 1px solid var(--hk-border);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            padding: 20px 0 14px;
            flex-shrink: 0;
            z-index: 50;
            box-sizing: border-box;
            user-select: none;
        }
        .hk-rail-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
            cursor: pointer;
            padding: 4px;
        }
        .hk-rail-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--hk-accent);
        }
        .hk-rail-brand-tag {
            font-size: 9px;
            font-weight: 800;
            letter-spacing: 0.09em;
            color: var(--hk-white);
            font-family: var(--hk-mono);
        }
        .hk-rail-nav {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 0 10px;
            box-sizing: border-box;
        }
        .hk-rail-btn {
            width: 100%;
            height: 64px;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 14px;
            color: var(--hk-text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 7px;
            cursor: pointer;
            position: relative;
            padding: 4px 2px;
            box-sizing: border-box;
        }
        .hk-rail-btn:hover {
            color: var(--hk-white);
            background: rgba(255, 255, 255, 0.05);
            border-color: var(--hk-border-subtle);
        }
        .hk-rail-btn.active {
            color: var(--hk-white);
            background: var(--hk-card);
            border-color: var(--hk-accent);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .hk-rail-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            line-height: 1;
        }
        .hk-rail-label {
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.02em;
        }
        .hk-rail-count {
            position: absolute;
            top: 3px;
            right: 3px;
            font-size: 8.5px;
            font-family: var(--hk-mono);
            color: var(--hk-text-dim);
            background: rgba(0, 0, 0, 0.45);
            padding: 1px 4px;
            border-radius: 6px;
        }
        .hk-rail-btn.active .hk-rail-count {
            color: var(--hk-purple-light);
            background: rgba(139, 92, 246, 0.15);
        }
        .hk-rail-btn .hk-hub-badge-count {
            position: absolute;
            top: 3px;
            right: 3px;
            background: var(--hk-accent);
            color: var(--hk-white);
            font-size: 8.5px;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 6px;
            line-height: 1.1;
        }

        .hk-rail-footer {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: 100%;
            padding: 0 8px;
            box-sizing: border-box;
        }
        .hk-engine-badge-mini {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(16, 185, 129, 0.12);
            border: 1px solid rgba(16, 185, 129, 0.3);
            margin-bottom: 2px;
        }
        /* Texto del estado real: solo visible con espacio suficiente en el rail. */
        .hk-engine-text {
            display: none;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 0.02em;
            white-space: nowrap;
            color: var(--hk-text-dim);
        }
        .hk-engine-badge-mini:has(.hk-engine-dot.busy) { background: rgba(245, 158, 11, 0.14); border-color: rgba(245, 158, 11, 0.45); }
        .hk-engine-badge-mini:has(.hk-engine-dot.busy) .hk-engine-text { color: #fbbf24; }
        .hk-rail-action-btn {
            width: 100%;
            height: 36px;
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius);
            color: var(--hk-text-muted);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 11px;
            gap: 2px;
            padding: 2px;
            box-sizing: border-box;
        }
        .hk-rail-action-btn:hover {
            color: var(--hk-white);
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
        }
        .hk-rail-action-btn.close {
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.25);
            color: #fca5a5;
        }
        .hk-rail-action-btn.close:hover {
            background: var(--hk-danger);
            border-color: var(--hk-danger);
            color: var(--hk-white);
        }
        .hk-rail-action-sub {
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        /* App Main Area (occupies 100% remaining width next to rail) */
        .hk-app-main {
            flex: 1 1 0;
            min-width: 0;
            height: 100%;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--hk-bg);
            position: relative;
        }

        /* Legacy Fallback Topbar Compatibility */
        .hk-topbar {
            height: 50px;
            background: var(--hk-panel);
            border-bottom: 1px solid var(--hk-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            flex-shrink: 0;
            z-index: 30;
        }
        .hk-brand {
            display: flex;
            align-items: center;
            gap: 10px;
            cursor: pointer;
        }
        .hk-brand-logo {
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--hk-accent);
            font-size: 18px;
        }
        .hk-brand-text {
            display: flex;
            align-items: baseline;
            gap: 6px;
        }
        .hk-brand-name {
            font-weight: 700;
            font-size: 15px;
            letter-spacing: 0.08em;
            color: var(--hk-white);
        }
        .hk-brand-sub {
            font-size: 12px;
            font-weight: 600;
            color: var(--hk-text-muted);
            letter-spacing: 0.02em;
        }

        .hk-nav-tabs {
            display: flex;
            align-items: center;
            gap: 4px;
            background: rgba(0, 0, 0, 0.25);
            padding: 3px;
            border-radius: var(--hk-radius);
            border: 1px solid var(--hk-border-subtle);
        }
        .hk-nav-btn {
            background: transparent;
            border: 1px solid transparent;
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 12.5px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }
        .hk-nav-btn:hover {
            color: var(--hk-text);
            background: rgba(255, 255, 255, 0.04);
        }
        .hk-nav-btn.active {
            color: var(--hk-white);
            background: var(--hk-card);
            border-color: var(--hk-border);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
        .hk-hub-badge-count {
            background: var(--hk-accent);
            color: var(--hk-white);
            font-size: 10.5px;
            font-weight: 700;
            padding: 1px 6px;
            border-radius: 10px;
            line-height: 1.2;
        }

        .hk-top-actions {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .hk-engine-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 10px;
            border-radius: var(--hk-radius-sm);
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.25);
            color: var(--hk-green);
            font-size: 11.5px;
            font-weight: 600;
        }
        .hk-engine-dot {
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: var(--hk-green);
            transition: background-color 200ms ease, box-shadow 200ms ease;
        }
        /* En reposo: punto verde tenue. Generando: ambar pulsante. */
        .hk-engine-dot.busy {
            background: #f59e0b;
            box-shadow: 0 0 8px rgba(245, 158, 11, 0.9);
            animation: hkPulse 1.1s ease-in-out infinite;
        }

        /* Generic Buttons & Standard Controls */
        .hk-btn-cyber {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text);
            font-family: var(--hk-sans);
            font-size: 12.5px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: var(--hk-radius);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            white-space: nowrap;
        }
        .hk-btn-cyber:hover {
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
            color: var(--hk-white);
        }
        .hk-btn-cyber.primary {
            background: var(--hk-accent);
            border-color: rgba(255, 255, 255, 0.15);
            color: var(--hk-white);
        }
        .hk-btn-cyber.primary:hover {
            background: var(--hk-purple-deep);
            border-color: rgba(255, 255, 255, 0.35);
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.4);
        }
        .hk-btn-cyber.danger {
            background: rgba(239, 68, 68, 0.12);
            border-color: rgba(239, 68, 68, 0.3);
            color: #fca5a5;
        }
        .hk-btn-cyber.danger:hover {
            background: var(--hk-danger);
            border-color: var(--hk-danger);
            color: var(--hk-white);
        }
        .hk-btn-icon-xs {
            padding: 4px 6px;
            font-size: 11px;
            border-radius: var(--hk-radius-sm);
        }

        .hk-quick-tag {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 12px;
            font-weight: 600;
            padding: 5px 10px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }
        .hk-quick-tag:hover {
            color: var(--hk-text);
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
        }
        .hk-quick-tag.active {
            color: var(--hk-white);
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
        }

        /* Form Inputs & Selects */
        .hk-input, .hk-select, .hk-textarea {
            background: var(--hk-panel);
            border: 1px solid var(--hk-border);
            color: var(--hk-text);
            font-family: var(--hk-sans);
            font-size: 13px;
            border-radius: var(--hk-radius);
            outline: none;
            box-sizing: border-box;
        }
        .hk-input:focus, .hk-select:focus, .hk-textarea:focus {
            border-color: var(--hk-border-focus);
            box-shadow: 0 0 0 2px var(--hk-accent-soft);
        }
        .hk-input {
            padding: 7px 10px;
        }
        .hk-select {
            padding: 7px 10px;
            cursor: pointer;
        }
        .hk-textarea {
            padding: 10px 12px;
            resize: vertical;
            line-height: 1.5;
        }

        .hk-label {
            font-size: 11px;
            font-weight: 650;
            text-transform: uppercase;
            letter-spacing: 0.07em;
            color: var(--hk-text-muted);
            display: block;
            margin-bottom: 4px;
        }

        /* Toggle Switch */
        .hk-switch {
            position: relative;
            display: inline-block;
            width: 36px;
            height: 20px;
            flex-shrink: 0;
        }
        .hk-switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }
        .hk-slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background-color: var(--hk-card-hover);
            border-radius: 20px;
            border: 1px solid var(--hk-border);
        }
        .hk-slider:before {
            position: absolute;
            content: "";
            height: 14px;
            width: 14px;
            left: 2px;
            bottom: 2px;
            background-color: var(--hk-text-muted);
            border-radius: 50%;
        }
        .hk-switch input:checked + .hk-slider {
            background-color: var(--hk-accent);
            border-color: var(--hk-accent);
        }
        .hk-switch input:checked + .hk-slider:before {
            transform: translateX(16px);
            background-color: var(--hk-white);
        }

        /* Range Slider */
        .hk-range {
            -webkit-appearance: none;
            width: 100%;
            height: 6px;
            background: var(--hk-card-hover);
            border-radius: 3px;
            outline: none;
            border: 1px solid var(--hk-border);
        }
        .hk-range::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: var(--hk-accent);
            cursor: pointer;
            border: 2px solid var(--hk-white);
            box-shadow: 0 1px 4px rgba(0,0,0,0.5);
        }

        /* ==================================================================== */
        /* STAGE LAYOUT & 2-PANE STUDIO (PERFECT SYMMETRY & ZERO OVERFLOW)      */
        /* ==================================================================== */
        .hk-studio-stage {
            display: grid;
            grid-template-columns: 340px minmax(0, 1fr);
            flex: 1 1 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--hk-bg);
        }
        .hk-stage-full {
            flex: 1 1 0;
            min-height: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: var(--hk-bg);
        }

        /* Left Column - Controls Sidebar with Custom Purple Scrollbar */
        .hk-left-col {
            background: var(--hk-panel);
            border-right: 1px solid var(--hk-border);
            display: flex;
            flex-direction: column;
            overflow-y: auto;
            overflow-x: hidden;
            padding: 20px;
            gap: 14px;
            box-sizing: border-box;
            height: 100%;
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        .hk-left-col::-webkit-scrollbar {
            width: 5px;
        }
        .hk-left-col::-webkit-scrollbar-track {
            background: transparent;
        }
        .hk-left-col::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 3px;
        }

        .hk-panel-card {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
            box-sizing: border-box;
            width: 100%;
                    flex-shrink: 0;
}

        /* LoRA Stack (Symmetrical & Anti-Overflow) */
        .hk-lora-row {
            background: var(--hk-card);
            border: 1px solid var(--hk-border-subtle);
            border-radius: var(--hk-radius);
            padding: 10px 12px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-sizing: border-box;
            width: 100%;
        }
        .hk-lora-row.active {
            border-color: rgba(168, 85, 247, 0.45);
            background: var(--hk-card);
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.15);
        }
        .hk-lora-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .hk-lora-controls {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            box-sizing: border-box;
        }
        .hk-lora-slider {
            flex: 1 1 0 !important;
            min-width: 0 !important;
            width: auto !important;
        }
        .hk-lora-num {
            width: 58px !important;
            min-width: 58px !important;
            max-width: 58px !important;
            flex-shrink: 0 !important;
            padding: 4px 2px !important;
            text-align: center !important;
            font-family: var(--hk-mono) !important;
            font-size: 11.5px !important;
            font-weight: 700 !important;
            font-variant-numeric: tabular-nums !important;
            color: var(--hk-white) !important;
            background: #000000 !important;
            border: 1px solid var(--hk-border) !important;
            border-radius: var(--hk-radius-sm) !important;
            box-sizing: border-box !important;
        }
        .hk-lora-num::-webkit-inner-spin-button,
        .hk-lora-num::-webkit-outer-spin-button,
        .hk-dim-input::-webkit-inner-spin-button,
        .hk-dim-input::-webkit-outer-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
        }
        .hk-lora-num, .hk-dim-input {
            -moz-appearance: textfield !important;
        }

        /* Hires Fix Card (Prominent & High Visibility) */
        .hk-hires-card {
            border: 1px solid var(--hk-border);
            background: var(--hk-card);
            border-radius: var(--hk-radius-lg);
            padding: 12px 14px;
            box-sizing: border-box;
            width: 100%;
        }
        .hk-hires-card.active {
            border-color: rgba(168, 85, 247, 0.5);
            box-shadow: 0 0 12px rgba(139, 92, 246, 0.2);
        }
        .hk-hires-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            user-select: none;
        }

        /* Hero Studio Workspace (Wide, Unobstructed Canvas) */
        .hk-studio-workspace {
            display: flex;
            flex-direction: column;
            height: 100%;
            min-width: 0;
            width: 100%;
            overflow: hidden;
            background: var(--hk-bg);
            position: relative;
        }

        /* Legacy workspace header: solo fuera de Studio. Dentro manda el minimal. */
        #universe-downloader-overlay :is(#hk-view-models, #hk-view-hub) .hk-workspace-header,
        .hk-studio-workspace .hk-workspace-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--hk-panel);
            border-bottom: 1px solid var(--hk-border);
            padding: 12px 20px;
            height: auto;
            flex-shrink: 0;
            gap: 10px;
            z-index: 15;
            box-sizing: border-box;
            white-space: nowrap;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            min-height: 64px;
            flex-wrap: wrap;
        }
        .hk-workspace-header::-webkit-scrollbar {
            display: none;
        }
        .hk-format-bar {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
                    flex-wrap: wrap;
}
        .hk-ratio-pill {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 11.5px;
            font-weight: 600;
            padding: 5px 9px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }
        .hk-ratio-pill:hover {
            color: var(--hk-white);
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
        }
        .hk-ratio-pill.active {
            color: var(--hk-white);
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
        }
        .hk-dim-inputs {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: 4px;
            flex-shrink: 0;
        }
        .hk-dim-input {
            width: 58px !important;
            min-width: 58px !important;
            padding: 4px 2px !important;
            text-align: center !important;
            font-size: 11.5px !important;
            font-family: var(--hk-mono) !important;
            font-variant-numeric: tabular-nums !important;
            box-sizing: border-box !important;
        }
        .hk-viewer-control-bar {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-shrink: 0;
                    flex-wrap: wrap;
}
        .hk-meta-tag {
            font-family: var(--hk-mono);
            font-size: 11.5px;
            font-weight: 700;
            color: var(--hk-purple-light);
            white-space: nowrap;
        }
        .hk-viewer-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
                    flex-wrap: wrap;
}
        .hk-act-btn {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 11.5px;
            font-weight: 600;
            padding: 5px 9px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
        }
        .hk-act-btn:hover {
            color: var(--hk-white);
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
        }
        .hk-act-btn.active {
            color: var(--hk-white);
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
        }
        .hk-act-btn.danger {
            color: #fca5a5;
            background: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.25);
        }
        .hk-act-btn.danger:hover {
            background: var(--hk-danger);
            border-color: var(--hk-danger);
            color: var(--hk-white);
        }

        /* Legacy viewport: solo fuera de Studio. Dentro manda el hero absoluto. */
        #universe-downloader-overlay :is(#hk-view-models, #hk-view-hub) .hk-viewport-area,
        .hk-studio-workspace .hk-viewport-area {
            flex: 1 1 0;
            min-height: 0;
            min-width: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            overflow: hidden;
            background: var(--hk-bg);
            padding: 20px 132px 20px 20px;
            box-sizing: border-box;
        }
        .hk-studio-stage .hk-viewport-area,
        .hk-studio-stage .hk-image-frame,
        .hk-studio-stage .hk-main-img {
            position: static;
        }
        .hk-studio-stage .hk-image-frame {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            min-width: 0;
            min-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
        }
        .hk-viewer-empty {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: var(--hk-text-dim);
            text-align: center;
        }
        .hk-empty-icon {
            color: var(--hk-accent);
            font-size: 36px;
            line-height: 1;
            filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.4));
        }
        .hk-empty-title {
            color: #fff;
            letter-spacing: 1.5px;
            font-size: 13.5px;
        }
        .hk-empty-desc {
            margin: 0;
            font-size: 12px;
            color: var(--hk-text-dim);
        }

        /* Metadata HUD: también temporal desde arriba en modo minimal */
        .hk-studio-stage .hk-metadata-hud {
            position: absolute;
            top: 64px;
            left: 50%;
            transform: translateX(-50%);
            right: auto;
            bottom: auto;
            width: min(720px, calc(100% - 32px));
            max-height: calc(100% - 220px);
            background: rgba(5, 5, 8, 0.97);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(14px);
            z-index: 96;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            user-select: text;
        }
        .hk-meta-header {
            padding: 12px 16px;
            border-bottom: 1px solid var(--hk-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: var(--hk-white);
        }
        .hk-meta-body {
            flex: 1;
            overflow-y: auto;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .hk-meta-section {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }
        .hk-meta-key {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.04em;
            color: var(--hk-text-muted);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .hk-meta-val {
            font-size: 12.5px;
            color: var(--hk-text);
            line-height: 1.4;
            word-break: break-word;
        }

        /* Base rail legacy: solo aplica fuera de Studio. Dentro de Studio manda el dropdown. */
        #universe-downloader-overlay :is(#hk-view-models, #hk-view-hub) .hk-history-rail,
        #hk-lightbox-modal .hk-history-rail {
            position: absolute;
            z-index: 10;
            top: 12px;
            right: 12px;
            bottom: 12px;
            width: 108px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 8px;
            background: rgba(10, 10, 14, .96);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            box-shadow: 0 10px 32px rgba(0, 0, 0, .35);
            box-sizing: border-box;
        }
        .hk-history-head {
            display: flex;
            flex-direction: column;
            gap: 7px;
            flex-shrink: 0;
        }
        .hk-history-heading {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 4px;
            color: var(--hk-purple-light);
            font-size: 9px;
            font-weight: 800;
            letter-spacing: .06em;
        }
        .hk-history-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
        }
        .hk-history-actions button {
            min-width: 0;
            min-height: 28px;
            padding: 3px;
            font-size: 10px;
        }

        /* Menu unificado: Parametros + Formato + Negativo en un solo control compacto */
        .hk-unified-menu {
            position: relative;
            display: inline-flex;
            flex: 0 0 auto;
        }
        .hk-unified-trigger {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            padding: 4px 9px;
            font-size: 11px;
            line-height: 1.1;
            background: rgba(168, 85, 247, 0.15);
            border-color: rgba(168, 85, 247, 0.4);
            color: var(--hk-purple-light);
            white-space: nowrap;
        }
        .hk-unified-caret {
            font-size: 8px;
            line-height: 1;
            opacity: 0.75;
            transition: transform 180ms ease;
        }
        .hk-unified-menu.is-open .hk-unified-caret { transform: rotate(180deg); }
        .hk-unified-list {
            position: absolute;
            bottom: calc(100% + 6px);
            left: 50%;
            transform: translateX(-50%);
            min-width: 172px;
            max-width: min(220px, calc(100vw - 24px));
            display: flex;
            flex-direction: column;
            gap: 2px;
            padding: 4px;
            background: var(--hk-surface-overlay);
            border: 1px solid var(--hk-border-hover);
            border-radius: var(--hk-radius);
            box-shadow: 0 14px 34px rgba(0, 0, 0, 0.75);
            backdrop-filter: blur(14px);
            z-index: 40;
        }
        .hk-unified-list[hidden] { display: none; }
        .hk-unified-item {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            padding: 7px 9px;
            font-size: 11px;
            font-family: inherit;
            color: var(--hk-text);
            background: transparent;
            border: 1px solid transparent;
            border-radius: 7px;
            cursor: pointer;
            text-align: left;
            transition: background-color 160ms ease, border-color 160ms ease;
        }
        .hk-unified-item:hover,
        .hk-unified-item:focus-visible {
            background: var(--hk-card-hover);
            border-color: var(--hk-border-subtle);
        }
        .hk-unified-item-emoji { font-size: 13px; line-height: 1; flex: none; }
        .hk-unified-item-text { flex: 1; white-space: nowrap; }
        .hk-unified-item-state {
            width: 7px;
            height: 7px;
            flex: none;
            border-radius: 50%;
            background: var(--hk-border-hover);
            transition: background-color 160ms ease, box-shadow 160ms ease;
        }
        .hk-unified-item-value {
            font-family: var(--hk-mono);
            font-size: 10px;
            color: var(--hk-text-dim);
            white-space: nowrap;
        }
        .hk-unified-item.active {
            background: var(--hk-card-active);
            border-color: var(--hk-border-hover);
        }
        /* Botones sueltos de la barra (Personajes / LoRAs) */
        .hk-deck-characters,
        .hk-deck-loras {
            padding: 4px 10px;
            font-size: 11px;
            line-height: 1.1;
            white-space: nowrap;
        }
        .hk-deck-characters {
            background: rgba(168, 85, 247, 0.15);
            border-color: rgba(168, 85, 247, 0.4);
            color: var(--hk-purple-light);
        }
        /* Tono verde para el stack de LoRAs (distinguelo de Personajes) */
        .hk-deck-loras {
            background: rgba(16, 185, 129, 0.12);
            border-color: rgba(16, 185, 129, 0.34);
            color: #6ee7b7;
        }
        .hk-deck-loras.active {
            background: rgba(16, 185, 129, 0.22);
            border-color: rgba(16, 185, 129, 0.6);
        }
        .hk-unified-item-state.is-on {
            background: var(--hk-green);
            box-shadow: 0 0 7px rgba(16, 185, 129, 0.8);
        }
        .hk-unified-item-negative[aria-pressed="true"] { color: var(--hk-purple-light); }
        .hk-filmstrip-scroll {
            display: flex;
            flex: 1 1 0;
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
            overflow-x: hidden;
            overflow-y: auto;
            min-height: 0;
            padding: 2px;
            scrollbar-width: thin;
            scrollbar-color: rgba(139, 92, 246, 0.3) transparent;
        }
        .hk-filmstrip-scroll::-webkit-scrollbar {
            width: 5px;
        }
        .hk-filmstrip-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .hk-filmstrip-scroll::-webkit-scrollbar-thumb {
            background: rgba(139, 92, 246, 0.3);
            border-radius: 4px;
        }
        .hk-history-thumb {
            height: 88px;
            width: 100%;
            flex-shrink: 0;
            position: relative;
            background: #000000;
            border: 1px solid var(--hk-border);
            border-radius: 10px;
            overflow: hidden;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
        .hk-history-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
            image-rendering: auto;
            background: #050508;
            display: block;
        }
        #hk-lightbox-modal .hk-lb-history-rail .hk-history-thumb img {
            object-fit: cover;
            object-position: center;
        }
        .hk-history-thumb.active {
            border-color: var(--hk-accent);
            box-shadow: 0 0 0 2px var(--hk-accent), 0 0 10px rgba(139, 92, 246, 0.4);
        }
        .hk-history-thumb:hover {
            border-color: var(--hk-border-hover);
        }
        .hk-thumb-del {
            position: absolute;
            top: 4px;
            right: 4px;
            background: rgba(5, 5, 8, 0.85);
            border: 1px solid var(--hk-border);
            color: #fca5a5;
            padding: 3px 5px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: none;
            font-size: 10px;
        }
        .hk-history-thumb:hover .hk-thumb-del {
            display: block;
        }
        @media (hover: none), (pointer: coarse) {
            .hk-history-thumb .hk-thumb-del {
                display: grid;
            }
        }
        .hk-history-empty {
            margin: auto 0;
            padding: 8px 2px;
            color: var(--hk-text-dim);
            font-size: 10px;
            line-height: 1.4;
            text-align: center;
        }
        .hk-thumb-badge {
            position: absolute;
            bottom: 3px;
            left: 3px;
            background: rgba(5, 5, 8, 0.85);
            border: 1px solid var(--hk-border-subtle);
            color: var(--hk-purple-light);
            font-family: var(--hk-mono);
            font-size: 8.5px;
            font-weight: 700;
            padding: 1px 4px;
            border-radius: 2px;
        }

        /* Legacy prompt deck: solo fuera de Studio. Dentro manda el minimal absoluto. */
        #universe-downloader-overlay :is(#hk-view-models, #hk-view-hub) .hk-prompt-deck,
        .hk-studio-workspace .hk-prompt-deck {
            padding: 16px 20px;
            background: var(--hk-panel);
            border-top: 1px solid var(--hk-border);
            display: flex;
            flex-direction: column;
            gap: 12px;
            flex-shrink: 0;
            z-index: 20;
            box-sizing: border-box;
        }
        .hk-prompt-tools {
            display: flex;
            align-items: center;
            justify-content: space-between;
                    flex-wrap: wrap;
            gap: 8px;
}
        .hk-tag-hint {
            font-size: 10px;
            color: var(--hk-text-dim);
            font-family: var(--hk-mono);
        }
        .hk-prompt-row {
            display: flex;
            gap: 12px;
            align-items: stretch;
        }
        .hk-prompt-wrap {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .hk-prompt-wrap .hk-textarea {
            width: 100%;
            height: 88px;
            font-size: 14px;
            background: #000000;
            border: 1px solid var(--hk-border);
                    padding: 12px 14px;
}
        .hk-neg-textarea {
            height: 42px !important;
            min-height: 40px !important;
            border-color: var(--hk-border) !important;
            color: var(--hk-text) !important;
            background: #000000 !important;
        }
        .hk-neg-textarea:focus {
            border-color: var(--hk-accent) !important;
            box-shadow: 0 0 10px rgba(139, 92, 246, 0.25) !important;
        }
        .hk-generate-cluster {
            display: flex;
            flex-direction: column;
            gap: 8px;
            width: 150px;
            min-width: 150px;
            flex-shrink: 0;
        }
        .hk-btn-generate {
            width: 100%;
            flex: 1;
            min-height: 68px;
            background: var(--hk-purple-deep) !important;
            border: 1px solid rgba(255, 255, 255, 0.25) !important;
            color: #ffffff !important;
            border-radius: var(--hk-radius-lg);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 4px;
            cursor: pointer;
            box-shadow: 0 4px 16px rgba(124, 58, 237, 0.18);
            padding: 8px 12px;
        }
        .hk-btn-generate:hover {
            background: var(--hk-accent) !important;
            box-shadow: 0 6px 22px rgba(139, 92, 246, 0.5);
        }
        .hk-btn-generate:active {
            transform: scale(0.98);
        }
        .hk-btn-gen-title {
            font-size: 15px;
            font-weight: 800;
            letter-spacing: 0.03em;
        }
        .hk-btn-gen-sub {
            font-size: 11px;
            font-weight: 600;
            opacity: 0.9;
        }
        .hk-queue-badge {
            background: rgba(255, 255, 255, 0.25);
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10.5px;
        }
        #hk-btn-interrupt-prompt {
            width: 100%;
            height: 32px;
            min-height: 32px;
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            gap: 6px;
            font-weight: 800;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            background: rgba(239, 68, 68, 0.1) !important;
            border: 1px solid rgba(248, 113, 113, 0.55) !important;
            color: #fca5a5 !important;
            border-radius: var(--hk-radius);
            cursor: pointer;
            box-sizing: border-box;
            padding: 0 8px;
            opacity: 1;
            transition: background-color 180ms ease, border-color 180ms ease,
                        color 180ms ease, box-shadow 180ms ease;
            user-select: none;
        }
        #hk-btn-interrupt-prompt:hover {
            background: rgba(239, 68, 68, 0.2) !important;
            color: #ffffff !important;
            border-color: #f87171 !important;
        }
        .hk-stop-label {
            display: grid;
            position: relative;
            flex: 0 1 auto;
            min-width: 0;
            align-items: center;
            justify-items: center;
        }
        .hk-stop-state {
            grid-area: 1 / 1;
            white-space: nowrap;
            transition: opacity 180ms ease, transform 180ms cubic-bezier(.22, 1, .36, 1);
        }
        .hk-stop-state-active {
            opacity: 0;
            transform: translateY(4px);
        }
        #hk-btn-interrupt-prompt.active .hk-stop-state-idle {
            opacity: 0;
            transform: translateY(-4px);
        }
        #hk-btn-interrupt-prompt.active .hk-stop-state-active {
            opacity: 1;
            transform: translateY(0);
        }
        .hk-stop-queue {
            min-width: 0;
            max-width: 0;
            overflow: hidden;
            padding: 0;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.16);
            font-size: 10px;
            line-height: 1;
            opacity: 0;
            transform: translateX(-4px);
            transition: max-width 180ms ease, opacity 160ms ease, transform 180ms ease, padding 180ms ease;
        }
        #hk-btn-interrupt-prompt.has-queue .hk-stop-queue {
            max-width: 42px;
            padding: 3px 5px;
            opacity: 1;
            transform: translateX(0);
        }
        #hk-btn-interrupt-prompt:not(.active) {
            background: rgba(239, 68, 68, 0.12) !important;
            border: 1px solid rgba(248, 113, 113, 0.55) !important;
            color: #ffd3d3 !important;
            box-shadow: none;
        }
        #hk-btn-interrupt-prompt.active {
            background: #dc2626 !important;
            border: 1px solid #f87171 !important;
            color: #ffffff !important;
            cursor: pointer !important;
            opacity: 1 !important;
            box-shadow: 0 0 14px rgba(239, 68, 68, 0.45);
        }
        #hk-btn-interrupt-prompt.active:hover {
            background: #b91c1c !important;
            box-shadow: 0 0 18px rgba(239, 68, 68, 0.65);
        }

        /* Progress Bar */
        .hk-progress-wrap {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .hk-progress-track {
            height: 5px;
            background: #000000;
            border-radius: 3px;
            overflow: hidden;
            position: relative;
            border: 1px solid var(--hk-border-subtle);
        }
        .hk-progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #7c3aed, #a855f7);
            border-radius: 3px;
        }
        .hk-progress-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11.5px;
            font-family: var(--hk-mono);
            color: var(--hk-text-muted);
            font-weight: 600;
        }

        /* Legacy Fallback Classes */
        .hk-right-col { flex-shrink: 0; }
        .hk-history-scroll { display: flex; align-items: stretch; }
        /* ==================================================================== */
        /* VIEW 2 & VIEW 3: CARDS GRID, TABS, LIST & INSPECTORS                 */
        /* ==================================================================== */
        .hk-tab-toolbar {
            padding: 16px 24px;
            background: var(--hk-panel);
            border-bottom: 1px solid var(--hk-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-shrink: 0;
            z-index: 10;
                    flex-wrap: wrap;
}
        .hk-filter-pills {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
        }
        .hk-pill {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 12px;
            font-weight: 600;
            padding: 6px 12px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .hk-pill:hover {
            color: var(--hk-text);
            background: var(--hk-card-hover);
            border-color: var(--hk-border-hover);
        }
        .hk-pill.active {
            color: var(--hk-white);
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
        }

        .hk-card-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 280px), 1fr));
            grid-auto-rows: max-content;
            gap: 20px;
            padding: 24px;
            overflow-y: auto;
            flex: 1 1 0;
            min-height: 0;
            align-content: start;
            align-items: stretch;
        }
        .hk-card-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 24px;
            overflow-y: auto;
            flex: 1 1 0;
            min-height: 0;
        }
        .hk-card-list .hk-card-item {
            height: auto;
            flex-shrink: 0;
            border-radius: var(--hk-radius-lg);
        }
        .hk-card-list .hk-card-preview {
            width: 70px !important;
            height: 70px !important;
            aspect-ratio: 1 / 1 !important;
            flex-shrink: 0;
        }

        .hk-card-item {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
            cursor: pointer;
            min-height: min-content;
            height: 100%;
            box-sizing: border-box;
        }
        .hk-card-item:hover {
            border-color: var(--hk-border-hover);
            background: var(--hk-card-hover);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }
        .hk-card-preview {
            width: 100%;
            aspect-ratio: 16 / 10;
            position: relative;
            background: var(--hk-panel);
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .hk-card-preview-bg {
            position: absolute;
            inset: -10px;
            width: calc(100% + 20px);
            height: calc(100% + 20px);
            object-fit: cover;
            filter: blur(20px) brightness(0.25);
            opacity: 0.8;
        }
        .hk-card-img-main {
            position: relative;
            z-index: 1;
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }

        .hk-badge-cat {
            position: absolute;
            top: 8px;
            left: 8px;
            z-index: 2;
            background: rgba(15, 18, 26, 0.85);
            border: 1px solid var(--hk-border);
            color: var(--hk-accent);
            font-size: 10.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: var(--hk-radius-sm);
        }
        .hk-badge-base {
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 2;
            background: rgba(15, 18, 26, 0.85);
            border: 1px solid var(--hk-border);
            color: var(--hk-text);
            font-size: 10.5px;
            font-weight: 700;
            padding: 2px 7px;
            border-radius: var(--hk-radius-sm);
        }
        .pv-heart-btn {
            position: absolute;
            top: 8px;
            right: 8px;
            z-index: 2;
            background: rgba(15, 18, 26, 0.85);
            border: 1px solid var(--hk-border);
            padding: 4px 8px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            font-size: 13px;
        }

        .hk-card-details {
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1 0 auto;
            min-height: min-content;
        }
        .hk-card-name {
            font-weight: 700;
            font-size: 15px;
            color: var(--hk-white);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
                    font-family: var(--hk-sans);
}
        .hk-card-sub {
            font-family: var(--hk-mono);
            font-size: 11.5px;
            color: var(--hk-text-dim);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .hk-card-prompt-box {
            font-size: 12.5px;
            color: var(--hk-text-muted);
            line-height: 1.4;
            max-height: 52px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            user-select: text;
        }

        .hk-triggers-box {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            max-height: 72px;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 4px;
            box-sizing: border-box;
            flex-shrink: 0;
        }
        .hk-triggers-box::-webkit-scrollbar {
            width: 4px;
        }
        .hk-triggers-box::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 4px;
        }
        .hk-triggers-box::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.4);
            border-radius: 4px;
        }
        .hk-triggers-box::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.85);
        }
        .hk-trigger-pill {
            background: var(--hk-card);
            border: 1px solid var(--hk-border-subtle);
            color: var(--hk-text-muted);
            font-family: var(--hk-mono);
            font-size: 11px;
            padding: 2px 6px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
        }
        .hk-trigger-pill:hover {
            color: var(--hk-white);
            border-color: var(--hk-accent);
        }
        .hk-trigger-pill.copied {
            background: var(--hk-accent) !important;
            color: var(--hk-white) !important;
        }

        .hk-card-actions {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: auto;
            padding-top: 10px;
            border-top: 1px solid var(--hk-border-subtle);
            flex-shrink: 0;
        }
        /* Keep every model card's action buttons on the same two tidy rows. */
        .hk-model-card-actions {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            flex-wrap: nowrap;
            gap: 6px;
        }
        .hk-model-card-primary-actions {
            display: flex;
            align-items: stretch;
            gap: 6px;
            min-width: 0;
        }
        .hk-model-card-primary-actions > button {
            flex: 1 1 0;
            min-width: 0;
            justify-content: center;
            white-space: nowrap;
        }
        .hk-model-card-tools {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 6px;
        }
        .hk-model-card-tools > button {
            width: 100%;
            min-width: 0;
            min-height: 30px;
            justify-content: center;
        }

        /* Modals & Inspectors */
        .pv-inspector-backdrop, .hk-model-inspector-backdrop, .pv-modal-backdrop, .hk-hub-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 10000000;
            background: rgba(9, 10, 15, 0.85);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .hk-action-dialog-backdrop,
        .pv-modal-backdrop:has(.hk-action-dialog) {
            z-index: 30000000 !important;
        }
        .pv-inspector-modal {
            background: var(--hk-panel);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            display: flex;
            width: 100%;
            max-width: 1100px;
            max-height: 90dvh;
            overflow: hidden;
        }
        .pv-inspector-left {
            flex: 1.1;
            min-width: 0;
            background: var(--hk-panel);
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 20px;
            overflow: hidden;
            border-right: 1px solid var(--hk-border-subtle);
        }
        .pv-inspector-left-bg {
            position: absolute;
            inset: -20px;
            width: calc(100% + 40px);
            height: calc(100% + 40px);
            object-fit: cover;
            filter: blur(30px) brightness(0.2);
            opacity: 0.85;
        }
        .pv-inspector-img {
            position: relative;
            z-index: 1;
            max-width: 100%;
            max-height: calc(88vh - 40px);
            object-fit: contain;
            border-radius: var(--hk-radius);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
        }
        .pv-inspector-right {
            flex: 1;
            min-width: 380px;
            max-width: 520px;
            display: flex;
            flex-direction: column;
            padding: 28px;
            overflow-y: auto;
            gap: 18px;
            background: var(--hk-panel);
        }
        .pv-inspector-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;
            border-bottom: 1px solid var(--hk-border-subtle);
            padding-bottom: 12px;
        }
        .pv-inspector-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }
        .pv-inspector-lora-pill {
            background: var(--hk-card);
            border: 1px solid var(--hk-border-subtle);
            border-radius: var(--hk-radius-sm);
            padding: 4px 8px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 11.5px;
        }
        .pv-inspector-actions {
            display: flex;
            gap: 10px;
            margin-top: auto;
            padding-top: 14px;
            border-top: 1px solid var(--hk-border-subtle);
        }

        .pv-modal {
            background: var(--hk-panel);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-xl);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
            width: 100%;
            max-width: 580px;
            max-height: 90vh;
            overflow-y: auto;
            padding: 28px;
            display: flex;
            flex-direction: column;
            gap: 18px;
        }
        .pv-dropzone {
            background: var(--hk-card);
            border: 1.5px dashed var(--hk-border);
            border-radius: var(--hk-radius);
            padding: 12px;
            box-sizing: border-box;
            width: 100%;
            min-width: 0;
            overflow: hidden;
            text-align: center;
            cursor: pointer;
        }
        #pv-dropzone-preview {
            width: 100%;
            min-width: 0;
            overflow: hidden;
        }
        #pv-dropzone-preview img {
            display: block;
            width: 180px;
            height: 180px;
            max-width: 100%;
            margin: 0 auto;
            object-fit: contain;
            border-radius: 4px;
        }
        #pv-dropzone-preview p {
            overflow-wrap: anywhere;
        }
        .pv-dropzone:hover {
            border-color: var(--hk-accent);
        }

        /* ==================================================================== */
        /* VIEW 4: DANBOORU AUTOCOMPLETE POPUP (RAYCAST STYLE)                  */
        /* ==================================================================== */
        .hk-autocomplete-popup {
            background: rgba(15, 18, 26, 0.96) !important;
            border: 1px solid var(--hk-border) !important;
            border-radius: var(--hk-radius-lg) !important;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.8) !important;
            backdrop-filter: blur(12px);
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.4) rgba(15, 18, 26, 0.5);
        }
        .hk-autocomplete-popup::-webkit-scrollbar {
            width: 6px;
        }
        .hk-autocomplete-popup::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.4);
            border-radius: 3px;
        }
        .hk-autocomplete-popup::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.8);
        }
        .hk-autocomplete-popup::-webkit-scrollbar-track {
            background: rgba(15, 18, 26, 0.5);
        }
        .hk-autocomplete-footer {
            padding: 6px 12px;
            font-size: 11px;
            font-family: var(--hk-mono);
            color: var(--hk-text-dim);
            text-align: center;
            background: rgba(18, 22, 32, 0.95);
            border-top: 1px solid var(--hk-border-subtle);
            position: sticky;
            bottom: 0;
            user-select: none;
            backdrop-filter: blur(8px);
        }

        .hk-autocomplete-item {
            padding: 8px 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            cursor: pointer;
            border-bottom: 1px solid var(--hk-border-subtle);
        }
        .hk-autocomplete-item:hover, .hk-autocomplete-item.selected {
            background: var(--hk-card-active);
        }
        .hk-autocomplete-left {
            display: flex;
            align-items: center;
            gap: 8px;
            min-width: 0;
        }
        .hk-tag-cat {
            font-size: 10px;
            font-weight: 700;
            padding: 1px 5px;
            border-radius: 3px;
        }
        .hk-tag-name {
            font-size: 12.5px;
            font-weight: 600;
            color: var(--hk-text);
        }
        .hk-tag-match {
            color: var(--hk-accent);
            text-decoration: underline;
        }
        .hk-tag-cnt {
            font-family: var(--hk-mono);
            font-size: 11px;
            color: var(--hk-text-dim);
            font-weight: 600;
        }

        /* ==================================================================== */
        /* VIEW 5: HUB DOWNLOADER                                               */
        /* ==================================================================== */
        .hk-hub-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow: hidden;
            background: var(--hk-bg);
        }
        .hk-hub-header {
            padding: 20px 24px;
            background: var(--hk-panel);
            border-bottom: 1px solid var(--hk-border);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
                    flex-wrap: wrap;
            gap: 14px;
}
        .hk-hub-subnav {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .hk-hub-subnav-btn {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            color: var(--hk-text-muted);
            font-family: var(--hk-sans);
            font-size: 12.5px;
            font-weight: 600;
            padding: 6px 14px;
            border-radius: var(--hk-radius-sm);
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .hk-hub-subnav-btn:hover {
            color: var(--hk-text);
            background: var(--hk-card-hover);
        }
        .hk-hub-subnav-btn.active {
            color: var(--hk-white);
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
        }

        .hk-hub-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 300px), 1fr));
            gap: 18px;
            padding: 20px;
            overflow-y: auto;
            flex: 1 1 0;
            min-height: 0;
        }
        .hk-hub-card {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            overflow: hidden;
            display: flex;
            flex-direction: column;
        }
        .hk-hub-card:hover {
            border-color: var(--hk-border-hover);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        /* Hub Tasks */
        .hk-hub-task-card {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            padding: 14px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-bottom: 12px;
        }
        .hk-hub-task-card.downloading {
            border-color: rgba(59, 130, 246, 0.5);
        }
        .hk-hub-task-card.completed {
            border-color: rgba(16, 185, 129, 0.4);
        }
        .hk-hub-task-card.error {
            border-color: rgba(239, 68, 68, 0.4);
        }
        .hk-hub-progress-track {
            height: 8px;
            background: var(--hk-card);
            border-radius: 4px;
            overflow: hidden;
            border: 1px solid var(--hk-border-subtle);
        }
        .hk-hub-progress-bar {
            height: 100%;
            background: var(--hk-accent);
            border-radius: 4px;
        }

        /* Link Bank */
        .hk-linkbank-card {
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            padding: 12px 14px;
            display: flex;
            gap: 14px;
            align-items: center;
            transition: all 0.2s ease;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.4);
        }
        .hk-linkbank-card:hover {
            border-color: rgba(168, 85, 247, 0.4);
            transform: translateY(-1px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
        }
        .hk-linkbank-card.present {
            border-color: rgba(16, 185, 129, 0.35);
        }
        .hk-linkbank-card.present:hover {
            border-color: rgba(16, 185, 129, 0.65);
        }
        .hk-linkbank-card.missing {
            border-color: rgba(245, 158, 11, 0.3);
        }
        .hk-linkbank-card.missing:hover {
            border-color: rgba(245, 158, 11, 0.6);
        }
        .hk-linkbank-badge {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            font-family: var(--hk-mono);
            font-size: 10.5px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 4px;
            white-space: nowrap;
        }
        .hk-linkbank-badge.present {
            background: rgba(16, 185, 129, 0.15);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.4);
            box-shadow: 0 0 8px rgba(16, 185, 129, 0.15);
        }
        .hk-linkbank-badge.missing {
            background: rgba(245, 158, 11, 0.12);
            color: #fde68a;
            border: 1px solid rgba(245, 158, 11, 0.35);
        }
        .hk-linkbank-badge.downloading {
            background: rgba(59, 130, 246, 0.15);
            color: #93c5fd;
            border: 1px solid rgba(59, 130, 246, 0.4);
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.2);
            animation: hkPulse 2s infinite ease-in-out;
        }
        .hk-linkbank-filter-btn {
            font-family: var(--hk-mono);
            font-size: 11px;
            font-weight: 700;
            padding: 4px 10px;
            border-radius: 5px;
            border: 1px solid var(--hk-border);
            background: transparent;
            color: var(--hk-text-muted);
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .hk-linkbank-filter-btn:hover {
            color: #ffffff;
            border-color: rgba(255, 255, 255, 0.3);
            background: rgba(255, 255, 255, 0.05);
        }
        .hk-linkbank-filter-btn.active {
            background: rgba(168, 85, 247, 0.2);
            border-color: rgba(168, 85, 247, 0.6);
            color: #f3e8ff;
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.2);
        }
        .hk-linkbank-search {
            background: #000000;
            border: 1px solid var(--hk-border);
            border-radius: 5px;
            color: #ffffff;
            font-family: var(--hk-mono);
            font-size: 11px;
            padding: 4px 10px;
            outline: none;
            transition: border-color 0.2s ease;
        }
        .hk-linkbank-search:focus {
            border-color: var(--hk-accent);
            box-shadow: 0 0 8px rgba(168, 85, 247, 0.3);
        }

        /* ==================================================================== */
        /* FULLSCREEN LIGHTBOX                                                  */
        /* ==================================================================== */
        #hk-lightbox-modal {
            position: fixed;
            inset: 0;
            z-index: 20000000 !important;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(10px);
            display: flex;
            align-items: center;
            justify-content: center;
        }
        #hk-lightbox-modal.hk-lightbox-studio #hk-lb-viewport {
            width: calc(100% - 132px) !important;
            margin-right: auto;
        }
        #hk-lightbox-modal.hk-lightbox-studio #hk-lightbox-img {
            max-width: calc(100% - 24px) !important;
            max-height: 92vh;
        }
        #hk-lightbox-modal.hk-lightbox-studio .hk-history-rail {
            top: 64px;
            right: 12px;
            bottom: 12px;
            width: 108px;
            z-index: 200;
            background: rgba(8, 8, 11, 0.94);
            box-shadow: 0 10px 36px rgba(0, 0, 0, 0.6);
        }
        #hk-lightbox-modal.hk-lightbox-studio #hk-lb-next {
            right: 132px;
        }
        #hk-lightbox-img {
            max-width: 95vw;
            max-height: 92vh;
            object-fit: contain;
            border-radius: var(--hk-radius);
            box-shadow: 0 20px 80px rgba(0, 0, 0, 0.9);
        }
        .hk-lb-nav {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(15, 18, 26, 0.8);
            border: 1px solid var(--hk-border);
            color: var(--hk-white);
            font-size: 20px;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 10;
        }
        .hk-lb-nav:hover {
            background: var(--hk-card-active);
            border-color: var(--hk-accent);
        }
        #hk-lb-prev { left: 24px; }
        #hk-lb-next { right: 24px; }
        #hk-lb-close {
            position: absolute;
            top: 20px;
            right: 24px;
            z-index: 10;
        }
        @media (max-width: 900px) {
            #hk-lightbox-modal.hk-lightbox-studio #hk-lb-viewport { width: calc(100% - 108px) !important; }
            #hk-lightbox-modal.hk-lightbox-studio .hk-history-rail { top: 58px; right: 8px; bottom: 8px; width: 84px; }
            #hk-lightbox-modal.hk-lightbox-studio #hk-lb-next { right: 108px; }
        }
        @media (max-width: 600px) {
            #hk-lightbox-modal.hk-lightbox-studio #hk-lb-viewport { width: calc(100% - 96px) !important; }
            #hk-lightbox-modal.hk-lightbox-studio .hk-history-rail { top: 54px; right: 6px; bottom: 6px; width: 72px; padding: 5px; }
            #hk-lightbox-modal.hk-lightbox-studio #hk-lb-next { right: 96px; }
        }

        /* ==================================================================== */
        /* CHARACTER SELECTOR MODAL (ANIMADEX)                                 */
        /* ==================================================================== */
        .hk-char-modal-backdrop {
            position: fixed;
            inset: 0;
            z-index: 9999999;
            background: rgba(5, 6, 10, 0.88);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            box-sizing: border-box;
            animation: hkFadeIn 0.2s ease-out;
        }
        .hk-char-modal {
            width: min(1500px, 100%);
            max-width: 1460px;
            height: 92dvh;
            max-height: 980px;
            background: var(--hk-bg);
            border: 1px solid rgba(168, 85, 247, 0.35);
            border-radius: var(--hk-radius-lg);
            box-shadow: 0 25px 80px rgba(0, 0, 0, 0.95), 0 0 30px rgba(168, 85, 247, 0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .hk-char-header {
            padding: 20px 24px;
            background: var(--hk-panel);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            flex-shrink: 0;
                    flex-wrap: wrap;
}
        .hk-char-search-wrap {
            position: relative;
            flex: 1 1 360px;
            max-width: 480px;
        }
        .hk-char-search-input {
            width: 100%;
            background: #000000;
            border: 1px solid rgba(255, 255, 255, 0.14);
            border-radius: 6px;
            color: #ffffff;
            font-size: 13px;
            padding: 7px 32px 7px 12px;
            outline: none;
            font-family: var(--hk-sans);
            transition: all 0.2s;
            box-sizing: border-box;
        }
        .hk-char-search-input:focus {
            border-color: var(--hk-accent);
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
        }
        .hk-char-clear-btn {
            position: absolute;
            right: 8px;
            top: 50%;
            transform: translateY(-50%);
            background: transparent;
            border: none;
            color: var(--hk-text-dim);
            cursor: pointer;
            font-size: 14px;
            display: none;
        }
        .hk-char-body {
            flex: 1 1 0;
            min-height: 0;
            display: flex;
            overflow: hidden;
        }
        .hk-char-sidebar {
            width: 260px;
            background: var(--hk-panel);
            border-right: 1px solid rgba(255, 255, 255, 0.07);
            padding: 20px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
            flex-shrink: 0;
        }
        .hk-char-facet-group {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }
        .hk-char-facet-title {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--hk-accent);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .hk-char-facet-list {
            display: flex;
            flex-direction: column;
            gap: 3px;
            max-height: 170px;
            overflow-y: auto;
        }
        .hk-char-facet-item {
            font-size: 11.5px;
            color: var(--hk-text-muted);
            padding: 4px 6px;
            border-radius: 4px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
            user-select: none;
            transition: background 0.15s, color 0.15s;
        }
        .hk-char-facet-item:hover {
            background: rgba(255, 255, 255, 0.05);
            color: #ffffff;
        }
        .hk-char-facet-item.active {
            background: rgba(168, 85, 247, 0.2);
            color: #f3e8ff;
            border: 1px solid rgba(168, 85, 247, 0.4);
            font-weight: 600;
        }
        .hk-char-active-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: rgba(168, 85, 247, 0.2);
            border: 1px solid rgba(168, 85, 247, 0.45);
            color: #f3e8ff;
            font-size: 11px;
            padding: 2px 7px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .hk-char-active-chip:hover {
            background: rgba(239, 68, 68, 0.25);
            border-color: rgba(239, 68, 68, 0.6);
            color: #fca5a5;
        }
        .hk-char-active-chip-remove {
            font-size: 10px;
            opacity: 0.7;
            font-weight: bold;
        }
        .hk-char-main {
            flex: 1 1 0;
            min-width: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: var(--hk-panel);
        }
        .hk-char-status-bar {
            padding: 8px 18px;
            background: var(--hk-panel);
            border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            font-size: 11.5px;
            color: var(--hk-text-dim);
            font-family: var(--hk-mono);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }
        .hk-char-grid {
            flex: 1 1 0;
            overflow-y: auto;
            padding: 20px;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr));
            grid-auto-rows: max-content;
            gap: 16px;
            align-content: start;
        }
        .hk-char-card {
            position: relative;
            background: var(--hk-card);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            min-height: 0;
            transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .hk-char-card:hover {
            border-color: rgba(168, 85, 247, 0.6);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), 0 0 16px rgba(168, 85, 247, 0.2);
            transform: translateY(-2px);
        }
        .hk-char-card-media {
            position: relative;
            width: 100%;
            aspect-ratio: 2 / 3;
            flex-shrink: 0;
            overflow: hidden;
            background: var(--hk-panel);
        }
        .hk-char-card-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            transition: transform 0.2s ease;
        }
        .hk-char-card:hover .hk-char-card-img {
            transform: scale(1.03);
        }
        .hk-char-card-footer {
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 3px;
            background: var(--hk-panel);
            border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .hk-char-card-name {
            font-size: 12.5px;
            font-weight: 700;
            color: #ffffff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .hk-char-card-series {
            font-size: 10px;
            color: #a855f7;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .hk-char-card-meta {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-top: 2px;
        }
        .hk-char-card-count {
            font-size: 10px;
            color: var(--hk-text-dim);
            font-family: var(--hk-mono);
        }
        .hk-char-overlay {
            position: absolute;
            inset: 0;
            background: rgba(6, 7, 12, 0.94);
            padding: 10px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.18s ease;
            z-index: 5;
            box-sizing: border-box;
        }
        .hk-char-card:hover .hk-char-overlay {
            opacity: 1;
            pointer-events: auto;
        }
        .hk-char-trigger-box {
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.35);
            border-radius: 5px;
            padding: 5px 7px;
            font-family: var(--hk-mono);
            font-size: 10px;
            color: #f3e8ff;
            line-height: 1.3;
            max-height: 52px;
            overflow-y: auto;
            word-break: break-word;
        }
        .hk-char-tags-chips {
            display: flex;
            flex-wrap: wrap;
            gap: 3px;
            max-height: 55px;
            overflow-y: auto;
            margin: 4px 0;
        }
        .hk-char-tag-chip {
            font-size: 9.5px;
            background: rgba(255, 255, 255, 0.08);
            color: #d1d5db;
            padding: 2px 5px;
            border-radius: 3px;
        }
        .hk-char-lora-trigger-list {
            display: flex;
            flex-direction: column;
            gap: 5px;
            max-height: 145px;
            overflow-y: auto;
            padding-right: 2px;
            margin: 4px 0;
        }
        .hk-char-lora-trigger-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 6px;
            background: rgba(168, 85, 247, 0.15);
            border: 1px solid rgba(168, 85, 247, 0.35);
            border-radius: 5px;
            padding: 5px 8px;
            font-family: var(--hk-mono);
            font-size: 10px;
            color: #f3e8ff;
            line-height: 1.25;
            cursor: pointer;
            transition: all 0.15s ease;
            user-select: none;
            word-break: break-word;
        }
        .hk-char-lora-trigger-item:hover {
            background: rgba(168, 85, 247, 0.35);
            border-color: rgba(168, 85, 247, 0.8);
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(168, 85, 247, 0.3);
            color: #ffffff;
        }
        .hk-char-lora-trigger-text {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
        }
        .hk-char-lora-trigger-icon {
            font-size: 11px;
            opacity: 0.75;
            flex-shrink: 0;
        }
        .hk-char-lora-trigger-item:hover .hk-char-lora-trigger-icon {
            opacity: 1;
        }
        .hk-char-actions {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .hk-char-btn-trigger {
            width: 100%;
            padding: 6px 8px;
            font-size: 11px;
            font-weight: 700;
            border-radius: 5px;
            background: var(--hk-accent);
            color: #ffffff;
            border: none;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }
        .hk-char-btn-trigger:hover {
            background: #9333ea;
            box-shadow: 0 0 10px rgba(168, 85, 247, 0.5);
        }
        .hk-char-btn-trigger-tags {
            width: 100%;
            padding: 6px 8px;
            font-size: 10.5px;
            font-weight: 600;
            border-radius: 5px;
            background: rgba(168, 85, 247, 0.2);
            border: 1px solid rgba(168, 85, 247, 0.4);
            color: #e9d5ff;
            cursor: pointer;
            transition: all 0.15s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
        }
        .hk-char-btn-trigger-tags:hover {
            background: rgba(168, 85, 247, 0.35);
            border-color: rgba(168, 85, 247, 0.7);
        }
        .hk-char-extra-actions {
            display: flex;
            gap: 4px;
        }
        .hk-char-btn-sub {
            flex: 1;
            padding: 3px 6px;
            font-size: 10px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: var(--hk-text-muted);
            cursor: pointer;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            transition: all 0.15s;
        }
        .hk-char-btn-sub:hover {
            background: rgba(255, 255, 255, 0.12);
            color: #ffffff;
        }
        .hk-char-pagination {
            padding: 10px 18px;
            background: var(--hk-panel);
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            flex-shrink: 0;
        }
        @keyframes hk-spin {
            to { transform: rotate(360deg); }
        }
        .hk-hub-content-scroll {
            flex: 1 1 0%;
            height: 0;
            width: 100%;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            min-height: 0;
            box-sizing: border-box;
            overscroll-behavior-y: contain;
            scroll-padding-block: 20px;
            padding-bottom: 32px !important;
        }
        #hk-view-hub,
        #hk-view-hub > .hk-hub-container {
            min-height: 0;
            min-width: 0;
        }
        .hk-hub-content-scroll > * {
            flex-shrink: 0;
        }
        .hk-hub-content-scroll::-webkit-scrollbar {
            width: 8px;
        }
        .hk-hub-content-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .hk-hub-content-scroll::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.4);
            border-radius: 4px;
        }
        .hk-hub-content-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.85);
        }
        .hk-inspected-scroll-box {
            box-sizing: border-box;
            overscroll-behavior-y: contain;
        }
        .hk-inspected-scroll-box::-webkit-scrollbar {
            width: 6px;
        }
        .hk-inspected-scroll-box::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 4px;
        }
        .hk-inspected-scroll-box::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.45);
            border-radius: 4px;
        }
        .hk-inspected-scroll-box::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.85);
        }
        .hk-hub-scroll-box {
            max-height: 320px;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            padding-right: 6px;
            padding-bottom: 20px !important;
            box-sizing: border-box;
            overscroll-behavior-y: contain;
            scrollbar-gutter: stable;
        }
        #hk-hub-tasks-content {
            max-height: min(48vh, 500px);
            min-height: 100px;
        }
        .hk-hub-history-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            min-height: 56px;
            padding: 10px 16px;
            background: var(--hk-card);
            border: 1px solid var(--hk-border);
            border-radius: var(--hk-radius-lg);
            box-sizing: border-box;
            flex-shrink: 0;
        }
        .hk-hub-scroll-box::-webkit-scrollbar {
            width: 6px;
        }
        .hk-hub-scroll-box::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 4px;
        }
        .hk-hub-scroll-box::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.45);
            border-radius: 4px;
        }
        .hk-hub-scroll-box::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.85);
        }

        /* Hub: estructura de gestor clara, con captura de enlace y dos paneles de trabajo. */
        #hk-view-hub .hk-hub-header {
            padding: 15px 22px;
            min-height: 68px;
            background: rgba(12, 11, 17, 0.96);
        }
        #hk-view-hub .hk-hub-header > div:first-child { min-width: 220px; }
        #hk-view-hub .hk-hub-header > div:last-child { gap: 8px !important; }
        #hk-view-hub .hk-hub-dashboard-grid {
            width: min(100%, 1560px);
            margin: 0 auto;
            display: grid !important;
            grid-template-columns: minmax(0, 1.12fr) minmax(360px, .88fr);
            align-content: start;
            gap: 14px !important;
            padding: 18px 22px 28px !important;
            box-sizing: border-box;
        }
        #hk-view-hub .hk-hub-panel {
            min-width: 0;
            padding: 16px 18px !important;
            background: rgba(17, 16, 23, .94) !important;
            border: 1px solid rgba(255,255,255,.08) !important;
            border-radius: 12px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,.22) !important;
        }
        #hk-view-hub .hk-hub-intake { grid-column: 1 / -1; }
        #hk-view-hub .hk-hub-bank { grid-column: 1; }
        #hk-view-hub .hk-hub-queue { grid-column: 2; }
        #hk-view-hub .hk-hub-panel-heading,
        #hk-view-hub .hk-linkbank-toolbar,
        #hk-view-hub .hk-hub-history-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
            min-width: 0;
        }
        #hk-view-hub .hk-hub-panel-heading { margin-bottom: 12px; }
        #hk-view-hub .hk-hub-panel-title {
            margin: 0;
            color: #f7f8f8;
            font: 650 14px/1.35 var(--hk-sans);
            letter-spacing: -.01em;
        }
        #hk-view-hub .hk-hub-panel-subtitle {
            margin-top: 3px;
            color: var(--hk-text-dim);
            font: 11px/1.45 var(--hk-sans);
        }
        #hk-view-hub .hk-hub-intake .hk-download-entry {
            display: grid;
            grid-template-columns: minmax(0,1fr) auto auto auto;
            gap: 8px;
        }
        #hk-view-hub .hk-hub-intake #hk-hub-link-input {
            min-width: 0;
            width: 100%;
        }
        #hk-view-hub .hk-hub-linkbank-tools {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            align-items: center;
            margin: 12px 0;
        }
        #hk-view-hub .hk-hub-linkbank-tools .hk-linkbank-search { flex: 1 1 200px; }
        #hk-view-hub .hk-hub-linkbank-tools button[data-lb-filter] {
            padding: 5px 9px;
            white-space: nowrap;
        }
        #hk-view-hub .hk-hub-linkbank-actions {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 7px;
            padding-top: 10px;
            margin-top: 10px;
            border-top: 1px solid rgba(255,255,255,.06);
        }
        #hk-view-hub #hk-linkbank-list {
            max-height: min(52vh, 560px);
            gap: 8px !important;
            padding-right: 4px;
        }
        #hk-view-hub #hk-hub-tasks-content {
            max-height: min(52vh, 560px);
            min-height: 170px;
            padding: 0 4px 8px 0;
            gap: 9px !important;
        }
        #hk-view-hub .hk-hub-task-card {
            padding: 11px;
            margin-bottom: 0;
            gap: 8px;
        }
        #hk-view-hub .hk-hub-history-header {
            min-height: 0;
            padding: 0;
            border: 0;
            background: transparent;
            border-radius: 0;
            margin-bottom: 10px;
        }
        #hk-view-hub .hk-linkbank-card { flex-wrap: wrap; gap: 10px; padding: 10px 12px; }
        #hk-view-hub .hk-linkbank-card > div:nth-child(2) { flex: 1 1 220px !important; }
        #hk-view-hub .hk-linkbank-card > div:last-child { flex: 0 0 auto; }
        #hk-view-hub .hk-hub-task-card > div:first-child { align-items: flex-start !important; }
        #hk-view-hub .hk-hub-task-card > div:first-child > div:first-child { width: 48px !important; height: 56px !important; }
        #hk-view-hub .hk-hub-task-card > div:first-child > div:nth-child(2) { min-width: 0; }
        #hk-view-hub .hk-hub-task-card > div:first-child > div:nth-child(2) > div:first-child { align-items: flex-start !important; }
        #hk-view-hub .hk-hub-task-card > div:first-child > div:nth-child(2) > div:last-child { flex-wrap: wrap; }
        #hk-view-hub .hk-hub-task-card > div:first-child > div:nth-child(2) > div:last-child > div:first-child { flex-wrap: wrap; gap: 6px !important; }
        #hk-view-hub #hk-linkbank-list,
        #hk-view-hub #hk-hub-tasks-content { scrollbar-gutter: stable; }
        @media (max-width: 1050px) {
            #hk-view-hub .hk-hub-dashboard-grid { grid-template-columns: minmax(0, 1fr); }
            #hk-view-hub .hk-hub-intake, #hk-view-hub .hk-hub-bank, #hk-view-hub .hk-hub-queue { grid-column: 1; }
            #hk-view-hub #hk-linkbank-list, #hk-view-hub #hk-hub-tasks-content { max-height: 42vh; }
        }
        @media (max-width: 640px) {
            #hk-view-hub .hk-hub-header { padding: 12px !important; }
            #hk-view-hub .hk-hub-dashboard-grid { padding: 12px !important; gap: 10px !important; }
            #hk-view-hub .hk-hub-panel { padding: 13px !important; }
            #hk-view-hub .hk-hub-intake .hk-download-entry { grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); }
            #hk-view-hub .hk-hub-intake #hk-hub-link-input { grid-column: 1 / -1; }
            #hk-view-hub .hk-hub-linkbank-tools { grid-template-columns: minmax(0,1fr) minmax(0,1fr); }
            #hk-view-hub .hk-hub-linkbank-tools .hk-linkbank-search { grid-column: 1 / -1; }
            #hk-view-hub .hk-hub-linkbank-actions { align-items: stretch; }
            #hk-view-hub .hk-hub-linkbank-actions button { flex: 1 1 auto; }
            #hk-view-hub .hk-hub-linkbank-tools { flex-wrap: wrap; }
            #hk-view-hub .hk-hub-linkbank-tools .hk-linkbank-search { flex: 1 1 100%; }
        }
        .hk-char-tab-btn {
            transition: all 0.15s ease;
        }
        .hk-char-tab-btn:hover {
            color: #ffffff !important;
            background: rgba(255, 255, 255, 0.08) !important;
        }
        .hk-char-tab-btn.active {
            background: var(--hk-accent-gradient, linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)) !important;
            color: #ffffff !important;
        }
        .hk-local-trigger-chip {
            cursor: pointer;
            transition: all 0.15s ease;
        }
        .hk-local-trigger-chip:hover {
            background: rgba(168, 85, 247, 0.45) !important;
            color: #ffffff !important;
            border-color: #a855f7 !important;
        }
        /* OLED / white / purple: shared interaction language for every surface. */
        :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-hub-modal-backdrop,
            .hk-char-modal-backdrop, #hk-lightbox-modal, .hk-autocomplete-popup) {
            color: var(--hk-text);
            font-family: var(--hk-sans);
            font-size: 14px;
            line-height: 1.5;
            color-scheme: dark;
        }
        #universe-downloader-overlay { color-scheme: dark; }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal) :is(button, input, select, textarea, summary, [tabindex]):focus-visible {
            outline: 2px solid var(--hk-purple-light);
            outline-offset: 3px;
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop) :is(input, textarea)::placeholder {
            color: var(--hk-text-dim);
            opacity: 1;
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop) button {
            font-family: var(--hk-sans);
            transition: background-color 120ms ease, border-color 120ms ease;
        }
        :is(.hk-btn-cyber, .hk-quick-tag, .hk-act-btn, .hk-pill, .hk-ratio-pill,
            .hk-linkbank-filter-btn, .hk-char-tab-btn, .hk-char-btn-sub) {
            min-height: 34px;
            border-radius: var(--hk-radius-sm);
        }
        :is(.hk-input, .hk-select, .hk-linkbank-search, .hk-char-search-input) {
            min-height: 38px;
            min-width: 0;
        }
        .hk-input, .hk-select { max-width: 100%; }
        .hk-switch:focus-within .hk-slider { outline: 2px solid var(--hk-purple-light); outline-offset: 3px; }
        .hk-app-main, .hk-studio-workspace, .hk-center-col { min-width: 0; min-height: 0; }
        .hk-left-col > .hk-label { margin-bottom: -4px; color: var(--hk-purple-light); }
        .hk-control-section { border: 1px solid var(--hk-border); border-radius: var(--hk-radius-lg); background: var(--hk-card); flex-shrink: 0; }
        .hk-control-section summary { padding: 14px 16px; cursor: pointer; font-size: 13px; font-weight: 600; }
        .hk-control-section summary span { color: var(--hk-text-dim); font-size: 11px; font-weight: 400; margin-left: 8px; }
        .hk-control-section > div { padding: 0 12px 12px; }
        .hk-lora-title { font: 600 13px var(--hk-sans); color: var(--hk-white); }
        .hk-rail-btn.active { background: var(--hk-accent-soft); border-color: rgba(168, 85, 247, 0.35); box-shadow: none; }
        .hk-rail-action-btn { min-height: 46px; border-radius: 10px; }
        .hk-empty-icon { width: 64px; height: 64px; display: grid; place-items: center; border: 1px solid var(--hk-border); border-radius: 20px; background: var(--hk-panel); }
        .hk-empty-title { font: 600 20px var(--hk-sans); letter-spacing: -0.025em; }
        .hk-empty-desc { font: 14px var(--hk-sans); color: var(--hk-text-dim); }
        .hk-prompt-tools > div { flex-wrap: wrap; }
        .hk-prompt-deck .hk-label { text-transform: none; letter-spacing: 0; font-size: 13px; }
        .hk-btn-gen-title { font-size: 16px; letter-spacing: 0; font-weight: 650; }
        .hk-btn-gen-sub { font-size: 10px; opacity: 0.75; }
        .hk-progress-track { height: 3px; }
        .hk-metadata-hud { max-width: calc(100% - 32px); background: var(--hk-surface-overlay); border-radius: var(--hk-radius-lg); }
        .hk-tab-toolbar > div:last-child { flex-wrap: wrap; min-width: 0; }
        .hk-tab-toolbar input[type=search] { flex: 1; min-width: 160px; }
        .hk-card-item:hover, .hk-hub-card:hover, .hk-char-card:hover { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35); }
        .hk-card-preview { background: var(--hk-bg); }
        .hk-card-name, .hk-char-card-name { overflow-wrap: anywhere; }
        .hk-card-actions { flex-wrap: wrap; }
        .hk-hub-header > div { flex-wrap: wrap; min-width: 0; }
        .hk-hub-content-scroll .hk-hub-panel { border-radius: var(--hk-radius-lg) !important; }
        .hk-hub-content-scroll input { min-width: 0; }
        .hk-linkbank-card, .hk-hub-task-card { border-radius: var(--hk-radius-lg); }
        .hk-char-header > div { min-width: 0; }
        .hk-char-header .hk-char-search-wrap { max-width: 560px; }
        .hk-char-overlay { background: linear-gradient(180deg, rgba(0,0,0,.15), rgba(0,0,0,.97)); }
        .hk-char-card:focus-within .hk-char-overlay { opacity: 1; pointer-events: auto; }
        .hk-char-card:focus-within { border-color: var(--hk-purple-light); }
        .hk-char-facet-title { color: var(--hk-text-muted); letter-spacing: 0.05em; }
        .hk-char-status-bar { flex-wrap: wrap; gap: 8px; }
        .hk-char-pagination { flex-wrap: wrap; }
        .pv-inspector-actions { flex-wrap: wrap; position: sticky; bottom: -28px; background: var(--hk-panel); padding-bottom: 16px; }
        .pv-modal h2, .pv-inspector-header h2 { font-family: var(--hk-sans) !important; letter-spacing: -0.025em !important; }
        .pv-modal, .pv-inspector-right, .hk-char-sidebar, .hk-char-grid, .hk-card-grid, .hk-card-list { scrollbar-width: thin; scrollbar-color: #49345d transparent; }
        .hk-autocomplete-popup { border-radius: var(--hk-radius); border-color: var(--hk-border-hover); }
        .hk-autocomplete-item { min-height: 38px; }
        @media (max-width: 1400px) {
            .hk-tag-hint { display: none; }
        }
        @media (max-height: 800px) and (min-width: 901px) {
            .hk-prompt-wrap .hk-textarea { height: 64px; }
            .hk-prompt-deck { gap: 8px; padding-top: 10px; padding-bottom: 10px; }
        }
        @media (max-width: 1100px) {
            .hk-activity-rail { width: 76px; }
            .hk-rail-nav { padding: 0 6px; }
            .hk-studio-stage .hk-topdrop { width: calc(100% - 16px); }
            .hk-char-sidebar { width: 210px; padding: 14px; }
            .pv-inspector-right { min-width: 320px; padding: 20px; }
        }
        @media (max-width: 900px) {
            /* El stage se mantiene en grid: es lo que impide que la barra
               inferior tape la imagen. No se cambia a flex-column. */
            #hk-view-studio[style*="none"] { display: none !important; }
            .hk-studio-stage .hk-left-col { height: auto; overflow: visible; }
            .hk-studio-workspace { min-height: 0; flex-shrink: 1; }
            .hk-studio-stage .hk-viewport-area { min-height: 200px; padding: 6px 10px 6px 10px; }
            .hk-hub-header { padding: 16px; }
            .hk-hub-content-scroll { padding: 16px !important; }
            .hk-hub-content-scroll > div { padding: 16px !important; }
            .hk-char-sidebar { width: 180px; }
            .hk-char-header { padding: 14px; gap: 10px; }
            .pv-inspector-modal { overflow-y: auto; }
            .pv-inspector-left { padding: 12px; }
        }
        @media (max-width: 600px) {
            .hk-activity-rail { width: 60px; padding-top: 12px; }
            .hk-rail-brand-tag { font-size: 7px; }
            .hk-rail-nav { gap: 4px; padding: 0 4px; }
            .hk-rail-btn { height: 54px; gap: 4px; }
            .hk-rail-label { font-size: 9px; }
            .hk-rail-count { display: none; }
            .hk-rail-action-sub { font-size: 8px; }
            .hk-studio-stage .hk-viewport-area { padding: 6px 8px 6px 8px; }
            .hk-studio-stage .hk-topdrop { top: 12px; width: calc(100% - 12px); }
            .hk-studio-stage #hk-topdrop-history .hk-history-thumb { height: 76px; width: 76px; }
            .hk-format-bar, .hk-viewer-actions { gap: 4px; }
            .hk-dim-inputs { width: 100%; }
            .hk-prompt-tools { align-items: flex-start; }
            .hk-prompt-tools > div { display: flex; flex-wrap: wrap; }
            .hk-prompt-row { flex-direction: column; }
            .hk-generate-cluster { flex-direction: row; width: 100%; min-width: 0; }
            .hk-btn-generate { min-height: 52px; }

            .hk-tab-toolbar, .hk-card-grid, .hk-card-list { padding: 14px; }
            .hk-tab-toolbar > div { width: 100%; }
            .hk-card-list .hk-card-item { flex-direction: column; }
            .hk-hub-header > div, .hk-hub-content-scroll > div > div { flex-wrap: wrap; }
            #hk-hub-link-input { flex-basis: 100% !important; }
            .hk-linkbank-search { width: 100%; }
            :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop) { padding: 10px; }
            .pv-inspector-modal { flex-direction: column; max-height: 94dvh; }
            .pv-inspector-left { min-height: 180px; flex: none; }
            .pv-inspector-img { max-height: 240px; }
            .pv-inspector-right { min-width: 0; max-width: none; overflow-y: visible; padding: 18px; }
            .pv-modal { padding: 20px; max-height: 94dvh; }
            .hk-char-modal { height: 96dvh; }
            .hk-char-body { flex-direction: column; }
            .hk-char-sidebar { width: 100%; max-height: 150px; flex-shrink: 0; border-right: 0; border-bottom: 1px solid var(--hk-border); }
            .hk-char-grid { padding: 12px; gap: 10px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
            .hk-char-search-wrap { flex-basis: 100%; }
            .hk-char-overlay { opacity: 1; pointer-events: auto; position: static; background: var(--hk-card); }
            .hk-char-trigger-box, .hk-char-tags-chips { display: none; }
            .hk-char-pagination { padding: 10px; }
        }
        @media (prefers-reduced-motion: reduce) {
            :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
                .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal) * {
                transition: none !important; animation: none !important;
            }
        }

        .hk-dialog-title { font: 600 20px var(--hk-sans); letter-spacing: -0.025em; color: var(--hk-white); }
        .hk-section-heading { font: 600 17px var(--hk-sans); letter-spacing: -0.02em; color: var(--hk-white); }
        .hk-download-entry { display: flex; flex-wrap: wrap; gap: 10px; }
        .hk-linkbank-toolbar { display: flex; flex-direction: column; gap: 16px; margin-bottom: 16px; }
        .hk-linkbank-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
        .hk-linkbank-tools .hk-linkbank-search { width: 260px; max-width: 100%; flex-shrink: 0; }
        .pv-modal .hk-label { font-size: 12px !important; text-transform: none; letter-spacing: 0; }
        .pv-modal .hk-btn-icon-xs, .hk-meta-copy-btn { min-width: 34px; min-height: 34px; border: 1px solid var(--hk-border); border-radius: var(--hk-radius-sm); background: var(--hk-card); color: var(--hk-text); cursor: pointer; }
        .hk-hub-content-scroll > div > div[style*="font-family"], .hk-hub-header > div > div > div:last-child { font-family: var(--hk-sans) !important; font-size: 12px !important; }
        .hk-btn-cyber { font-size: 12px !important; }
        .hk-linkbank-card.present { border-color: var(--hk-border); }
        .hk-hub-modal-backdrop { background: rgba(0,0,0,.8) !important; }
        .hk-char-header > div:first-child > div > div:first-child { font: 600 18px var(--hk-sans) !important; letter-spacing: -0.02em !important; }
        @media (max-width: 600px) {
            .hk-linkbank-tools .hk-linkbank-search { width: 100%; }
            .hk-download-entry input { flex-basis: 100%; }
            .hk-dialog-title { font-size: 18px; }
        }

        @media (max-width: 600px) {
            .hk-char-card-media { aspect-ratio: auto; overflow: visible; }
            .hk-char-card-img { height: auto; aspect-ratio: 2 / 3; object-fit: cover; }
            .hk-char-extra-actions { flex-wrap: wrap; }
            .hk-char-overlay { gap: 8px; }
        }
        @media (max-height: 650px) {
            .hk-activity-rail { overflow-y: auto; gap: 16px; }
            .hk-rail-nav { gap: 4px; }
            .hk-rail-btn { height: 48px; }
            .hk-rail-action-btn { min-height: 34px; }
        }

        .hk-action-dialog-backdrop,
        .pv-modal-backdrop:has(.hk-action-dialog) {
            z-index: 30000000 !important;
        }
        .hk-action-dialog .hk-dialog-title { margin: 0; }
        .hk-dialog-message { margin: 0; color: var(--hk-text-muted); white-space: pre-wrap; overflow-wrap: anywhere; }
        .hk-dialog-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; padding-top: 12px; border-top: 1px solid var(--hk-border); }

        .hk-char-header { position: relative; padding-right: 72px; }
        #hk-char-close-btn { position: absolute; top: 20px; right: 20px; }
        #hk-char-sort-container { flex-wrap: wrap; }
        @media (max-width: 600px) {
            .hk-char-header { padding-right: 56px; }
            #hk-char-close-btn { top: 14px; right: 12px; }
        }

        @keyframes hkPulse { 0%, 100% { opacity: .65; } 50% { opacity: 1; } }
        @keyframes hk-surface-enter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes hk-dialog-enter { from { opacity: 0; transform: translateY(12px) scale(.985); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes hk-backdrop-enter { from { opacity: 0; } to { opacity: 1; } }

        /* ==================================================================== */
        /* SISTEMA DE ANIMACIONES (v5) — fluido y coherente en todo el nodo     */
        /* Se usa @starting-style para que los elementos se animen AL MONTARSE  */
        /* y no se re-animen en cada refresco (teclear en un buscador no debe   */
        /* hacer parpadear la lista entera).                                    */
        /* ==================================================================== */
        @keyframes hk-drop-in {
            from { opacity: 0; transform: translateY(-16px) scale(.985); }
            to   { opacity: 1; transform: none; }
        }
        @keyframes hk-pop-in {
            0%   { opacity: 0; transform: scale(.9); }
            62%  { opacity: 1; transform: scale(1.012); }
            100% { opacity: 1; transform: scale(1); }
        }
        @keyframes hk-slide-in-right {
            from { opacity: 0; transform: translateX(26px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hk-rail-in {
            from { opacity: 0; transform: translateX(-14px); }
            to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hk-sheen {
            from { transform: translateX(-120%); }
            to   { transform: translateX(220%); }
        }
        @keyframes hk-glow-breathe {
            0%, 100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
            50%      { box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.16); }
        }
        @keyframes hk-dot-pulse {
            0%, 100% { transform: scale(1);   opacity: 1; }
            50%      { transform: scale(1.45); opacity: .6; }
        }

        /* Transiciones base de todo lo interactivo. */
        #universe-downloader-overlay button,
        #universe-downloader-overlay .hk-quick-tag,
        #universe-downloader-overlay .hk-min-pill,
        #universe-downloader-overlay .hk-ratio-pill,
        #universe-downloader-overlay .hk-pill,
        #universe-downloader-overlay .hk-act-btn,
        #universe-downloader-overlay .hk-rail-btn,
        #universe-downloader-overlay .hk-char-btn-sub,
        #universe-downloader-overlay .hk-trigger-pill,
        :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal) :is(button, .hk-quick-tag) {
            transition: background-color 180ms cubic-bezier(.4, 0, .2, 1),
                        border-color 180ms cubic-bezier(.4, 0, .2, 1),
                        color 180ms cubic-bezier(.4, 0, .2, 1),
                        box-shadow 220ms cubic-bezier(.4, 0, .2, 1),
                        transform 180ms cubic-bezier(.4, 0, .2, 1);
        }
        /* Controles que NO deben desplazarse al pasar el raton (si no, el
           layout "respira" y molesta): solo cambio de color. */
        #universe-downloader-overlay :is(.hk-rail-brand, .hk-deck-handle, .hk-switch, .hk-slider) {
            transition: none;
        }

        /* Foco comun con halo, sin desplazar nada. */
        #universe-downloader-overlay :is(input, select, textarea):focus-visible,
        :is(.pv-modal-backdrop, .pv-inspector-backdrop) :is(input, select, textarea):focus-visible {
            outline: none;
            border-color: var(--hk-accent);
            box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.22);
        }

        /* --- Riel lateral: entrada escalonada al abrir el panel --- */
        @starting-style {
            #universe-downloader-overlay .hk-activity-rail { opacity: 0; transform: translateX(-14px); }
            #universe-downloader-overlay .hk-app-main { opacity: 0; transform: translateY(10px); }
        }
        #universe-downloader-overlay .hk-activity-rail {
            transition: opacity 260ms ease-out, transform 300ms cubic-bezier(.16, 1, .3, 1);
        }
        #universe-downloader-overlay .hk-app-main {
            transition: opacity 300ms ease-out, transform 320ms cubic-bezier(.16, 1, .3, 1);
        }

        /* --- Dropdown superior: baja desde arriba --- */
        @starting-style {
            .hk-studio-stage .hk-topdrop.open { opacity: 0; transform: translateY(-16px) scale(.985); }
        }
        .hk-studio-stage .hk-topdrop {
            transition: opacity 200ms ease-out,
                        transform 280ms cubic-bezier(.16, 1, .3, 1),
                        visibility 200ms ease;
        }
        .hk-studio-stage .hk-topdrop.hk-anchored {
            transition: opacity 200ms ease-out, transform 280ms cubic-bezier(.16, 1, .3, 1);
        }
        /* Contenido interno del panel: entra con un leve retardo. */
        @starting-style {
            .hk-studio-stage .hk-topdrop.open .hk-topdrop-head { opacity: 0; transform: translateY(-6px); }
            .hk-studio-stage .hk-topdrop.open .hk-topdrop-scroll { opacity: 0; transform: translateY(6px); }
        }
        .hk-studio-stage .hk-topdrop .hk-topdrop-head,
        .hk-studio-stage .hk-topdrop .hk-topdrop-scroll {
            transition: opacity 260ms ease-out 40ms, transform 300ms cubic-bezier(.16, 1, .3, 1) 40ms;
        }

        /* --- Barra inferior y su contenido --- */
        @starting-style {
            .hk-studio-stage .hk-prompt-deck { opacity: 0; transform: translateY(20px); }
        }
        .hk-studio-stage .hk-prompt-deck {
            transition: opacity 300ms ease-out,
                        transform 340ms cubic-bezier(.16, 1, .3, 1),
                        border-color 220ms ease,
                        box-shadow 220ms ease;
        }

        /* --- Tarjetas: aparecen subiendo y se elevan al pasar el raton --- */
        @starting-style {
            #universe-downloader-overlay .hk-card-item { opacity: 0; transform: translateY(14px); }
            #universe-downloader-overlay .hk-history-thumb { opacity: 0; transform: scale(.94); }
            #universe-downloader-overlay .hk-char-card { opacity: 0; transform: translateY(12px); }
            #universe-downloader-overlay :is(.hk-pill, .hk-min-pill, .hk-quick-tag, .hk-act-btn, .hk-ratio-pill) { opacity: 0; transform: translateY(-6px); }
            #universe-downloader-overlay .hk-rail-btn { opacity: 0; transform: translateX(-10px); }
        }
        #universe-downloader-overlay .hk-card-item {
            transition: opacity 320ms ease-out, transform 320ms cubic-bezier(.16, 1, .3, 1),
                        border-color 200ms ease, box-shadow 240ms ease;
        }
        #universe-downloader-overlay .hk-history-thumb {
            transition: opacity 220ms ease-out, transform 240ms cubic-bezier(.16, 1, .3, 1),
                        border-color 200ms ease, box-shadow 200ms ease;
        }
        #universe-downloader-overlay .hk-linkbank-card,
        #universe-downloader-overlay .hk-char-card {
            transition: opacity 300ms ease-out, transform 300ms cubic-bezier(.16, 1, .3, 1),
                        border-color 200ms ease, box-shadow 240ms ease;
        }
        #universe-downloader-overlay :is(.hk-pill, .hk-min-pill, .hk-quick-tag, .hk-act-btn, .hk-ratio-pill) {
            transition: opacity 240ms ease-out, transform 240ms cubic-bezier(.16, 1, .3, 1),
                        background-color 180ms ease, border-color 180ms ease,
                        color 180ms ease, box-shadow 200ms ease;
        }
        #universe-downloader-overlay .hk-rail-btn {
            transition: opacity 260ms ease-out, transform 280ms cubic-bezier(.16, 1, .3, 1),
                        background-color 180ms ease, border-color 180ms ease, color 180ms ease;
        }
        /* Escalonado sutil: hace que la entrada se lea como un barrido. */
        #universe-downloader-overlay .hk-rail-nav .hk-rail-btn:nth-child(1) { transition-delay: 20ms; }
        #universe-downloader-overlay .hk-rail-nav .hk-rail-btn:nth-child(2) { transition-delay: 50ms; }
        #universe-downloader-overlay .hk-rail-nav .hk-rail-btn:nth-child(3) { transition-delay: 80ms; }
        #universe-downloader-overlay .hk-rail-nav .hk-rail-btn:nth-child(4) { transition-delay: 110ms; }
        #universe-downloader-overlay .hk-rail-nav .hk-rail-btn:nth-child(5) { transition-delay: 140ms; }

        /* --- Pestanas: la vista activa entra con un fundido corto --- */
        @keyframes hk-view-in {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
        }
        #universe-downloader-overlay .hk-stage-full,
        #universe-downloader-overlay .hk-studio-stage {
            animation: hk-view-in 260ms cubic-bezier(.16, 1, .3, 1);
        }

        /* --- Modal: fondo con desenfoque progresivo y contenido con rebote --- */
        @starting-style {
            :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
                .hk-hub-modal-backdrop, .hk-char-modal-backdrop) { opacity: 0; backdrop-filter: blur(0px); }
            :is(.pv-modal, .pv-inspector-modal, .hk-char-modal, .hk-hub-modal) { opacity: 0; transform: translateY(18px) scale(.97); }
        }
        :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop) {
            transition: opacity 200ms ease-out, backdrop-filter 240ms ease-out;
        }
        :is(.pv-modal, .pv-inspector-modal, .hk-char-modal, .hk-hub-modal) {
            transition: opacity 240ms ease-out, transform 320ms cubic-bezier(.16, 1, .3, 1);
        }

        /* --- Toasts: entran deslizando desde la derecha --- */
        @starting-style {
            .universe-toast { opacity: 0; transform: translateX(28px); }
        }
        .universe-toast {
            animation: none;
            transition: opacity 220ms ease-out, transform 300ms cubic-bezier(.16, 1, .3, 1);
        }

        /* --- Autocompletado de tags: aparece con un pop suave --- */
        @starting-style {
            .hk-autocomplete-popup { opacity: 0; transform: translateY(6px) scale(.98); }
        }
        .hk-autocomplete-popup {
            animation: none;
            transition: opacity 160ms ease-out, transform 200ms cubic-bezier(.16, 1, .3, 1);
        }

        /* --- Barra de progreso: brillo que recorre mientras genera --- */
        #universe-downloader-overlay .hk-progress-fill {
            position: relative;
            overflow: hidden;
            transition: width 320ms cubic-bezier(.4, 0, .2, 1), background-color 240ms ease;
        }
        #universe-downloader-overlay .hk-progress-fill::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
            animation: hk-sheen 1.6s linear infinite;
            pointer-events: none;
        }
        /* Sin generacion activa el brillo desaparece. */
        #universe-downloader-overlay .hk-progress-wrap:not(.hk-generating) .hk-progress-fill::after {
            animation: none;
            opacity: 0;
        }

        /* --- Interruptor de LoRA/Hires: el pomo se desliza con muelle --- */
        #universe-downloader-overlay .hk-slider,
        #universe-downloader-overlay .hk-slider:before {
            transition: background-color 220ms cubic-bezier(.4, 0, .2, 1),
                        transform 260ms cubic-bezier(.34, 1.4, .64, 1);
        }
        /* --- Desplegables nativos (<details>): su contenido entra suave --- */
        @starting-style {
            #universe-downloader-overlay details[open] > :not(summary) { opacity: 0; transform: translateY(-6px); }
        }
        #universe-downloader-overlay details > :not(summary) {
            transition: opacity 220ms ease-out, transform 260ms cubic-bezier(.16, 1, .3, 1);
        }
        #universe-downloader-overlay details > summary {
            transition: color 180ms ease, background-color 180ms ease;
        }

        /* --- Punto de estado del motor: late cuando hay trabajo --- */
        #universe-downloader-overlay .hk-engine-dot { transition: background-color 240ms ease, box-shadow 240ms ease; }
        #universe-downloader-overlay .hk-engine-dot.busy { animation: hk-dot-pulse 1.3s ease-in-out infinite; }
        /* --- Enlaces del banco: elevacion al pasar el raton --- */
        #universe-downloader-overlay .hk-linkbank-card:hover { transform: translateY(-2px); }
        #universe-downloader-overlay .hk-history-thumb:hover { transform: translateY(-2px) scale(1.03); }
        #universe-downloader-overlay .hk-char-card:hover { transform: translateY(-3px); }

        /* --- Cierre del panel: fundido de salida --- */
        #universe-downloader-overlay.hk-closing {
            opacity: 0;
            transform: scale(.994);
            pointer-events: none;
            transition: opacity var(--hk-motion-surface, 240ms) ease-out,
                        transform var(--hk-motion-surface, 240ms) var(--hk-motion-ease-enter, cubic-bezier(.16, 1, .3, 1));
        }

        /* Respeto a quien prefiere menos movimiento. */
        @media (prefers-reduced-motion: reduce) {
            #universe-downloader-overlay *,
            #universe-downloader-overlay *::before,
            #universe-downloader-overlay *::after,
            :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
                .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal,
                #universe-toast-container, .hk-autocomplete-popup),
            :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
                .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal,
                #universe-toast-container, .hk-autocomplete-popup) * {
                animation-duration: 1ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 1ms !important;
                transition-delay: 0ms !important;
            }
        }

        #universe-downloader-overlay :is(.hk-stage-full, .hk-studio-stage) { animation: hk-surface-enter 220ms ease-out; }
        :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop) { animation: hk-backdrop-enter 160ms ease-out; }
        :is(.pv-modal, .pv-inspector-modal, .hk-char-modal) { animation: hk-dialog-enter 240ms cubic-bezier(.2,.7,.2,1); }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal) :is(button, .hk-quick-tag, .hk-rail-btn) { transition: background-color 180ms ease, border-color 180ms ease, color 180ms ease, transform 180ms ease; }
        @media (hover: hover) {
            :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop) button:not(:disabled):hover { transform: translateY(-1px); }
            #universe-downloader-overlay .hk-card-item:hover { transform: translateY(-2px); }
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop) button:not(:disabled):active { transform: scale(.975); transition-duration: 80ms; }
        :is(#universe-downloader-overlay, .hk-hub-modal-backdrop, .hk-char-modal-backdrop) :is(.hk-card-item, .hk-history-thumb, .hk-linkbank-card, .hk-char-card) { transition: transform 200ms ease, border-color 200ms ease, background-color 200ms ease; }
        #universe-downloader-overlay :is(.hk-progress-fill, .hk-hub-progress-bar) { transition: width 260ms ease-out; }
        .universe-toast { animation: hk-surface-enter 220ms ease-out; transition: opacity 180ms ease, transform 180ms ease; max-width: min(460px, calc(100vw - 48px)); overflow-wrap: anywhere; }
        .hk-autocomplete-popup { animation: hk-surface-enter 160ms ease-out; }
        #universe-downloader-overlay details[open] > :not(summary) { animation: hk-surface-enter 180ms ease-out; }
        #hk-lightbox-modal img { animation: hk-backdrop-enter 180ms ease-out; }
        /* Pantalla completa: entrada y salida con fundido, sin recolocar el DOM
           del Studio (eso causaba que los controles se solaparan un momento). */
        #hk-lightbox-modal {
            opacity: 0;
            transition: opacity 160ms ease-out;
            z-index: 20000000 !important;
        }
        #hk-lightbox-modal.hk-lb-visible {
            opacity: 1;
        }
        #hk-lightbox-modal .hk-lb-history-rail {
            position: absolute;
            top: 58px;
            right: 8px;
            bottom: 8px;
            width: 92px;
            margin: 0;
            padding: 6px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            overflow-y: auto;
            background: rgba(10, 8, 16, 0.72);
            backdrop-filter: blur(14px);
            -webkit-backdrop-filter: blur(14px);
            border: 1px solid rgba(168, 85, 247, 0.28);
            border-radius: 12px;
            z-index: 99;
        }
        #hk-lightbox-modal .hk-lb-history-rail .hk-history-head {
            flex-shrink: 0;
        }
        @media (prefers-reduced-motion: reduce) {
            :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal, #universe-toast-container, .hk-autocomplete-popup),
            :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop, #hk-lightbox-modal, #universe-toast-container, .hk-autocomplete-popup) * { animation: none !important; transition: none !important; }
        }

        /* ==================================================================== */
        /* UNIVERSE STUDIO MINIMAL — HERO PREVIEW + TOP DROPDOWNS (v2)       */
        /* Preview gigante al centro. Todo lo demás baja desde arriba y      */
        /* se cierra solo (temporal). Sin drawers laterales.                 */
        /* ==================================================================== */
        .hk-studio-stage {
            position: relative;
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            overflow: hidden;
            background: #08070d;
        }

        #hk-view-studio[style*="none"] {
            display: none !important;
        }

        /* --- Minimal top scrim (temporal, cierra dropdowns al hacer clic) --- */
        /* Solo existe dentro de Studio; jamás debe cubrir Modelos/Bóveda/Hub. */
        .hk-studio-stage .hk-top-scrim {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
            backdrop-filter: blur(2px);
            -webkit-backdrop-filter: blur(2px);
            z-index: 85;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.25s ease;
        }
        .hk-studio-stage .hk-top-scrim.open {
            opacity: 1;
            pointer-events: auto;
        }

        /* --- Minimal top dropdown panel (baja desde arriba, temporal) --- */
        /* Scoped a Studio para no contaminar Modelos/Bóveda/Hub. */
        .hk-studio-stage .hk-topdrop {
            position: absolute;
            top: 64px;
            left: 50%;
            transform: translate(-50%, -12px);
            width: min(880px, calc(100% - 32px));
            max-height: calc(100% - 190px);
            min-height: 120px;
            background: rgba(13, 11, 20, 0.97);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border: 1px solid rgba(168, 85, 247, 0.38);
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(168, 85, 247, 0.16);
            display: flex;
            flex-direction: column;
            z-index: 95;
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease, visibility 0.22s ease;
            pointer-events: none;
            opacity: 0;
            visibility: hidden;
            overflow: hidden;
            box-sizing: border-box;
        }
        .hk-studio-stage .hk-topdrop.open {
            transform: translate(-50%, 0);
            pointer-events: auto;
            opacity: 1;
            visibility: visible;
        }
        /* Drawer lateral legacy: oculto en modo minimal (se conserva clase por compatibilidad) */
        .hk-slideout-drawer,
        .hk-drawer-backdrop {
            display: none !important;
        }
        .hk-studio-stage .hk-topdrop-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            border-bottom: 1px solid rgba(168, 85, 247, 0.25);
            background: rgba(255, 255, 255, 0.02);
            flex-shrink: 0;
        }
        .hk-studio-stage .hk-topdrop-title {
            font-family: var(--hk-mono);
            font-size: 13px;
            font-weight: 700;
            color: #ffffff;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .hk-studio-stage .hk-topdrop-close {
            background: transparent;
            border: 1px solid transparent;
            color: var(--hk-text-dim);
            font-size: 15px;
            cursor: pointer;
            padding: 3px 8px;
            border-radius: 6px;
            transition: all 0.2s;
        }
        .hk-studio-stage .hk-topdrop-close:hover {
            color: #ffffff;
            background: rgba(239, 68, 68, 0.2);
            border-color: rgba(239, 68, 68, 0.4);
        }
        .hk-studio-stage .hk-topdrop-scroll {
            flex: 1 1 auto;
            min-height: 0;
            max-height: calc(100vh - 320px);
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.3) transparent;
        }

        /* ====================================================================
        DESPLEGABLES SUPERIORES: compacto, simetrico y centrado
        (el selector de personajes NO se toca: es un modal aparte)
        ==================================================================== */
        .hk-studio-stage .hk-topdrop {
            --hk-drop-pad: 12px;
            --hk-drop-gap: 8px;
            overflow: hidden;
        }
        /* Ajustes, formato y LoRAs: dialogs compactos centrados en el espacio del Studio. */
        .hk-studio-stage .hk-topdrop.hk-centered-dialog,
        .hk-studio-stage .hk-topdrop.hk-centered-dialog.open {
            transform: none;
        }
        .hk-studio-stage #hk-topdrop-params .hk-left-col {
            padding: 12px;
            gap: 8px;
        }
        .hk-studio-stage #hk-topdrop-params .hk-panel-card {
            padding: 9px 10px;
            gap: 8px;
        }
        .hk-studio-stage #hk-topdrop-loras .hk-left-col {
            padding: 12px;
            gap: 8px;
        }
        /* Cuatro LoRAs: dos columnas y dos filas en ventana amplia (2x2). */
        .hk-studio-stage #hk-topdrop-loras {
            width: 1020px !important;
            max-width: calc(100vw - 28px) !important;
        }
        .hk-studio-stage #hk-topdrop-loras .hk-lora-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
            width: 100%;
        }
        .hk-studio-stage #hk-topdrop-loras .hk-lora-row {
            min-width: 0;
            padding: 16px 18px;
            gap: 12px;
            background: rgba(14, 16, 26, 0.92);
            border: 1.5px solid rgba(255, 255, 255, 0.1);
            border-radius: 14px;
            transition: all 0.2s ease;
        }
        .hk-studio-stage #hk-topdrop-loras .hk-lora-row.active {
            border-color: rgba(168, 85, 247, 0.65);
            background: rgba(20, 22, 38, 0.98);
            box-shadow: 0 8px 28px rgba(139, 92, 246, 0.25);
        }
        @media (max-width: 720px) {
            .hk-studio-stage #hk-topdrop-loras .hk-lora-grid {
                grid-template-columns: minmax(0, 1fr);
            }
        }
        /* LoRA Status Tag */
        .hk-lora-status-tag {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            padding: 2.5px 8px;
            border-radius: 5px;
            background: rgba(255, 255, 255, 0.07);
            color: var(--hk-text-dim);
            letter-spacing: 0.04em;
        }
        .hk-lora-status-tag.active {
            background: rgba(168, 85, 247, 0.24);
            color: var(--hk-purple-light);
            border: 1px solid rgba(168, 85, 247, 0.45);
        }
        /* Custom LoRA Select Trigger Button */
        .hk-lora-custom-select-btn {
            flex: 1;
            min-width: 0;
            height: 38px;
            background: #000000;
            border: 1px solid var(--hk-border);
            border-radius: 8px;
            color: var(--hk-text-bright);
            padding: 0 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            cursor: pointer;
            font-size: 12.5px;
            text-align: left;
            transition: all 0.15s ease;
        }
        .hk-lora-custom-select-btn:hover {
            border-color: var(--hk-purple-light);
            background: rgba(139, 92, 246, 0.08);
        }
        .hk-lora-custom-select-label {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            flex: 1;
            font-weight: 600;
        }
        .hk-lora-custom-select-arrow {
            font-size: 10px;
            color: var(--hk-text-dim);
            flex-shrink: 0;
        }
        /* Custom LoRA Dropdown Popover */
        .hk-lora-dropdown-popover {
            position: fixed;
            z-index: 1000005;
            background: #0a0c13;
            border: 1.5px solid rgba(168, 85, 247, 0.55);
            border-radius: 12px;
            box-shadow: 0 24px 70px rgba(0, 0, 0, 0.96), 0 0 30px rgba(139, 92, 246, 0.3);
            backdrop-filter: blur(16px);
            width: 420px;
            max-height: 480px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-sizing: border-box;
            animation: hkFadeInDown 0.14s ease forwards;
        }
        .hk-lora-dropdown-search-wrap {
            padding: 10px 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            background: rgba(0, 0, 0, 0.4);
        }
        .hk-lora-dropdown-search {
            width: 100%;
            background: #000;
            border: 1px solid var(--hk-border);
            border-radius: 7px;
            padding: 8px 12px;
            font-size: 12.5px;
            color: #fff;
            box-sizing: border-box;
        }
        .hk-lora-dropdown-search:focus {
            border-color: var(--hk-purple-light);
            outline: none;
        }
        .hk-lora-dropdown-list {
            overflow-y: auto;
            max-height: 400px;
            padding: 6px;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        .hk-lora-dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.12s ease;
            color: #cbd5e1;
            font-size: 12.5px;
            user-select: none;
        }
        .hk-lora-dropdown-item:hover {
            background: rgba(168, 85, 247, 0.22);
            color: #fff;
        }
        .hk-lora-dropdown-item.selected {
            background: rgba(168, 85, 247, 0.32);
            color: var(--hk-purple-light);
            font-weight: 700;
        }
        .hk-lora-dropdown-item-thumb {
            width: 48px;
            height: 64px;
            border-radius: 6px;
            overflow: hidden;
            background: #000;
            border: 1px solid rgba(255, 255, 255, 0.12);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
        }
        .hk-lora-dropdown-item-thumb img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: top center;
        }
        .hk-lora-dropdown-item-info {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 3px;
        }
        .hk-lora-dropdown-item-name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 600;
            font-size: 12.5px;
        }
        .hk-lora-dropdown-item-badge {
            font-size: 9.5px;
            color: var(--hk-purple-light);
            font-family: var(--hk-mono);
        }
        /* Floating LoRA Hover Preview Card (Clean, Uncropped, High Detail) */
        .hk-lora-floating-hover-card {
            position: fixed;
            z-index: 1000030;
            pointer-events: none !important;
            width: 340px;
            background: #0b0d16;
            border: 1.5px solid rgba(168, 85, 247, 0.65);
            border-radius: 14px;
            box-shadow: 0 28px 70px rgba(0, 0, 0, 0.98), 0 0 35px rgba(139, 92, 246, 0.45);
            backdrop-filter: blur(16px);
            overflow: hidden;
            display: flex;
            flex-direction: column;
            transition: opacity 0.15s ease;
        }
        .hk-lora-floating-hover-card,
        .hk-lora-floating-hover-card * {
            pointer-events: none !important;
        }
        .hk-lora-hover-card-img-wrap {
            width: 100%;
            height: 330px;
            background: #06070d;
            position: relative;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 8px;
            box-sizing: border-box;
        }
        .hk-lora-hover-bg-blur {
            position: absolute;
            inset: -12px;
            width: calc(100% + 24px);
            height: calc(100% + 24px);
            object-fit: cover;
            filter: blur(28px) brightness(0.4) saturate(1.4);
            opacity: 0.65;
            pointer-events: none;
        }
        .hk-lora-hover-main-img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            display: block;
            position: relative;
            z-index: 1;
            border-radius: 8px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
        }
        .hk-lora-hover-card-body {
            padding: 10px 14px;
            display: flex;
            flex-direction: column;
            gap: 5px;
            background: linear-gradient(180deg, rgba(12, 14, 23, 0.95) 0%, #0b0d16 100%);
            position: relative;
            z-index: 2;
        }
        .hk-lora-hover-card-title {
            font-size: 13px;
            font-weight: 700;
            color: #fff;
            line-height: 1.3;
            word-break: break-word;
        }
        .hk-lora-hover-card-tag {
            font-size: 9.5px;
            font-weight: 700;
            padding: 2.5px 7px;
            border-radius: 4px;
            background: rgba(168, 85, 247, 0.25);
            color: var(--hk-purple-light);
            border: 1px solid rgba(168, 85, 247, 0.5);
        }
        .hk-lora-hover-card-triggers {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            align-items: center;
            margin-top: 2px;
        }
        .hk-lora-hover-card-trigger-chip {
            font-size: 9px;
            padding: 2px 6px;
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.08);
            color: #e2e8f0;
            font-family: var(--hk-mono);
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        /* Cabecera homogenea: mismo alto y mismo padding en los cuatro paneles. */
        .hk-studio-stage .hk-topdrop-head {
            padding: 10px 14px;
            min-height: 42px;
            justify-content: space-between;
        }
        .hk-studio-stage .hk-topdrop-title {
            font-size: 12px;
            letter-spacing: 0.02em;
        }
        /* Contenido: columnas centradas y espaciado uniforme. */
        .hk-studio-stage .hk-topdrop .hk-left-col {
            padding: var(--hk-drop-pad);
            gap: var(--hk-drop-gap);
            display: flex;
            flex-direction: column;
            align-items: stretch;
            justify-content: flex-start;
            max-width: 100%;
            box-sizing: border-box;
        }
        .hk-studio-stage .hk-topdrop .hk-panel-card {
            padding: 10px 12px;
            gap: var(--hk-drop-gap);
        }
        .hk-studio-stage .hk-topdrop .hk-label {
            font-size: 10.5px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: var(--hk-text-dim);
            margin: 0;
        }
        /* Formato: panel mas bajo, con las pills centradas en rejilla. */
        .hk-studio-stage #hk-topdrop-format .hk-topdrop-scroll {
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
        }
        .hk-studio-stage #hk-topdrop-format .hk-format-bar {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 8px;
            justify-items: stretch;
        }
        .hk-studio-stage #hk-topdrop-format .hk-ratio-pill {
            text-align: center;
            min-width: 0;
        }
        .hk-studio-stage #hk-topdrop-format .hk-dim-inputs {
            grid-column: 1 / -1;
            display: grid;
            grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
            gap: 8px;
            align-items: center;
            margin-top: 2px;
        }
        .hk-studio-stage #hk-topdrop-format .hk-dim-input {
            width: 100% !important;
            min-width: 0 !important;
            height: 34px;
            box-sizing: border-box;
        }
        /* Historial y LoRAs: mismo ancho y mismo respire que el resto. */
        .hk-studio-stage #hk-topdrop-history .hk-topdrop-scroll,
        .hk-studio-stage #hk-topdrop-loras .hk-topdrop-scroll { padding: 12px 14px; }

        /* Controles heredados dentro del dropdown superior */
        .hk-studio-stage .hk-topdrop .hk-left-col {
            background: transparent;
            border-right: none;
            padding: 16px;
            gap: 12px;
            box-sizing: border-box;
            height: auto;
            max-height: none;
            overflow: visible;
            display: flex;
            flex-direction: column;
        }
        /* El historial dentro del dropdown: galería horizontal visible */
        .hk-studio-stage #hk-topdrop-history .hk-topdrop-scroll {
            min-height: 180px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-filmstrip-scroll {
            flex-direction: row;
            flex-wrap: wrap;
            overflow-y: auto;
            overflow-x: hidden;
            min-height: 140px;
            max-height: 46vh;
            align-content: flex-start;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-thumb {
            height: 92px;
            width: 92px;
            flex: 0 0 auto;
        }

        /* Minimal hero canvas: la preview manda, ocupa todo el centro */
        /* Scoped a Studio para que Modelos/Bóveda/Hub no hereden posicionamiento. */
        .hk-studio-stage .hk-viewport-area {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            background: #07060b;
            padding: 64px 16px 118px 16px;
            box-sizing: border-box;
            z-index: 10;
        }
        .hk-studio-stage .hk-main-img {
            max-width: min(96vw, 1600px);
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
            border-radius: 14px;
            box-shadow: 0 14px 48px rgba(0, 0, 0, 0.9), 0 0 35px rgba(168, 85, 247, 0.15);
            transition: opacity 0.25s ease;
        }

        /* Minimal top bar: solo disparadores de dropdowns temporales */
        /* Scoped a Studio: no debe flotar sobre Modelos/Bóveda/Hub. */
        .hk-studio-stage .hk-workspace-header {
            position: absolute;
            top: 12px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            background: rgba(13, 11, 20, 0.9);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(168, 85, 247, 0.32);
            border-radius: 999px;
            padding: 6px 10px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.7), 0 0 20px rgba(168, 85, 247, 0.12);
            z-index: 90;
            box-sizing: border-box;
            white-space: nowrap;
            max-width: 96vw;
            overflow-x: auto;
            overflow-y: hidden;
            scrollbar-width: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hk-studio-stage .hk-workspace-header:hover {
            border-color: rgba(168, 85, 247, 0.55);
            box-shadow: 0 10px 36px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.2);
        }
        /* Dentro del header minimal solo viven los pills; el contenido pesado va a .hk-topdrop */
        .hk-studio-stage .hk-workspace-header .hk-format-bar,
        .hk-studio-stage .hk-workspace-header .hk-viewer-control-bar {
            display: contents;
        }
        .hk-studio-stage .hk-min-pill {
            background: rgba(168, 85, 247, 0.14);
            border: 1px solid rgba(168, 85, 247, 0.4);
            color: #fff;
            border-radius: 999px;
            padding: 6px 12px;
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.2s ease, border-color 0.2s ease;
        }
        .hk-studio-stage .hk-min-pill:hover {
            background: rgba(168, 85, 247, 0.28);
            border-color: rgba(168, 85, 247, 0.65);
        }
        .hk-studio-stage .hk-min-pill.active {
            background: rgba(168, 85, 247, 0.4);
            border-color: #a855f7;
        }

        /* Minimal bottom prompt bar: delgada, solo prompt + generar */
        .hk-studio-stage .hk-prompt-deck {
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: min(980px, 94vw);
            background: rgba(13, 11, 20, 0.92);
            backdrop-filter: blur(28px);
            -webkit-backdrop-filter: blur(28px);
            border: 1px solid rgba(168, 85, 247, 0.36);
            border-radius: 18px;
            padding: 10px 14px 8px 14px;
            box-shadow: 0 16px 48px rgba(0, 0, 0, 0.8), 0 0 25px rgba(168, 85, 247, 0.15);
            z-index: 60;
            display: flex;
            flex-direction: column;
            gap: 8px;
            box-sizing: border-box;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .hk-studio-stage .hk-prompt-deck:focus-within {
            border-color: rgba(168, 85, 247, 0.65);
            box-shadow: 0 18px 52px rgba(0, 0, 0, 0.85), 0 0 35px rgba(168, 85, 247, 0.25);
        }

        /* Historial como contenido de dropdown superior (temporal) */
        .hk-studio-stage .hk-history-rail {
            position: static;
            width: 100%;
            background: transparent;
            border: none;
            border-radius: 0;
            box-shadow: none;
            padding: 0;
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
            z-index: auto;
            transition: none;
        }
        .hk-studio-stage .hk-history-rail.collapsed {
            transform: none;
            opacity: 1;
            pointer-events: auto;
        }
        .hk-studio-stage .hk-history-toggle-tab {
            display: none;
        }

        /* ==================================================================== */
        /* FIX v3 — DROPDOWNS COMPLETOS, HERO REALMENTE GRANDE, CERO CHOQUES    */
        /* Estas reglas van al final a proposito: ganan la cascada sobre los    */
        /* bloques legacy L2697 (grid de 2 paneles) y L2982 (viewport legacy).  */
        /* ==================================================================== */

        /* 1) El stage minimalista: capa de preview a pantalla completa + barra
              inferior posicionada con su propia altura real.
              Se usa posicionamiento explicito (no filas de grid) porque al
              reconstruirse el HTML cualquier hermano que caiga en flujo normal
              creaba una fila implicita y descolocaba todo: eso rompia el layout
              tras vaciar el historial. */
        .hk-studio-stage {
            position: relative;
            display: block;
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
            flex: 1 1 auto;
            overflow: hidden;
            background: #08070d;
        }
        /* El viewport legacy (padding 132px a la derecha para el rail antiguo)
           nunca debe aplicarse al hero de Studio. */
        .hk-studio-stage .hk-viewport-area,
        .hk-studio-stage .hk-image-frame,
        .hk-studio-stage .hk-main-img {
            position: static;
            padding: 0;
        }
        .hk-studio-stage .hk-viewport-area {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            /* La barra inferior es absoluta: su alto real lo mide el JS y se
               publica en --hk-deck-h. Este respaldo evita cualquier solape
               incluso antes de la primera medicion. */
            bottom: var(--hk-deck-h, 220px);
            min-width: 0;
            min-height: 0;
            padding: 8px 12px 8px 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            box-sizing: border-box;
        }

        /* 2) Dropdowns: mas anchos y usando TODO el alto disponible.
              Antes: max-height calc(100% - 190px) dejaba 130px sin usar y el
              contenido (922px) solo mostraba 488px -> "no se abren del todo".
              Ahora el alto lo fija el JS con el hueco real medido. */
        .hk-studio-stage .hk-topdrop {
            position: absolute;
            top: 62px;
            /* Compacto y centrado sobre el lienzo: en pantallas anchas no se
               estira de lado a lado, y en estrechas se adapta sin desbordar. */
            width: min(700px, calc(100% - 28px));
            max-height: none; /* lo fija el JS con la altura real disponible */
            min-height: 0;
            border-radius: 14px;
        }
        /* Modo anclado: cuando el JS ya midio el hueco, el panel se posiciona en
           coordenadas de viewport. Asi ninguna regla de layout posterior puede
           volver a dejarlo en una franja diminuta. */
        .hk-studio-stage .hk-topdrop.hk-anchored {
            position: fixed;
            top: var(--hk-drop-top, 62px);
            left: var(--hk-drop-left, 50%);
            width: var(--hk-drop-width, min(940px, calc(100% - 28px)));
            transform: none;
            margin: 0;
        }
        .hk-studio-stage .hk-topdrop.hk-anchored.open {
            transform: none;
        }
        .hk-studio-stage .hk-topdrop-scroll {
            max-height: none;
            flex: 1 1 auto;
            min-height: 0;
            overscroll-behavior: contain;
            scrollbar-width: thin;
            scrollbar-color: rgba(168, 85, 247, 0.45) transparent;
        }
        .hk-studio-stage .hk-topdrop-scroll::-webkit-scrollbar {
            width: 7px;
        }
        .hk-studio-stage .hk-topdrop-scroll::-webkit-scrollbar-track {
            background: transparent;
        }
        .hk-studio-stage .hk-topdrop-scroll::-webkit-scrollbar-thumb {
            background: rgba(168, 85, 247, 0.45);
            border-radius: 4px;
        }
        .hk-studio-stage .hk-topdrop-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(168, 85, 247, 0.7);
        }
        /* El historial no debe quedar aplastado: mas alto y con scroll propio. */
        .hk-studio-stage #hk-topdrop-history .hk-topdrop-scroll {
            min-height: 0;
            padding-bottom: 16px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-filmstrip-scroll {
            min-height: 108px;
            max-height: none;
        }
        /* Historial: panel centrado, galeria simetrica y estado vacio centrado. */
        .hk-studio-stage #hk-topdrop-history .hk-topdrop-scroll {
            padding: 14px 18px 18px;
            display: flex;
            flex-direction: column;
            min-height: 0;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-rail {
            width: 100%;
            min-height: 0;
            flex: 1 1 auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-head {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 10px;
            border-bottom: 1px solid rgba(255,255,255,.07);
            gap: 12px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-heading {
            justify-content: flex-start;
            gap: 8px;
            font-size: 11px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-heading #hk-history-count {
            color: var(--hk-text-dim);
            font: 11px var(--hk-mono);
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-actions {
            display: flex;
            grid-template-columns: none;
            gap: 8px;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-actions button {
            width: 34px;
            min-width: 34px;
            min-height: 34px;
            padding: 0;
            display: grid;
            place-items: center;
        }
        .hk-studio-stage #hk-topdrop-history .hk-filmstrip-scroll {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));
            align-content: start;
            justify-items: stretch;
            gap: 12px;
            width: 100%;
            min-height: 0;
            max-height: none;
            flex: 1 1 auto;
            padding: 2px;
            overflow-x: hidden;
            overflow-y: auto;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-thumb {
            width: 100%;
            height: auto;
            aspect-ratio: 1;
            min-width: 0;
        }
        .hk-studio-stage #hk-topdrop-history .hk-history-empty {
            grid-column: 1 / -1;
            min-height: 220px;
            width: 100%;
            margin: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-sizing: border-box;
        }
        @media (max-width: 640px) {
            .hk-studio-stage #hk-topdrop-history .hk-topdrop-scroll { padding: 12px; }
            .hk-studio-stage #hk-topdrop-history .hk-filmstrip-scroll {
                grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
                gap: 8px;
            }
        }

        /* 3) Barra inferior: anclada abajo con su propia altura. No puede
              solaparse con la preview porque el lienzo termina justo donde
              empieza la barra (--hk-deck-h, medido en vivo). */
        .hk-studio-stage .hk-prompt-deck {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            top: auto;
            transform: none;
            width: 100%;
            max-width: none;
            border-radius: 0;
            border: none;
            border-top: 1px solid rgba(168, 85, 247, 0.34);
            box-shadow: 0 -10px 30px rgba(0, 0, 0, 0.55);
            padding: 8px 14px 7px 14px;
            gap: 6px;
            z-index: 60;
        }
        /* Controles integrados en la barra inferior. */
        .hk-studio-stage .hk-deck-pills {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            min-width: 0;
        }
        .hk-studio-stage .hk-deck-actions {
            display: flex;
            align-items: center;
            gap: 6px;
            /* nowrap: con wrap los botones saltaban de linea y el menu Ajustes
               acababa aparesido despues de Limpiar. */
            flex-wrap: nowrap;
            justify-content: flex-end;
            min-width: 0;
        }
        .hk-studio-stage .hk-deck-actions > * {
            flex: 0 0 auto;
        }
        .hk-studio-stage .hk-prompt-tools {
            align-items: flex-start;
        }
        .hk-studio-stage .hk-prompt-tools {
            gap: 6px;
        }
        .hk-studio-stage .hk-prompt-row {
            gap: 10px;
        }
        .hk-studio-stage .hk-prompt-wrap {
            gap: 4px;
        }
        .hk-studio-stage .hk-prompt-wrap .hk-textarea {
            height: 72px;
            padding: 9px 12px;
            font-size: 13.5px;
        }
        .hk-studio-stage .hk-neg-textarea {
            height: 34px !important;
            min-height: 34px !important;
            padding: 7px 12px !important;
            font-size: 12.5px !important;
        }
        .hk-studio-stage .hk-generate-cluster {
            width: 142px;
            min-width: 142px;
            gap: 6px;
        }
        .hk-studio-stage .hk-btn-generate {
            min-height: 60px;
        }
        .hk-studio-stage .hk-btn-gen-sub {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            justify-content: center;
            gap: 4px;
            line-height: 1.25;
            min-height: 0;
        }
        .hk-studio-stage .hk-progress-wrap {
            gap: 4px;
        }

        /* 4) La imagen manda: crece hasta el borde de su caja sin deformarse. */
        .hk-studio-stage .hk-main-img {
            max-width: 100%;
            max-height: 100%;
            width: auto;
            height: auto;
            object-fit: contain;
        }

        /* 4b) EXCLUSIVIDAD DE VISTAS. Cada pestana vive en su propio contenedor
              dentro de .hk-app-main. Si por cualquier motivo mas de una queda
              visible, el contenido se mezcla (el deck de Studio y su estado
              vacio se pintan encima de Modelos/Boveda/Hub). Estas reglas
              garantizan que la vista inactiva NO se pinte nunca, y ademas
              aislan el apilado de la vista activa. */
        #universe-downloader-overlay .hk-app-main > #hk-view-studio[style*="none"],
        #universe-downloader-overlay .hk-app-main > #hk-view-models[style*="none"],
                #universe-downloader-overlay .hk-app-main > #hk-view-hub[style*="none"] {
            display: none;
        }
        #universe-downloader-overlay .hk-app-main {
            isolation: isolate;
        }
        #universe-downloader-overlay .hk-app-main > #hk-view-models,
                #universe-downloader-overlay .hk-app-main > #hk-view-hub {
            position: relative;
            z-index: 1;
            flex: 1 1 auto;
            min-width: 0;
            min-height: 0;
        }

        /* 5) Pantallas bajas: priorizar el preview por encima de todo. */
        @media (max-height: 760px) {
            .hk-studio-stage .hk-viewport-area { padding: 6px 10px 6px 10px; }
            .hk-studio-stage .hk-prompt-wrap .hk-textarea { height: 60px; }
            .hk-studio-stage .hk-topdrop { top: 58px; }
        }
        @media (max-height: 640px) {
            .hk-studio-stage .hk-viewport-area { padding: 6px 8px 6px 8px; }
            .hk-studio-stage .hk-prompt-wrap .hk-textarea { height: 52px; }
            .hk-studio-stage .hk-neg-textarea { height: 30px !important; min-height: 30px !important; }
            .hk-studio-stage .hk-generate-cluster { width: 120px; min-width: 120px; }
        }

        /* ==================================================================== */
        /* FIX v4 — MODO INMERSIVO Y BARRA DE PROMPT COLAPSABLE                 */
        /* La preview es la prioridad absoluta: cuando el usuario no esta       */
        /* escribiendo, la barra se recoge y el lienzo respira.                 */
        /* ==================================================================== */

        /* Los controles flotantes de la esquina superior derecha se retiraron:
           tapaban la imagen. Inmersivo y barra recogida siguen disponibles con
           las teclas I y B. */
        /* Salida del modo inmersivo: una pildora discreta abajo al centro. Es la
           unica salida visible cuando la barra esta oculta, asi que nunca puede
           quedarse sin mostrar (el boton interno vive dentro de la barra). */
        .hk-studio-stage .hk-immersive-exit {
            position: absolute;
            bottom: 16px;
            left: 50%;
            transform: translateX(-50%) translateY(8px);
            z-index: 97;
            display: none;
            align-items: center;
            gap: 6px;
            padding: 8px 15px;
            background: rgba(13, 11, 20, 0.76);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border: 1px solid rgba(168, 85, 247, 0.45);
            border-radius: 999px;
            color: #ffffff;
            font-family: var(--hk-sans);
            font-size: 12px;
            font-weight: 700;
            cursor: pointer;
            opacity: 0;
        }
        .hk-studio-stage .hk-immersive-exit:hover {
            border-color: var(--hk-accent);
            background: rgba(168, 85, 247, 0.3);
        }
        .hk-studio-stage.hk-immersive .hk-immersive-exit {
            display: inline-flex;
            opacity: 0.4;
            transition: opacity 240ms ease-out, transform 300ms cubic-bezier(.16, 1, .3, 1);
            transform: translateX(-50%) translateY(0);
        }
        .hk-studio-stage.hk-immersive .hk-immersive-exit:hover {
            opacity: 1;
        }

        /* Estado recogido de la barra de prompt.
           La transition incluye TAMBIEN border-color y box-shadow para que el
           resalte al enfocar el prompt siga animandose (antes lo pisaba una
           regla posterior y el foco cambiaba de golpe). */
        .hk-studio-stage .hk-prompt-deck {
            transition: transform 0.34s cubic-bezier(0.16, 1, 0.3, 1),
                        opacity 0.26s ease,
                        border-color 0.2s ease,
                        box-shadow 0.2s ease;
        }
        /* Barra recogida: con el layout en grid ya no puede deslizarse fuera
           (no es absoluta), asi que se pliega ocultando su contenido y deja
           solo el asa. Recupera TODO el alto para la preview. */
        .hk-studio-stage.hk-deck-collapsed .hk-prompt-deck .hk-prompt-row,
        .hk-studio-stage.hk-deck-collapsed .hk-prompt-deck .hk-prompt-tools,
        .hk-studio-stage.hk-deck-collapsed .hk-prompt-deck .hk-progress-wrap {
            display: none;
        }
        .hk-studio-stage.hk-deck-collapsed .hk-prompt-deck {
            padding: 4px 14px 5px 14px;
        }
        /* El asa visual de la barra recogida. */
        .hk-studio-stage .hk-deck-handle {
            display: none;
            width: 46px;
            height: 4px;
            border-radius: 999px;
            background: rgba(168, 85, 247, 0.55);
            margin: 0 auto 2px auto;
            flex-shrink: 0;
            cursor: pointer;
        }
        .hk-studio-stage.hk-deck-collapsed .hk-deck-handle {
            display: block;
        }

        /* MODO INMERSIVO: el lienzo ocupa todo y la UI se desvanece. */
        .hk-studio-stage.hk-immersive .hk-viewport-area {
            padding: 8px 10px 8px 10px;
        }
        /* La barra desaparece por completo: la fila del grid se colapsa y la
           preview se queda con TODO el alto. */
        .hk-studio-stage.hk-immersive .hk-prompt-deck {
            display: none;
        }
        .hk-studio-stage.hk-immersive .hk-workspace-header {
            display: none;
        }
        /* La UI vuelve cuando el raton se acerca de verdad a los controles.
           Usamos :hover SOLO sobre los propios controles: un :hover sobre el
           stage (que es lo que reporta siempre un navegador headless, y tambien
           cualquier raton quieto sobre la ventana) anularia el ocultado. */
        .hk-studio-stage.hk-immersive .hk-prompt-deck:hover,
        .hk-studio-stage.hk-immersive .hk-prompt-deck:focus-within {
            opacity: 1;
            pointer-events: auto;
        }
        .hk-studio-stage.hk-immersive .hk-main-img {
            max-width: 100%;
            max-height: 100%;
            border-radius: 6px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.85);
        }

        /* Selector de personajes: escaparate centrado, ordenado y fluido. */
        @keyframes hk-char-backdrop-in {
            from { opacity: 0; backdrop-filter: blur(0); }
            to { opacity: 1; backdrop-filter: blur(18px); }
        }
        @keyframes hk-char-dialog-in {
            from { opacity: 0; transform: translateY(16px) scale(.975); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes hk-char-card-in {
            from { opacity: 0; transform: translateY(10px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hk-char-modal-backdrop {
            padding: 28px;
            background: radial-gradient(ellipse at 50% 40%, rgba(109, 40, 217, .16), transparent 58%), rgba(3, 3, 7, .84);
            backdrop-filter: blur(18px) saturate(125%);
            -webkit-backdrop-filter: blur(18px) saturate(125%);
            animation: hk-char-backdrop-in 260ms ease-out both;
        }
        .hk-char-modal {
            width: min(1540px, calc(100vw - 56px));
            height: min(900px, calc(100dvh - 56px));
            max-width: none;
            max-height: none;
            border: 1px solid rgba(192, 132, 252, .32);
            border-radius: 26px;
            background: linear-gradient(145deg, #0d0b13 0%, #08080c 54%, #0b0911 100%);
            box-shadow: 0 34px 110px rgba(0, 0, 0, .72), 0 0 0 1px rgba(255, 255, 255, .035) inset, 0 0 54px rgba(124, 58, 237, .14);
            animation: hk-char-dialog-in 360ms cubic-bezier(.2, .8, .2, 1) both;
            isolation: isolate;
        }
        .hk-char-header {
            position: relative;
            padding: 17px 22px;
            padding-right: 22px;
            display: grid;
            grid-template-columns: minmax(210px, .85fr) auto minmax(280px, 1.25fr) 42px;
            grid-template-areas: "brand tabs search close" "clipboard sort sort close";
            align-items: center;
            justify-content: initial;
            gap: 10px 14px;
            background: linear-gradient(110deg, rgba(23, 17, 34, .98), rgba(10, 10, 15, .98) 68%);
            border-bottom: 1px solid rgba(192, 132, 252, .16);
        }
        .hk-char-brand {
            grid-area: brand;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
        }
        .hk-char-brand-icon {
            width: 42px;
            height: 42px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border: 1px solid rgba(192, 132, 252, .34);
            border-radius: 14px;
            background: linear-gradient(145deg, rgba(168, 85, 247, .24), rgba(91, 33, 182, .08));
            box-shadow: 0 6px 24px rgba(126, 34, 206, .16), inset 0 1px rgba(255, 255, 255, .08);
            font-size: 20px;
        }
        .hk-char-brand-title {
            color: #fff;
            font-size: 15px;
            font-weight: 800;
            letter-spacing: .015em;
            line-height: 1.2;
        }
        .hk-char-brand-subtitle {
            margin-top: 4px;
            color: #c4a3f3;
            font: 10px var(--hk-mono);
            letter-spacing: .02em;
        }
        .hk-char-tabs {
            grid-area: tabs;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px;
            border: 1px solid rgba(255, 255, 255, .09);
            border-radius: 15px;
            background: rgba(0, 0, 0, .32);
        }
        .hk-char-tabs .hk-char-tab-btn {
            min-height: 40px;
            padding: 0 14px !important;
            border: 1px solid transparent;
            border-radius: 11px !important;
            background: transparent !important;
            color: var(--hk-text-muted) !important;
            white-space: nowrap;
        }
        .hk-char-tabs .hk-char-tab-btn:hover {
            background: rgba(255, 255, 255, .055) !important;
        }
        .hk-char-tabs .hk-char-tab-btn.active {
            background: linear-gradient(135deg, #a855f7, #7c3aed) !important;
            border-color: rgba(216, 180, 254, .35);
            box-shadow: 0 5px 18px rgba(126, 34, 206, .24), inset 0 1px rgba(255, 255, 255, .17);
            color: #fff !important;
        }
        .hk-char-search-wrap {
            grid-area: search;
            width: 100%;
            max-width: none;
            min-width: 0;
        }
        .hk-char-search-input {
            min-height: 44px;
            padding: 0 42px 0 15px;
            border: 1px solid rgba(255, 255, 255, .12);
            border-radius: 14px;
            background: rgba(3, 3, 8, .78);
            font-size: 13px;
            transition: border-color 180ms ease, box-shadow 180ms ease, background 180ms ease;
        }
        .hk-char-search-input:focus {
            border-color: rgba(192, 132, 252, .72);
            background: rgba(8, 6, 14, .96);
            box-shadow: 0 0 0 4px rgba(168, 85, 247, .12), 0 0 22px rgba(168, 85, 247, .13);
        }
        .hk-char-sidebar .hk-char-search-input {
            min-height: 38px;
            padding: 0 12px !important;
            border-radius: 11px;
        }
        .hk-char-clear-btn {
            right: 10px;
            width: 28px;
            height: 28px;
            display: grid;
            place-items: center;
            border-radius: 9px;
            font-size: 12px;
        }
        #hk-char-sort-container {
            grid-area: sort;
            align-items: center;
            justify-content: flex-start;
            flex-wrap: wrap;
            gap: 7px !important;
        }
        #hk-char-sort-container .hk-pill {
            min-height: 36px;
            padding: 0 12px;
            border-radius: 11px;
            background: rgba(255, 255, 255, .045);
        }
        .hk-char-clipboard {
            grid-area: clipboard;
            justify-self: start;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            min-height: 32px;
            box-sizing: border-box;
            padding: 0 11px;
            border: 1px solid rgba(168, 85, 247, .25);
            border-radius: 999px;
            background: rgba(168, 85, 247, .09);
        }
        .hk-char-clipboard span {
            color: #d8b4fe !important;
            font: 600 10px var(--hk-mono) !important;
        }
        #hk-char-close-btn {
            position: static;
            grid-area: close;
            align-self: start;
            justify-self: end;
            width: 42px;
            height: 42px;
            padding: 0 !important;
            display: grid;
            place-items: center;
            border-radius: 14px;
            font-size: 15px !important;
        }
        .hk-char-body { min-height: 0; }
        .hk-char-sidebar {
            width: 278px;
            box-sizing: border-box;
            padding: 18px 14px;
            gap: 15px;
            border-right: 1px solid rgba(255, 255, 255, .07);
            background: linear-gradient(180deg, rgba(16, 14, 22, .98), rgba(10, 10, 14, .98));
            overscroll-behavior: contain;
        }
        .hk-char-sidebar > div:first-child {
            position: sticky;
            top: -18px;
            z-index: 2;
            margin: -4px -2px 0;
            padding: 6px 2px 10px;
            background: #111017;
        }
        .hk-char-facet-group {
            gap: 8px;
            padding: 12px 10px;
            border: 1px solid rgba(255, 255, 255, .055);
            border-radius: 15px;
            background: rgba(255, 255, 255, .018);
        }
        .hk-char-facet-title {
            padding: 0 3px;
            color: #c4a3f3;
            font-size: 10px;
            letter-spacing: .09em;
        }
        .hk-char-facet-list { gap: 3px; max-height: 190px; }
        .hk-char-facet-item {
            min-height: 32px;
            box-sizing: border-box;
            padding: 5px 9px;
            border: 1px solid transparent;
            border-radius: 10px;
            font-size: 11.5px;
            transition: background 160ms ease, color 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .hk-char-facet-item:hover {
            background: rgba(255, 255, 255, .055);
            transform: translateX(2px);
        }
        .hk-char-facet-item.active {
            border-color: rgba(192, 132, 252, .26);
            border-radius: 10px;
            background: rgba(168, 85, 247, .15);
            color: #f3e8ff;
        }
        .hk-char-sidebar label { min-height: 38px; padding: 0 4px; }
        .hk-char-main { background: linear-gradient(180deg, #0a090e, #08080b); }
        .hk-char-status-bar {
            min-height: 44px;
            box-sizing: border-box;
            padding: 8px 20px;
            background: rgba(14, 12, 18, .82);
            border-bottom-color: rgba(255, 255, 255, .065);
            font-size: 11px;
        }
        .hk-char-grid {
            padding: 18px;
            gap: 14px;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 160px), 1fr));
            align-content: start;
            overscroll-behavior: contain;
            scrollbar-gutter: stable;
        }
        .hk-char-card {
            border: 1px solid rgba(255, 255, 255, .075);
            border-radius: 17px;
            background: #101015;
            box-shadow: 0 5px 18px rgba(0, 0, 0, .16);
            animation: hk-char-card-in 320ms cubic-bezier(.2, .75, .25, 1) backwards;
            transition: transform 220ms cubic-bezier(.2, .75, .25, 1), border-color 220ms ease, box-shadow 220ms ease;
        }
        .hk-char-card:nth-child(6n + 2) { animation-delay: 24ms; }
        .hk-char-card:nth-child(6n + 3) { animation-delay: 48ms; }
        .hk-char-card:nth-child(6n + 4) { animation-delay: 72ms; }
        .hk-char-card:nth-child(6n + 5) { animation-delay: 96ms; }
        .hk-char-card:nth-child(6n) { animation-delay: 120ms; }
        .hk-char-card:hover {
            transform: translateY(-4px);
            border-color: rgba(192, 132, 252, .48);
            box-shadow: 0 18px 34px rgba(0, 0, 0, .34), 0 0 24px rgba(126, 34, 206, .11);
        }
        .hk-char-card-media { background: #17141e; }
        .hk-char-card-img { transition: transform 520ms cubic-bezier(.2, .7, .2, 1), filter 320ms ease; }
        .hk-char-card:hover .hk-char-card-img { transform: scale(1.045); filter: saturate(1.06); }
        .hk-char-card-footer {
            min-height: 70px;
            box-sizing: border-box;
            padding: 12px 13px;
            gap: 5px;
            background: linear-gradient(180deg, #111116, #0d0d11);
            border-top: 1px solid rgba(255, 255, 255, .06);
        }
        .hk-char-card-name { font-size: 12px; letter-spacing: .005em; }
        .hk-char-card-series {
            color: #c084fc;
            font-size: 9px;
            letter-spacing: .055em;
        }
        .hk-char-card-count { color: #a1a1aa; font-size: 9px; }
        .hk-char-overlay {
            background: linear-gradient(180deg, rgba(8, 7, 12, .18), rgba(8, 7, 12, .96) 72%);
            backdrop-filter: blur(5px);
        }
        .hk-char-trigger-box, .hk-char-lora-trigger-item { border-radius: 10px; }
        .hk-char-tag-chip { border-radius: 999px; padding: 3px 7px; }
        .hk-char-btn-trigger, .hk-char-btn-trigger-tags, .hk-char-btn-sub { border-radius: 10px; }
        .hk-char-pagination {
            min-height: 56px;
            box-sizing: border-box;
            padding: 10px 18px;
            background: rgba(14, 12, 18, .96);
            border-top-color: rgba(255, 255, 255, .07);
        }
        .hk-char-pagination .hk-pill { min-height: 38px; border-radius: 12px; }
        .hk-char-active-chip { border-radius: 999px; padding: 5px 10px; }
        #hk-char-active-chips > div {
            gap: 8px !important;
            padding: 9px 16px !important;
            border-bottom-color: rgba(168, 85, 247, .14) !important;
            background: rgba(168, 85, 247, .045) !important;
        }
        @media (max-width: 1080px) {
            .hk-char-header {
                grid-template-columns: minmax(180px, 1fr) auto 42px;
                grid-template-areas: "brand tabs close" "search search search" "sort sort sort" "clipboard clipboard clipboard";
                gap: 10px 12px;
                padding: 16px 18px;
            }
            #hk-char-close-btn { grid-row: 1; }
            .hk-char-clipboard { justify-self: end; }
            .hk-char-sidebar { width: 246px; }
        }
        @media (max-width: 680px) {
            .hk-char-modal-backdrop { padding: 10px; }
            .hk-char-modal {
                width: calc(100vw - 20px);
                height: calc(100dvh - 20px);
                border-radius: 21px;
            }
            .hk-char-header {
                grid-template-columns: minmax(0, 1fr) 40px;
                grid-template-areas: "brand close" "tabs tabs" "search search" "sort sort" "clipboard clipboard";
                gap: 9px;
                padding: 12px;
            }
            .hk-char-brand-icon { width: 36px; height: 36px; border-radius: 12px; font-size: 18px; }
            .hk-char-brand-title { font-size: 13px; }
            .hk-char-brand-subtitle { font-size: 9px; }
            #hk-char-close-btn { width: 40px; height: 40px; }
            .hk-char-tabs { width: 100%; box-sizing: border-box; }
            .hk-char-tabs .hk-char-tab-btn { flex: 1 1 0; justify-content: center; padding: 0 8px !important; font-size: 10px; }
            .hk-char-search-input { min-height: 42px; font-size: 12px; }
            #hk-char-sort-container { gap: 6px !important; }
            #hk-char-sort-container .hk-pill { flex: 1 1 auto; padding: 0 8px; font-size: 10px; }
            .hk-char-clipboard { justify-self: start; min-height: 28px; }
            .hk-char-body { flex-direction: column; }
            .hk-char-sidebar {
                width: 100%;
                max-height: clamp(116px, 18dvh, 170px);
                flex: 0 0 auto;
                padding: 10px;
                border-right: 0;
                border-bottom: 1px solid rgba(255, 255, 255, .07);
            }
            .hk-char-sidebar > div:first-child { top: -10px; background: #111017; }
            .hk-char-facet-group { padding: 9px; }
            .hk-char-facet-list { max-height: 100px; }
            .hk-char-status-bar { min-height: 40px; padding: 7px 12px; font-size: 10px; }
            .hk-char-grid {
                padding: 11px;
                gap: 10px;
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
            .hk-char-card { border-radius: 14px; }
            .hk-char-card-media { aspect-ratio: 4 / 5; overflow: hidden; }
            .hk-char-card-img { width: 100%; height: 100%; aspect-ratio: auto; object-fit: cover; }
            .hk-char-card-footer { min-height: 62px; padding: 9px; }
            .hk-char-card-name { font-size: 11px; }
            .hk-char-card-series { font-size: 8px; }
            .hk-char-overlay {
                position: absolute;
                inset: auto 0 0;
                max-height: 72%;
                overflow-y: auto;
                opacity: 1;
                pointer-events: auto;
                background: linear-gradient(180deg, transparent, rgba(8, 7, 12, .97) 24%);
            }
            .hk-char-trigger-box, .hk-char-tags-chips { display: none; }
            .hk-char-extra-actions { flex-wrap: wrap; }
            .hk-char-pagination { min-height: 50px; padding: 8px; gap: 8px; }
        }
        @media (prefers-reduced-motion: reduce) {
            .hk-char-modal-backdrop, .hk-char-modal, .hk-char-card { animation: none !important; }
        }

        /* API tokens: pulido visual manteniendo el diálogo compacto y claro. */
        @keyframes hk-token-modal-in {
            from { opacity: 0; transform: translateY(12px) scale(.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .hk-hub-modal-backdrop {
            padding: 24px;
            background: radial-gradient(ellipse at 50% 42%, rgba(109, 40, 217, .12), transparent 58%), rgba(3, 3, 7, .88) !important;
            backdrop-filter: blur(15px) saturate(120%);
            -webkit-backdrop-filter: blur(15px) saturate(120%);
        }
        .hk-hub-token-modal {
            box-sizing: border-box;
            width: min(560px, calc(100vw - 36px)) !important;
            max-width: 560px !important;
            max-height: min(90dvh, 760px) !important;
            padding: 22px !important;
            gap: 12px !important;
            border: 1px solid rgba(192, 132, 252, .28);
            border-radius: 23px !important;
            background: linear-gradient(145deg, #0e0c13, #09090d 72%);
            box-shadow: 0 30px 90px rgba(0, 0, 0, .72), 0 0 0 1px rgba(255, 255, 255, .035) inset, 0 0 42px rgba(124, 58, 237, .13);
            animation: hk-token-modal-in 280ms cubic-bezier(.2, .8, .2, 1) both;
        }
        .hk-hub-token-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            padding-bottom: 11px;
            border-bottom: 1px solid rgba(255, 255, 255, .075);
        }
        .hk-hub-token-heading {
            display: flex;
            align-items: center;
            gap: 11px;
            min-width: 0;
        }
        .hk-hub-token-icon {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border: 1px solid rgba(192, 132, 252, .28);
            border-radius: 13px;
            background: linear-gradient(145deg, rgba(168, 85, 247, .2), rgba(91, 33, 182, .07));
            box-shadow: inset 0 1px rgba(255, 255, 255, .07);
            font-size: 18px;
        }
        .hk-hub-token-heading .hk-dialog-title {
            font-size: 19px;
            letter-spacing: -.02em;
        }
        .hk-hub-token-close {
            width: 40px;
            height: 40px;
            display: grid;
            place-items: center;
            flex: 0 0 auto;
            border-radius: 12px !important;
            background: rgba(255, 255, 255, .035) !important;
            transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;
        }
        .hk-hub-token-close:hover {
            background: rgba(255, 255, 255, .09) !important;
            transform: rotate(5deg);
        }
        .hk-hub-token-field {
            display: flex;
            flex-direction: column;
            gap: 6px;
            padding: 8px 10px;
            border: 1px solid rgba(255, 255, 255, .065);
            border-radius: 16px;
            background: rgba(255, 255, 255, .022);
            transition: border-color 180ms ease, background 180ms ease;
        }
        .hk-hub-token-field:focus-within {
            border-color: rgba(168, 85, 247, .3);
            background: rgba(168, 85, 247, .035);
        }
        .hk-hub-token-field-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 10px;
        }
        .hk-hub-token-label {
            min-width: 0;
            color: #f4f1f8;
            font: 700 10.5px var(--hk-sans);
            letter-spacing: .055em;
            line-height: 1.4;
        }
        .hk-hub-token-status {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-left: 7px;
            padding: 3px 8px;
            border: 1px solid rgba(52, 211, 153, .2);
            border-radius: 999px;
            background: rgba(16, 185, 129, .08);
            color: #6ee7b7;
            font: 700 9px var(--hk-sans);
            letter-spacing: .025em;
            white-space: nowrap;
        }
        .hk-hub-token-remove {
            min-height: 30px !important;
            padding: 0 10px !important;
            border-radius: 10px !important;
            font-size: 10px !important;
            white-space: nowrap;
        }
        .hk-hub-token-input {
            width: 100%;
            min-height: 38px;
            box-sizing: border-box;
            padding: 0 12px !important;
            border: 1px solid rgba(255, 255, 255, .11) !important;
            border-radius: 12px !important;
            background: rgba(2, 2, 6, .78) !important;
            font-size: 12.5px;
            transition: border-color 160ms ease, box-shadow 160ms ease, background 160ms ease;
        }
        .hk-hub-token-input:focus {
            border-color: rgba(192, 132, 252, .7) !important;
            background: #07060b !important;
            box-shadow: 0 0 0 4px rgba(168, 85, 247, .1), 0 0 20px rgba(168, 85, 247, .1) !important;
        }
        .hk-hub-token-help {
            margin: 0;
            color: #a7a2b1;
            font: 11px/1.5 var(--hk-sans);
        }
        .hk-hub-token-help strong { color: #d8b4fe; font-weight: 650; }
        .hk-hub-token-actions {
            display: flex;
            justify-content: flex-end;
            gap: 9px;
            margin-top: 0;
            padding-top: 12px;
            border-top: 1px solid rgba(255, 255, 255, .075);
        }
        .hk-hub-token-actions .hk-btn-cyber {
            min-height: 36px;
            padding: 0 15px !important;
            border-radius: 12px;
        }
        .hk-hub-token-actions #hk-hub-settings-save {
            box-shadow: 0 7px 20px rgba(126, 34, 206, .2), inset 0 1px rgba(255, 255, 255, .15);
        }
        @media (max-width: 600px) {
            .hk-hub-modal-backdrop { padding: 12px; }
            .hk-hub-token-modal {
                width: min(560px, calc(100vw - 24px)) !important;
                max-height: calc(100dvh - 24px) !important;
                padding: 16px !important;
                gap: 12px !important;
                border-radius: 20px !important;
            }
            .hk-hub-token-field { padding: 8px; }
            .hk-hub-token-actions { gap: 8px; }
            .hk-hub-token-actions .hk-btn-cyber { flex: 1 1 auto; justify-content: center; padding: 0 9px !important; font-size: 11px; }
        }
        @media (prefers-reduced-motion: reduce) {
            .hk-hub-token-modal { animation: none !important; }
        }

        /* Sistema global de movimiento: transiciones cortas, sin animar layout. */
        :root {
            --hk-motion-fast: 140ms;
            --hk-motion-ui: 190ms;
            --hk-motion-surface: 240ms;
            --hk-motion-enter: 320ms;
            --hk-motion-ease: cubic-bezier(.2, .7, .2, 1);
            --hk-motion-ease-enter: cubic-bezier(.16, 1, .3, 1);
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop)
            :is(button, a.hk-btn-cyber, .hk-quick-tag, .hk-pill, .hk-min-pill, .hk-act-btn, .hk-rail-btn) {
            transition-property: color, background-color, border-color, box-shadow, opacity, transform, filter;
            transition-duration: var(--hk-motion-ui);
            transition-timing-function: var(--hk-motion-ease);
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop)
            button:not(:disabled):active { transition-duration: 90ms; }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .pv-modal-backdrop,
            .hk-model-inspector-backdrop, .hk-hub-modal-backdrop, .hk-char-modal-backdrop)
            :is(input, textarea, select, .hk-input, .hk-select) {
            transition: color var(--hk-motion-ui) var(--hk-motion-ease),
                        background-color var(--hk-motion-ui) var(--hk-motion-ease),
                        border-color var(--hk-motion-ui) var(--hk-motion-ease),
                        box-shadow var(--hk-motion-ui) var(--hk-motion-ease);
        }
        :is(#universe-downloader-overlay, .pv-inspector-backdrop, .hk-model-inspector-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop)
            :is(.hk-card-item, .hk-history-thumb, .hk-linkbank-card, .hk-hub-card,
                .hk-hub-task-card, .hk-char-card, .hk-model-card) {
            transition: transform var(--hk-motion-surface) var(--hk-motion-ease-enter),
                        opacity var(--hk-motion-surface) ease-out,
                        border-color var(--hk-motion-ui) var(--hk-motion-ease),
                        background-color var(--hk-motion-ui) var(--hk-motion-ease),
                        box-shadow var(--hk-motion-surface) var(--hk-motion-ease),
                        filter var(--hk-motion-surface) var(--hk-motion-ease);
        }
        #universe-downloader-overlay .hk-lora-row,
        .hk-autocomplete-popup .hk-autocomplete-item {
            transition: color var(--hk-motion-ui) var(--hk-motion-ease),
                        background-color var(--hk-motion-ui) var(--hk-motion-ease),
                        border-color var(--hk-motion-ui) var(--hk-motion-ease),
                        box-shadow var(--hk-motion-surface) var(--hk-motion-ease),
                        transform var(--hk-motion-ui) var(--hk-motion-ease-enter);
        }
        :is(.pv-inspector-backdrop, .pv-modal-backdrop, .hk-model-inspector-backdrop,
            .hk-hub-modal-backdrop, .hk-char-modal-backdrop) {
            transition: opacity var(--hk-motion-surface) ease-out,
                        backdrop-filter var(--hk-motion-surface) var(--hk-motion-ease);
        }
        :is(.pv-modal, .pv-inspector-modal, .hk-char-modal, .hk-hub-token-modal) {
            transition: opacity var(--hk-motion-surface) ease-out,
                        transform var(--hk-motion-enter) var(--hk-motion-ease-enter);
        }
        .hk-char-modal-backdrop { animation-duration: var(--hk-motion-surface); }
        .hk-char-modal, .hk-hub-token-modal {
            animation-duration: var(--hk-motion-enter);
            animation-timing-function: var(--hk-motion-ease-enter);
        }
        .hk-dialog-closing {
            animation: none !important;
            pointer-events: none !important;
            opacity: 0 !important;
        }
        .hk-dialog-closing > :is(.pv-modal, .pv-inspector-modal, .hk-char-modal, .hk-hub-token-modal) {
            animation: none !important;
            pointer-events: none !important;
            opacity: 0 !important;
            transform: translateY(9px) scale(.985) !important;
            transition: opacity var(--hk-motion-ui) ease-out,
                        transform var(--hk-motion-surface) var(--hk-motion-ease-enter) !important;
        }
        #universe-downloader-overlay .hk-studio-stage :is(.hk-topdrop, .hk-top-scrim) {
            transition-timing-function: var(--hk-motion-ease-enter);
        }
        #universe-downloader-overlay .hk-studio-stage .hk-topdrop {
            transition-duration: var(--hk-motion-enter), var(--hk-motion-surface), var(--hk-motion-surface);
        }
        #universe-downloader-overlay .hk-top-scrim { transition-duration: var(--hk-motion-surface); }
        #universe-downloader-overlay .hk-stage-full,
        #universe-downloader-overlay .hk-studio-stage { animation-duration: var(--hk-motion-enter); }
        #universe-downloader-overlay .hk-prompt-deck {
            transition-timing-function: var(--hk-motion-ease-enter), ease-out, var(--hk-motion-ui), var(--hk-motion-surface);
        }
        #universe-downloader-overlay :is(.hk-stop-state, .hk-stop-queue) {
            transition-timing-function: var(--hk-motion-ease-enter);
        }
        #universe-downloader-overlay .hk-stop-state { transition-duration: 220ms; }
        #universe-downloader-overlay .hk-stop-queue {
            transition-duration: 240ms, 180ms, 220ms, 220ms;
        }
        #universe-downloader-overlay .hk-slider,
        #universe-downloader-overlay .hk-slider:before {
            transition-timing-function: var(--hk-motion-ease), var(--hk-motion-ease-enter);
        }
        #universe-downloader-overlay :is(.hk-progress-fill, .hk-hub-progress-bar) {
            transition: width 360ms var(--hk-motion-ease-enter), background-color 240ms var(--hk-motion-ease);
        }
        #universe-downloader-overlay details > :not(summary) {
            transition-duration: var(--hk-motion-surface), var(--hk-motion-enter);
            transition-timing-function: ease-out, var(--hk-motion-ease-enter);
        }
        #universe-downloader-overlay .hk-autocomplete-popup {
            transition-duration: var(--hk-motion-ui), var(--hk-motion-surface);
            transition-timing-function: ease-out, var(--hk-motion-ease-enter);
        }
        #universe-downloader-overlay .hk-main-img,
        #hk-lightbox-modal #hk-lightbox-img {
            transition: opacity 260ms var(--hk-motion-ease);
        }
        .hk-lightbox-closing {
            opacity: 0 !important;
            transform: scale(.99);
            pointer-events: none !important;
            transition: opacity var(--hk-motion-ui) ease-out,
                        transform var(--hk-motion-surface) var(--hk-motion-ease-enter) !important;
        }
        .hk-lightbox-closing img {
            opacity: 0 !important;
            transition: opacity var(--hk-motion-ui) ease-out !important;
        }
        #universe-downloader-overlay .hk-engine-dot.busy { animation-duration: 1.6s; }
        @media (prefers-reduced-motion: reduce) {
            .hk-dialog-closing,
            .hk-dialog-closing > :is(.pv-modal, .pv-inspector-modal, .hk-char-modal, .hk-hub-token-modal) {
                transition-duration: 1ms !important;
            }
        }



/* Fullscreen modal container for Universe Downloader */
.hk-hub-full-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.82);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    z-index: 99999;
    display: none;
    align-items: center;
    justify-content: center;
    padding: 24px;
    box-sizing: border-box;
    animation: hkFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.hk-downloader-container {
    width: 100%;
    max-width: 1540px;
    height: 94vh;
    background: #08080b;
    border: 1px solid rgba(168, 85, 247, 0.35);
    border-radius: 14px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(168, 85, 247, 0.15);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

@keyframes hkFadeIn {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
}

body.hk-downloader-active {
    overflow: hidden !important;
}
`;

// ============================================================================
// CORE HELPERS & UTILITIES
// ============================================================================
function escapeHtml(str) {
    // Only null/undefined/'' collapse to ''; 0 and false are real values
    // (seed:0, cfg:0 used to render as empty text).
    if (str === null || str === undefined || str === '') return '';
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/** Parse JSON seguro: si la respuesta no es JSON (404 HTML/texto), no revienta. */

async function safeJson(res) {
    if (!res) return { __non_json: true, status: 0, body: '' };
    let text = '';
    try {
        text = await res.text();
    } catch (e) {
        return { __non_json: true, status: res.status || 0, body: '', message: String(e) };
    }
    const trimmed = (text || '').trim();
    if (!trimmed) {
        return { __non_json: true, status: res.status || 0, body: '' };
    }
    try {
        return JSON.parse(trimmed);
    } catch (e) {
        return {
            __non_json: true,
            status: res.status || 0,
            body: trimmed.slice(0, 200),
            message: `Respuesta no JSON (HTTP ${res.status}): ${trimmed.slice(0, 80)}`
        };
    }
}

function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const CYBER_ICONS = {
    logo: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><defs><linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="var(--hk-purple-light)"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#ec4899"/></linearGradient></defs><polygon points="12 2 2 7 12 12 22 7 12 2" stroke="url(#cosmicGrad)" fill="rgba(139,92,246,0.18)"/><polyline points="2 17 12 22 22 17" stroke="var(--hk-purple-light)"/><polyline points="2 12 12 17 22 12" stroke="url(#cosmicGrad)"/></svg>`,
    dice: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="8.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor"/><circle cx="12" cy="12" r="1.2" fill="currentColor"/><circle cx="8.5" cy="15.5" r="1.2" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.2" fill="currentColor"/></svg>`,
    lock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
    unlock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`,
    copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    download: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>`,
    trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`,
    fullscreen: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/></svg>`,
    info: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="16" y2="12"/><line x1="12" x2="12.01" y1="8" y2="8"/></svg>`,
    swap: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/></svg>`,
    close: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>`,
    refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>`,
    folder: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>`,
    globe: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    grid: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`,
    list: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>`,
    studio: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
    models: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
    hub: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>`,
    vram: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`
};

function hubCivitaiPreviewUrl(url) {
    if (!url) return '';
    const cleanUrl = url.replace('original=true', 'width=450');
    return `/universe_downloader/api/hub/preview?url=${encodeURIComponent(cleanUrl)}`;
}

function handleHubPreviewError(img) {
    if (!img) return;
    const stage = img.dataset.previewStage || '';
    if (stage === 'local' && img.dataset.proxy) {
        img.dataset.previewStage = 'proxy';
        img.src = img.dataset.proxy;
        img.dataset.proxy = '';
        return;
    }
    if (stage === 'proxy' && img.dataset.direct) {
        img.dataset.previewStage = 'direct';
        img.src = img.dataset.direct;
        img.dataset.direct = '';
        return;
    }
    if (stage === 'direct' && img.dataset.proxy) {
        img.dataset.previewStage = 'proxy';
        img.src = img.dataset.proxy;
        img.dataset.proxy = '';
        return;
    }
    img.style.display = 'none';
    if (img.nextElementSibling) img.nextElementSibling.style.display = 'block';
}
window.handleHubPreviewError = handleHubPreviewError;

async function openModelFolder(path) {
    if (!path) return;
    try {
        const res = await api.fetchApi("/local_manager/open_folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: path })
        });
        if (res.ok) showToast("📁 Abriendo en el Explorador", "info");
    } catch (e) {}
}

function mountStudioDialog(backdrop) {
    const dialog = backdrop.querySelector('.pv-modal, .pv-inspector-modal, .hk-char-modal') || backdrop.firstElementChild;
    const previousFocus = document.activeElement;
    const labels = { 'hk-char-modal-backdrop': 'Selector de personajes', 'hk-hub-modal-backdrop': 'Configurar API Tokens', 'pv-modal-backdrop': 'Editor de preset' };
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-label', dialog.querySelector('h2')?.textContent || labels[backdrop.className] || 'Inspector de Universe Studio');
    dialog.tabIndex = -1;
    backdrop.querySelectorAll('button').forEach(button => {
        if (!button.textContent.trim() && !button.getAttribute('aria-label')) button.setAttribute('aria-label', button.title || 'Cerrar diálogo');
    });
    backdrop.addEventListener('keydown', event => {
        if (event.key === 'Escape') {
            event.preventDefault(); event.stopPropagation();
            closeStudioDialog(backdrop);
        } else if (event.key === 'Tab') {
            const controls = [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
                .filter(element => !element.disabled && element.getClientRects().length);
            const first = controls[0], last = controls[controls.length - 1];
            if (!first) { event.preventDefault(); dialog.focus(); }
            else if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog)) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog)) { event.preventDefault(); first.focus(); }
        }
    });
    document.body.appendChild(backdrop);
    dialog.focus({ preventScroll: true });
    const removal = new MutationObserver(() => {
        if (!backdrop.isConnected) {
            removal.disconnect();
            if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
        }
    });
    removal.observe(document.body, { childList: true });
}

let _masterStylesInjected = false;

function closeStudioDialog(backdrop, onClosed = null, immediate = false) {
    if (!backdrop) {
        onClosed?.();
        return;
    }
    if (backdrop._hkCloseTimer) {
        if (!immediate) return;
        window.clearTimeout(backdrop._hkCloseTimer);
        backdrop._hkCloseTimer = null;
        backdrop.remove();
        const pendingCallback = backdrop._hkCloseCallback;
        backdrop._hkCloseCallback = null;
        pendingCallback?.();
        onClosed?.();
        return;
    }

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (immediate || reduceMotion || !backdrop.isConnected) {
        backdrop.remove();
        onClosed?.();
        return;
    }

    backdrop.classList.add('hk-dialog-closing');
    backdrop._hkCloseCallback = onClosed;
    backdrop._hkCloseTimer = window.setTimeout(() => {
        backdrop.remove();
        backdrop._hkCloseTimer = null;
        const callback = backdrop._hkCloseCallback;
        backdrop._hkCloseCallback = null;
        callback?.();
    }, 260);
}

function showToast(message, type = 'info') {
    if (!message) return;
    let toastContainer = document.getElementById('hk-downloader-toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'hk-downloader-toast-container';
        toastContainer.style.cssText = 'position:fixed; top:24px; right:24px; z-index:999999; display:flex; flex-direction:column; gap:8px; pointer-events:none;';
        document.body.appendChild(toastContainer);
    }
    const toast = document.createElement('div');
    const colors = {
        success: { bg: 'rgba(16, 185, 129, 0.95)', border: '#10b981', color: '#ffffff' },
        warning: { bg: 'rgba(245, 158, 11, 0.95)', border: '#f59e0b', color: '#ffffff' },
        error: { bg: 'rgba(239, 68, 68, 0.95)', border: '#ef4444', color: '#ffffff' },
        info: { bg: 'rgba(24, 24, 32, 0.95)', border: '#a855f7', color: '#f8fafc' }
    };
    const c = colors[type] || colors.info;
    toast.style.cssText = `padding: 10px 16px; border-radius: 8px; background: ${c.bg}; border: 1px solid ${c.border}; color: ${c.color}; font-family: var(--hk-mono, monospace); font-size: 12px; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.6); pointer-events: auto; display: flex; align-items: center; gap: 8px; transition: opacity 0.25s, transform 0.25s; opacity: 0; transform: translateY(-8px); backdrop-filter: blur(8px);`;
    toast.textContent = message;
    toastContainer.appendChild(toast);
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
    });
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-8px)';
        setTimeout(() => toast.remove(), 260);
    }, 3200);
}


// ============================================================================
// HUB & DOWNLOAD ENGINE (EXTRACTED FROM UNIVERSE STUDIO)
// ============================================================================
const hubState = {
    linkInput: '',
    inspecting: false,
    inspectedResult: null,
    inspectedResults: [],
    tasks: [],
    folders: {},
    pollInterval: null,
    settingsModalOpen: false,
    settings: { has_civitai_token: false, has_hf_token: false, civitai_token_masked: '', hf_token_masked: '' },
    aria2: { available: false, version: '', max_connections: 8 },
    linkBank: [],
    linkBankFilter: 'all', // compatibilidad con estados guardados antiguos
    linkBankSearch: '',
    linkBankLoading: false,
    linkBankPollInterval: null,
    linkBankCheckInFlight: false,
    omitDownloaded: true
};

async function fetchHubAria2Status() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/aria2_status');
        if (res.ok) {
            const data = await res.json();
            hubState.aria2 = {
                available: data.aria2_available !== false,
                version: data.version || '',
                max_connections: data.max_connections || 8
            };
            const badge = document.getElementById('hk-hub-aria2-badge');
            if (badge) {
                if (hubState.aria2.available) {
                    badge.innerHTML = `<span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span> 🚀 Acelerador Aria2: Activo (${hubState.aria2.max_connections} Conexiones)`;
                    badge.style.color = 'var(--hk-purple-light)';
                    badge.style.borderColor = 'rgba(168, 85, 247, 0.35)';
                    badge.style.background = 'rgba(168, 85, 247, 0.12)';
                } else {
                    const isWin = data.platform === 'win32';
                    const canInstall = data.can_install_linux;
                    badge.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:${isWin ? '#38bdf8' : '#eab308'};"></span> 
                            <span>⚡ Motor Nativo Python ${isWin ? '(Windows)' : '(Aria2 Inactivo)'}</span>
                            ${canInstall ? `<button id="hk-hub-btn-install-aria2" style="padding: 2px 8px; font-size: 10px; font-weight: 700; color: #ffffff; background: #a855f7; border: none; border-radius: 4px; cursor: pointer;">📥 Instalar Aria2 en Linux (Vast.ai)</button>` : ''}
                        </div>
                    `;
                    badge.style.color = '#e2e8f0';
                    badge.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                    badge.style.background = 'rgba(255, 255, 255, 0.05)';

                    const installBtn = badge.querySelector('#hk-hub-btn-install-aria2');
                    if (installBtn) {
                        installBtn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            installBtn.disabled = true;
                            installBtn.textContent = '⏳ Instalando Aria2...';
                            showToast('⏳ Instalando aria2 en el sistema Linux (Vast.ai)...', 'info');
                            try {
                                const iRes = await api.fetchApi('/universe_downloader/api/hub/install_aria2', { method: 'POST' });
                                const iData = await iRes.json();
                                if (iData.status === 'ok') {
                                    showToast('✨ Aria2 instalado correctamente en Vast.ai/Linux', 'success');
                                    await fetchHubAria2Status();
                                } else {
                                    showToast(`⚠️ ${iData.message || 'No se pudo instalar aria2'}`, 'error');
                                    installBtn.disabled = false;
                                    installBtn.textContent = '📥 Reintentar Instalación';
                                }
                            } catch (err) {
                                showToast(`⚠️ Error al invocar instalador: ${err.message}`, 'error');
                                installBtn.disabled = false;
                                installBtn.textContent = '📥 Reintentar Instalación';
                            }
                        });
                    }
                }
            }
        }
    } catch (e) {
        console.warn("[Hub] Error fetching aria2 status:", e);
    }
}

function hubGetActiveDownloadsCount() {
    return (hubState.tasks || []).filter(t => t.status === 'downloading' || t.status === 'pending').length;
}

function updateHubNavBadge() {
    const badge = document.getElementById('hk-hub-nav-badge');
    if (!badge) return;
    const count = hubGetActiveDownloadsCount();
    badge.innerText = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
}

async function fetchHubFolders() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/folders');
        if (res.ok) {
            const data = await res.json();
            hubState.folders = data.folders || {};
        }
    } catch (e) {
        console.warn("[Hub] Error fetching folders:", e);
    }
}

async function fetchHubSettings() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/settings');
        if (res.ok) {
            const data = await res.json();
            hubState.settings = data.settings || {};
        }
    } catch (e) {
        console.warn("[Hub] Error fetching settings:", e);
    }
}

async function fetchHubTasks() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/tasks');
        if (res.ok) {
            const data = await res.json();
            const prevTasks = hubState.tasks || [];
            hubState.tasks = data.tasks || [];
            updateHubNavBadge();

            // Check if any task just completed
            hubState.tasks.forEach(t => {
                const prev = prevTasks.find(p => p.task_id === t.task_id);
                if (prev && prev.status === 'downloading' && t.status === 'completed') {
                    showToast(`✨ Modelo descargado: ${t.filename} (${t.category})`, 'success');
                    fetchLinkBank().catch(() => {});
                }
            });

            updateTasksViewContent();
        }
    } catch (e) {
        console.warn("[Hub] Error fetching tasks:", e);
    }
}

function startHubTasksPolling() {
    if (hubState.pollInterval) return;
    hubState.pollInterval = setInterval(() => {
        const hubStage = document.getElementById('hk-hub-container');
        const activeCount = hubGetActiveDownloadsCount();
        if (hubStage || activeCount > 0) {
            fetchHubTasks();
        }
    }, 1000);
}

function stopHubTasksPolling() {
    if (hubState.pollInterval) {
        clearInterval(hubState.pollInterval);
        hubState.pollInterval = null;
    }
}

function extractCivitaiModelAndVersion(url) {
    if (!url || typeof url !== 'string') return null;
    try {
        const m = url.match(/civitai\.(?:com|red)\/models\/(\d+)(?:\/[^?#]*)?(?:\?[^#]*\bmodelVersionId=(\d+))?/i);
        if (m) {
            return {
                modelId: m[1],
                versionId: m[2] || ''
            };
        }
    } catch (e) {}
    return null;
}

function normalizeModelUrl(url) {
    if (!url || typeof url !== 'string') return '';
    let u = url.trim().replace(/^[<"']+|[>"']+$/g, '');
    if (u.startsWith('civitai.com') || u.startsWith('www.civitai.com') ||
        u.startsWith('civitai.red') || u.startsWith('huggingface.co') ||
        u.startsWith('www.huggingface.co')) {
        u = 'https://' + u;
    }
    const civ = extractCivitaiModelAndVersion(u);
    if (civ) {
        return civ.versionId ? `civitai:${civ.modelId}@${civ.versionId}` : `civitai:${civ.modelId}`;
    }
    try {
        const parsed = new URL(u);
        return (parsed.host + parsed.pathname.replace(/\/+$/, '')).toLowerCase();
    } catch (e) {
        return u.toLowerCase().replace(/\/+$/, '');
    }
}

function isUrlAlreadyAdded(url) {
    if (!url) return false;
    const norm = normalizeModelUrl(url);
    const civ = extractCivitaiModelAndVersion(url);

    // 1. Check inspectedResults (cards already visible in intake area)
    const inspected = hubState.inspectedResults || [];
    for (const item of inspected) {
        if (!item) continue;
        if (item.sourceUrl && normalizeModelUrl(item.sourceUrl) === norm) return true;
        const ver = item.versions && item.versions[0];
        const file = ver && ver.files && ver.files[0];
        if (file && file.download_url && normalizeModelUrl(file.download_url) === norm) return true;
        if (civ && civ.modelId && String(item.id) === civ.modelId) {
            if (!civ.versionId || !ver || !ver.id || String(ver.id) === civ.versionId) {
                return true;
            }
        }
    }

    // 2. Check active/pending/completed tasks
    const tasks = hubState.tasks || [];
    for (const task of tasks) {
        if (!task) continue;
        if (task.url && normalizeModelUrl(task.url) === norm) return true;
        const taskModelId = task.civitai_info?.model_id || task.model_id;
        if (civ && civ.modelId && String(taskModelId) === civ.modelId) {
            return true;
        }
    }

    // 3. Check Link Bank (also includes local items on disk)
    const bank = hubState.linkBank || [];
    for (const item of bank) {
        if (!item) continue;
        if (item.url && normalizeModelUrl(item.url) === norm) return true;
        if (item.download_url && normalizeModelUrl(item.download_url) === norm) return true;
        if (civ && civ.modelId && String(item.model_id) === civ.modelId) {
            if (!civ.versionId || !item.version_id || String(item.version_id) === civ.versionId) {
                return true;
            }
        }
    }

    return false;
}

function extractModelUrls(text) {
    if (!text || typeof text !== 'string') return [];
    const urlPattern = /(?:https?:\/\/[^\s<>"'{}|\\^`]+|(?:www\.)?(?:civitai\.(?:com|red)|huggingface\.co)\/[^\s<>"'{}|\\^`]+)/gi;
    const rawMatches = text.match(urlPattern) || [];
    const results = [];
    const seenNorms = new Set();

    for (let raw of rawMatches) {
        let u = raw.trim().replace(/[.,;!?)]+$/, '');
        if (!u.startsWith('http://') && !u.startsWith('https://')) {
            u = 'https://' + u;
        }
        try {
            new URL(u);
        } catch (e) {
            continue;
        }
        const norm = normalizeModelUrl(u);
        if (!seenNorms.has(norm)) {
            seenNorms.add(norm);
            results.push(u);
        }
    }
    return results;
}

async function readClipboardText() {
    try {
        if (navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
            const clip = await navigator.clipboard.readText();
            if (clip && typeof clip === 'string') return clip.trim();
        }
    } catch (e) {
        console.warn('[Hub] No se pudo acceder directamente al portapapeles:', e);
    }
    return '';
}

function isModelMetadataAlreadyAdded(data) {
    if (!data) return false;
    const modelId = data.id ? String(data.id) : '';
    const ver = data.versions && data.versions[0];
    const versionId = ver && ver.id ? String(ver.id) : '';
    const file = ver && ver.files && ver.files[0];
    const filename = file && file.filename ? file.filename.toLowerCase() : '';

    // Check inspectedResults
    const inspected = hubState.inspectedResults || [];
    for (const item of inspected) {
        if (!item) continue;
        if (modelId && item.id && String(item.id) === modelId) {
            const itemVer = item.versions && item.versions[0];
            if (!versionId || !itemVer || !itemVer.id || String(itemVer.id) === versionId) return true;
        }
        const itemFile = item.versions && item.versions[0] && item.versions[0].files && item.versions[0].files[0];
        if (filename && itemFile && itemFile.filename && itemFile.filename.toLowerCase() === filename) return true;
    }

    // Check tasks
    const tasks = hubState.tasks || [];
    for (const task of tasks) {
        if (!task) continue;
        const taskModelId = task.civitai_info?.model_id || task.model_id;
        if (modelId && taskModelId && String(taskModelId) === modelId) return true;
        if (filename && task.filename && task.filename.toLowerCase() === filename) return true;
    }

    // Check bank
    const bank = hubState.linkBank || [];
    for (const item of bank) {
        if (!item) continue;
        if (modelId && item.model_id && String(item.model_id) === modelId) {
            if (!versionId || !item.version_id || String(item.version_id) === versionId) return true;
        }
        if (filename && item.filename && item.filename.toLowerCase() === filename) return true;
    }

    return false;
}

function buildFolderOptionsHtml(selectedCat) {
    const allFolders = hubState.folders || {};
    const catKeys = Object.keys(allFolders);
    let html = '';

    if (catKeys.length > 0) {
        catKeys.forEach(cat => {
            const info = allFolders[cat] || {};
            const isSelected = cat === selectedCat;
            html += `<option value="${escapeHtml(cat)}" ${isSelected ? 'selected' : ''}>models/${escapeHtml(cat)}</option>`;
            if (info.subdirs && info.subdirs.length > 0) {
                info.subdirs.forEach(sub => {
                    const fullVal = `${cat}/${sub}`;
                    const isSubSelected = fullVal === selectedCat;
                    html += `<option value="${escapeHtml(fullVal)}" ${isSubSelected ? 'selected' : ''}>  ↳ models/${escapeHtml(cat)}/${escapeHtml(sub)}</option>`;
                });
            }
        });
    } else {
        const defaults = ['diffusion_models', 'loras', 'text_encoders', 'vae', 'checkpoints', 'controlnet', 'clip_vision', 'unet', 'upscale_models', 'embeddings', 'gligen'];
        html = defaults.map(cat => `<option value="${cat}" ${cat === selectedCat ? 'selected' : ''}>models/${cat}</option>`).join('');
    }
    return html;
}

function renderInspectedCardItemHtml(res, idx) {
    if (!res) return '';
    const ver = (res.versions && res.versions[0]) ? res.versions[0] : null;
    const file = (ver && ver.files && ver.files[0]) ? ver.files[0] : null;
    if (!file) return '';

    const isAlreadyOnDisk = !!(res.already_downloaded || res.local_status === 'present');
    const localRelPath = res.local_relpath || (res.local_path ? res.local_path.replace(/\\/g, '/').split('/').slice(-3).join('/') : '');

    const cover = ver.cover_url || res.top_cover || '';
    const coverProxy = hubCivitaiPreviewUrl(cover);
    const coverSrc = coverProxy || cover;
    const title = res.name || file.filename;
    const verName = ver.name || '';
    const creator = res.creator || 'Autor';
    const recFolder = res.selectedFolder || file.recommended_folder || 'diffusion_models';
    const recSubfolder = res.customSubfolder !== undefined ? res.customSubfolder : (file.recommended_subfolder || '');
    const reason = file.reason || '';
    const sizeStr = file.size_formatted || '';
    const triggers = ver.trained_words || [];

    const folderOptions = buildFolderOptionsHtml(recFolder);

    return `
        <div class="hk-inspected-card-item" data-idx="${idx}" style="background: var(--hk-card); border: 1px solid ${isAlreadyOnDisk ? 'rgba(34, 197, 94, 0.45)' : 'var(--hk-border)'}; border-radius: 8px; padding: 12px 14px; display: flex; gap: 14px; align-items: center; box-shadow: 0 4px 18px rgba(0,0,0,0.6); position: relative; flex-shrink: 0;">
            <div style="width: 75px; height: 90px; border-radius: 6px; overflow: hidden; background: #000000; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--hk-border-subtle);">
                ${coverSrc ? `<img src="${escapeHtml(coverSrc)}" data-preview-stage="proxy" data-direct="${escapeHtml(cover)}" data-proxy="${escapeHtml(coverProxy)}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" alt="Vista previa del modelo" onerror="handleHubPreviewError(this)"><span style="display:none; font-size:28px;">⚡</span>` : `<span style="font-size:28px;">⚡</span>`}
            </div>

            <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px;">
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                    <div style="font-family: var(--hk-mono); font-size: 13.5px; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(title)}">
                        ${escapeHtml(title)} ${verName ? `<span style="font-size: 11.5px; color: var(--hk-text-muted); font-weight: normal;">[${escapeHtml(verName)}]</span>` : ''}
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                        ${isAlreadyOnDisk ? `
                            <span style="font-family: var(--hk-mono); font-size: 10px; background: rgba(34, 197, 94, 0.2); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.45); padding: 2px 7px; border-radius: 4px; font-weight: 800;" title="${escapeHtml(res.local_path || '')}">
                                ✓ EN DISCO
                            </span>
                        ` : ''}
                        <span style="font-family: var(--hk-mono); font-size: 10.5px; background: rgba(255,255,255,0.1); color: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid var(--hk-border); font-weight: 800;">
                            ${escapeHtml(sizeStr || '—')}
                        </span>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    <span style="color: #ffffff; font-weight: 600; overflow: hidden; text-overflow: ellipsis;">📄 ${escapeHtml(file.filename)}</span>
                    <span>·</span>
                    <span>👤 ${escapeHtml(creator)}</span>
                    ${triggers.length > 0 ? `<span>·</span><span>🏷️ ${triggers.length} triggers</span>` : ''}
                </div>

                <div style="font-family: var(--hk-mono); font-size: 10.5px; color: #ffffff; background: rgba(255,255,255,0.06); padding: 4px 8px; border-radius: 4px; border: 1px solid var(--hk-border); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    🎯 <strong>Sugerido:</strong> models/${escapeHtml(file.recommended_folder || 'diffusion_models')}/${file.recommended_subfolder ? `<strong style="color: var(--hk-purple-light);">${escapeHtml(file.recommended_subfolder)}/</strong>` : ''} <span style="color: var(--hk-text-muted);">(${escapeHtml(reason || 'auto-clasificado')})</span>
                </div>

                ${isAlreadyOnDisk ? `
                    <div style="font-family: var(--hk-mono); font-size: 11px; color: #4ade80; background: rgba(34, 197, 94, 0.12); padding: 5px 10px; border-radius: 5px; border: 1px solid rgba(34, 197, 94, 0.35); display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 2px;">
                        <div style="display: flex; align-items: center; gap: 6px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                            <span style="font-weight: 800;">✅ Ya descargado:</span>
                            <span style="color: #ffffff; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(res.local_path || '')}">En tu carpeta: <strong style="color: #86efac;">${escapeHtml(localRelPath || 'models/')}</strong></span>
                        </div>
                        <span style="font-size: 10.5px; color: #86efac; font-weight: 700; flex-shrink: 0;">No hace falta descargarlo</span>
                    </div>
                ` : ''}

                <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px; flex-wrap: wrap;">
                    <span style="font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-dim);">Destino:</span>
                    <select class="hk-select hk-card-folder-select" data-idx="${idx}" style="font-size: 11px; padding: 4px 8px; width: 140px; max-width: 100%;">
                        ${folderOptions}
                    </select>
                    <input type="text" class="hk-input hk-card-subfolder-input" data-idx="${idx}" style="font-size: 11px; padding: 4px 8px; width: 110px;" placeholder="subcarpeta..." value="${escapeHtml(recSubfolder)}">

                    ${isAlreadyOnDisk ? `
                        <button class="hk-btn-cyber hk-btn-card-start-dl" data-idx="${idx}" style="padding: 5px 12px; font-size: 11px; font-weight: 700; white-space: nowrap; color: #86efac; border-color: rgba(34, 197, 94, 0.4);" title="Ya existe en tu carpeta de modelos, pero pulsa aquí si deseas volver a descargarlo">
                            ⬇️ Re-descargar
                        </button>
                    ` : `
                        <button class="hk-btn-cyber primary hk-btn-card-start-dl" data-idx="${idx}" style="padding: 5px 12px; font-size: 11px; font-weight: 800; white-space: nowrap;">
                            ⬇️ DESCARGAR
                        </button>
                    `}
                    <button class="hk-btn-cyber hk-btn-card-save-bank" data-idx="${idx}" style="padding: 5px 10px; font-size: 11px; white-space: nowrap;" title="Guardar en el banco de enlaces para más tarde">
                        ⭐ Guardar
                    </button>
                    <button class="hk-btn-cyber hk-btn-card-cancel" data-idx="${idx}" style="padding: 5px 10px; font-size: 11px; white-space: nowrap;" title="Descartar este modelo">
                        ✕
                    </button>
                </div>
            </div>
        </div>
    `;
}

function renderInspectedCardsListHtml() {
    const list = hubState.inspectedResults || [];
    if (!list.length) {
        if (hubState.inspectedResult) {
            hubState.inspectedResults = [hubState.inspectedResult];
            return renderInspectedCardsListHtml();
        }
        return '';
    }

    const pendingList = list.filter(item => !item.already_downloaded);
    const alreadyList = list.filter(item => item.already_downloaded);

    const cardsHtml = list.map((item, idx) => renderInspectedCardItemHtml(item, idx)).join('');
    const isScrollable = list.length > 3;

    return `
        <div style="margin-top: 14px; display: flex; flex-direction: column;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding: 2px 4px; flex-wrap: wrap; gap: 8px;">
                <div style="font-family: var(--hk-mono); font-size: 12px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 8px #22c55e;"></span>
                    <span>Modelos listos para descargar (${list.length})</span>
                    ${alreadyList.length > 0 ? `<span style="font-size: 11px; color: #4ade80; font-weight: normal;">· ${alreadyList.length} ya en disco</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                    ${alreadyList.length > 0 ? `
                        <button id="hk-btn-inspect-clear-downloaded" class="hk-btn-cyber" style="padding: 4px 10px; font-size: 11px; color: #86efac; border-color: rgba(34,197,94,0.4);" title="Omitir y quitar de la lista los modelos que ya tienes en disco">
                            ✓ Omitir ya en disco (${alreadyList.length})
                        </button>
                    ` : ''}
                    ${pendingList.length > 0 ? `
                        <button id="hk-btn-inspect-dl-all" class="hk-btn-cyber primary" style="padding: 4px 14px; font-size: 11px; font-weight: 800;" title="Descargar todos los modelos que aún no tienes">
                            ⬇️ Descargar Pendientes (${pendingList.length})
                        </button>
                    ` : (list.length > 1 ? `
                        <button id="hk-btn-inspect-dl-all" class="hk-btn-cyber" style="padding: 4px 14px; font-size: 11px; font-weight: 700; opacity: 0.85;" title="Todos los modelos ya existen en tu carpeta. Pulsa si deseas re-descargar todos">
                            ⬇️ Re-descargar Todos (${list.length})
                        </button>
                    ` : '')}
                    <button id="hk-btn-inspect-clear-all" class="hk-btn-cyber" style="padding: 4px 10px; font-size: 11px;" title="Descartar todos los modelos analizados">
                        ✕ Descartar ${list.length > 1 ? 'todos' : ''}
                    </button>
                </div>
            </div>
            <div id="hk-inspected-scroll-container" class="hk-inspected-scroll-box" style="${isScrollable ? 'max-height: 440px; overflow-y: auto; overflow-x: hidden; padding-right: 6px;' : 'max-height: none; overflow: visible; padding-right: 0;'} display: flex; flex-direction: column; gap: 10px; width: 100%;">
                ${cardsHtml}
            </div>
        </div>
    `;
}

function bindInspectedListEvents(container) {
    if (!container) return;

    // Folder select
    container.querySelectorAll('.hk-card-folder-select').forEach(sel => {
        sel.addEventListener('change', () => {
            const idx = parseInt(sel.dataset.idx, 10);
            const item = hubState.inspectedResults && hubState.inspectedResults[idx];
            if (!item) return;
            const cardEl = container.querySelector(`.hk-inspected-card-item[data-idx="${idx}"]`);
            const subInp = cardEl?.querySelector('.hk-card-subfolder-input');
            const val = sel.value || '';
            const ver = item.versions && item.versions[0];
            const file = ver && ver.files && ver.files[0];

            if (val.includes('/')) {
                const parts = val.split('/');
                if (subInp) subInp.value = parts.slice(1).join('/');
            } else if (file && val === file.recommended_folder && file.recommended_subfolder) {
                if (subInp) subInp.value = file.recommended_subfolder;
            }
            item.selectedFolder = val;
            if (subInp) item.customSubfolder = subInp.value;
        });
    });

    // Subfolder input
    container.querySelectorAll('.hk-card-subfolder-input').forEach(inp => {
        inp.addEventListener('input', () => {
            const idx = parseInt(inp.dataset.idx, 10);
            if (hubState.inspectedResults && hubState.inspectedResults[idx]) {
                hubState.inspectedResults[idx].customSubfolder = inp.value;
            }
        });
    });

    // Individual Download
    container.querySelectorAll('.hk-btn-card-start-dl').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const item = hubState.inspectedResults && hubState.inspectedResults[idx];
            if (!item) return;

            const ver = item.versions && item.versions[0];
            const file = ver && ver.files && ver.files[0];
            if (!file) return;

            const cardEl = container.querySelector(`.hk-inspected-card-item[data-idx="${idx}"]`);
            let cat = cardEl?.querySelector('.hk-card-folder-select')?.value || item.selectedFolder || file.recommended_folder || 'diffusion_models';
            let subfolder = (cardEl?.querySelector('.hk-card-subfolder-input')?.value || item.customSubfolder || '').trim();
            if (cat.includes('/')) {
                const parts = cat.split('/');
                const baseCat = parts[0];
                const catSub = parts.slice(1).join('/');
                if (!subfolder || subfolder === catSub) {
                    cat = baseCat;
                    subfolder = catSub;
                }
            }
            const cover = ver.cover_url || item.top_cover || '';
            const dlUrl = file.download_url || '';
            const filename = file.filename || 'modelo.safetensors';

            let civitai_info = null;
            if (item.name || (ver.trained_words && ver.trained_words.length > 0)) {
                civitai_info = {
                    civitai_status: 'found',
                    model_name: item.name || filename,
                    base_model: ver.base_model || '',
                    trained_words: ver.trained_words || [],
                    model_id: item.id || ''
                };
            }

            hubState.inspectedResults.splice(idx, 1);
            hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
            updateInspectedResultsUI();

            hubStartDownload(dlUrl, filename, cat, subfolder, cover, civitai_info, item.provider || 'direct', file.size_bytes || 0);
        };
    });

    // Individual Save to Link Bank
    container.querySelectorAll('.hk-btn-card-save-bank').forEach(btn => {
        btn.onclick = async () => {
            const idx = parseInt(btn.dataset.idx, 10);
            const item = hubState.inspectedResults && hubState.inspectedResults[idx];
            if (!item) return;

            btn.disabled = true;
            btn.innerText = '⏳';
            const payload = linkBankPayloadFromInspected(item, item.sourceUrl);
            if (payload) {
                await saveLinkToBank(payload);
                hubState.inspectedResults.splice(idx, 1);
                hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
                updateInspectedResultsUI();
            } else {
                btn.disabled = false;
                btn.innerText = '⭐ Guardar';
            }
        };
    });

    // Individual Cancel
    container.querySelectorAll('.hk-btn-card-cancel').forEach(btn => {
        btn.onclick = () => {
            const idx = parseInt(btn.dataset.idx, 10);
            if (!isNaN(idx) && idx >= 0 && hubState.inspectedResults && idx < hubState.inspectedResults.length) {
                hubState.inspectedResults.splice(idx, 1);
                hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
                updateInspectedResultsUI();
            }
        };
    });

    // Download All
    const dlAllBtn = container.querySelector('#hk-btn-inspect-dl-all');
    if (dlAllBtn) {
        dlAllBtn.onclick = async () => {
            await hubDownloadAllInspected();
        };
    }

    // Clear Already Downloaded
    const clearDlBtn = container.querySelector('#hk-btn-inspect-clear-downloaded');
    if (clearDlBtn) {
        clearDlBtn.onclick = () => {
            const count = (hubState.inspectedResults || []).filter(item => item.already_downloaded).length;
            hubState.inspectedResults = (hubState.inspectedResults || []).filter(item => !item.already_downloaded);
            hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
            updateInspectedResultsUI();
            showToast(`🗑️ ${count} modelo(s) ya presentes en tu disco omitidos de la lista`, 'info');
        };
    }

    // Clear All
    const clearAllBtn = container.querySelector('#hk-btn-inspect-clear-all');
    if (clearAllBtn) {
        clearAllBtn.onclick = () => {
            hubState.inspectedResults = [];
            hubState.inspectedResult = null;
            updateInspectedResultsUI();
            showToast('🗑️ Modelos descartados', 'info');
        };
    }
}

function updateInspectedResultsUI() {
    hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
    const resultCont = document.getElementById('hk-hub-inspect-result');
    if (resultCont) {
        resultCont.innerHTML = renderInspectedCardsListHtml();
        bindInspectedListEvents(resultCont);
    }
}

async function hubDownloadAllInspected() {
    const allItems = [...(hubState.inspectedResults || [])];
    if (!allItems.length) return;

    // Priorizar los modelos pendientes que no existen en disco
    const pendingItems = allItems.filter(item => !item.already_downloaded);
    const toDownload = pendingItems.length > 0 ? pendingItems : allItems;

    // Retener en la lista los que no se descargan ahora (si solo se procesan los pendientes)
    hubState.inspectedResults = hubState.inspectedResults.filter(item => !toDownload.includes(item));
    hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
    updateInspectedResultsUI();
    showToast(`⚡ Iniciando ${toDownload.length} descarga(s) acelerada(s)...`, 'info');

    let startedCount = 0;
    for (const item of toDownload) {
        const ver = (item.versions && item.versions[0]) ? item.versions[0] : null;
        const file = (ver && ver.files && ver.files[0]) ? ver.files[0] : null;
        if (!file) continue;

        let cat = item.selectedFolder || file.recommended_folder || 'diffusion_models';
        let subfolder = (item.customSubfolder !== undefined ? item.customSubfolder : (file.recommended_subfolder || '')).trim();
        if (cat.includes('/')) {
            const parts = cat.split('/');
            cat = parts[0];
            subfolder = parts.slice(1).join('/');
        }
        const cover = ver.cover_url || item.top_cover || '';
        const dlUrl = file.download_url || '';
        const filename = file.filename || 'modelo.safetensors';

        let civitai_info = null;
        if (item.name || (ver.trained_words && ver.trained_words.length > 0)) {
            civitai_info = {
                civitai_status: 'found',
                model_name: item.name || filename,
                base_model: ver.base_model || '',
                trained_words: ver.trained_words || [],
                model_id: item.id || ''
            };
        }

        try {
            const res = await api.fetchApi('/universe_downloader/api/hub/download', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: dlUrl,
                    filename,
                    category: cat,
                    subfolder,
                    cover_url: cover,
                    civitai_info,
                    provider: item.provider || 'direct',
                    total_bytes: file.size_bytes || 0
                })
            });
            if (res.ok) {
                startedCount++;
            }
        } catch (e) {
            console.error('[Hub] Error iniciando descarga:', filename, e);
        }
    }

    await fetchHubTasks();
    startHubTasksPolling();
    renderHubStageContent();
    showToast(`📥 ${startedCount} de ${list.length} descargas iniciadas`, 'success');
}

async function hubDetectAndAddLinks(opts = {}) {
    if (hubState.inspecting) {
        showToast('⏳ Ya hay un análisis en curso, espera un momento...', 'info');
        return;
    }

    const inp = document.getElementById('hk-hub-link-input');
    const inputVal = (inp ? inp.value : (hubState.linkInput || '')).trim();
    const btn = document.getElementById('hk-btn-hub-add-link');
    const clipBtn = document.getElementById('hk-btn-hub-clipboard');
    const loadingEl = document.getElementById('hk-hub-inspect-loading');

    let allDetectedUrls = [];

    if (Array.isArray(opts.directUrls) && opts.directUrls.length > 0) {
        allDetectedUrls = [...opts.directUrls];
    } else {
        if (inputVal) {
            allDetectedUrls.push(...extractModelUrls(inputVal));
        }
        try {
            const clipRes = await api.fetchApi('/universe_downloader/api/hub/clipboard_links');
            if (clipRes && clipRes.ok) {
                const clipData = await safeJson(clipRes);
                if (clipData && Array.isArray(clipData.urls) && clipData.urls.length > 0) {
                    allDetectedUrls.push(...clipData.urls);
                }
            }
        } catch (e) {
            console.warn('[Hub] No se pudo consultar historial de portapapeles:', e);
        }
        const clipText = await readClipboardText();
        if (clipText) {
            allDetectedUrls.push(...extractModelUrls(clipText));
        }
    }

    // Deduplicate unique URLs
    const uniqueUrls = [];
    const seenNorms = new Set();
    for (const u of allDetectedUrls) {
        const norm = normalizeModelUrl(u);
        if (norm && !seenNorms.has(norm)) {
            seenNorms.add(norm);
            uniqueUrls.push(u);
        }
    }

    if (!uniqueUrls.length) {
        if (opts.forceClipboard) {
            showToast('⚠️ No se encontraron enlaces de modelos en el portapapeles. Pégalos con Ctrl+V.', 'warning');
        } else {
            showToast('⚠️ No se detectaron enlaces de Civitai o Hugging Face en el cuadro ni en el portapapeles.', 'warning');
        }
        if (inp) inp.focus();
        return;
    }

    // Check which URLs are already added (omitted)
    const newUrls = [];
    const omittedUrls = [];

    for (const u of uniqueUrls) {
        if (isUrlAlreadyAdded(u)) {
            omittedUrls.push(u);
        } else {
            newUrls.push(u);
        }
    }

    if (newUrls.length === 0) {
        showToast(`ℹ️ Todos los enlaces detectados (${uniqueUrls.length}) ya estaban añadidos. Se omitieron duplicados.`, 'info');
        if (inp) {
            inp.value = '';
            hubState.linkInput = '';
        }
        return;
    }

    hubState.inspecting = true;
    if (btn) {
        btn.disabled = true;
        btn.innerText = `⏳ Analizando (0/${newUrls.length})...`;
        btn.style.opacity = '0.7';
        btn.style.cursor = 'wait';
    }
    if (clipBtn) {
        clipBtn.disabled = true;
        clipBtn.style.opacity = '0.7';
    }
    if (loadingEl) {
        loadingEl.style.display = 'flex';
        const msg = loadingEl.querySelector('span:last-child');
        if (msg) msg.textContent = `Analizando ${newUrls.length} enlace(s)...`;
    }

    let addedCount = 0;
    let failedCount = 0;
    const downloadedOmittedList = [];

    for (let i = 0; i < newUrls.length; i++) {
        const url = newUrls[i];
        if (btn) btn.innerText = `⏳ Analizando (${i + 1}/${newUrls.length})...`;
        if (loadingEl) {
            const msg = loadingEl.querySelector('span:last-child');
            if (msg) msg.textContent = `Analizando (${i + 1}/${newUrls.length}): ${url.slice(0, 48)}...`;
        }

        try {
            const res = await api.fetchApi('/universe_downloader/api/hub/inspect_url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });
            const data = await safeJson(res);
            if (res && res.ok && data && data.status === 'ok' && data.data) {
                const inspected = data.data;
                inspected.sourceUrl = url;

                if (isModelMetadataAlreadyAdded(inspected)) {
                    omittedUrls.push(url);
                    continue;
                }

                // Detección de presencia previa en disco local
                const isAlreadyOnDisk = !!(inspected.already_downloaded || inspected.local_status === 'present');
                if (isAlreadyOnDisk && hubState.omitDownloaded !== false && (opts.forceClipboard || newUrls.length > 1)) {
                    downloadedOmittedList.push(inspected);
                    omittedUrls.push(url);
                    continue;
                }

                const v = inspected.versions && inspected.versions[0];
                const f = v && v.files && v.files[0];
                inspected.selectedFolder = (f && f.recommended_folder) || 'diffusion_models';
                inspected.customSubfolder = (f && f.recommended_subfolder) || '';

                hubState.inspectedResults.push(inspected);
                addedCount++;
                updateInspectedResultsUI();
            } else {
                failedCount++;
            }
        } catch (e) {
            console.error('[Hub] Error inspeccionando URL:', url, e);
            failedCount++;
        }
    }

    hubState.inspecting = false;
    if (btn) {
        btn.disabled = false;
        btn.innerText = 'Analizar enlace';
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
    }
    if (clipBtn) {
        clipBtn.disabled = false;
        clipBtn.style.opacity = '1';
    }
    if (loadingEl) loadingEl.style.display = 'none';

    if (inp) {
        inp.value = '';
        hubState.linkInput = '';
    }

    if (addedCount > 0) {
        const omitInfo = downloadedOmittedList.length > 0 ? ` (${downloadedOmittedList.length} omitidos por ya estar en tu carpeta)` : (omittedUrls.length ? ` (${omittedUrls.length} omitidos)` : '');
        showToast(`✨ ${addedCount} modelo(s) listo(s) para descargar${omitInfo}`, 'success');
    } else if (downloadedOmittedList.length > 0) {
        const sampleNames = downloadedOmittedList.map(item => item.name || item.filename).slice(0, 2).join(', ');
        const extra = downloadedOmittedList.length > 2 ? ` (+${downloadedOmittedList.length - 2} más)` : '';
        showToast(`✅ Los modelos detectados ya están en tu carpeta (${sampleNames}${extra}). No hace falta descargarlos.`, 'info');
    } else if (omittedUrls.length > 0) {
        showToast(`ℹ️ Todos los enlaces detectados ya estaban añadidos (${omittedUrls.length} omitidos)`, 'info');
    } else if (failedCount > 0) {
        showToast(`⚠️ No se pudo obtener información de ${failedCount} enlace(s)`, 'warning');
    }
}

async function hubInspectUrl(url) {
    if (!url) return;
    await hubDetectAndAddLinks({ directUrls: [url] });
}

async function hubStartDownload(url, filename, category, subfolder = '', cover_url = '', civitai_info = null, provider = 'direct', total_bytes = 0) {
    try {
        showToast(`⚡ Iniciando descarga acelerada de ${filename}...`, 'info');
        const res = await api.fetchApi('/universe_downloader/api/hub/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                url,
                filename,
                category,
                subfolder,
                cover_url,
                civitai_info,
                provider,
                total_bytes
            })
        });


        if (res.ok) {
            const data = await res.json();
            showToast(`📥 Descarga iniciada: ${filename} -> models/${category}/`, 'success');
            if (hubState.inspectedResults && hubState.inspectedResults.length > 0) {
                const matchIdx = hubState.inspectedResults.findIndex(item => {
                    const v = item.versions && item.versions[0];
                    const f = v && v.files && v.files[0];
                    return (f && f.filename === filename) || (item.sourceUrl && item.sourceUrl === url) || (f && f.download_url === url);
                });
                if (matchIdx !== -1) {
                    hubState.inspectedResults.splice(matchIdx, 1);
                }
            }
            hubState.inspectedResult = (hubState.inspectedResults && hubState.inspectedResults[0]) || null;
            hubState.linkInput = '';
            updateInspectedResultsUI();
            await fetchHubTasks();
            startHubTasksPolling();
            renderHubStageContent();
        } else {
            const err = await res.json().catch(() => ({}));
            showToast(`❌ Error: ${err.message || 'No se pudo iniciar la descarga'}`, 'error');
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function hubPauseTask(task_id) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/pause', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id })
        });
        if (res.ok) {
            showToast('⏸️ Descarga pausada', 'info');
            await fetchHubTasks();
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function hubResumeTask(task_id) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/resume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id })
        });
        if (res.ok) {
            showToast('▶️ Reanudando descarga...', 'info');
            await fetchHubTasks();
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function hubCancelTask(task_id) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/cancel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id })
        });
        if (res.ok) {
            showToast('🛑 Descarga cancelada', 'warning');
            await fetchHubTasks();
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function hubDeleteTask(task_id) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/delete_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id })
        });
        if (res.ok) {
            showToast('🗑️ Descarga eliminada del historial', 'info');
            await fetchHubTasks();
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function hubClearCompletedTasks() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/clear_tasks', {
            method: 'POST'
        });
        if (res.ok) {
            await fetchHubTasks();
            showToast('🧹 Historial de descargas limpiado', 'info');
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

// ---------------------------------------------------------------------------
// Link Bank (Banco de Enlaces guardados + detección inteligente de modelos)
// ---------------------------------------------------------------------------

async function fetchLinkBank() {
    try {
        hubState.linkBankLoading = true;
        const res = await api.fetchApi('/universe_downloader/api/hub/links');
        const data = await safeJson(res);
        if (res && res.ok && data && !data.__non_json) {
            hubState.linkBank = data.links || [];
        } else if (data && data.__non_json) {
            console.warn('[Link Bank] Response not JSON:', data.message || data.body || data.status);
        }
    } catch (e) {
        console.warn('[Link Bank] Error fetching:', e);
    } finally {
        hubState.linkBankLoading = false;
        updateLinkBankUI();
    }
}

function getLinkBankFiltered() {
    let links = hubState.linkBank || [];
    const f = hubState.linkBankFilter || 'all';
    if (f === 'missing') links = links.filter(l => l.local_status !== 'present');
    else if (f === 'present') links = links.filter(l => l.local_status === 'present');

    const q = (hubState.linkBankSearch || '').trim().toLowerCase();
    if (q) {
        links = links.filter(l =>
            (l.title && l.title.toLowerCase().includes(q)) ||
            (l.filename && l.filename.toLowerCase().includes(q)) ||
            (l.category && l.category.toLowerCase().includes(q)) ||
            (l.creator && l.creator.toLowerCase().includes(q)) ||
            (l.url && l.url.toLowerCase().includes(q))
        );
    }
    return links;
}

function linkBankActiveDownload(filename) {
    if (!filename) return null;
    const key = String(filename).toLowerCase();
    return (hubState.tasks || []).find(t =>
        (t.status === 'downloading' || t.status === 'pending' || t.status === 'paused') &&
        (t.filename || '').toLowerCase() === key
    ) || null;
}

function renderLinkBankListHtml() {
    const links = getLinkBankFiltered();
    const allCount = (hubState.linkBank || []).length;
    if (!links || links.length === 0) {
        const emptyMsg = allCount === 0
            ? 'Aún no has guardado ningún enlace en el banco.'
            : 'El banco está vacío por ahora.';
        const subMsg = allCount === 0
            ? 'Pega un enlace arriba y pulsa «Guardar enlace» para añadirlo.'
            : 'Los enlaces nuevos aparecerán aquí.';
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 120px; gap: 8px; color: var(--hk-text-muted); font-family: var(--hk-mono); border: 1px dashed var(--hk-border-subtle); border-radius: 8px; background: rgba(0,0,0,0.2);">
                <div style="font-size: 24px;">⭐</div>
                <div style="font-size: 12px; font-weight: 700; color: #ffffff;">${emptyMsg}</div>
                <div style="font-size: 11px; color: var(--hk-text-dim); text-align: center; max-width: 440px;">${subMsg}</div>
            </div>
        `;
    }

    return links.map(l => {
        const isPresent = l.local_status === 'present';
        const activeTask = linkBankActiveDownload(l.filename);
        const coverProxy = l.cover_url ? hubCivitaiPreviewUrl(l.cover_url) : '';
        const coverSrc = coverProxy || l.cover_url || '';
        const sizeStr = l.size_formatted || (l.size_bytes ? formatBytes(l.size_bytes) : '');
        const dlUrl = l.download_url || '';
        const cat = l.category || 'diffusion_models';

        let statusBadge = '';
        if (isPresent) {
            statusBadge = `<span class="hk-linkbank-badge present" title="El modelo se encuentra en tu disco">✅ Ya lo tienes</span>`;
        } else if (activeTask) {
            const pct = Math.min(100, Math.max(0, activeTask.progress || 0)).toFixed(0);
            statusBadge = `<span class="hk-linkbank-badge downloading" title="Descarga en curso">⏳ Descargando (${pct}%)</span>`;
        } else {
            statusBadge = `<span class="hk-linkbank-badge missing" title="Pendiente de descargar">📥 Por descargar</span>`;
        }

        const canDownload = !isPresent && !activeTask;

        return `
            <div class="hk-linkbank-card ${isPresent ? 'present' : 'missing'}" data-linkid="${escapeHtml(l.id || '')}">
                <div style="width: 58px; height: 68px; border-radius: 6px; overflow: hidden; background: #000000; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--hk-border-subtle);">
                    ${coverSrc ? `<img src="${escapeHtml(coverSrc)}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" alt="" onerror="handleHubPreviewError(this)">` : `<span style="font-size:24px;">⭐</span>`}
                </div>

                <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        ${statusBadge}
                        <span style="font-family: var(--hk-mono); font-size: 13px; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;" title="${escapeHtml(l.title || l.filename || '')}">
                            ${escapeHtml(l.title || l.filename || 'Modelo')}
                        </span>
                        <span style="font-family: var(--hk-mono); font-size: 10.5px; color: var(--hk-purple-light); background: rgba(168,85,247,0.12); border: 1px solid rgba(168,85,247,0.3); padding: 1px 7px; border-radius: 3px;">
                            models/${escapeHtml(cat)}
                        </span>
                        ${sizeStr ? `<span style="font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-dim);">${escapeHtml(sizeStr)}</span>` : ''}
                    </div>

                    <div style="font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(l.filename || l.url || '')}">
                        <span style="color: #ffffff; font-weight: 600;">📄 ${escapeHtml(l.filename || 'Archivo')}</span>
                        ${isPresent && l.local_path ? `<span style="color: #6ee7b7; font-weight: 600; margin-left: 6px;">· 📂 En disco: ${escapeHtml(l.local_path)}</span>` : ''}
                        ${!isPresent && !dlUrl ? `<span style="color: #fde68a; margin-left: 6px;">· ⚠️ Sin URL directa (se re-analizará al descargar)</span>` : ''}
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0; flex-wrap: wrap; justify-content: flex-end;">
                    ${canDownload ? `
                        <button class="hk-btn-cyber primary hk-lb-btn-download" data-linkid="${escapeHtml(l.id || '')}" style="padding: 6px 14px; font-size: 11px; font-weight: 800;" title="Iniciar descarga acelerada con Aria2">
                            ⬇️ Descargar
                        </button>
                    ` : ''}
                    ${isPresent ? `
                        <button class="hk-btn-cyber hk-lb-btn-open-folder" data-linkid="${escapeHtml(l.id || '')}" style="padding: 5px 10px; font-size: 11px;" title="Abrir carpeta donde está guardado">
                            📂 Carpeta
                        </button>
                    ` : `
                        <button class="hk-btn-cyber hk-lb-btn-recheck" data-linkid="${escapeHtml(l.id || '')}" style="padding: 5px 10px; font-size: 11px;" title="Volver a comprobar si ya existe en disco">
                            🔄
                        </button>
                    `}
                    <button class="hk-btn-cyber hk-lb-btn-open-url" data-linkid="${escapeHtml(l.id || '')}" style="padding: 5px 10px; font-size: 11px;" title="Abrir página en Civitai o Hugging Face">
                        🔗
                    </button>
                    <button class="hk-btn-cyber hk-lb-btn-delete" data-linkid="${escapeHtml(l.id || '')}" style="padding: 5px 10px; font-size: 11px; color: #ff4d6d;" title="Quitar del banco de enlaces">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateLinkBankUI() {
    const list = document.getElementById('hk-linkbank-list');
    if (list) {
        const markup = renderLinkBankListHtml();
        // The Hub can update the bank once when its request resolves and again
        // when the other initial requests finish. Replacing identical markup
        // recreates every card, restarts its entrance transition, and makes
        // the list appear to flicker on tab entry. Keep the existing nodes when
        // the rendered content has not changed.
        if (list._hkLinkBankMarkup !== markup) {
            if (list.innerHTML !== markup) list.innerHTML = markup;
            list._hkLinkBankMarkup = markup;
        }
    }
    const count = document.getElementById('hk-linkbank-count');
    if (count) {
        const total = (hubState.linkBank || []).length;
        const present = (hubState.linkBank || []).filter(l => l.local_status === 'present').length;
        const missing = total - present;
        count.innerHTML = `${total} guardados · <span style="color:#6ee7b7;">${present} en disco</span> · <span style="color:#fde68a;">${missing} pendientes</span>`;
    }
    document.querySelectorAll('.hk-linkbank-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lbFilter === (hubState.linkBankFilter || 'all'));
    });
}

function linkBankPayloadFromInspected(res, targetUrl = '') {
    if (!res) return null;
    const ver = (res.versions && res.versions[0]) ? res.versions[0] : null;
    const file = (ver && ver.files && ver.files[0]) ? ver.files[0] : null;
    return {
        url: targetUrl || hubState.linkInput || (file && file.download_url) || '',
        title: res.name || (file && file.filename) || 'Modelo',
        creator: res.creator || '',
        filename: (file && file.filename) || '',
        category: (file && file.recommended_folder) || 'diffusion_models',
        subfolder: (file && file.recommended_subfolder) || '',
        cover_url: (ver && ver.cover_url) || res.top_cover || '',
        download_url: (file && file.download_url) || '',
        provider: res.provider || 'civitai',
        size_bytes: (file && file.size_bytes) || 0,
        size_formatted: (file && file.size_formatted) || '',
        files: (ver && ver.files) || [],
        trained_words: (ver && ver.trained_words) || [],
        base_model: (ver && ver.base_model) || '',
        model_id: res.id || '',
        version_id: (ver && ver.id) || ''
    };
}

async function saveLinkToBank(payload, silent = false) {
    if (!payload || !payload.url) {
        if (!silent) showToast('⚠️ No hay un enlace para guardar', 'warning');
        return null;
    }
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok') {
            if (!silent) {
                showToast(data.existed ? '⭐ Ese enlace ya estaba en tu banco' : '⭐ Enlace guardado en el banco', 'success');
                await fetchLinkBank();
            }
            return data.link;
        }
        const msg = (data && (data.message || data.body)) || `HTTP ${res ? res.status : '?'}`;
        if (!silent) showToast(`⚠️ No se pudo guardar: ${msg}`, 'warning');
        return null;
    } catch (e) {
        if (!silent) showToast(`❌ Error: ${e}`, 'error');
        return null;
    }
}

async function deleteLinkFromBank(linkId) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: linkId })
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok') {
            showToast('🗑️ Enlace eliminado del banco', 'info');
            await fetchLinkBank();
        } else {
            showToast(`⚠️ ${(data && (data.message || data.body)) || 'No se pudo eliminar'}`, 'warning');
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function recheckLinkBankItem(linkId) {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: linkId })
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok') {
            await fetchLinkBank();
            const st = data.link && data.link.local_status;
            if (st === 'present') showToast('✅ Ya lo tienes descargado en disco', 'success');
            else showToast('📥 Todavía no se encuentra en disco', 'info');
        } else {
            showToast(`⚠️ ${(data && (data.message || data.body)) || 'No se pudo revisar'}`, 'warning');
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function downloadFromLinkBank(linkId) {
    const link = (hubState.linkBank || []).find(l => l.id === linkId);
    if (!link) return;
    if (link.local_status === 'present') {
        showToast('✅ Ya lo tienes descargado en disco', 'success');
        return;
    }
    let downloadUrl = link.download_url || '';
    let filename = link.filename || '';
    let category = link.category || 'diffusion_models';

    // Si no tenemos URL de descarga directa, re-inspeccionar la página original
    if (!downloadUrl || !filename) {
        showToast('🔍 Obteniendo URL de descarga…', 'info');
        try {
            const res = await api.fetchApi('/universe_downloader/api/hub/inspect_url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: link.url })
            });
            const data = await safeJson(res);
            if (res && res.ok && data && data.status === 'ok' && data.data) {
                const payload = linkBankPayloadFromInspected(data.data);
                if (payload) {
                    downloadUrl = payload.download_url || downloadUrl;
                    filename = payload.filename || filename;
                    category = payload.category || category;
                    await api.fetchApi('/universe_downloader/api/hub/links/update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: linkId,
                            filename,
                            download_url: downloadUrl,
                            category,
                            size_bytes: payload.size_bytes || link.size_bytes || 0,
                            cover_url: payload.cover_url || link.cover_url || '',
                            title: payload.title || link.title,
                            model_id: payload.model_id || link.model_id || '',
                            version_id: payload.version_id || link.version_id || ''
                        })
                    }).catch(() => {});
                }
            }
        } catch (e) {
            console.warn('[Link Bank] re-inspect failed:', e);
        }
    }

    if (!downloadUrl || !filename) {
        showToast('⚠️ Este enlace no tiene URL de descarga. Vuelve a analizarlo arriba.', 'warning');
        return;
    }

    let finalCategory = category;
    let finalSubfolder = link.subfolder || '';
    if (finalCategory.includes('/')) {
        const parts = finalCategory.split('/');
        finalCategory = parts[0];
        if (!finalSubfolder) finalSubfolder = parts.slice(1).join('/');
    }

    await hubStartDownload(
        downloadUrl,
        filename,
        finalCategory,
        finalSubfolder,
        link.cover_url || '',
        (link.trained_words && link.trained_words.length) ? {
            civitai_status: 'found',
            model_name: link.title || filename,
            base_model: link.base_model || '',
            trained_words: link.trained_words,
            model_id: link.model_id || ''
        } : null,
        link.provider || 'direct',
        link.size_bytes || 0
    );
    await fetchLinkBank();
}

async function batchDownloadPendingLinks() {
    const missing = (hubState.linkBank || []).filter(l => l.local_status !== 'present');
    if (missing.length === 0) {
        showToast('✅ ¡Ya tienes todos los modelos de tu banco en disco!', 'success');
        return;
    }

    showToast(`⚡ Iniciando descarga por lotes de ${missing.length} modelos pendientes...`, 'info');
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links/batch_download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok') {
            showToast(`🚀 ${data.message}`, 'success');
            await fetchHubTasks();
            startHubTasksPolling();
            await fetchLinkBank();
        } else {
            showToast(`⚠️ ${(data && data.message) || 'Error al iniciar descargas por lotes'}`, 'warning');
        }
    } catch (e) {
        showToast(`❌ Error: ${e}`, 'error');
    }
}

async function exportLinkBank() {
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links/export');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `universe_studio_link_bank_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('📤 Banco de enlaces exportado con éxito', 'success');
    } catch (e) {
        showToast(`❌ Error al exportar: ${e}`, 'error');
    }
}

async function importLinkBank(file) {
    if (!file) return;
    try {
        showToast('📥 Importando enlaces...', 'info');
        const text = await file.text();
        const parsed = JSON.parse(text);
        const res = await api.fetchApi('/universe_downloader/api/hub/links/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok') {
            showToast(`✅ ${data.message}`, 'success');
            await fetchLinkBank();
        } else {
            showToast(`⚠️ ${(data && data.message) || 'Error al importar archivo'}`, 'warning');
        }
    } catch (e) {
        showToast(`❌ Archivo inválido o corrupto: ${e}`, 'error');
    }
}

async function saveCurrentInputUrlToBank() {
    const inp = document.getElementById('hk-hub-link-input');
    const url = (inp && inp.value ? inp.value : (hubState.linkInput || '')).trim();
    if (!url) {
        await hubDetectAndAddLinks({ forceClipboard: true });
        return;
    }
    const inspected = hubState.inspectedResult;
    if (inspected) {
        const payload = linkBankPayloadFromInspected(inspected);
        if (payload) {
            payload.url = url;
            await saveLinkToBank(payload);
            return;
        }
    }
    showToast('🔍 Analizando enlace antes de guardarlo…', 'info');
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/inspect_url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });
        const data = await safeJson(res);
        if (res && res.ok && data && data.status === 'ok' && data.data) {
            const payload = linkBankPayloadFromInspected(data.data);
            if (payload) {
                payload.url = url;
                await saveLinkToBank(payload);
                return;
            }
        }
        await saveLinkToBank({ url, title: url, provider: 'direct' });
    } catch (e) {
        await saveLinkToBank({ url, title: url, provider: 'direct' });
    }
}

function bindLinkBankEvents(container) {
    if (!container || container._lbDelegated) return;
    container._lbDelegated = true;

    container.addEventListener('click', async (e) => {
        const dlBtn = e.target.closest('.hk-lb-btn-download');
        if (dlBtn && dlBtn.dataset.linkid) {
            e.stopPropagation();
            await downloadFromLinkBank(dlBtn.dataset.linkid);
            return;
        }

        const delBtn = e.target.closest('.hk-lb-btn-delete');
        if (delBtn && delBtn.dataset.linkid) {
            e.stopPropagation();
            await deleteLinkFromBank(delBtn.dataset.linkid);
            return;
        }

        const checkBtn = e.target.closest('.hk-lb-btn-recheck');
        if (checkBtn && checkBtn.dataset.linkid) {
            e.stopPropagation();
            await recheckLinkBankItem(checkBtn.dataset.linkid);
            return;
        }

        const urlBtn = e.target.closest('.hk-lb-btn-open-url');
        if (urlBtn && urlBtn.dataset.linkid) {
            e.stopPropagation();
            const link = (hubState.linkBank || []).find(l => l.id === urlBtn.dataset.linkid);
            if (link && link.url) window.open(link.url, '_blank', 'noopener');
            return;
        }

        const folderBtn = e.target.closest('.hk-lb-btn-open-folder');
        if (folderBtn && folderBtn.dataset.linkid) {
            e.stopPropagation();
            const link = (hubState.linkBank || []).find(l => l.id === folderBtn.dataset.linkid);
            if (link && link.local_path) openModelFolder(link.local_path);
            else showToast('⚠️ Ruta local no disponible', 'warning');
            return;
        }
    });
}

function bindLinkBankChrome(root) {
    if (!root || root._lbChromeBound) return;
    root._lbChromeBound = true;

    // Guardar enlace está junto al campo superior; el estado local se actualiza automáticamente.
    root.querySelector('#hk-btn-hub-quick-save')?.addEventListener('click', async () => {
        await saveCurrentInputUrlToBank();
    });

    // Botón Descargar todos los pendientes (Vast.ai super-feature)
    root.querySelector('#hk-btn-linkbank-batch-download')?.addEventListener('click', async () => {
        await batchDownloadPendingLinks();
    });

    // Botón Exportar JSON
    root.querySelector('#hk-btn-linkbank-export')?.addEventListener('click', async () => {
        await exportLinkBank();
    });

    // Botón e input Importar JSON
    const fileInput = root.querySelector('#hk-linkbank-file-input');
    root.querySelector('#hk-btn-linkbank-import')?.addEventListener('click', () => {
        if (fileInput) fileInput.click();
    });
    if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files && e.target.files[0];
            if (file) {
                await importLinkBank(file);
                fileInput.value = '';
            }
        });
    }
}

function renderHubStageHtml() {
    return `
        <div class="hk-hub-container" id="hk-hub-container">
            <div class="hk-hub-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span style="font-size: 22px;">⚡</span>
                    <div>
                        <div class="hk-section-heading" style="font-size: 15px; letter-spacing: 0.5px;">
                            UNIVERSE DOWNLOADER · COMFYUI
                        </div>
                        <div style="font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-muted);">
                            Civitai & Hugging Face · Atajo: <strong style="color:var(--hk-purple-light);">[g g]</strong>
                        </div>
                    </div>
                </div>

                <div style="display: flex; align-items: center; gap: 10px;">
                    <div id="hk-hub-aria2-badge" style="display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.35); border-radius: 6px; font-family: var(--hk-mono); font-size: 11px; color: var(--hk-purple-light); font-weight: 700;">
                        <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#22c55e; box-shadow:0 0 8px #22c55e;"></span>
                        🚀 Acelerador Aria2: Activo (${hubState.aria2 ? hubState.aria2.max_connections : 8} Conexiones)
                    </div>
                    <button id="hk-btn-hub-settings" class="hk-btn-cyber" style="padding: 6px 14px; font-size: 11px;" title="Configurar API Keys">
                        API Tokens
                    </button>
                    <button id="hk-btn-hub-clear-history" class="hk-btn-cyber" style="padding: 6px 14px; font-size: 11px;" title="Limpiar historial">
                        Limpiar Historial
                    </button>
                    <button id="hk-btn-hub-close-downloader" class="hk-btn-cyber danger" style="padding: 6px 12px; font-size: 13px; font-weight: 800;" title="Cerrar ventana (Escape)">
                        ✕
                    </button>
                </div>
            </div>

            <div class="hk-hub-content-scroll" id="hk-hub-content-scroll">
                <div class="hk-hub-dashboard-grid">
                    <!-- Entrada principal: analizar y guardar una URL. -->
                    <section class="hk-hub-panel hk-hub-intake">
                        <div class="hk-hub-panel-heading">
                            <div>
                                <h2 class="hk-hub-panel-title">Añadir modelo</h2>
                                <div class="hk-hub-panel-subtitle">Analiza un enlace de Civitai, Hugging Face o una descarga directa.</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 14px;">
                                <label style="font-family: var(--hk-mono); font-size: 11px; color: var(--hk-text-muted); display: inline-flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;" title="Omitir automáticamente enlaces de modelos que ya tengas descargados en tu carpeta">
                                    <input type="checkbox" id="hk-hub-chk-omit-downloaded" ${hubState.omitDownloaded !== false ? 'checked' : ''} style="accent-color: #a855f7; cursor: pointer;">
                                    <span>Omitir si ya está descargado</span>
                                </label>
                                <span style="font-size: 20px;">↳</span>
                            </div>
                        </div>
                        <div class="hk-download-entry">
                            <input type="text" id="hk-hub-link-input" aria-label="Enlace de descarga" class="hk-input" style="padding: 10px 14px; font-size: 12.5px; font-family: var(--hk-mono);" placeholder="Pega enlaces aquí o pulsa «Portapapeles»..." value="${escapeHtml(hubState.linkInput || '')}">
                            <button id="hk-btn-hub-add-link" class="hk-btn-cyber primary" style="padding: 10px 18px; font-size: 12px; font-weight: 800; white-space: nowrap;" title="Analizar enlace del cuadro o detectar enlaces del portapapeles">Analizar enlace</button>
                            <button id="hk-btn-hub-clipboard" class="hk-btn-cyber" style="padding: 10px 14px; font-size: 12px; font-weight: 700; white-space: nowrap;" title="Detectar enlaces de Civitai y Hugging Face de tu portapapeles y prepararlos para descargar">📋 Portapapeles</button>
                            <button id="hk-btn-hub-quick-save" class="hk-btn-cyber" style="padding: 10px 14px; font-size: 12px; font-weight: 700; white-space: nowrap;" title="Guardar el enlace pegado en el banco, sin iniciar una descarga">⭐ Guardar enlace</button>
                        </div>
                        <div id="hk-hub-inspect-loading" style="display: none; align-items: center; gap: 10px; margin-top: 12px; padding: 11px 12px; background: rgba(168, 85, 247, 0.08); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 8px; color: #ffffff; font-family: var(--hk-mono); font-size: 12px;">
                            <span style="font-size: 18px;">⚙️</span><span>Analizando enlace y extrayendo metadatos...</span>
                        </div>
                        <div id="hk-hub-inspect-result">
                            ${renderInspectedCardsListHtml()}
                        </div>
                    </section>

                    <!-- Banco de modelos guardados: enlaces con carga individual o eliminación. -->
                    <section class="hk-hub-panel hk-hub-bank">
                        <div class="hk-hub-panel-heading">
                            <div>
                                <h2 class="hk-hub-panel-title">Banco de enlaces</h2>
                                <div class="hk-hub-panel-subtitle">Guarda modelos aquí y vuelve a cargarlos o elimínalos cuando quieras.</div>
                            </div>
                            <span id="hk-linkbank-count" class="hk-linkbank-filter-btn" style="pointer-events:none;">
                                ${hubState.linkBank.length} guardados · ${hubState.linkBank.filter(l => l.local_status === 'present').length} en disco
                            </span>
                        </div>
                        <div id="hk-linkbank-list" class="hk-hub-scroll-box" style="display: flex; flex-direction: column; gap: 8px;">
                            ${renderLinkBankListHtml()}
                        </div>
                    </section>

                    <!-- Cola activa e historial de tareas de descarga. -->
                    <section class="hk-hub-panel hk-hub-queue">
                        <div class="hk-hub-history-header">
                            <div>
                                <h2 class="hk-hub-panel-title">Cola e historial</h2>
                                <div class="hk-hub-panel-subtitle">Progreso, velocidad, pausa y reintentos.</div>
                            </div>
                            <div class="hk-hub-history-actions">
                                <span id="hk-hub-history-count" class="hk-linkbank-filter-btn" style="pointer-events:none;">${hubState.tasks.length} descargas</span>
                                <button id="hk-btn-hub-refresh" class="hk-btn-cyber" style="padding: 5px 10px; font-size: 11px;" title="Actualizar lista">Actualizar</button>
                            </div>
                        </div>
                        <div id="hk-hub-tasks-content" class="hk-hub-scroll-box" style="display: flex; flex-direction: column; gap: 9px;">
                            ${renderTasksListInnerHtml(hubState.tasks)}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    `;
}

function renderInspectedCardHtml(result) {
    return renderInspectedCardItemHtml(result, 0);
}

function renderTasksListInnerHtml(tasks) {
    if (!tasks || tasks.length === 0) {
        return `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 200px; gap: 10px; color: var(--hk-text-muted); font-family: var(--hk-mono); border: 1px dashed var(--hk-border-subtle); border-radius: 8px;">
                <div style="font-size: 32px;">⚡</div>
                <div style="font-size: 13px; font-weight: 700; color: #ffffff;">No hay descargas activas.</div>
                <div style="font-size: 11px; color: var(--hk-text-dim);">Pega un enlace de Civitai o Hugging Face para comenzar.</div>
            </div>
        `;
    }

    return tasks.map(t => {
        const pct = Math.min(100, Math.max(0, t.progress || 0));
        const localPreview = t.preview_path ? `/local_manager/preview?path=${encodeURIComponent(t.preview_path)}` : '';
        const proxyPreview = t.cover_url ? hubCivitaiPreviewUrl(t.cover_url) : '';
        const taskCover = localPreview || proxyPreview || t.cover_url || '';
        const taskCoverStage = localPreview ? 'local' : (proxyPreview ? 'proxy' : 'direct');
        const isPaused = t.status === 'paused';
        const isDownloading = t.status === 'downloading';
        const isCompleted = t.status === 'completed';
        const isCancelled = t.status === 'cancelled';
        const isPending = t.status === 'pending';
        const isError = t.status === 'error';

        const isAria2 = t.engine === 'aria2';
        const engineLabel = isAria2 
            ? `🚀 Aria2 (${t.connections || 1} conns)`
            : (t.engine === 'native_accelerated' ? `⚡ Nativo (${t.connections || 1} conns)` : `📦 Nativo (1 stream)`);
        const engineColor = isAria2 ? 'var(--hk-purple-light)' : '#93c5fd';
        const engineBg = isAria2 ? 'rgba(168, 85, 247, 0.15)' : 'rgba(59, 130, 246, 0.12)';
        const engineBorder = isAria2 ? 'rgba(168, 85, 247, 0.35)' : 'rgba(59, 130, 246, 0.3)';

        return `
            <div class="hk-hub-task-card ${t.status}" data-taskid="${t.task_id}">
                <div style="display: flex; gap: 14px; align-items: center;">
                    <div style="width: 60px; height: 70px; border-radius: 6px; overflow: hidden; background: #000000; flex-shrink: 0; display: flex; align-items: center; justify-content: center; border: 1px solid var(--hk-border-subtle);">
                        ${taskCover ? `<img src="${escapeHtml(taskCover)}" data-preview-stage="${taskCoverStage}" data-local="${escapeHtml(localPreview)}" data-proxy="${escapeHtml(proxyPreview)}" data-direct="${escapeHtml(t.cover_url || '')}" referrerpolicy="no-referrer" style="width:100%; height:100%; object-fit:cover;" alt="Vista previa de ${escapeHtml(t.filename)}" onerror="handleHubPreviewError(this)"><span style="display:none; font-size:24px;">⚡</span>` : `<span style="font-size:24px;">⚡</span>`}
                    </div>

                    <div style="flex: 1; display: flex; flex-direction: column; gap: 6px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex-wrap: wrap;">
                                <span style="font-family: var(--hk-mono); font-size: 13px; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(t.filename)}">
                                    ${escapeHtml(t.filename)}
                                </span>
                                <span style="font-family: var(--hk-mono); font-size: 10.5px; color: #ffffff; background: rgba(255,255,255,0.08); padding: 1px 6px; border-radius: 3px; border: 1px solid var(--hk-border); flex-shrink: 0;">
                                    models/${escapeHtml(t.category)}
                                </span>
                                <span style="font-family: var(--hk-mono); font-size: 10px; color: ${engineColor}; background: ${engineBg}; padding: 1px 6px; border-radius: 3px; border: 1px solid ${engineBorder}; flex-shrink: 0; font-weight: 700;" title="${escapeHtml(t.engine_details || '')}">
                                    ${engineLabel}
                                </span>
                                ${t.engine_fallback_reason ? `
                                    <span style="font-family: var(--hk-mono); font-size: 9.5px; color: #f59e0b; background: rgba(245, 158, 11, 0.12); padding: 1px 6px; border-radius: 3px; border: 1px solid rgba(245, 158, 11, 0.3); flex-shrink: 0;" title="${escapeHtml(t.engine_fallback_reason)}">
                                        ⚠️ Aria2 ➔ Nativo
                                    </span>
                                ` : ''}
                            </div>

                            <div>
                                ${isDownloading ? `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: #000000; background: #ffffff; padding: 3px 8px; border-radius: 4px; border: 1px solid #ffffff;">
                                        Descargando
                                    </span>
                                ` : (isPaused ? `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: #f59e0b; background: rgba(245,158,11,0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(245,158,11,0.3);">
                                        Pausado
                                    </span>
                                ` : (isCompleted ? `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: #ffffff; background: rgba(255,255,255,0.15); padding: 3px 8px; border-radius: 4px; border: 1px solid var(--hk-border);">
                                        Completado
                                    </span>
                                ` : (isCancelled ? `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: #94a3b8; background: rgba(148,163,184,0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(148,163,184,0.3);">
                                        Cancelado
                                    </span>
                                ` : (isPending ? `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: var(--hk-purple-light); background: rgba(139, 92, 246, 0.15); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(139, 92, 246, 0.35);">
                                        Conectando...
                                    </span>
                                ` : `
                                    <span style="font-family: var(--hk-mono); font-size: 10px; font-weight: 800; color: #ff4d6d; background: rgba(255,77,109,0.12); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,77,109,0.3);" title="${escapeHtml(t.error || '')}">
                                        Error
                                    </span>
                                `))))}
                            </div>
                        </div>

                        <!-- Progress Bar -->
                        <div class="hk-hub-progress-track" style="height: 10px;">
                            <div class="hk-hub-progress-bar" style="width: ${pct}%; ${isPaused ? 'background: linear-gradient(90deg, #f59e0b 0%, #eab308 100%); box-shadow: 0 0 10px rgba(245,158,11,0.4);' : ''}"></div>
                        </div>

                        <!-- Metrics & Action buttons -->
                        <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; font-family: var(--hk-mono); font-size: 11px;">
                            <div style="display: flex; align-items: center; gap: 12px; color: var(--hk-text-muted);">
                                <span style="color: #ffffff; font-weight: 800;">${pct.toFixed(1)}%</span>
                                <span>${escapeHtml(t.downloaded_formatted || '0 MB')} / ${escapeHtml(t.total_formatted || '?')}</span>
                                ${isDownloading ? `
                                    <span style="color: #ffffff; font-weight: 700;">⚡ ${escapeHtml(t.speed_formatted || '0 MB/s')}</span>
                                    ${t.eta_formatted ? `<span>ETA: ${escapeHtml(t.eta_formatted)}</span>` : ''}
                                ` : ''}
                            </div>

                            <div style="display: flex; align-items: center; gap: 6px;">
                                ${isDownloading ? `
                                    <button class="hk-btn-cyber hk-hub-btn-pause-task" data-taskid="${t.task_id}" style="padding: 3px 10px; font-size: 10.5px;">
                                        ⏸️ Pausar
                                    </button>
                                    <button class="hk-btn-cyber hk-hub-btn-cancel-task" data-taskid="${t.task_id}" style="padding: 3px 10px; font-size: 10.5px; color: #ff4d6d;">
                                        🛑 Cancelar
                                    </button>
                                ` : (isPaused ? `
                                    <button class="hk-btn-cyber primary hk-hub-btn-resume-task" data-taskid="${t.task_id}" style="padding: 3px 10px; font-size: 10.5px;">
                                        ▶️ Reanudar
                                    </button>
                                    <button class="hk-btn-cyber hk-hub-btn-cancel-task" data-taskid="${t.task_id}" style="padding: 3px 10px; font-size: 10.5px; color: #ff4d6d;">
                                        🛑 Cancelar
                                    </button>
                                ` : (isCompleted ? `
                                    <button class="hk-btn-cyber hk-hub-btn-open-task-folder" data-path="${escapeHtml(t.target_path || '')}" style="padding: 3px 10px; font-size: 10.5px;">
                                        📂 Abrir Carpeta
                                    </button>
                                    <button class="hk-btn-cyber hk-hub-btn-delete-task" data-taskid="${t.task_id}" style="padding: 3px 8px; font-size: 10.5px;" title="Eliminar del historial">
                                        🗑️
                                    </button>
                                ` : `
                                    <button class="hk-btn-cyber primary hk-hub-btn-resume-task" data-taskid="${t.task_id}" style="padding: 3px 10px; font-size: 10.5px;">
                                        🔄 Reintentar
                                    </button>
                                    <button class="hk-btn-cyber hk-hub-btn-delete-task" data-taskid="${t.task_id}" style="padding: 3px 8px; font-size: 10.5px;" title="Eliminar del historial">
                                        🗑️
                                    </button>
                                `))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function updateTasksViewContent() {
    const cont = document.getElementById('hk-hub-tasks-content');
    if (cont) {
        cont.innerHTML = renderTasksListInnerHtml(hubState.tasks || []);
        bindTasksCardEvents(cont);
    }
    const countBadge = document.getElementById('hk-hub-history-count');
    if (countBadge) {
        countBadge.innerText = `${(hubState.tasks || []).length} descargas`;
    }
}

function renderHubStageContent() {
    const container = document.getElementById('hk-view-hub') || document.getElementById('hk-hub-stage-container');
    if (!container) return;
    const existingRoot = document.getElementById('hk-hub-container');
    if (existingRoot) {
        updateTasksViewContent();
        bindHubStageEvents(existingRoot);
        updateLinkBankUI();
        updateInspectedResultsUI();
        return;
    }
    container.innerHTML = renderHubStageHtml();
    bindHubStageEvents();
}

function bindInspectedCardEvents(container) {
    bindInspectedListEvents(container);
}

function bindHubStageEvents(forcedRoot) {
    const hubRoot = forcedRoot || document.getElementById('hk-hub-container');
    if (!hubRoot) return;
    if (hubRoot._hubEventsBound) return;
    hubRoot._hubEventsBound = true;

    hubRoot.querySelector('#hk-btn-hub-settings')?.addEventListener('click', () => {
        openHubSettingsModal();
    });

    hubRoot.querySelector('#hk-btn-hub-clear-history')?.addEventListener('click', () => {
        hubClearCompletedTasks();
    });

    hubRoot.querySelector('#hk-btn-hub-refresh')?.addEventListener('click', () => {
        fetchHubTasks();
        showToast('🔄 Lista de descargas actualizada', 'info');
    });

    // Add / Inspect Link button & Clipboard button
    const omitChk = hubRoot.querySelector('#hk-hub-chk-omit-downloaded');
    if (omitChk) {
        omitChk.addEventListener('change', () => {
            hubState.omitDownloaded = omitChk.checked;
        });
    }

    const addBtn = hubRoot.querySelector('#hk-btn-hub-add-link');
    const clipBtn = hubRoot.querySelector('#hk-btn-hub-clipboard');
    const linkInput = hubRoot.querySelector('#hk-hub-link-input');

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            await hubDetectAndAddLinks({ forceClipboard: false });
        });
    }

    if (clipBtn) {
        clipBtn.addEventListener('click', async () => {
            await hubDetectAndAddLinks({ forceClipboard: true });
        });
    }

    if (linkInput) {
        linkInput.addEventListener('input', (e) => {
            hubState.linkInput = e.target.value;
        });
        linkInput.addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await hubDetectAndAddLinks({ forceClipboard: false });
            }
        });
        linkInput.addEventListener('paste', (e) => {
            const pastedText = e.clipboardData?.getData('text') || '';
            const detectedUrls = extractModelUrls(pastedText);
            if (detectedUrls.length > 0) {
                e.preventDefault();
                linkInput.value = '';
                hubState.linkInput = '';
                setTimeout(() => {
                    hubDetectAndAddLinks({ directUrls: detectedUrls });
                }, 20);
            }
        });
    }

    const resultCont = hubRoot.querySelector('#hk-hub-inspect-result');
    if (resultCont) {
        bindInspectedCardEvents(resultCont);
    }

    bindLinkBankChrome(hubRoot);
    bindLinkBankEvents(hubRoot.querySelector('#hk-linkbank-list'));

    bindTasksCardEvents(hubRoot);
}

function bindTasksCardEvents(container) {
    if (!container) return;

    container.querySelectorAll('.hk-hub-btn-pause-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const tid = btn.dataset.taskid;
            if (tid) hubPauseTask(tid);
        });
    });

    container.querySelectorAll('.hk-hub-btn-resume-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const tid = btn.dataset.taskid;
            if (tid) hubResumeTask(tid);
        });
    });

    container.querySelectorAll('.hk-hub-btn-cancel-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const tid = btn.dataset.taskid;
            if (tid) hubCancelTask(tid);
        });
    });

    container.querySelectorAll('.hk-hub-btn-delete-task').forEach(btn => {
        btn.addEventListener('click', () => {
            const tid = btn.dataset.taskid;
            if (tid) hubDeleteTask(tid);
        });
    });

    container.querySelectorAll('.hk-hub-btn-open-task-folder').forEach(btn => {
        btn.addEventListener('click', async () => {
            const p = btn.dataset.path;
            if (p) {
                try {
                    await api.fetchApi('/local_manager/open_folder', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ path: p })
                    });
                } catch (e) {
                    showToast(`❌ Error: ${e}`, 'error');
                }
            }
        });
    });
}

function openHubSettingsModal() {
    const existing = document.getElementById('hk-hub-settings-modal-backdrop');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'hk-hub-settings-modal-backdrop';
    backdrop.className = 'hk-hub-modal-backdrop';
    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeStudioDialog(backdrop);
    });

    backdrop.innerHTML = `
        <div class="pv-modal hk-hub-token-modal">
            <div class="hk-hub-token-header">
                <div class="hk-hub-token-heading">
                    <span class="hk-hub-token-icon">⚙️</span>
                    <span class="hk-dialog-title">API Tokens</span>
                </div>
                <button id="hk-hub-settings-close" aria-label="Cerrar configuración" class="hk-meta-copy-btn hk-hub-token-close">✕</button>
            </div>

            <div class="hk-hub-token-field">
                <div class="hk-hub-token-field-head">
                    <label class="hk-hub-token-label" for="hk-hub-civitai-token-input">
                        CIVITAI API KEY ${hubState.settings && hubState.settings.has_civitai_token ? '<span class="hk-hub-token-status">✓ Configurado</span>' : ''}
                    </label>
                    ${hubState.settings && hubState.settings.has_civitai_token ? '<button id="hk-hub-clear-civitai-btn" class="hk-btn-cyber danger hk-hub-token-remove">🗑️ Eliminar</button>' : ''}
                </div>
                <input type="password" id="hk-hub-civitai-token-input" aria-label="API Key de Civitai" class="hk-input hk-hub-token-input" value="" placeholder="${hubState.settings && hubState.settings.has_civitai_token ? 'Guardado (oculto) - Introduce nuevo para cambiar...' : 'Clave alfanumérica de Civitai (32 caracteres)...'}">
                <p class="hk-hub-token-help">
                    Permite descargar modelos NSFW, acceso anticipado o privados en Civitai (civitai.com → Account → API Keys). <strong>No uses aquí tokens que empiecen por “hf_”.</strong>
                </p>
            </div>

            <div class="hk-hub-token-field">
                <div class="hk-hub-token-field-head">
                    <label class="hk-hub-token-label" for="hk-hub-hf-token-input">
                        HUGGING FACE USER TOKEN ${hubState.settings && hubState.settings.has_hf_token ? '<span class="hk-hub-token-status">✓ Configurado</span>' : ''}
                    </label>
                    ${hubState.settings && hubState.settings.has_hf_token ? '<button id="hk-hub-clear-hf-btn" class="hk-btn-cyber danger hk-hub-token-remove">🗑️ Eliminar</button>' : ''}
                </div>
                <input type="password" id="hk-hub-hf-token-input" aria-label="Token de Hugging Face" class="hk-input hk-hub-token-input" value="" placeholder="${hubState.settings && hubState.settings.has_hf_token ? 'Guardado (oculto) - Introduce nuevo para cambiar...' : 'hf_... (Read Access Token)'}">
                <p class="hk-hub-token-help">
                    Token de lectura (empieza por 'hf_') obtenido en huggingface.co/settings/tokens.
                </p>
            </div>

            <div class="hk-hub-token-actions">
                <button id="hk-hub-settings-cancel" class="hk-btn-cyber">
                    ✕ Cancelar
                </button>
                <button id="hk-hub-settings-save" class="hk-btn-cyber primary">
                    💾 Guardar Configuración
                </button>
            </div>
        </div>
    `;

    mountStudioDialog(backdrop);

    let clearCivitai = false;
    let clearHf = false;

    backdrop.querySelector('#hk-hub-clear-civitai-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearCivitai = true;
        const inp = backdrop.querySelector('#hk-hub-civitai-token-input');
        if (inp) { inp.value = ''; inp.placeholder = 'Token marcado para eliminar al guardar'; }
        showToast('🗑️ Token de Civitai marcado para eliminar', 'warning');
    });

    backdrop.querySelector('#hk-hub-clear-hf-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        clearHf = true;
        const inp = backdrop.querySelector('#hk-hub-hf-token-input');
        if (inp) { inp.value = ''; inp.placeholder = 'Token marcado para eliminar al guardar'; }
        showToast('🗑️ Token de Hugging Face marcado para eliminar', 'warning');
    });

    backdrop.querySelector('#hk-hub-settings-close')?.addEventListener('click', () => closeStudioDialog(backdrop));
    backdrop.querySelector('#hk-hub-settings-cancel')?.addEventListener('click', () => closeStudioDialog(backdrop));
    backdrop.querySelector('#hk-hub-settings-save')?.addEventListener('click', async () => {
        let civitai_token = (backdrop.querySelector('#hk-hub-civitai-token-input')?.value || '').trim();
        let hf_token = (backdrop.querySelector('#hk-hub-hf-token-input')?.value || '').trim();

        if (civitai_token.startsWith('hf_')) {
            showToast('⚠️ La clave de Civitai no debe empezar por "hf_". Esa clave corresponde a Hugging Face.', 'warning');
            return;
        }

        try {
            const payload = { civitai_token, hf_token };
            if (clearCivitai) payload.clear_civitai_token = true;
            if (clearHf) payload.clear_hf_token = true;

            const res = await api.fetchApi('/universe_downloader/api/hub/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                showToast('✅ Tokens de API guardados con éxito', 'success');
                await fetchHubSettings();
                closeStudioDialog(backdrop);
            } else {
                showToast('❌ Error al guardar tokens', 'error');
            }
        } catch (e) {
            showToast(`❌ Error: ${e}`, 'error');
        }
    });
}

async function refreshLinkBankLocalStatus() {
    if (hubState.linkBankCheckInFlight) return;
    hubState.linkBankCheckInFlight = true;
    try {
        const res = await api.fetchApi('/universe_downloader/api/hub/links');
        const data = await safeJson(res);
        if (res && res.ok && data && !data.__non_json) {
            hubState.linkBank = data.links || [];
            updateLinkBankUI();
        }
    } catch (e) {
        console.warn('[Link Bank] Error comprobando disponibilidad local:', e);
    } finally {
        hubState.linkBankCheckInFlight = false;
    }
}

function startLinkBankPolling() {
    if (hubState.linkBankPollInterval) return;
    hubState.linkBankPollInterval = setInterval(() => {
        if (document.getElementById('hk-hub-container')) refreshLinkBankLocalStatus();
    }, 30000);
}

function stopLinkBankPolling() {
    if (!hubState.linkBankPollInterval) return;
    clearInterval(hubState.linkBankPollInterval);
    hubState.linkBankPollInterval = null;
}

async function initHubViewIfNeeded() {
    startHubTasksPolling();
    startLinkBankPolling();
    try {
        await Promise.all([
            fetchHubFolders(),
            fetchHubSettings(),
            fetchHubTasks(),
            fetchHubAria2Status(),
            fetchLinkBank()
        ]);
    } catch (e) {
        console.warn("[Hub] Error in initHubViewIfNeeded background fetches:", e);
    }
    renderHubStageContent();
}


// ============================================================================
// OVERLAY & LIFECYCLE (UNIVERSE DOWNLOADER COMFYUI)
// ============================================================================

export const universeDownloaderState = {
    isOpen: false
};

let lastKeyPressTime = 0;
let lastKeyPressed = '';

function injectMasterStyles() {
    const styleId = 'universe-downloader-master-styles';
    let style = document.getElementById(styleId);
    if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
    }
    style.textContent = MASTER_CSS;
}

export function openUniverseDownloader() {
    injectMasterStyles();
    universeDownloaderState.isOpen = true;

    let overlay = document.getElementById('universe-downloader-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'universe-downloader-overlay';
        overlay.className = 'hk-hub-full-overlay';
        overlay.innerHTML = `
            <div class="hk-downloader-container">
                <div id="hk-view-hub" class="hk-stage-full" style="width: 100%; height: 100%; display: flex; flex-direction: column; overflow: hidden;">
                    ${renderHubStageHtml()}
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeUniverseDownloader();
        });

        bindHubStageEvents();
    } else {
        renderHubStageContent();
    }

    overlay.style.display = 'flex';
    document.body.classList.add('hk-downloader-active');

    // Inicializar tareas, banco de enlaces y datos en segundo plano
    initHubViewIfNeeded();

    // Hook the close button in header
    setTimeout(() => {
        const closeBtn = document.getElementById('hk-btn-hub-close-downloader');
        if (closeBtn) closeBtn.onclick = () => closeUniverseDownloader();
    }, 50);
}

export function closeUniverseDownloader() {
    universeDownloaderState.isOpen = false;
    const overlay = document.getElementById('universe-downloader-overlay');
    if (overlay) overlay.style.display = 'none';
    document.body.classList.remove('hk-downloader-active');
    stopHubTasksPolling();
    stopLinkBankPolling();
}

export function toggleUniverseDownloader() {
    if (universeDownloaderState.isOpen) closeUniverseDownloader();
    else openUniverseDownloader();
}

// Global window assignments for console access & direct triggers
window.openUniverseDownloader = openUniverseDownloader;
window.closeUniverseDownloader = closeUniverseDownloader;
window.toggleUniverseDownloader = toggleUniverseDownloader;
window.universeDownloaderState = universeDownloaderState;

// ============================================================================
// GLOBAL KEYBOARD LISTENER (2x 'g' HOTKEY & ESCAPE)
// ============================================================================

if (!window._universeDownloaderKeydownBound) {
    window._universeDownloaderKeydownBound = true;

    window.addEventListener('keydown', (e) => {
        const activeEl = document.activeElement;
        const targetEl = e.target;
        const overlay = document.getElementById('universe-downloader-overlay');
        const targetIsInput = targetEl && /^(INPUT|TEXTAREA|SELECT)$/.test(targetEl.tagName);
        const focusedField = activeEl && /^(INPUT|TEXTAREA|SELECT)$/.test(activeEl.tagName);
        const isEditable = Boolean(
            targetEl?.isContentEditable || activeEl?.isContentEditable || targetIsInput || focusedField
        );

        // Escape closes Universe Downloader
        if (e.key === 'Escape' && universeDownloaderState.isOpen) {
            e.preventDefault();
            e.stopPropagation();
            closeUniverseDownloader();
            return;
        }

        // Double 'g' / 'G' hotkey within 500ms outside text fields
        const isGKey = (e.key === 'g' || e.key === 'G' || e.code === 'KeyG');
        const isDownloaderHotkey = !e.ctrlKey && !e.altKey && !e.metaKey && isGKey && !isEditable;

        if (isDownloaderHotkey) {
            const now = Date.now();
            if (lastKeyPressed.toLowerCase() === 'g' && (now - lastKeyPressTime) <= 500) {
                e.preventDefault();
                e.stopPropagation();
                lastKeyPressTime = 0;
                lastKeyPressed = '';
                toggleUniverseDownloader();
                return;
            }
            lastKeyPressTime = now;
            lastKeyPressed = 'g';
            return;
        }

        lastKeyPressed = '';
    }, true);
}

// ============================================================================
// COMFYUI EXTENSION REGISTRATION
// ============================================================================

app.registerExtension({
    name: "UniverseDownloader",
    async setup() {
        try {
            injectMasterStyles();
            window.openUniverseDownloader = openUniverseDownloader;
            window.closeUniverseDownloader = closeUniverseDownloader;
            window.toggleUniverseDownloader = toggleUniverseDownloader;

            // Add menu item in ComfyUI menu bar
            if (app.menu && typeof app.menu.addMenuItem === 'function') {
                try {
                    app.menu.addMenuItem({
                        name: "Universe Downloader (gg)",
                        icon: "pi pi-download",
                        action: () => toggleUniverseDownloader()
                    });
                } catch (e) {}
            }

            console.log("[Universe Downloader] Extensión cargada con éxito. Presiona 'g' dos veces rápido para abrir.");
        } catch (err) {
            console.error("[Universe Downloader] Error inicializando extensión:", err);
        }
    }
});

