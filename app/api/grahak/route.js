import { db } from '@/lib/db.js'
import { customers, invoices } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq, and, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  // हर ग्राहक के साथ उनकी बकाया राशि
  const data = await db
    .select({
      id: customers.id,
      name: customers.name,
      phone: customers.phone,
      email: customers.email,
      address: customers.address,
      createdAt: customers.createdAt,
      bakaya: sql`coalesce(sum(case when ${invoices.status} = 'unpaid' then ${invoices.totalAmount} else 0 end), 0)`,
      kulBill: sql`coalesce(count(${invoices.id}), 0)`,
    })
    .from(customers)
    .leftJoin(
      invoices,
      and(eq(invoices.customerId, customers.id), eq(invoices.tenantId, session.tenantId))
    )
    .where(eq(customers.tenantId, session.tenantId))
    .groupBy(customers.id)

  return NextResponse.json({ data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { naam, phone, email, address } = await request.json()
  if (!naam) return NextResponse.json({ error: 'नाम जरूरी है' }, { status: 400 })

  const result = await db
    .insert(customers)
    .values({
      tenantId: session.tenantId,
      name: naam,
      phone: phone || null,
      email: email || null,
      address: address || null,
    })
    .returning({ id: customers.id })

  return NextResponse.json({ success: true, id: result[0].id })
}