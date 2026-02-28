var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/api.ts
var InstrucktApi = class {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }
  async createSession(url) {
    const res = await fetch(`${this.endpoint}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error(`instruckt: failed to create session (${res.status})`);
    return res.json();
  }
  async getSession(sessionId) {
    const res = await fetch(`${this.endpoint}/sessions/${sessionId}`, {
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error(`instruckt: failed to get session (${res.status})`);
    return res.json();
  }
  async addAnnotation(sessionId, data) {
    const res = await fetch(`${this.endpoint}/sessions/${sessionId}/annotations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`instruckt: failed to add annotation (${res.status})`);
    return res.json();
  }
  async updateAnnotation(annotationId, data) {
    const res = await fetch(`${this.endpoint}/annotations/${annotationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`instruckt: failed to update annotation (${res.status})`);
    return res.json();
  }
};

// src/sse.ts
var InstrucktSSE = class {
  constructor(endpoint, sessionId, onUpdate) {
    this.endpoint = endpoint;
    this.sessionId = sessionId;
    this.onUpdate = onUpdate;
    this.source = null;
  }
  connect() {
    if (this.source) return;
    this.source = new EventSource(`${this.endpoint}/sessions/${this.sessionId}/events`);
    this.source.addEventListener("annotation.updated", (e) => {
      try {
        const annotation = JSON.parse(e.data);
        this.onUpdate(annotation);
      } catch (e2) {
      }
    });
    this.source.onerror = () => {
    };
  }
  disconnect() {
    var _a;
    (_a = this.source) == null ? void 0 : _a.close();
    this.source = null;
  }
};

// src/ui/toolbar.ts
var Toolbar = class {
  constructor(position, callbacks) {
    this.position = position;
    this.callbacks = callbacks;
    this.annotationCount = 0;
    this.mode = "idle";
    this.dragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.build();
    this.setupDrag();
  }
  build() {
    this.el = document.createElement("div");
    this.el.id = "instruckt-toolbar";
    this.el.setAttribute("data-instruckt", "toolbar");
    this.annotateBtn = this.makeBtn("\u270F\uFE0F", "Annotate elements (A)", () => {
      const next = this.mode !== "annotating";
      this.setMode(next ? "annotating" : "idle");
      this.callbacks.onToggleAnnotate(next);
    });
    this.annotateBtn.setAttribute("data-action", "annotate");
    this.freezeBtn = this.makeBtn("\u23F8", "Freeze animations (F)", () => {
      const next = this.mode !== "frozen";
      this.setMode(next ? "frozen" : "idle");
      this.callbacks.onFreezeAnimations(next);
    });
    const divider = document.createElement("div");
    divider.className = "ik-divider";
    this.el.append(this.annotateBtn, divider, this.freezeBtn);
    this.applyPosition();
    document.body.appendChild(this.el);
  }
  makeBtn(icon, title, onClick) {
    const btn = document.createElement("button");
    btn.className = "ik-btn";
    btn.title = title;
    btn.setAttribute("aria-label", title);
    btn.innerHTML = icon;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }
  applyPosition() {
    const margin = "16px";
    const pos = this.position;
    this.el.style.bottom = pos.includes("bottom") ? margin : "auto";
    this.el.style.top = pos.includes("top") ? margin : "auto";
    this.el.style.right = pos.includes("right") ? margin : "auto";
    this.el.style.left = pos.includes("left") ? margin : "auto";
  }
  setupDrag() {
    this.el.addEventListener("mousedown", (e) => {
      if (e.target.closest(".ik-btn")) return;
      this.dragging = true;
      const rect = this.el.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;
      this.el.style.transition = "none";
      e.preventDefault();
    });
    document.addEventListener("mousemove", (e) => {
      if (!this.dragging) return;
      const x = e.clientX - this.dragOffset.x;
      const y = e.clientY - this.dragOffset.y;
      this.el.style.left = `${x}px`;
      this.el.style.top = `${y}px`;
      this.el.style.right = "auto";
      this.el.style.bottom = "auto";
    });
    document.addEventListener("mouseup", () => {
      this.dragging = false;
    });
  }
  setMode(mode) {
    this.mode = mode;
    this.annotateBtn.classList.toggle("active", mode === "annotating");
    this.freezeBtn.classList.toggle("active", mode === "frozen");
    document.body.classList.toggle("ik-annotating", mode === "annotating");
  }
  setAnnotationCount(count) {
    this.annotationCount = count;
    let badge = this.annotateBtn.querySelector(".ik-badge");
    if (count > 0) {
      if (!badge) {
        badge = document.createElement("span");
        badge.className = "ik-badge";
        this.annotateBtn.style.position = "relative";
        this.annotateBtn.appendChild(badge);
      }
      badge.textContent = count > 99 ? "99+" : String(count);
    } else {
      badge == null ? void 0 : badge.remove();
    }
  }
  destroy() {
    this.el.remove();
    document.body.classList.remove("ik-annotating");
  }
};

// src/ui/highlight.ts
var ElementHighlight = class {
  constructor() {
    this.overlay = document.createElement("div");
    this.overlay.className = "ik-highlight-overlay";
    this.overlay.style.display = "none";
    document.body.appendChild(this.overlay);
  }
  show(el) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      this.hide();
      return;
    }
    this.overlay.style.display = "block";
    this.overlay.style.left = `${rect.left}px`;
    this.overlay.style.top = `${rect.top}px`;
    this.overlay.style.width = `${rect.width}px`;
    this.overlay.style.height = `${rect.height}px`;
  }
  hide() {
    this.overlay.style.display = "none";
  }
  destroy() {
    this.overlay.remove();
  }
};

// src/ui/popup.ts
var AnnotationPopup = class {
  constructor() {
    this.el = null;
    this.intent = "fix";
    this.severity = "important";
    this.textarea = null;
    this.onOutsideClick = (e) => {
      if (this.el && !this.el.contains(e.target)) {
        this.destroy();
      }
    };
  }
  show(pending, callbacks) {
    this.destroy();
    this.el = document.createElement("div");
    this.el.id = "instruckt-popup";
    this.el.setAttribute("data-instruckt", "popup");
    this.intent = "fix";
    this.severity = "important";
    const frameworkBadge = pending.framework ? `<div class="ik-framework-badge">${frameworkIcon(pending.framework.framework)} ${pending.framework.component}</div>` : "";
    const selectedText = pending.selectedText ? `<div class="ik-selected-text">"${pending.selectedText.slice(0, 80)}"</div>` : "";
    this.el.innerHTML = `
      <div class="ik-popup-header">
        <span class="ik-popup-element" title="${escHtml(pending.elementPath)}">${escHtml(pending.elementName)}</span>
        <button class="ik-popup-close" title="Cancel (Esc)">\u2715</button>
      </div>
      ${frameworkBadge}
      ${selectedText}
      <div class="ik-label">Intent</div>
      <div class="ik-row">
        <div class="ik-chip-group" data-group="intent">
          <button class="ik-chip selected" data-value="fix">Fix</button>
          <button class="ik-chip" data-value="change">Change</button>
          <button class="ik-chip" data-value="question">Question</button>
          <button class="ik-chip" data-value="approve">Approve</button>
        </div>
      </div>
      <div class="ik-label">Severity</div>
      <div class="ik-row">
        <div class="ik-chip-group" data-group="severity">
          <button class="ik-chip severity-blocking" data-value="blocking">Blocking</button>
          <button class="ik-chip severity-important selected" data-value="important">Important</button>
          <button class="ik-chip severity-suggestion" data-value="suggestion">Suggestion</button>
        </div>
      </div>
      <textarea class="ik-textarea" placeholder="Describe what you'd like changed\u2026" rows="3"></textarea>
      <div class="ik-popup-actions">
        <button class="ik-btn-secondary" data-action="cancel">Cancel</button>
        <button class="ik-btn-primary" data-action="submit" disabled>Add note</button>
      </div>
    `;
    this.textarea = this.el.querySelector("textarea");
    const submitBtn = this.el.querySelector('[data-action="submit"]');
    this.el.querySelectorAll('[data-group="intent"] .ik-chip').forEach((btn) => {
      btn.addEventListener("click", () => {
        this.el.querySelectorAll('[data-group="intent"] .ik-chip').forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.intent = btn.dataset.value;
      });
    });
    this.el.querySelectorAll('[data-group="severity"] .ik-chip').forEach((btn) => {
      btn.addEventListener("click", () => {
        this.el.querySelectorAll('[data-group="severity"] .ik-chip').forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.severity = btn.dataset.value;
      });
    });
    this.textarea.addEventListener("input", () => {
      submitBtn.disabled = this.textarea.value.trim().length === 0;
    });
    this.textarea.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!submitBtn.disabled) submitBtn.click();
      }
      if (e.key === "Escape") callbacks.onCancel();
    });
    this.el.querySelector('[data-action="cancel"]').addEventListener("click", () => {
      callbacks.onCancel();
      this.destroy();
    });
    this.el.querySelector(".ik-popup-close").addEventListener("click", () => {
      callbacks.onCancel();
      this.destroy();
    });
    submitBtn.addEventListener("click", () => {
      const comment = this.textarea.value.trim();
      if (!comment) return;
      callbacks.onSubmit({ comment, intent: this.intent, severity: this.severity });
      this.destroy();
    });
    document.body.appendChild(this.el);
    this.position(pending.x, pending.y);
    setTimeout(() => {
      document.addEventListener("mousedown", this.onOutsideClick, { once: true });
    }, 0);
    this.textarea.focus();
  }
  position(x, y) {
    if (!this.el) return;
    const rect = this.el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let left = x + 10;
    let top = y + 10;
    if (left + rect.width > vw - 10) left = x - rect.width - 10;
    if (top + rect.height > vh - 10) top = y - rect.height - 10;
    left = Math.max(10, left);
    top = Math.max(10, top);
    this.el.style.left = `${left}px`;
    this.el.style.top = `${top}px`;
  }
  destroy() {
    var _a;
    (_a = this.el) == null ? void 0 : _a.remove();
    this.el = null;
    document.removeEventListener("mousedown", this.onOutsideClick);
  }
};
function escHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function frameworkIcon(fw) {
  var _a;
  const icons = { livewire: "\u26A1", vue: "\u{1F49A}", svelte: "\u{1F9E1}" };
  return (_a = icons[fw]) != null ? _a : "\u{1F527}";
}

// src/ui/styles.ts
function injectStyles() {
  if (document.getElementById("instruckt-styles")) return;
  const style = document.createElement("style");
  style.id = "instruckt-styles";
  style.textContent = CSS_TEXT;
  document.head.appendChild(style);
}
var CSS_TEXT = (
  /* css */
  `
/* \u2500\u2500 Variables \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 Toolbar \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 Element highlight \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
.ik-highlight-overlay {
  position: fixed;
  pointer-events: none;
  z-index: 2147483644;
  border: 2px solid var(--ik-highlight-border);
  background: var(--ik-highlight);
  border-radius: 3px;
  transition: all 0.08s ease;
}

/* \u2500\u2500 Annotation markers \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 Annotation popup \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
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

/* \u2500\u2500 Cursor override when annotating \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */
body.ik-annotating * { cursor: crosshair !important; }
`
);

// src/selector.ts
function getElementSelector(el) {
  if (el.id) {
    return `#${CSS.escape(el.id)}`;
  }
  const path = [];
  let current = el;
  while (current && current !== document.documentElement) {
    const tag = current.tagName.toLowerCase();
    const parent = current.parentElement;
    if (!parent) {
      path.unshift(tag);
      break;
    }
    const classes = Array.from(current.classList).filter((c) => !c.match(/^(hover|focus|active|visited|is-|has-)/)).slice(0, 3);
    if (classes.length > 0) {
      const classSelector = `${tag}.${classes.map(CSS.escape).join(".")}`;
      const matches = parent.querySelectorAll(classSelector);
      if (matches.length === 1) {
        path.unshift(classSelector);
        break;
      }
    }
    const siblings = Array.from(parent.children).filter((c) => c.tagName === current.tagName);
    if (siblings.length === 1) {
      path.unshift(tag);
    } else {
      const index = siblings.indexOf(current) + 1;
      path.unshift(`${tag}:nth-of-type(${index})`);
    }
    current = parent;
  }
  return path.join(" > ");
}
function getElementName(el) {
  const wireModel = el.getAttribute("wire:model") || el.getAttribute("wire:click");
  if (wireModel) return `wire:${wireModel.split(".")[0]}`;
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;
  const id = el.id;
  if (id) return `#${id}`;
  const tag = el.tagName.toLowerCase();
  const role = el.getAttribute("role");
  if (role) return `${tag}[${role}]`;
  const firstClass = el.classList[0];
  if (firstClass) return `${tag}.${firstClass}`;
  return tag;
}
function getNearbyText(el) {
  const text = (el.textContent || "").trim().replace(/\s+/g, " ");
  return text.slice(0, 120);
}
function getCssClasses(el) {
  return Array.from(el.classList).filter((c) => !c.match(/^(instruckt-)/)).join(" ");
}
function getPageBoundingBox(el) {
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left + window.scrollX,
    y: rect.top + window.scrollY,
    width: rect.width,
    height: rect.height
  };
}

// src/adapters/livewire.ts
function isAvailable() {
  return typeof window.Livewire !== "undefined";
}
function detect(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    const wireId = node.getAttribute("wire:id");
    if (wireId) return wireId;
    node = node.parentElement;
  }
  return null;
}
function getContext(el) {
  var _a, _b;
  if (!isAvailable()) return null;
  const wireId = detect(el);
  if (!wireId) return null;
  const component = window.Livewire.find(wireId);
  if (!component) return null;
  const snapshotData = (_b = (_a = component.snapshot) == null ? void 0 : _a.data) != null ? _b : {};
  const data = {};
  for (const key of Object.keys(snapshotData)) {
    try {
      data[key] = component.get(key);
    } catch (e) {
    }
  }
  return {
    framework: "livewire",
    component: component.name,
    wire_id: wireId,
    data
  };
}

// src/adapters/vue.ts
function detect2(el) {
  var _a;
  let node = el;
  while (node && node !== document.documentElement) {
    const instance = (_a = node.__vueParentComponent) != null ? _a : node.__vue__;
    if (instance) return instance;
    node = node.parentElement;
  }
  return null;
}
function getContext2(el) {
  var _a, _b, _c, _d, _e, _f, _g, _h;
  const instance = detect2(el);
  if (!instance) return null;
  const name = (_h = (_g = (_e = (_c = (_a = instance.$options) == null ? void 0 : _a.name) != null ? _c : (_b = instance.$options) == null ? void 0 : _b.__name) != null ? _e : (_d = instance.type) == null ? void 0 : _d.name) != null ? _g : (_f = instance.type) == null ? void 0 : _f.__name) != null ? _h : "Anonymous";
  const data = {};
  if (instance.props) {
    Object.assign(data, instance.props);
  }
  if (instance.setupState) {
    for (const [key, value] of Object.entries(instance.setupState)) {
      if (!key.startsWith("_") && typeof value !== "function") {
        try {
          data[key] = JSON.parse(JSON.stringify(value));
        } catch (e) {
          data[key] = String(value);
        }
      }
    }
  }
  return {
    framework: "vue",
    component: name,
    component_uid: instance.uid !== void 0 ? String(instance.uid) : void 0,
    data
  };
}

// src/adapters/svelte.ts
function detect3(el) {
  let node = el;
  while (node && node !== document.documentElement) {
    if (node.__svelte_meta) return node.__svelte_meta;
    node = node.parentElement;
  }
  return null;
}
function getContext3(el) {
  var _a, _b, _c, _d;
  const meta = detect3(el);
  if (!meta) return null;
  const filePath = (_b = (_a = meta.loc) == null ? void 0 : _a.file) != null ? _b : "";
  const component = filePath ? (_d = (_c = filePath.split("/").pop()) == null ? void 0 : _c.replace(/\.svelte$/, "")) != null ? _d : "Unknown" : "Unknown";
  return {
    framework: "svelte",
    component,
    data: filePath ? { file: filePath } : void 0
  };
}

// src/instruckt.ts
var SESSION_KEY = "instruckt_session";
var Instruckt = class {
  constructor(config) {
    this.sse = null;
    this.toolbar = null;
    this.highlight = null;
    this.popup = null;
    this.annotations = [];
    this.session = null;
    this.isAnnotating = false;
    this.isFrozen = false;
    this.frozenStyleEl = null;
    // ── Event listeners ───────────────────────────────────────────
    this.boundMouseMove = this.onMouseMove.bind(this);
    this.boundMouseLeave = this.onMouseLeave.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.config = __spreadValues({
      adapters: ["livewire", "vue", "svelte"],
      theme: "auto",
      position: "bottom-right"
    }, config);
    this.api = new InstrucktApi(config.endpoint);
    this.init();
  }
  async init() {
    injectStyles();
    const theme = this.config.theme;
    if (theme !== "auto") {
      document.documentElement.setAttribute("data-instruckt-theme", theme);
    }
    this.toolbar = new Toolbar(this.config.position, {
      onToggleAnnotate: (active) => this.setAnnotating(active),
      onFreezeAnimations: (frozen) => this.setFrozen(frozen)
    });
    this.highlight = new ElementHighlight();
    this.popup = new AnnotationPopup();
    await this.connectSession();
    this.setupKeyboard();
  }
  // ── Session management ────────────────────────────────────────
  async connectSession() {
    var _a, _b, _c, _d;
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const data = await this.api.getSession(stored);
        this.session = data;
        this.annotations = (_a = data.annotations) != null ? _a : [];
        (_b = this.toolbar) == null ? void 0 : _b.setAnnotationCount(this.pendingCount());
        this.connectSSE(stored);
        return;
      } catch (e) {
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    try {
      this.session = await this.api.createSession(window.location.href);
      sessionStorage.setItem(SESSION_KEY, this.session.id);
      (_d = (_c = this.config).onSessionCreate) == null ? void 0 : _d.call(_c, this.session);
      this.connectSSE(this.session.id);
    } catch (e) {
      console.warn("[instruckt] Could not connect to server. Running in offline mode.");
    }
  }
  connectSSE(sessionId) {
    this.sse = new InstrucktSSE(this.config.endpoint, sessionId, (annotation) => {
      this.onAnnotationUpdated(annotation);
    });
    this.sse.connect();
  }
  // ── Annotation mode ───────────────────────────────────────────
  setAnnotating(active) {
    var _a;
    this.isAnnotating = active;
    if (active) {
      this.attachAnnotateListeners();
    } else {
      this.detachAnnotateListeners();
      (_a = this.highlight) == null ? void 0 : _a.hide();
    }
  }
  setFrozen(frozen) {
    var _a;
    this.isFrozen = frozen;
    if (frozen) {
      this.frozenStyleEl = document.createElement("style");
      this.frozenStyleEl.id = "instruckt-freeze";
      this.frozenStyleEl.textContent = `*, *::before, *::after {
        animation-play-state: paused !important;
        transition: none !important;
      }
      video { filter: none !important; }`;
      document.head.appendChild(this.frozenStyleEl);
    } else {
      (_a = this.frozenStyleEl) == null ? void 0 : _a.remove();
      this.frozenStyleEl = null;
    }
  }
  attachAnnotateListeners() {
    document.addEventListener("mousemove", this.boundMouseMove);
    document.addEventListener("mouseleave", this.boundMouseLeave);
    document.addEventListener("click", this.boundClick, true);
  }
  detachAnnotateListeners() {
    document.removeEventListener("mousemove", this.boundMouseMove);
    document.removeEventListener("mouseleave", this.boundMouseLeave);
    document.removeEventListener("click", this.boundClick, true);
  }
  onMouseMove(e) {
    var _a, _b;
    const target = e.target;
    if (this.isInstrucktElement(target)) {
      (_a = this.highlight) == null ? void 0 : _a.hide();
      return;
    }
    (_b = this.highlight) == null ? void 0 : _b.show(target);
  }
  onMouseLeave() {
    var _a;
    (_a = this.highlight) == null ? void 0 : _a.hide();
  }
  onClick(e) {
    var _a, _b;
    const target = e.target;
    if (this.isInstrucktElement(target)) return;
    e.preventDefault();
    e.stopPropagation();
    const elementPath = getElementSelector(target);
    const elementName = getElementName(target);
    const cssClasses = getCssClasses(target);
    const nearbyText = getNearbyText(target);
    const boundingBox = getPageBoundingBox(target);
    const selectedText = ((_a = window.getSelection()) == null ? void 0 : _a.toString().trim()) || void 0;
    const framework = this.detectFramework(target);
    const pending = {
      element: target,
      elementPath,
      elementName,
      cssClasses,
      boundingBox,
      x: e.clientX,
      y: e.clientY,
      selectedText,
      nearbyText: nearbyText || void 0,
      framework: framework != null ? framework : void 0
    };
    (_b = this.popup) == null ? void 0 : _b.show(pending, {
      onSubmit: (result) => this.submitAnnotation(pending, result),
      onCancel: () => {
      }
    });
  }
  isInstrucktElement(el) {
    return el.closest("[data-instruckt]") !== null;
  }
  // ── Framework detection ───────────────────────────────────────
  detectFramework(el) {
    var _a;
    const adapters = (_a = this.config.adapters) != null ? _a : [];
    if (adapters.includes("livewire")) {
      const ctx = getContext(el);
      if (ctx) return ctx;
    }
    if (adapters.includes("vue")) {
      const ctx = getContext2(el);
      if (ctx) return ctx;
    }
    if (adapters.includes("svelte")) {
      const ctx = getContext3(el);
      if (ctx) return ctx;
    }
    return null;
  }
  // ── Submitting annotations ────────────────────────────────────
  async submitAnnotation(pending, result) {
    var _a, _b, _c;
    if (!this.session) {
      await this.connectSession();
      if (!this.session) {
        console.warn("[instruckt] No session \u2014 annotation not saved.");
        return;
      }
    }
    const data = {
      x: pending.x / window.innerWidth * 100,
      y: pending.y + window.scrollY,
      comment: result.comment,
      element: pending.elementName,
      elementPath: pending.elementPath,
      cssClasses: pending.cssClasses,
      boundingBox: pending.boundingBox,
      selectedText: pending.selectedText,
      nearbyText: pending.nearbyText,
      intent: result.intent,
      severity: result.severity,
      framework: pending.framework,
      url: window.location.href
    };
    try {
      const annotation = await this.api.addAnnotation(this.session.id, data);
      this.annotations.push(annotation);
      (_a = this.toolbar) == null ? void 0 : _a.setAnnotationCount(this.pendingCount());
      (_c = (_b = this.config).onAnnotationAdd) == null ? void 0 : _c.call(_b, annotation);
    } catch (err) {
      console.error("[instruckt] Failed to save annotation:", err);
    }
  }
  // ── Incoming agent events ─────────────────────────────────────
  onAnnotationUpdated(updated) {
    var _a, _b, _c;
    const idx = this.annotations.findIndex((a) => a.id === updated.id);
    if (idx >= 0) {
      this.annotations[idx] = updated;
    } else {
      this.annotations.push(updated);
    }
    (_a = this.toolbar) == null ? void 0 : _a.setAnnotationCount(this.pendingCount());
    (_c = (_b = this.config).onAnnotationResolve) == null ? void 0 : _c.call(_b, updated);
  }
  // ── Keyboard shortcuts ────────────────────────────────────────
  setupKeyboard() {
    document.addEventListener("keydown", (e) => {
      var _a, _b, _c;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) return;
      if (e.target.isContentEditable) return;
      if (e.key === "a" && !e.metaKey && !e.ctrlKey) {
        const next = !this.isAnnotating;
        (_a = this.toolbar) == null ? void 0 : _a.setMode(next ? "annotating" : "idle");
        this.setAnnotating(next);
      }
      if (e.key === "f" && !e.metaKey && !e.ctrlKey) {
        const next = !this.isFrozen;
        (_b = this.toolbar) == null ? void 0 : _b.setMode(next ? "frozen" : "idle");
        this.setFrozen(next);
      }
      if (e.key === "Escape") {
        if (this.isAnnotating) {
          (_c = this.toolbar) == null ? void 0 : _c.setMode("idle");
          this.setAnnotating(false);
        }
      }
    });
  }
  // ── Helpers ───────────────────────────────────────────────────
  pendingCount() {
    return this.annotations.filter((a) => a.status === "pending" || a.status === "acknowledged").length;
  }
  /** Programmatic API: get all current annotations */
  getAnnotations() {
    return [...this.annotations];
  }
  /** Programmatic API: get current session */
  getSession() {
    return this.session;
  }
  /** Programmatic API: destroy and clean up */
  destroy() {
    var _a, _b, _c, _d;
    this.setAnnotating(false);
    this.setFrozen(false);
    (_a = this.sse) == null ? void 0 : _a.disconnect();
    (_b = this.toolbar) == null ? void 0 : _b.destroy();
    (_c = this.highlight) == null ? void 0 : _c.destroy();
    (_d = this.popup) == null ? void 0 : _d.destroy();
  }
};

// src/index.ts
function init(config) {
  return new Instruckt(config);
}
export {
  Instruckt,
  init
};
//# sourceMappingURL=instruckt.esm.js.map