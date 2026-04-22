import { db } from '@/lib/db.js'
import { customers } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const data = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, session.tenantId))

  return NextResponse.json({ data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { naam, phone, email, address } = await request.json()
  if (!naam) return NextResponse.json({ error: 'नाम जरूरी है' }, { status: 400 })

  await db.insert(customers).values({
    tenantId: session.tenantId,
    name: naam,
    phone: phone || null,
    email: email || null,
    address: address || null,
  })

  return NextResponse.json({ success: true })
}