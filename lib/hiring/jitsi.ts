import { randomBytes } from 'crypto'

export function generateMeetLink(): string {
  const id = randomBytes(6).toString('hex')
  return `https://meet.jit.si/segwae-${id}`
}
