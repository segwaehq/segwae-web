import { createClient } from '@/lib/supabase/server'
import { resolveMergeTags } from './templates'
import { logApplicationEmail } from './queries'

export async function sendViaZeptomail(to: string, subject: string, htmlBody: string): Promise<void> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY
  if (!apiKey) {
    console.warn('[Zeptomail] ZEPTOMAIL_API_KEY not set — email not sent')
    return
  }

  const res = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({
      from: {
        address: process.env.ZEPTOMAIL_FROM_ADDRESS ?? 'noreply@segwae.com',
        name: 'Segwae Hiring',
      },
      to: [{ email_address: { address: to } }],
      subject,
      htmlbody: htmlBody,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Zeptomail error: ${err}`)
  }
}

const STATUS_TEMPLATE_TYPE: Partial<Record<string, 'acceptance' | 'rejection'>> = {
  accepted: 'acceptance',
  rejected: 'rejection',
}

export async function sendStatusEmail(params: {
  applicationId: string
  status: string
  applicantName: string
  applicantEmail: string
  jobTitle: string
  companyId: string
  companyName: string
  sentBy: string
}): Promise<void> {
  const templateType = STATUS_TEMPLATE_TYPE[params.status]
  if (!templateType) return

  const supabase = await createClient()
  const { data: template } = await supabase
    .from('email_templates')
    .select('*')
    .eq('company_id', params.companyId)
    .eq('type', templateType)
    .eq('is_default', true)
    .single()

  if (!template) return

  const ctx = {
    first_name: params.applicantName.split(' ')[0] ?? 'there',
    job_title: params.jobTitle,
    company_name: params.companyName,
    decision_date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
  }

  const subject = resolveMergeTags(template.subject, ctx)
  const htmlBody = resolveMergeTags(template.body, ctx).replace(/\n/g, '<br/>')

  await sendViaZeptomail(params.applicantEmail, subject, htmlBody)

  await logApplicationEmail({
    application_id: params.applicationId,
    template_id: template.id,
    sent_by: params.sentBy,
    recipient_email: params.applicantEmail,
    subject,
    body: htmlBody,
  })
}
