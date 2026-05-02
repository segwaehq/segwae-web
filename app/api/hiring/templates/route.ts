import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, getTemplatesByCompany, createTemplate } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

export async function GET() {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await getCompanyByOwner(user.id)
  if (!company) return NextResponse.json({ templates: [] })

  const templates = await getTemplatesByCompany(company.id)
  return NextResponse.json({ templates })
}

export async function POST(request: Request) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const company = await getCompanyByOwner(user.id)
  if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 403 })

  const body = await request.json()
  const { type, label, subject, body: templateBody, is_default } = body

  if (!['rejection', 'acceptance', 'general'].includes(type)) {
    return NextResponse.json({ error: 'Invalid template type' }, { status: 400 })
  }
  if (!label?.trim()) return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  if (!subject?.trim()) return NextResponse.json({ error: 'Subject is required' }, { status: 400 })
  if (!templateBody?.trim()) return NextResponse.json({ error: 'Body is required' }, { status: 400 })

  try {
    const template = await createTemplate(company.id, { type, label, subject, body: templateBody, is_default: is_default ?? false })
    return NextResponse.json({ template }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed to create template' }, { status: 500 })
  }
}
