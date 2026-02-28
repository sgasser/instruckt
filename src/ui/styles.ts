/** Injects instruckt styles into the document as a single <style> tag */
export function injectStyles(): void {
  if (document.getElementById('instruckt-styles')) return

  const style = document.createElement('style')
  style.id = 'instruckt-styles'
  style.textContent = CSS_TEXT
  document.head.appendChild(style)
}

const CSS_TEXT = /* css */ `
/* ── Variables ───────────────────────────────────────────────── */
:root {
  --ik-accent:       #6366f1;
  --ik-accent-hover: #4f46e5;
  --ik-bg:           #ffffff;
  --ik-bg-secondary: #f8f8f8;
  --ik-border:       #e4e4e7;
  --ik-text:         #18181b;
  --ik-text-muted:   #71717a;
  --ik-shadow:       0 4px 24px rgba(0,0,0,0.12);
  --ik-radius:       10px;
  --ik-highlight:    rgba(99,102,241,0.15);
  --ik-highlight-border: rgba(99,102,241,0.7);
}

@media (prefers-color-scheme: dark) {
  :root {
    --ik-bg:           #1c1c1e;
    --ik-bg-secondary: #2c2c2e;
    --ik-border:       #3a3a3c;
    --ik-text:         #f4f4f5;
    --ik-text-muted:   #a1a1aa;
    --ik-shadow:       0 4px 24px rgba(0,0,0,0.5);
    --ik-highlight:    rgba(99,102,241,0.2);
  }
}

[data-instruckt-theme="light"] { color-scheme: light; }
[data-instruckt-theme="dark"]  {
  color-scheme: dark;
  --ik-bg: #1c1c1e; --ik-bg-secondary: #2c2c2e;
  --ik-border: #3a3a3c; --ik-text: #f4f4f5; --ik-text-muted: #a1a1aa;
  --ik-shadow: 0 4px 24px rgba(0,0,0,0.5); --ik-highlight: rgba(99,102,241,0.2);
}

/* ── Toolbar ─────────────────────────────────────────────────── */
#instruckt-toolbar {
  position: fixed;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: var(--ik-bg);
  border: 1px solid var(--ik-border);
  border-radius: 14px;
  padding: 8px 6px;
  box-shadow: var(--ik-shadow);
  user-select: none;
  touch-action: none;
  transition: opacity 0.15s ease;
}
#instruckt-toolbar.ik-hidden { opacity: 0; pointer-events: none; }

.ik-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--ik-text-muted);
  cursor: pointer;
  transition: background 0.1s, color 0.1s;
  padding: 0;
  font-size: 18px;
  line-height: 1;
}
.ik-btn:hover  { background: var(--ik-bg-secondary); color: var(--ik-text); }
.ik-btn.active { background: var(--ik-accent); color: #fff; }
.ik-btn.active:hover { background: var(--ik-accent-hover); }

.ik-divider {
  width: 20px;
  height: 1px;
  background: var(--ik-border);
  margin: 2px 0;
}

.ik-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 16px;
  height: 16px;
  background: var(--ik-accent);
  color: #fff;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
}

/* ── Element highlight ───────────────────────────────────────── */
.ik-highlight-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 2147483644;
  border: 2px solid var(--ik-highlight-border);
  background: var(--ik-highlight);
  border-radius: 3px;
  transition: all 0.08s ease;
}

/* ── Annotation markers ──────────────────────────────────────── */
.ik-marker {
  position: absolute;
  z-index: 2147483645;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--ik-accent);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(99,102,241,0.4);
  transition: transform 0.15s ease;
}
.ik-marker:hover { transform: scale(1.15); }
.ik-marker.resolved { background: #22c55e; }
.ik-marker.dismissed { background: var(--ik-text-muted); }

/* ── Annotation popup ────────────────────────────────────────── */
#instruckt-popup {
  position: fixed;
  z-index: 2147483647;
  width: 340px;
  background: var(--ik-bg);
  border: 1px solid var(--ik-border);
  border-radius: var(--ik-radius);
  box-shadow: var(--ik-shadow);
  padding: 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 13px;
  color: var(--ik-text);
  animation: ik-popup-in 0.12s ease;
}

@keyframes ik-popup-in {
  from { opacity: 0; transform: scale(0.95) translateY(4px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}

.ik-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.ik-popup-element {
  font-size: 11px;
  font-family: ui-monospace, monospace;
  color: var(--ik-text-muted);
  background: var(--ik-bg-secondary);
  border-radius: 4px;
  padding: 2px 6px;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.ik-popup-close {
  background: none;
  border: none;
  color: var(--ik-text-muted);
  cursor: pointer;
  font-size: 18px;
  line-height: 1;
  padding: 0;
}

.ik-framework-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ik-accent);
  background: var(--ik-highlight);
  border-radius: 4px;
  padding: 2px 6px;
  margin-bottom: 8px;
}

.ik-selected-text {
  font-size: 12px;
  color: var(--ik-text-muted);
  background: var(--ik-bg-secondary);
  border-left: 3px solid var(--ik-accent);
  padding: 4px 8px;
  border-radius: 0 4px 4px 0;
  margin-bottom: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ik-row {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
}

.ik-chip-group {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.ik-chip {
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid var(--ik-border);
  background: transparent;
  color: var(--ik-text-muted);
  cursor: pointer;
  transition: all 0.1s;
}
.ik-chip:hover { border-color: var(--ik-accent); color: var(--ik-accent); }
.ik-chip.selected {
  background: var(--ik-accent);
  border-color: var(--ik-accent);
  color: #fff;
}
.ik-chip.severity-blocking.selected  { background: #ef4444; border-color: #ef4444; }
.ik-chip.severity-important.selected { background: #f97316; border-color: #f97316; }
.ik-chip.severity-suggestion.selected{ background: #22c55e; border-color: #22c55e; }

.ik-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--ik-text-muted);
  margin-bottom: 4px;
}

textarea.ik-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 80px;
  resize: vertical;
  border: 1px solid var(--ik-border);
  border-radius: 6px;
  background: var(--ik-bg-secondary);
  color: var(--ik-text);
  font-family: inherit;
  font-size: 13px;
  padding: 8px 10px;
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: 10px;
}
textarea.ik-textarea:focus { border-color: var(--ik-accent); }
textarea.ik-textarea::placeholder { color: var(--ik-text-muted); }

.ik-popup-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
}

.ik-btn-secondary {
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--ik-border);
  background: transparent;
  color: var(--ik-text-muted);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.1s;
}
.ik-btn-secondary:hover { border-color: var(--ik-text-muted); color: var(--ik-text); }

.ik-btn-primary {
  padding: 6px 14px;
  border-radius: 6px;
  border: none;
  background: var(--ik-accent);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.1s;
}
.ik-btn-primary:hover { background: var(--ik-accent-hover); }
.ik-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ── Cursor override when annotating ─────────────────────────── */
body.ik-annotating * { cursor: crosshair !important; }
`
