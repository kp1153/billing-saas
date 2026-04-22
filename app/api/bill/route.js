import { db } from '@/lib/db.js'
import { invoices, invoiceItems, customers, products } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq, desc, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const data = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      paymentMode: invoices.paymentMode,
      totalAmount: invoices.totalAmount,
      createdAt: invoices.createdAt,
      grahakNaam: customers.name,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(eq(invoices.tenantId, session.tenantId))
    .orderBy(desc(invoices.createdAt))

  return NextResponse.json({ data })
}

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { customerId, items, discount, notes, status, paymentMode, totalAmount, gstAmount } =
    await request.json()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'सामान जरूरी है' }, { status: 400 })
  }

  // Server-side total recalculate — frontend पर trust नहीं
  const serverSubtotal = items.reduce(
    (s, i) => s + parseInt(i.pricePerUnit) * parseInt(i.quantity), 0
  )
  const serverGst = items.reduce(
    (s, i) => s + Math.round(parseInt(i.pricePerUnit) * parseInt(i.quantity) * parseInt(i.gstPercent) / 100), 0
  )
  const serverTotal = serverSubtotal + serverGst - parseInt(discount || 0)

  // Invoice number
  const [countRow] = await db
    .select({ count: sql`count(*)` })
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))

  const num = (parseInt(countRow.count) + 1).toString().padStart(4, '0')
  const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
  const invoiceNumber = `INV-${today}-${num}`

  // Invoice insert
  const result = await db
    .insert(invoices)
    .values({
      tenantId: session.tenantId,
      customerId: customerId ? parseInt(customerId) : null,
      invoiceNumber,
      status: status || 'unpaid',
      paymentMode: paymentMode || 'cash',
      totalAmount: serverTotal,
      gstAmount: serverGst,
      discount: parseInt(discount || 0),
      notes: notes || null,
    })
    .returning({ id: invoices.id })

  const invoiceId = result[0].id

  // Items insert + stock deduct एक साथ
  await db.insert(invoiceItems).values(
    items.map((item) => ({
      invoiceId,
      productId: item.productId || null,
      name: item.name,
      quantity: parseInt(item.quantity),
      pricePerUnit: parseInt(item.pricePerUnit),
      gstPercent: parseInt(item.gstPercent),
      total: parseInt(item.pricePerUnit) * parseInt(item.quantity),
    }))
  )

  // Stock deduct — सिर्फ उन items के लिए जिनका productId है
  for (const item of items) {
    if (item.productId) {
      await db
        .update(products)
        .set({
          currentStock: sql`max(0, ${products.currentStock} - ${parseInt(item.quantity)})`,
        })
        .where(eq(products.id, item.productId))
    }
  }

  return NextResponse.json({ success: true, invoiceId })
}