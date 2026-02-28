/** Builds and manages the floating toolbar DOM element */

export type ToolbarMode = 'idle' | 'annotating' | 'frozen'

interface ToolbarCallbacks {
  onToggleAnnotate: (active: boolean) => void
  onFreezeAnimations: (frozen: boolean) => void
}

export class Toolbar {
  private el!: HTMLElement
  private annotateBtn!: HTMLButtonElement
  private freezeBtn!: HTMLButtonElement
  private annotationCount = 0
  private mode: ToolbarMode = 'idle'
  private dragging = false
  private dragOffset = { x: 0, y: 0 }

  constructor(
    private readonly position: string,
    private readonly callbacks: ToolbarCallbacks,
  ) {
    this.build()
    this.setupDrag()
  }

  private build(): void {
    this.el = document.createElement('div')
    this.el.id = 'instruckt-toolbar'
    this.el.setAttribute('data-instruckt', 'toolbar')

    // Annotate button
    this.annotateBtn = this.makeBtn('✏️', 'Annotate elements (A)', () => {
      const next = this.mode !== 'annotating'
      this.setMode(next ? 'annotating' : 'idle')
      this.callbacks.onToggleAnnotate(next)
    })
    this.annotateBtn.setAttribute('data-action', 'annotate')

    // Freeze animations button
    this.freezeBtn = this.makeBtn('⏸', 'Freeze animations (F)', () => {
      const next = this.mode !== 'frozen'
      this.setMode(next ? 'frozen' : 'idle')
      this.callbacks.onFreezeAnimations(next)
    })

    const divider = document.createElement('div')
    divider.className = 'ik-divider'

    this.el.append(this.annotateBtn, divider, this.freezeBtn)

    // Position
    this.applyPosition()
    document.body.appendChild(this.el)
  }

  private makeBtn(icon: string, title: string, onClick: () => void): HTMLButtonElement {
    const btn = document.createElement('button')
    btn.className = 'ik-btn'
    btn.title = title
    btn.setAttribute('aria-label', title)
    btn.innerHTML = icon
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      onClick()
    })
    return btn
  }

  private applyPosition(): void {
    const margin = '16px'
    const pos = this.position
    this.el.style.bottom = pos.includes('bottom') ? margin : 'auto'
    this.el.style.top = pos.includes('top') ? margin : 'auto'
    this.el.style.right = pos.includes('right') ? margin : 'auto'
    this.el.style.left = pos.includes('left') ? margin : 'auto'
  }

  private setupDrag(): void {
    this.el.addEventListener('mousedown', (e) => {
      // Only drag via the toolbar background, not buttons
      if ((e.target as Element).closest('.ik-btn')) return
      this.dragging = true
      const rect = this.el.getBoundingClientRect()
      this.dragOffset.x = e.clientX - rect.left
      this.dragOffset.y = e.clientY - rect.top
      this.el.style.transition = 'none'
      e.preventDefault()
    })

    document.addEventListener('mousemove', (e) => {
      if (!this.dragging) return
      const x = e.clientX - this.dragOffset.x
      const y = e.clientY - this.dragOffset.y
      this.el.style.left = `${x}px`
      this.el.style.top = `${y}px`
      this.el.style.right = 'auto'
      this.el.style.bottom = 'auto'
    })

    document.addEventListener('mouseup', () => {
      this.dragging = false
    })
  }

  setMode(mode: ToolbarMode): void {
    this.mode = mode
    this.annotateBtn.classList.toggle('active', mode === 'annotating')
    this.freezeBtn.classList.toggle('active', mode === 'frozen')
    document.body.classList.toggle('ik-annotating', mode === 'annotating')
  }

  setAnnotationCount(count: number): void {
    this.annotationCount = count
    // Update badge on annotate button
    let badge = this.annotateBtn.querySelector('.ik-badge')
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span')
        badge.className = 'ik-badge'
        this.annotateBtn.style.position = 'relative'
        this.annotateBtn.appendChild(badge)
      }
      badge.textContent = count > 99 ? '99+' : String(count)
    } else {
      badge?.remove()
    }
  }

  destroy(): void {
    this.el.remove()
    document.body.classList.remove('ik-annotating')
  }
}
