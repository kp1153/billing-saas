import { db } from '@/lib/db.js'
import { invoices, invoiceItems, customers } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq, and } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { id } = await params

  const [bill] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      totalAmount: invoices.totalAmount,
      gstAmount: invoices.gstAmount,
      discount: invoices.discount,
      notes: invoices.notes,
      createdAt: invoices.createdAt,
      grahakNaam: customers.name,
      grahakPhone: customers.phone,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(and(eq(invoices.id, parseInt(id)), eq(invoices.tenantId, session.tenantId)))
    .limit(1)

  if (!bill) return NextResponse.json({ error: 'नहीं मिला' }, { status: 404 })

  const items = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, parseInt(id)))

  return NextResponse.json({ data: { ...bill, items } })
}

export async function PATCH(request, { params }) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { id } = await params
  const { status } = await request.json()

  if (!['paid', 'unpaid'].includes(status)) {
    return NextResponse.json({ error: 'गलत status' }, { status: 400 })
  }

  await db
    .update(invoices)
    .set({ status })
    .where(and(eq(invoices.id, parseInt(id)), eq(invoices.tenantId, session.tenantId)))

  return NextResponse.json({ success: true })
}