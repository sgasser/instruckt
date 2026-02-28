import type { FrameworkContext } from '../types'

interface LivewireComponent {
  name: string
  id: string
  get(key: string): unknown
  snapshot?: {
    data?: Record<string, unknown>
  }
}

interface LivewireGlobal {
  find(id: string): LivewireComponent | undefined
  all(): LivewireComponent[]
}

declare global {
  interface Window {
    Livewire?: LivewireGlobal
  }
}

export function isAvailable(): boolean {
  return typeof window.Livewire !== 'undefined'
}

/** Walk up the DOM from el to find the nearest wire:id ancestor */
export function detect(el: Element): string | null {
  let node: Element | null = el
  while (node && node !== document.documentElement) {
    const wireId = node.getAttribute('wire:id')
    if (wireId) return wireId
    node = node.parentElement
  }
  return null
}

/** Get Livewire component context for an element */
export function getContext(el: Element): FrameworkContext | null {
  if (!isAvailable()) return null

  const wireId = detect(el)
  if (!wireId) return null

  const component = window.Livewire!.find(wireId)
  if (!component) return null

  // Snapshot data holds the current public properties
  const snapshotData = component.snapshot?.data ?? {}
  const data: Record<string, unknown> = {}

  for (const key of Object.keys(snapshotData)) {
    try {
      data[key] = component.get(key)
    } catch {
      // property may not be readable
    }
  }

  return {
    framework: 'livewire',
    component: component.name,
    wire_id: wireId,
    data,
  }
}
