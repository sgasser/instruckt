import type { Annotation } from './types'

type AnnotationEventHandler = (annotation: Annotation) => void

export class InstrucktSSE {
  private source: EventSource | null = null

  constructor(
    private readonly endpoint: string,
    private readonly sessionId: string,
    private readonly onUpdate: AnnotationEventHandler,
  ) {}

  connect(): void {
    if (this.source) return

    this.source = new EventSource(`${this.endpoint}/sessions/${this.sessionId}/events`)

    this.source.addEventListener('annotation.updated', (e: MessageEvent) => {
      try {
        const annotation: Annotation = JSON.parse(e.data)
        this.onUpdate(annotation)
      } catch {
        // ignore malformed events
      }
    })

    this.source.onerror = () => {
      // SSE will auto-reconnect; nothing to do
    }
  }

  disconnect(): void {
    this.source?.close()
    this.source = null
  }
}
