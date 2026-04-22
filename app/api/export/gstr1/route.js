import { db } from '@/lib/db.js'
import { invoices, invoiceItems, customers, tenants } from '@/db/schema.js'
import { getSession } from '@/lib/session.js'
import { eq, and, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'अनधिकृत' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month') // format: 2025-01

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: 'month param चाहिए — format: 2025-01' }, { status: 400 })
  }

  // Tenant info (GSTIN के लिए)
  const [tenant] = await db
    .select({ gstin: tenants.gstin, name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, session.tenantId))
    .limit(1)

  // उस महीने के सब बिल
  const billList = await db
    .select({
      invoiceNumber: invoices.invoiceNumber,
      createdAt: invoices.createdAt,
      totalAmount: invoices.totalAmount,
      gstAmount: invoices.gstAmount,
      grahakNaam: customers.name,
      grahakPhone: customers.phone,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .where(
      and(
        eq(invoices.tenantId, session.tenantId),
        sql`strftime('%Y-%m', ${invoices.createdAt}) = ${month}`
      )
    )
    .orderBy(invoices.createdAt)

  // CSV बनाओ
  const header = [
    'Invoice No',
    'Date',
    'Customer Name',
    'Customer Phone',
    'Taxable Amount',
    'GST Amount',
    'Total Amount',
    'Supplier GSTIN',
  ].join(',')

  const rows = billList.map((b) => {
    const taxable = b.totalAmount - b.gstAmount
    return [
      b.invoiceNumber,
      b.createdAt?.slice(0, 10) ?? '',
      `"${b.grahakNaam ?? 'Walk-in'}"`,
      b.grahakPhone ?? '',
      taxable,
      b.gstAmount,
      b.totalAmount,
      tenant?.gstin ?? '',
    ].join(',')
  })

  const csv = [header, ...rows].join('\n')

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="GSTR1_${month}_${tenant?.name ?? 'export'}.csv"`,
    },
  })
}