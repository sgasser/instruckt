/* instruckt v0.1.0 | MIT */
"use strict";var Instruckt=(()=>{var g=Object.defineProperty;var N=Object.getOwnPropertyDescriptor;var F=Object.getOwnPropertyNames,w=Object.getOwnPropertySymbols;var A=Object.prototype.hasOwnProperty,j=Object.prototype.propertyIsEnumerable;var E=(o,t,e)=>t in o?g(o,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):o[t]=e,S=(o,t)=>{for(var e in t||(t={}))A.call(t,e)&&E(o,e,t[e]);if(w)for(var e of w(t))j.call(t,e)&&E(o,e,t[e]);return o};var O=(o,t)=>{for(var e in t)g(o,e,{get:t[e],enumerable:!0})},H=(o,t,e,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of F(t))!A.call(o,i)&&i!==e&&g(o,i,{get:()=>t[i],enumerable:!(n=N(t,i))||n.enumerable});return o};var R=o=>H(g({},"__esModule",{value:!0}),o);var Q={};O(Q,{Instruckt:()=>m,init:()=>G});var v=class{constructor(t){this.endpoint=t}async createSession(t){let e=await fetch(`${this.endpoint}/sessions`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({url:t})});if(!e.ok)throw new Error(`instruckt: failed to create session (${e.status})`);return e.json()}async getSession(t){let e=await fetch(`${this.endpoint}/sessions/${t}`,{headers:{Accept:"application/json"}});if(!e.ok)throw new Error(`instruckt: failed to get session (${e.status})`);return e.json()}async addAnnotation(t,e){let n=await fetch(`${this.endpoint}/sessions/${t}/annotations`,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)});if(!n.ok)throw new Error(`instruckt: failed to add annotation (${n.status})`);return n.json()}async updateAnnotation(t,e){let n=await fetch(`${this.endpoint}/annotations/${t}`,{method:"PATCH",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(e)});if(!n.ok)throw new Error(`instruckt: failed to update annotation (${n.status})`);return n.json()}};var f=class{constructor(t,e,n){this.endpoint=t;this.sessionId=e;this.onUpdate=n;this.source=null}connect(){this.source||(this.source=new EventSource(`${this.endpoint}/sessions/${this.sessionId}/events`),this.source.addEventListener("annotation.updated",t=>{try{let e=JSON.parse(t.data);this.onUpdate(e)}catch(e){}}),this.source.onerror=()=>{})}disconnect(){var t;(t=this.source)==null||t.close(),this.source=null}};var k=class{constructor(t,e){this.position=t;this.callbacks=e;this.annotationCount=0;this.mode="idle";this.dragging=!1;this.dragOffset={x:0,y:0};this.build(),this.setupDrag()}build(){this.el=document.createElement("div"),this.el.id="instruckt-toolbar",this.el.setAttribute("data-instruckt","toolbar"),this.annotateBtn=this.makeBtn("\u270F\uFE0F","Annotate elements (A)",()=>{let e=this.mode!=="annotating";this.setMode(e?"annotating":"idle"),this.callbacks.onToggleAnnotate(e)}),this.annotateBtn.setAttribute("data-action","annotate"),this.freezeBtn=this.makeBtn("\u23F8","Freeze animations (F)",()=>{let e=this.mode!=="frozen";this.setMode(e?"frozen":"idle"),this.callbacks.onFreezeAnimations(e)});let t=document.createElement("div");t.className="ik-divider",this.el.append(this.annotateBtn,t,this.freezeBtn),this.applyPosition(),document.body.appendChild(this.el)}makeBtn(t,e,n){let i=document.createElement("button");return i.className="ik-btn",i.title=e,i.setAttribute("aria-label",e),i.innerHTML=t,i.addEventListener("click",r=>{r.stopPropagation(),n()}),i}applyPosition(){let t="16px",e=this.position;this.el.style.bottom=e.includes("bottom")?t:"auto",this.el.style.top=e.includes("top")?t:"auto",this.el.style.right=e.includes("right")?t:"auto",this.el.style.left=e.includes("left")?t:"auto"}setupDrag(){this.el.addEventListener("mousedown",t=>{if(t.target.closest(".ik-btn"))return;this.dragging=!0;let e=this.el.getBoundingClientRect();this.dragOffset.x=t.clientX-e.left,this.dragOffset.y=t.clientY-e.top,this.el.style.transition="none",t.preventDefault()}),document.addEventListener("mousemove",t=>{if(!this.dragging)return;let e=t.clientX-this.dragOffset.x,n=t.clientY-this.dragOffset.y;this.el.style.left=`${e}px`,this.el.style.top=`${n}px`,this.el.style.right="auto",this.el.style.bottom="auto"}),document.addEventListener("mouseup",()=>{this.dragging=!1})}setMode(t){this.mode=t,this.annotateBtn.classList.toggle("active",t==="annotating"),this.freezeBtn.classList.toggle("active",t==="frozen"),document.body.classList.toggle("ik-annotating",t==="annotating")}setAnnotationCount(t){this.annotationCount=t;let e=this.annotateBtn.querySelector(".ik-badge");t>0?(e||(e=document.createElement("span"),e.className="ik-badge",this.annotateBtn.style.position="relative",this.annotateBtn.appendChild(e)),e.textContent=t>99?"99+":String(t)):e==null||e.remove()}destroy(){this.el.remove(),document.body.classList.remove("ik-annotating")}};var b=class{constructor(){this.overlay=document.createElement("div"),this.overlay.className="ik-highlight-overlay",this.overlay.style.display="none",document.body.appendChild(this.overlay)}show(t){let e=t.getBoundingClientRect();if(e.width===0&&e.height===0){this.hide();return}this.overlay.style.display="block",this.overlay.style.left=`${e.left}px`,this.overlay.style.top=`${e.top}px`,this.overlay.style.width=`${e.width}px`,this.overlay.style.height=`${e.height}px`}hide(){this.overlay.style.display="none"}destroy(){this.overlay.remove()}};var x=class{constructor(){this.el=null;this.intent="fix";this.severity="important";this.textarea=null;this.onOutsideClick=t=>{this.el&&!this.el.contains(t.target)&&this.destroy()}}show(t,e){this.destroy(),this.el=document.createElement("div"),this.el.id="instruckt-popup",this.el.setAttribute("data-instruckt","popup"),this.intent="fix",this.severity="important";let n=t.framework?`<div class="ik-framework-badge">${q(t.framework.framework)} ${t.framework.component}</div>`:"",i=t.selectedText?`<div class="ik-selected-text">"${t.selectedText.slice(0,80)}"</div>`:"";this.el.innerHTML=`
      <div class="ik-popup-header">
        <span class="ik-popup-element" title="${C(t.elementPath)}">${C(t.elementName)}</span>
        <button class="ik-popup-close" title="Cancel (Esc)">\u2715</button>
      </div>
      ${n}
      ${i}
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
    `,this.textarea=this.el.querySelector("textarea");let r=this.el.querySelector('[data-action="submit"]');this.el.querySelectorAll('[data-group="intent"] .ik-chip').forEach(s=>{s.addEventListener("click",()=>{this.el.querySelectorAll('[data-group="intent"] .ik-chip').forEach(a=>a.classList.remove("selected")),s.classList.add("selected"),this.intent=s.dataset.value})}),this.el.querySelectorAll('[data-group="severity"] .ik-chip').forEach(s=>{s.addEventListener("click",()=>{this.el.querySelectorAll('[data-group="severity"] .ik-chip').forEach(a=>a.classList.remove("selected")),s.classList.add("selected"),this.severity=s.dataset.value})}),this.textarea.addEventListener("input",()=>{r.disabled=this.textarea.value.trim().length===0}),this.textarea.addEventListener("keydown",s=>{s.key==="Enter"&&!s.shiftKey&&(s.preventDefault(),r.disabled||r.click()),s.key==="Escape"&&e.onCancel()}),this.el.querySelector('[data-action="cancel"]').addEventListener("click",()=>{e.onCancel(),this.destroy()}),this.el.querySelector(".ik-popup-close").addEventListener("click",()=>{e.onCancel(),this.destroy()}),r.addEventListener("click",()=>{let s=this.textarea.value.trim();s&&(e.onSubmit({comment:s,intent:this.intent,severity:this.severity}),this.destroy())}),document.body.appendChild(this.el),this.position(t.x,t.y),setTimeout(()=>{document.addEventListener("mousedown",this.onOutsideClick,{once:!0})},0),this.textarea.focus()}position(t,e){if(!this.el)return;let n=this.el.getBoundingClientRect(),i=window.innerWidth,r=window.innerHeight,s=t+10,a=e+10;s+n.width>i-10&&(s=t-n.width-10),a+n.height>r-10&&(a=e-n.height-10),s=Math.max(10,s),a=Math.max(10,a),this.el.style.left=`${s}px`,this.el.style.top=`${a}px`}destroy(){var t;(t=this.el)==null||t.remove(),this.el=null,document.removeEventListener("mousedown",this.onOutsideClick)}};function C(o){return o.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function q(o){var e;return(e={livewire:"\u26A1",vue:"\u{1F49A}",svelte:"\u{1F9E1}"}[o])!=null?e:"\u{1F527}"}function L(){if(document.getElementById("instruckt-styles"))return;let o=document.createElement("style");o.id="instruckt-styles",o.textContent=V,document.head.appendChild(o)}var V=`
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
`;function T(o){if(o.id)return`#${CSS.escape(o.id)}`;let t=[],e=o;for(;e&&e!==document.documentElement;){let n=e.tagName.toLowerCase(),i=e.parentElement;if(!i){t.unshift(n);break}let r=Array.from(e.classList).filter(a=>!a.match(/^(hover|focus|active|visited|is-|has-)/)).slice(0,3);if(r.length>0){let a=`${n}.${r.map(CSS.escape).join(".")}`;if(i.querySelectorAll(a).length===1){t.unshift(a);break}}let s=Array.from(i.children).filter(a=>a.tagName===e.tagName);if(s.length===1)t.unshift(n);else{let a=s.indexOf(e)+1;t.unshift(`${n}:nth-of-type(${a})`)}e=i}return t.join(" > ")}function M(o){let t=o.getAttribute("wire:model")||o.getAttribute("wire:click");if(t)return`wire:${t.split(".")[0]}`;let e=o.getAttribute("aria-label");if(e)return e;let n=o.id;if(n)return`#${n}`;let i=o.tagName.toLowerCase(),r=o.getAttribute("role");if(r)return`${i}[${r}]`;let s=o.classList[0];return s?`${i}.${s}`:i}function z(o){return(o.textContent||"").trim().replace(/\s+/g," ").slice(0,120)}function $(o){return Array.from(o.classList).filter(t=>!t.match(/^(instruckt-)/)).join(" ")}function I(o){let t=o.getBoundingClientRect();return{x:t.left+window.scrollX,y:t.top+window.scrollY,width:t.width,height:t.height}}function K(){return typeof window.Livewire!="undefined"}function U(o){let t=o;for(;t&&t!==document.documentElement;){let e=t.getAttribute("wire:id");if(e)return e;t=t.parentElement}return null}function _(o){var r,s;if(!K())return null;let t=U(o);if(!t)return null;let e=window.Livewire.find(t);if(!e)return null;let n=(s=(r=e.snapshot)==null?void 0:r.data)!=null?s:{},i={};for(let a of Object.keys(n))try{i[a]=e.get(a)}catch(l){}return{framework:"livewire",component:e.name,wire_id:t,data:i}}function D(o){var e;let t=o;for(;t&&t!==document.documentElement;){let n=(e=t.__vueParentComponent)!=null?e:t.__vue__;if(n)return n;t=t.parentElement}return null}function B(o){var i,r,s,a,l,c,u,p;let t=D(o);if(!t)return null;let e=(p=(u=(l=(s=(i=t.$options)==null?void 0:i.name)!=null?s:(r=t.$options)==null?void 0:r.__name)!=null?l:(a=t.type)==null?void 0:a.name)!=null?u:(c=t.type)==null?void 0:c.__name)!=null?p:"Anonymous",n={};if(t.props&&Object.assign(n,t.props),t.setupState){for(let[d,h]of Object.entries(t.setupState))if(!d.startsWith("_")&&typeof h!="function")try{n[d]=JSON.parse(JSON.stringify(h))}catch(Z){n[d]=String(h)}}return{framework:"vue",component:e,component_uid:t.uid!==void 0?String(t.uid):void 0,data:n}}function X(o){let t=o;for(;t&&t!==document.documentElement;){if(t.__svelte_meta)return t.__svelte_meta;t=t.parentElement}return null}function P(o){var i,r,s,a;let t=X(o);if(!t)return null;let e=(r=(i=t.loc)==null?void 0:i.file)!=null?r:"";return{framework:"svelte",component:e&&(a=(s=e.split("/").pop())==null?void 0:s.replace(/\.svelte$/,""))!=null?a:"Unknown",data:e?{file:e}:void 0}}var y="instruckt_session",m=class{constructor(t){this.sse=null;this.toolbar=null;this.highlight=null;this.popup=null;this.annotations=[];this.session=null;this.isAnnotating=!1;this.isFrozen=!1;this.frozenStyleEl=null;this.boundMouseMove=this.onMouseMove.bind(this);this.boundMouseLeave=this.onMouseLeave.bind(this);this.boundClick=this.onClick.bind(this);this.config=S({adapters:["livewire","vue","svelte"],theme:"auto",position:"bottom-right"},t),this.api=new v(t.endpoint),this.init()}async init(){L();let t=this.config.theme;t!=="auto"&&document.documentElement.setAttribute("data-instruckt-theme",t),this.toolbar=new k(this.config.position,{onToggleAnnotate:e=>this.setAnnotating(e),onFreezeAnimations:e=>this.setFrozen(e)}),this.highlight=new b,this.popup=new x,await this.connectSession(),this.setupKeyboard()}async connectSession(){var e,n,i,r;let t=sessionStorage.getItem(y);if(t)try{let s=await this.api.getSession(t);this.session=s,this.annotations=(e=s.annotations)!=null?e:[],(n=this.toolbar)==null||n.setAnnotationCount(this.pendingCount()),this.connectSSE(t);return}catch(s){sessionStorage.removeItem(y)}try{this.session=await this.api.createSession(window.location.href),sessionStorage.setItem(y,this.session.id),(r=(i=this.config).onSessionCreate)==null||r.call(i,this.session),this.connectSSE(this.session.id)}catch(s){console.warn("[instruckt] Could not connect to server. Running in offline mode.")}}connectSSE(t){this.sse=new f(this.config.endpoint,t,e=>{this.onAnnotationUpdated(e)}),this.sse.connect()}setAnnotating(t){var e;this.isAnnotating=t,t?this.attachAnnotateListeners():(this.detachAnnotateListeners(),(e=this.highlight)==null||e.hide())}setFrozen(t){var e;this.isFrozen=t,t?(this.frozenStyleEl=document.createElement("style"),this.frozenStyleEl.id="instruckt-freeze",this.frozenStyleEl.textContent=`*, *::before, *::after {
        animation-play-state: paused !important;
        transition: none !important;
      }
      video { filter: none !important; }`,document.head.appendChild(this.frozenStyleEl)):((e=this.frozenStyleEl)==null||e.remove(),this.frozenStyleEl=null)}attachAnnotateListeners(){document.addEventListener("mousemove",this.boundMouseMove),document.addEventListener("mouseleave",this.boundMouseLeave),document.addEventListener("click",this.boundClick,!0)}detachAnnotateListeners(){document.removeEventListener("mousemove",this.boundMouseMove),document.removeEventListener("mouseleave",this.boundMouseLeave),document.removeEventListener("click",this.boundClick,!0)}onMouseMove(t){var n,i;let e=t.target;if(this.isInstrucktElement(e)){(n=this.highlight)==null||n.hide();return}(i=this.highlight)==null||i.show(e)}onMouseLeave(){var t;(t=this.highlight)==null||t.hide()}onClick(t){var p,d;let e=t.target;if(this.isInstrucktElement(e))return;t.preventDefault(),t.stopPropagation();let n=T(e),i=M(e),r=$(e),s=z(e),a=I(e),l=((p=window.getSelection())==null?void 0:p.toString().trim())||void 0,c=this.detectFramework(e),u={element:e,elementPath:n,elementName:i,cssClasses:r,boundingBox:a,x:t.clientX,y:t.clientY,selectedText:l,nearbyText:s||void 0,framework:c!=null?c:void 0};(d=this.popup)==null||d.show(u,{onSubmit:h=>this.submitAnnotation(u,h),onCancel:()=>{}})}isInstrucktElement(t){return t.closest("[data-instruckt]")!==null}detectFramework(t){var n;let e=(n=this.config.adapters)!=null?n:[];if(e.includes("livewire")){let i=_(t);if(i)return i}if(e.includes("vue")){let i=B(t);if(i)return i}if(e.includes("svelte")){let i=P(t);if(i)return i}return null}async submitAnnotation(t,e){var i,r,s;if(!this.session&&(await this.connectSession(),!this.session)){console.warn("[instruckt] No session \u2014 annotation not saved.");return}let n={x:t.x/window.innerWidth*100,y:t.y+window.scrollY,comment:e.comment,element:t.elementName,elementPath:t.elementPath,cssClasses:t.cssClasses,boundingBox:t.boundingBox,selectedText:t.selectedText,nearbyText:t.nearbyText,intent:e.intent,severity:e.severity,framework:t.framework,url:window.location.href};try{let a=await this.api.addAnnotation(this.session.id,n);this.annotations.push(a),(i=this.toolbar)==null||i.setAnnotationCount(this.pendingCount()),(s=(r=this.config).onAnnotationAdd)==null||s.call(r,a)}catch(a){console.error("[instruckt] Failed to save annotation:",a)}}onAnnotationUpdated(t){var n,i,r;let e=this.annotations.findIndex(s=>s.id===t.id);e>=0?this.annotations[e]=t:this.annotations.push(t),(n=this.toolbar)==null||n.setAnnotationCount(this.pendingCount()),(r=(i=this.config).onAnnotationResolve)==null||r.call(i,t)}setupKeyboard(){document.addEventListener("keydown",t=>{var e,n,i;if(!["INPUT","TEXTAREA","SELECT"].includes(t.target.tagName)&&!t.target.isContentEditable){if(t.key==="a"&&!t.metaKey&&!t.ctrlKey){let r=!this.isAnnotating;(e=this.toolbar)==null||e.setMode(r?"annotating":"idle"),this.setAnnotating(r)}if(t.key==="f"&&!t.metaKey&&!t.ctrlKey){let r=!this.isFrozen;(n=this.toolbar)==null||n.setMode(r?"frozen":"idle"),this.setFrozen(r)}t.key==="Escape"&&this.isAnnotating&&((i=this.toolbar)==null||i.setMode("idle"),this.setAnnotating(!1))}})}pendingCount(){return this.annotations.filter(t=>t.status==="pending"||t.status==="acknowledged").length}getAnnotations(){return[...this.annotations]}getSession(){return this.session}destroy(){var t,e,n,i;this.setAnnotating(!1),this.setFrozen(!1),(t=this.sse)==null||t.disconnect(),(e=this.toolbar)==null||e.destroy(),(n=this.highlight)==null||n.destroy(),(i=this.popup)==null||i.destroy()}};function G(o){return new m(o)}return R(Q);})();
//# sourceMappingURL=instruckt.iife.js.map