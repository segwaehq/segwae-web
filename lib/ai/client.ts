import Anthropic from '@anthropic-ai/sdk'

/**
 * Shared Anthropic client + model registry for the AI job-seeker tools.
 * Server-only — never import this into a client component (it reads the API key).
 *
 * Model choices are the ones settled for the premium scope:
 *  - matchScore: Haiku 4.5  (free tier, high volume, cheap)
 *  - tailor:     Opus 4.8   (paid flagship — best writing, adaptive thinking on)
 *  - secondary:  Sonnet 5   (interview prep / profile optimizer / regenerations)
 */
export const MODELS = {
  matchScore: 'claude-haiku-4-5',
  tailor: 'claude-opus-4-8',
  secondary: 'claude-sonnet-5',
} as const

let client: Anthropic | null = null

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set in the environment (.env.local)')
  }
  if (!client) client = new Anthropic()
  return client
}

type GenerateJsonOpts = {
  model: string
  system: string
  prompt: string
  maxTokens: number
  /** JSON Schema the model's output is constrained to (structured outputs). */
  schema: Record<string, unknown>
  /** Enable adaptive thinking (quality lever for the flagship tailor). */
  thinking?: boolean
  /** Optional PDF (base64) attached as a document block — Claude reads it natively. */
  pdfBase64?: string
}

/**
 * Calls Claude with a JSON-schema-constrained response and returns the parsed result.
 *
 * `output_config.format` (structured outputs) guarantees the model emits JSON
 * matching `schema`, so parsing can no longer fail on stray prose or markdown
 * fences. The only remaining failure mode is a response truncated at the token
 * cap, which is detected explicitly below.
 */
export async function generateJson<T>({
  model,
  system,
  prompt,
  maxTokens,
  schema,
  thinking,
  pdfBase64,
}: GenerateJsonOpts): Promise<T> {
  const content: Anthropic.ContentBlockParam[] = []
  if (pdfBase64) {
    content.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: pdfBase64 },
    })
  }
  content.push({ type: 'text', text: prompt })

  const res = await getClient().messages.create({
    model,
    max_tokens: maxTokens,
    system,
    // Sonnet 5 runs adaptive thinking when `thinking` is omitted, and thinking
    // draws from the same max_tokens budget as the answer — that silently
    // truncated the JSON body and surfaced as "did not return valid JSON". Be
    // explicit: only think when a tool opts in; otherwise give the whole budget
    // to the structured output.
    thinking: thinking ? { type: 'adaptive' as const } : { type: 'disabled' as const },
    // Structured outputs: the model is constrained to emit JSON matching `schema`.
    output_config: { format: { type: 'json_schema', schema } },
    messages: [{ role: 'user', content }],
  })

  // A response cut off at the token cap is incomplete JSON, but the cause is the
  // budget, not the model — surface that distinctly from a genuine parse failure.
  if (res.stop_reason === 'max_tokens') {
    throw new Error(
      'The response was cut off before it finished (token limit reached). Try again.',
    )
  }

  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim()

  return parseJson<T>(text)
}

// Structured outputs guarantee schema-valid JSON, so a plain parse is enough —
// no more fence-stripping or brace-extraction heuristics.
function parseJson<T>(raw: string): T {
  try {
    return JSON.parse(raw.trim()) as T
  } catch {
    throw new Error('The model did not return valid JSON. Try again.')
  }
}
