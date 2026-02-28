import type { Annotation, Session } from './types'

export class InstrucktApi {
  constructor(private readonly endpoint: string) {}

  async createSession(url: string): Promise<Session> {
    const res = await fetch(`${this.endpoint}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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

  async addAnnotation(
    sessionId: string,
    data: Omit<Annotation, 'id' | 'sessionId' | 'url' | 'status' | 'thread' | 'createdAt' | '_syncedTo'>,
  ): Promise<Annotation> {
    const res = await fetch(`${this.endpoint}/sessions/${sessionId}/annotations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
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
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`instruckt: failed to update annotation (${res.status})`)
    return res.json()
  }
}
