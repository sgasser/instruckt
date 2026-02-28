import type { Annotation, Session } from './types'

/** Read Laravel's XSRF-TOKEN cookie for CSRF protection */
function getCsrfToken(): string {
  const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  const csrf = getCsrfToken()
  if (csrf) h['X-XSRF-TOKEN'] = csrf
  return h
}

export type AnnotationPayload = Omit<
  Annotation,
  'id' | 'sessionId' | 'status' | 'thread' | 'createdAt' | '_syncedTo'
>

export class InstrucktApi {
  constructor(private readonly endpoint: string) {}

  async createSession(url: string): Promise<Session> {
    const res = await fetch(`${this.endpoint}/sessions`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ url }),
    })
    if (!res.ok) throw new Error(`instruckt: failed to create session (${res.status})`)
    return res.json()
  }

  async getSession(sessionId: string): Promise<Session & { annotations: Annotation[] }> {
    const res = await fetch(`${this.endpoint}/sessions/${sessionId}`, {
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`instruckt: failed to get session (${res.status})`)
    return res.json()
  }

  async addAnnotation(sessionId: string, data: AnnotationPayload): Promise<Annotation> {
    const res = await fetch(`${this.endpoint}/sessions/${sessionId}/annotations`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`instruckt: failed to add annotation (${res.status})`)
    return res.json()
  }

  async updateAnnotation(
    annotationId: string,
    data: Partial<Pick<Annotation, 'status' | 'comment' | 'intent' | 'severity'>>,
  ): Promise<Annotation> {
    const res = await fetch(`${this.endpoint}/annotations/${annotationId}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`instruckt: failed to update annotation (${res.status})`)
    return res.json()
  }

  async addReply(annotationId: string, content: string, role: 'human' | 'agent' = 'human'): Promise<Annotation> {
    const res = await fetch(`${this.endpoint}/annotations/${annotationId}/reply`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ role, content }),
    })
    if (!res.ok) throw new Error(`instruckt: failed to add reply (${res.status})`)
    return res.json()
  }
}
