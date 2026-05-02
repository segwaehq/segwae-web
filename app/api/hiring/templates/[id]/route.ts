import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyByOwner, getTemplateById, updateTemplate, deleteTemplate } from '@/lib/hiring/queries'

async function getAuthedUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

async function verifyOwnership(userId: string, templateId: string) {
  const company = await getCompanyByOwner(userId)
  if (!company) return null
  const template = await getTemplateById(templateId)
  if (!template || template.company_id !== company.id) return null
  return { company, template }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await verifyOwnership(user.id, id)
  if (!ownership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { label, subject, body: templateBody, is_default } = body

  try {
    const template = await updateTemplate(id, ownership.company.id, {
      ...(label !== undefined && { label }),
      ...(subject !== undefined && { subject }),
      ...(templateBody !== undefined && { body: templateBody }),
      ...(is_default !== undefined && { is_default }),
    })
    return NextResponse.json({ template })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthedUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ownership = await verifyOwnership(user.id, id)
  if (!ownership) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  if (ownership.template.is_seeded) {
    return NextResponse.json({ error: 'Seeded templates cannot be deleted' }, { status: 400 })
  }

  try {
    await deleteTemplate(id, ownership.company.id)
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Delete failed' }, { status: 500 })
  }
}
