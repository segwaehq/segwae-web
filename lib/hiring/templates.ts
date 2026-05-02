export interface MergeContext {
  first_name: string
  job_title: string
  company_name: string
  decision_date?: string
}

export function resolveMergeTags(text: string, ctx: MergeContext): string {
  return text
    .replace(/\{\{first_name\}\}/g, ctx.first_name)
    .replace(/\{\{job_title\}\}/g, ctx.job_title)
    .replace(/\{\{company_name\}\}/g, ctx.company_name)
    .replace(/\{\{decision_date\}\}/g, ctx.decision_date ?? new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }))
}
