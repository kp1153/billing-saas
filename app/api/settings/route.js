import { db } from '@/lib/db.js'
import { tenants } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, session.tenantId))
    .limit(1)

  return NextResponse.json({ data: tenant })
}

export async function PATCH(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { name, phone, address, gstin, logoUrl } = await request.json()

  await db
    .update(tenants)
    .set({
      name: name || null,
      phone: phone || null,
      address: address || null,
      gstin: gstin || null,
      logoUrl: logoUrl || null,
    })
    .where(eq(tenants.id, session.tenantId))

  return NextResponse.json({ success: true })
}