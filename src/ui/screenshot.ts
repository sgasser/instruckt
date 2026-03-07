import { toPng } from 'html-to-image'

/** Capture a DOM element as a base64 PNG data URL */
export async function captureElement(el: Element): Promise<string | null> {
  try {
    return await toPng(el as HTMLElement, {
      cacheBust: true,
      pixelRatio: 2,
      skipFonts: true,
      filter: (node: HTMLElement) => {
        // Skip instruckt UI elements from the capture
        if (node.getAttribute?.('data-instruckt')) return false
        // Skip cross-origin link elements (external stylesheets cause SecurityError)
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
          const href = node.getAttribute('href') ?? ''
          if (href.startsWith('http') && !href.startsWith(window.location.origin)) return false
        }
        return true
      },
    })
  } catch {
    return null
  }
}

/** Capture a rectangular region of the viewport as a base64 PNG data URL */
export async function captureRegion(rect: DOMRect): Promise<string | null> {
  try {
    const full = await toPng(document.body, {
      cacheBust: true,
      pixelRatio: 2,
      skipFonts: true,
      filter: (node: HTMLElement) => {
        if (node.getAttribute?.('data-instruckt')) return false
        if (node.tagName === 'LINK' && node.getAttribute('rel') === 'stylesheet') {
          const href = node.getAttribute('href') ?? ''
          if (href.startsWith('http') && !href.startsWith(window.location.origin)) return false
        }
        return true
      },
    })

    // Crop the full capture to the selected region
    return await cropImage(full, rect)
  } catch {
    return null
  }
}

/** Crop a data URL image to a rectangle */
function cropImage(dataUrl: string, rect: DOMRect): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const ratio = 2 // matches pixelRatio above
      const canvas = document.createElement('canvas')
      canvas.width = rect.width * ratio
      canvas.height = rect.height * ratio
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        rect.x * ratio, rect.y * ratio,
        rect.width * ratio, rect.height * ratio,
        0, 0,
        rect.width * ratio, rect.height * ratio,
      )
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = dataUrl
  })
}

/** Interactive region selector — returns the selected DOMRect or null if cancelled */
export function selectRegion(): Promise<DOMRect | null> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div')
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      cursor: 'crosshair',
      background: 'rgba(0,0,0,0.1)',
    })
    overlay.setAttribute('data-instruckt', 'region-select')

    const box = document.createElement('div')
    Object.assign(box.style, {
      position: 'fixed',
      border: '2px dashed #6366f1',
      background: 'rgba(99,102,241,0.08)',
      borderRadius: '4px',
      display: 'none',
      pointerEvents: 'none',
    })
    overlay.appendChild(box)

    let startX = 0, startY = 0, dragging = false

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX
      startY = e.clientY
      dragging = true
      box.style.display = 'block'
      updateBox(e)
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return
      updateBox(e)
    }

    const updateBox = (e: MouseEvent) => {
      const x = Math.min(startX, e.clientX)
      const y = Math.min(startY, e.clientY)
      const w = Math.abs(e.clientX - startX)
      const h = Math.abs(e.clientY - startY)
      Object.assign(box.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      })
    }

    const onMouseUp = (e: MouseEvent) => {
      if (!dragging) return
      dragging = false
      const x = Math.min(startX, e.clientX)
      const y = Math.min(startY, e.clientY)
      const w = Math.abs(e.clientX - startX)
      const h = Math.abs(e.clientY - startY)
      cleanup()
      if (w < 10 || h < 10) {
        resolve(null)
      } else {
        resolve(new DOMRect(x, y, w, h))
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        cleanup()
        resolve(null)
      }
    }

    const cleanup = () => {
      overlay.remove()
      document.removeEventListener('keydown', onKeyDown, true)
    }

    overlay.addEventListener('mousedown', onMouseDown)
    overlay.addEventListener('mousemove', onMouseMove)
    overlay.addEventListener('mouseup', onMouseUp)
    document.addEventListener('keydown', onKeyDown, true)
    document.body.appendChild(overlay)
  })
}
