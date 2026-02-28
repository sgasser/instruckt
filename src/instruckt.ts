import type { Annotation, InstrucktConfig, PendingAnnotation, Session } from './types'
import { InstrucktApi } from './api'
import { InstrucktSSE } from './sse'
import { Toolbar } from './ui/toolbar'
import { ElementHighlight } from './ui/highlight'
import { AnnotationPopup } from './ui/popup'
import { injectStyles } from './ui/styles'
import { getElementSelector, getElementName, getNearbyText, getCssClasses, getPageBoundingBox } from './selector'
import * as livewireAdapter from './adapters/livewire'
import * as vueAdapter from './adapters/vue'
import * as svelteAdapter from './adapters/svelte'

const SESSION_KEY = 'instruckt_session'

export class Instruckt {
  private config: Required<Pick<InstrucktConfig, 'endpoint' | 'theme' | 'position'>> & InstrucktConfig
  private api: InstrucktApi
  private sse: InstrucktSSE | null = null
  private toolbar: Toolbar | null = null
  private highlight: ElementHighlight | null = null
  private popup: AnnotationPopup | null = null
  private annotations: Annotation[] = []
  private session: Session | null = null
  private isAnnotating = false
  private isFrozen = false
  private frozenStyleEl: HTMLStyleElement | null = null

  constructor(config: InstrucktConfig) {
    this.config = {
      adapters: ['livewire', 'vue', 'svelte'],
      theme: 'auto',
      position: 'bottom-right',
      ...config,
    }

    this.api = new InstrucktApi(config.endpoint)
    this.init()
  }

  private async init(): Promise<void> {
    injectStyles()

    // Apply theme data attribute for CSS variable switching
    const theme = this.config.theme
    if (theme !== 'auto') {
      document.documentElement.setAttribute('data-instruckt-theme', theme)
    }

    this.toolbar = new Toolbar(this.config.position, {
      onToggleAnnotate: (active) => this.setAnnotating(active),
      onFreezeAnimations: (frozen) => this.setFrozen(frozen),
    })

    this.highlight = new ElementHighlight()
    this.popup = new AnnotationPopup()

    await this.connectSession()
    this.setupKeyboard()
  }

  // ── Session management ────────────────────────────────────────

  private async connectSession(): Promise<void> {
    const stored = sessionStorage.getItem(SESSION_KEY)

    if (stored) {
      try {
        const data = await this.api.getSession(stored)
        this.session = data
        this.annotations = data.annotations ?? []
        this.toolbar?.setAnnotationCount(this.pendingCount())
        this.connectSSE(stored)
        return
      } catch {
        sessionStorage.removeItem(SESSION_KEY)
      }
    }

    try {
      this.session = await this.api.createSession(window.location.href)
      sessionStorage.setItem(SESSION_KEY, this.session.id)
      this.config.onSessionCreate?.(this.session)
      this.connectSSE(this.session.id)
    } catch {
      console.warn('[instruckt] Could not connect to server. Running in offline mode.')
    }
  }

  private connectSSE(sessionId: string): void {
    this.sse = new InstrucktSSE(this.config.endpoint, sessionId, (annotation) => {
      this.onAnnotationUpdated(annotation)
    })
    this.sse.connect()
  }

  // ── Annotation mode ───────────────────────────────────────────

  private setAnnotating(active: boolean): void {
    this.isAnnotating = active
    if (active) {
      this.attachAnnotateListeners()
    } else {
      this.detachAnnotateListeners()
      this.highlight?.hide()
    }
  }

  private setFrozen(frozen: boolean): void {
    this.isFrozen = frozen
    if (frozen) {
      this.frozenStyleEl = document.createElement('style')
      this.frozenStyleEl.id = 'instruckt-freeze'
      this.frozenStyleEl.textContent = `*, *::before, *::after {
        animation-play-state: paused !important;
        transition: none !important;
      }
      video { filter: none !important; }`
      document.head.appendChild(this.frozenStyleEl)
    } else {
      this.frozenStyleEl?.remove()
      this.frozenStyleEl = null
    }
  }

  // ── Event listeners ───────────────────────────────────────────

  private boundMouseMove = this.onMouseMove.bind(this)
  private boundMouseLeave = this.onMouseLeave.bind(this)
  private boundClick = this.onClick.bind(this)

  private attachAnnotateListeners(): void {
    document.addEventListener('mousemove', this.boundMouseMove)
    document.addEventListener('mouseleave', this.boundMouseLeave)
    document.addEventListener('click', this.boundClick, true)
  }

  private detachAnnotateListeners(): void {
    document.removeEventListener('mousemove', this.boundMouseMove)
    document.removeEventListener('mouseleave', this.boundMouseLeave)
    document.removeEventListener('click', this.boundClick, true)
  }

  private onMouseMove(e: MouseEvent): void {
    const target = e.target as Element
    if (this.isInstrucktElement(target)) {
      this.highlight?.hide()
      return
    }
    this.highlight?.show(target)
  }

  private onMouseLeave(): void {
    this.highlight?.hide()
  }

  private onClick(e: MouseEvent): void {
    const target = e.target as Element
    if (this.isInstrucktElement(target)) return

    e.preventDefault()
    e.stopPropagation()

    const elementPath = getElementSelector(target)
    const elementName = getElementName(target)
    const cssClasses = getCssClasses(target)
    const nearbyText = getNearbyText(target)
    const boundingBox = getPageBoundingBox(target)
    const selectedText = window.getSelection()?.toString().trim() || undefined

    const framework = this.detectFramework(target)

    const pending: PendingAnnotation = {
      element: target,
      elementPath,
      elementName,
      cssClasses,
      boundingBox,
      x: e.clientX,
      y: e.clientY,
      selectedText,
      nearbyText: nearbyText || undefined,
      framework: framework ?? undefined,
    }

    this.popup?.show(pending, {
      onSubmit: (result) => this.submitAnnotation(pending, result),
      onCancel: () => {},
    })
  }

  private isInstrucktElement(el: Element): boolean {
    return el.closest('[data-instruckt]') !== null
  }

  // ── Framework detection ───────────────────────────────────────

  private detectFramework(el: Element) {
    const adapters = this.config.adapters ?? []

    if (adapters.includes('livewire')) {
      const ctx = livewireAdapter.getContext(el)
      if (ctx) return ctx
    }

    if (adapters.includes('vue')) {
      const ctx = vueAdapter.getContext(el)
      if (ctx) return ctx
    }

    if (adapters.includes('svelte')) {
      const ctx = svelteAdapter.getContext(el)
      if (ctx) return ctx
    }

    return null
  }

  // ── Submitting annotations ────────────────────────────────────

  private async submitAnnotation(
    pending: PendingAnnotation,
    result: { comment: string; intent: 'fix' | 'change' | 'question' | 'approve'; severity: 'blocking' | 'important' | 'suggestion' },
  ): Promise<void> {
    if (!this.session) {
      await this.connectSession()
      if (!this.session) {
        console.warn('[instruckt] No session — annotation not saved.')
        return
      }
    }

    const data = {
      x: (pending.x / window.innerWidth) * 100,
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
      url: window.location.href,
    }

    try {
      const annotation = await this.api.addAnnotation(this.session.id, data)
      this.annotations.push(annotation)
      this.toolbar?.setAnnotationCount(this.pendingCount())
      this.config.onAnnotationAdd?.(annotation)
    } catch (err) {
      console.error('[instruckt] Failed to save annotation:', err)
    }
  }

  // ── Incoming agent events ─────────────────────────────────────

  private onAnnotationUpdated(updated: Annotation): void {
    const idx = this.annotations.findIndex(a => a.id === updated.id)
    if (idx >= 0) {
      this.annotations[idx] = updated
    } else {
      this.annotations.push(updated)
    }
    this.toolbar?.setAnnotationCount(this.pendingCount())
    this.config.onAnnotationResolve?.(updated)
  }

  // ── Keyboard shortcuts ────────────────────────────────────────

  private setupKeyboard(): void {
    document.addEventListener('keydown', (e) => {
      // Ignore when typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as Element).tagName)) return
      if ((e.target as HTMLElement).isContentEditable) return

      if (e.key === 'a' && !e.metaKey && !e.ctrlKey) {
        const next = !this.isAnnotating
        this.toolbar?.setMode(next ? 'annotating' : 'idle')
        this.setAnnotating(next)
      }

      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        const next = !this.isFrozen
        this.toolbar?.setMode(next ? 'frozen' : 'idle')
        this.setFrozen(next)
      }

      if (e.key === 'Escape') {
        if (this.isAnnotating) {
          this.toolbar?.setMode('idle')
          this.setAnnotating(false)
        }
      }
    })
  }

  // ── Helpers ───────────────────────────────────────────────────

  private pendingCount(): number {
    return this.annotations.filter(a => a.status === 'pending' || a.status === 'acknowledged').length
  }

  /** Programmatic API: get all current annotations */
  getAnnotations(): Annotation[] {
    return [...this.annotations]
  }

  /** Programmatic API: get current session */
  getSession(): Session | null {
    return this.session
  }

  /** Programmatic API: destroy and clean up */
  destroy(): void {
    this.setAnnotating(false)
    this.setFrozen(false)
    this.sse?.disconnect()
    this.toolbar?.destroy()
    this.highlight?.destroy()
    this.popup?.destroy()
  }
}
