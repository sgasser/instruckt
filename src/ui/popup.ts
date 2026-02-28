import type { AnnotationIntent, AnnotationSeverity, PendingAnnotation } from '../types'

interface PopupResult {
  comment: string
  intent: AnnotationIntent
  severity: AnnotationSeverity
}

interface PopupCallbacks {
  onSubmit: (result: PopupResult) => void
  onCancel: () => void
}

/** Annotation popup — renders a form for comment, intent, severity */
export class AnnotationPopup {
  private el: HTMLElement | null = null
  private intent: AnnotationIntent = 'fix'
  private severity: AnnotationSeverity = 'important'
  private textarea: HTMLTextAreaElement | null = null

  show(pending: PendingAnnotation, callbacks: PopupCallbacks): void {
    this.destroy()

    this.el = document.createElement('div')
    this.el.id = 'instruckt-popup'
    this.el.setAttribute('data-instruckt', 'popup')

    this.intent = 'fix'
    this.severity = 'important'

    const frameworkBadge = pending.framework
      ? `<div class="ik-framework-badge">${frameworkIcon(pending.framework.framework)} ${pending.framework.component}</div>`
      : ''

    const selectedText = pending.selectedText
      ? `<div class="ik-selected-text">"${pending.selectedText.slice(0, 80)}"</div>`
      : ''

    this.el.innerHTML = `
      <div class="ik-popup-header">
        <span class="ik-popup-element" title="${escHtml(pending.elementPath)}">${escHtml(pending.elementName)}</span>
        <button class="ik-popup-close" title="Cancel (Esc)">✕</button>
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
      <textarea class="ik-textarea" placeholder="Describe what you'd like changed…" rows="3"></textarea>
      <div class="ik-popup-actions">
        <button class="ik-btn-secondary" data-action="cancel">Cancel</button>
        <button class="ik-btn-primary" data-action="submit" disabled>Add note</button>
      </div>
    `

    this.textarea = this.el.querySelector('textarea')!
    const submitBtn = this.el.querySelector<HTMLButtonElement>('[data-action="submit"]')!

    // Chip selection
    this.el.querySelectorAll<HTMLButtonElement>('[data-group="intent"] .ik-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el!.querySelectorAll('[data-group="intent"] .ik-chip').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        this.intent = btn.dataset.value as AnnotationIntent
      })
    })

    this.el.querySelectorAll<HTMLButtonElement>('[data-group="severity"] .ik-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        this.el!.querySelectorAll('[data-group="severity"] .ik-chip').forEach(b => b.classList.remove('selected'))
        btn.classList.add('selected')
        this.severity = btn.dataset.value as AnnotationSeverity
      })
    })

    // Textarea
    this.textarea.addEventListener('input', () => {
      submitBtn.disabled = this.textarea!.value.trim().length === 0
    })

    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (!submitBtn.disabled) submitBtn.click()
      }
      if (e.key === 'Escape') callbacks.onCancel()
    })

    // Actions
    this.el.querySelector('[data-action="cancel"]')!.addEventListener('click', () => {
      callbacks.onCancel()
      this.destroy()
    })

    this.el.querySelector('.ik-popup-close')!.addEventListener('click', () => {
      callbacks.onCancel()
      this.destroy()
    })

    submitBtn.addEventListener('click', () => {
      const comment = this.textarea!.value.trim()
      if (!comment) return
      callbacks.onSubmit({ comment, intent: this.intent, severity: this.severity })
      this.destroy()
    })

    // Position near the click point, keeping within viewport
    document.body.appendChild(this.el)
    this.position(pending.x, pending.y)

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('mousedown', this.onOutsideClick, { once: true })
    }, 0)

    this.textarea.focus()
  }

  private position(x: number, y: number): void {
    if (!this.el) return
    const rect = this.el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    let left = x + 10
    let top = y + 10

    if (left + rect.width > vw - 10) left = x - rect.width - 10
    if (top + rect.height > vh - 10) top = y - rect.height - 10

    left = Math.max(10, left)
    top = Math.max(10, top)

    this.el.style.left = `${left}px`
    this.el.style.top = `${top}px`
  }

  private onOutsideClick = (e: MouseEvent): void => {
    if (this.el && !this.el.contains(e.target as Node)) {
      this.destroy()
    }
  }

  destroy(): void {
    this.el?.remove()
    this.el = null
    document.removeEventListener('mousedown', this.onOutsideClick)
  }
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function frameworkIcon(fw: string): string {
  const icons: Record<string, string> = { livewire: '⚡', vue: '💚', svelte: '🧡' }
  return icons[fw] ?? '🔧'
}
