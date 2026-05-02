import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import {
  getCompanyByOwner,
  getTemplateById,
  updateApplicationStatus,
  logApplicationEmail,
} from '@/lib/hiring/queries'
import { resolveMergeTags } from '@/lib/hiring/templates'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function sendViaZeptomail(to: string, subject: string, htmlBody: string): Promise<void> {
  const apiKey = process.env.ZEPTOMAIL_API_KEY
  if (!apiKey) {
    // In development / before key is configured: log and continue
    console.warn('[Zeptomail] ZEPTOMAIL_API_KEY not set — email not sent')
    return
  }

  const res = await fetch('https://api.zeptomail.com/v1.1/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Zoho-enczapikey ${apiKey}`,
    },
    body: JSON.stringify({
      from: { address: process.env.ZEPTOMAIL_FROM_ADDRESS ?? 'noreply@segwae.com', name: 'Segwae Hiring' },
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

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { application_id, template_id, subject_override, body_override, new_status } = body

  if (!application_id) return NextResponse.json({ error: 'application_id is required' }, { status: 400 })

  // Verify ownership chain
  const supabase = await createClient()
  const { data: appRow } = await supabase
    .from('job_applications')
    .select(`
      id, job_id, cover_note,
      users ( id, name, email ),
      jobs ( id, title, company_id )
    `)
    .eq('id', application_id)
    .single()

  if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  const company = await getCompanyByOwner(user.id)
  const rawJobs = appRow.jobs as unknown
  const jobRow = (Array.isArray(rawJobs) ? rawJobs[0] : rawJobs) as { id: string; title: string; company_id: string } | null
  if (!company || company.id !== jobRow?.company_id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const rawUsers = appRow.users as unknown
  const applicant = (Array.isArray(rawUsers) ? rawUsers[0] : rawUsers) as { id: string; name: string; email: string } | null
  if (!applicant?.email) return NextResponse.json({ error: 'Applicant email not found' }, { status: 400 })
  const job = jobRow

  let subject: string
  let htmlBody: string

  if (template_id) {
    const template = await getTemplateById(template_id)
    if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 })

    const ctx = {
      first_name: applicant.name?.split(' ')[0] ?? 'there',
      job_title: job.title,
      company_name: company.name,
      decision_date: new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }),
    }

    subject = subject_override ?? resolveMergeTags(template.subject, ctx)
    htmlBody = body_override ?? resolveMergeTags(template.body, ctx).replace(/\n/g, '<br/>')
  } else if (subject_override && body_override) {
    subject = subject_override
    htmlBody = body_override.replace(/\n/g, '<br/>')
  } else {
    return NextResponse.json({ error: 'Either template_id or subject_override+body_override required' }, { status: 400 })
  }

  try {
    await sendViaZeptomail(applicant.email, subject, htmlBody)

    await logApplicationEmail({
      application_id,
      template_id: template_id ?? null,
      sent_by: user.id,
      recipient_email: applicant.email,
      subject,
      body: htmlBody,
    })

    if (new_status) {
      await updateApplicationStatus(application_id, new_status)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to send email' }, { status: 500 })
  }
}
