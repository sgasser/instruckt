/** Renders a floating highlight overlay over a hovered element */

export class ElementHighlight {
  private overlay: HTMLElement

  constructor() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'ik-highlight-overlay'
    this.overlay.style.display = 'none'
    document.body.appendChild(this.overlay)
  }

  show(el: Element): void {
    const rect = el.getBoundingClientRect()
    if (rect.width === 0 && rect.height === 0) {
      this.hide()
      return
    }
    this.overlay.style.display = 'block'
    this.overlay.style.left = `${rect.left}px`
    this.overlay.style.top = `${rect.top}px`
    this.overlay.style.width = `${rect.width}px`
    this.overlay.style.height = `${rect.height}px`
  }

  hide(): void {
    this.overlay.style.display = 'none'
  }

  destroy(): void {
    this.overlay.remove()
  }
}
