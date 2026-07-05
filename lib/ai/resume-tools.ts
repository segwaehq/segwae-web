import { generateJson, MODELS } from './client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type MatchScore = {
  score: number // 0-100
  verdict: string
  strengths: string[]
  gaps: string[]
  suggestions: string[]
}

export type TailoredExperience = {
  company: string
  role: string
  period: string
  bullets: string[]
}

export type TailoredEducation = {
  institution: string
  credential: string
  period: string
}

export type TailoredResume = {
  name: string
  headline: string
  summary: string
  skills: string[]
  experience: TailoredExperience[]
  education: TailoredEducation[]
  coverLetter: string
}

export type JobInput = {
  jobTitle?: string
  company?: string
  jobDescription: string
  /** Provide the resume as text OR as a PDF (base64) — at least one is required. */
  resumeText?: string
  resumePdfBase64?: string
}

// ─── Shared context builder ─────────────────────────────────────────────────────

function jobContext({
  jobTitle,
  company,
  jobDescription,
  resumeText,
  resumePdfBase64,
}: JobInput): string {
  const resumeSection = resumePdfBase64
    ? `# Candidate resume\nThe candidate's resume is attached as a PDF document — read it in full.`
    : `# Candidate resume\n${resumeText ?? ''}`
  return [
    jobTitle ? `# Target role\n${jobTitle}` : '',
    company ? `# Company\n${company}` : '',
    `# Job posting\n${jobDescription}`,
    resumeSection,
  ]
    .filter(Boolean)
    .join('\n\n')
}

// ─── Match Score (free tier — Haiku) ────────────────────────────────────────────

const MATCH_SYSTEM = `You are an expert technical recruiter. Given a job posting and a candidate's resume, assess the fit honestly and specifically.

Return ONLY a JSON object of this exact shape — no prose, no markdown fences:
{"score": <integer 0-100>, "verdict": <one sentence>, "strengths": [<specific matched qualifications>], "gaps": [<specific missing or weak requirements>], "suggestions": [<concrete actions to improve the match>]}

Reference real details from the posting and resume. Do not invent qualifications the candidate does not have.`

const MATCH_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    score: { type: 'integer' },
    verdict: { type: 'string' },
    strengths: { type: 'array', items: { type: 'string' } },
    gaps: { type: 'array', items: { type: 'string' } },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['score', 'verdict', 'strengths', 'gaps', 'suggestions'],
}

export async function getMatchScore(input: JobInput): Promise<MatchScore> {
  return generateJson<MatchScore>({
    model: MODELS.matchScore,
    system: MATCH_SYSTEM,
    prompt: jobContext(input),
    schema: MATCH_SCHEMA,
    pdfBase64: input.resumePdfBase64,
    maxTokens: 2000,
  })
}

// ─── Resume Tailor (paid flagship — Opus 4.8 + adaptive thinking) ────────────────

const TAILOR_SYSTEM = `You are an expert resume writer and career coach. Rewrite the candidate's resume to target the specific job below, and write a matching cover letter.

Hard rules — these are non-negotiable:
- NEVER fabricate experience, employers, job titles, dates, degrees, certifications, or metrics. Only reframe, reorder, and rephrase what is genuinely present in the candidate's resume.
- If a specific detail is NOT in the source resume (a school name, employer, date range, etc.), set that field to an empty string "" — never invent it or use a generic placeholder like "University", "Company", or "Present". Drop any education or experience entry that has no real content.
- Mirror the job's language and keywords ONLY where it is truthful for this candidate.
- Make bullets achievement-oriented and lead with impact; keep quantified results that appear in the source.
- The cover letter is three short paragraphs, specific to this company and role.

Return ONLY a JSON object of this exact shape — no prose, no markdown fences:
{"name": string, "headline": string, "summary": string, "skills": string[], "experience": [{"company": string, "role": string, "period": string, "bullets": string[]}], "education": [{"institution": string, "credential": string, "period": string}], "coverLetter": string}`

const TAILOR_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    headline: { type: 'string' },
    summary: { type: 'string' },
    skills: { type: 'array', items: { type: 'string' } },
    experience: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          company: { type: 'string' },
          role: { type: 'string' },
          period: { type: 'string' },
          bullets: { type: 'array', items: { type: 'string' } },
        },
        required: ['company', 'role', 'period', 'bullets'],
      },
    },
    education: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          institution: { type: 'string' },
          credential: { type: 'string' },
          period: { type: 'string' },
        },
        required: ['institution', 'credential', 'period'],
      },
    },
    coverLetter: { type: 'string' },
  },
  required: ['name', 'headline', 'summary', 'skills', 'experience', 'education', 'coverLetter'],
}

export async function tailorResume(input: JobInput): Promise<TailoredResume> {
  return generateJson<TailoredResume>({
    model: MODELS.tailor,
    system: TAILOR_SYSTEM,
    prompt: jobContext(input),
    schema: TAILOR_SCHEMA,
    pdfBase64: input.resumePdfBase64,
    maxTokens: 16000,
    thinking: true,
  })
}

// ─── Interview Prep (paid secondary — Sonnet 5) ──────────────────────────────────

export type InterviewQuestion = {
  question: string
  category: string
  suggestedAnswer: string // first-person, grounded in the candidate's real resume
  tip: string // what the interviewer is really assessing
}

export type InterviewPrep = {
  overview: string
  questions: InterviewQuestion[]
  questionsToAsk: string[]
}

const INTERVIEW_SYSTEM = `You are an expert interview coach and hiring manager. Given a job posting and the candidate's resume, prepare them for the actual interview for THIS role at THIS company.

Produce 8–10 of the most likely interview questions for this specific role and company, across a mix of categories (e.g. "Behavioral", "Role-specific", "Motivation & fit"). For each question, write a strong suggested answer in the FIRST PERSON as the candidate, grounded ONLY in the real experience, skills, and projects in their resume. For behavioral questions, structure the answer with STAR (Situation, Task, Action, Result) using a genuine example from the resume. Add a short "tip" noting what the interviewer is really assessing.

Hard rules — non-negotiable:
- NEVER invent employers, projects, metrics, titles, or credentials the candidate does not have. If the resume lacks a relevant example, coach them on how to answer honestly instead of fabricating one.
- Keep each suggested answer concise and speakable — roughly 45–90 seconds out loud.
- Match the seniority and domain of the target role.

Also provide 3–5 smart, specific questions the candidate should ask the interviewer about this role/company.

Return ONLY a JSON object of this exact shape — no prose, no markdown fences:
{"overview": string, "questions": [{"question": string, "category": string, "suggestedAnswer": string, "tip": string}], "questionsToAsk": string[]}`

const INTERVIEW_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    overview: { type: 'string' },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          question: { type: 'string' },
          category: { type: 'string' },
          suggestedAnswer: { type: 'string' },
          tip: { type: 'string' },
        },
        required: ['question', 'category', 'suggestedAnswer', 'tip'],
      },
    },
    questionsToAsk: { type: 'array', items: { type: 'string' } },
  },
  required: ['overview', 'questions', 'questionsToAsk'],
}

export async function interviewPrep(input: JobInput): Promise<InterviewPrep> {
  return generateJson<InterviewPrep>({
    model: MODELS.secondary,
    system: INTERVIEW_SYSTEM,
    prompt: jobContext(input),
    schema: INTERVIEW_SCHEMA,
    pdfBase64: input.resumePdfBase64,
    // 8–10 STAR answers plus questions-to-ask is a large body; give it room so a
    // long-but-valid response doesn't clip against the cap.
    maxTokens: 8000,
  })
}
