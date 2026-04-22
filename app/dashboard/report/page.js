import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { invoices } from "@/db/schema.js"
import { eq, sql, and } from "drizzle-orm"
import Link from "next/link"
import GstrExport from './GstrExport'

export default async function ReportPage() {
  const session = await getSession()

  const mahwariBikri = await db
    .select({
      mahina: sql`strftime('%Y-%m', ${invoices.createdAt})`,
      kul: sql`sum(${invoices.totalAmount})`,
      paid: sql`sum(case when ${invoices.status} = 'paid' then ${invoices.totalAmount} else 0 end)`,
      unpaid: sql`sum(case when ${invoices.status} = 'unpaid' then ${invoices.totalAmount} else 0 end)`,
      count: sql`count(*)`,
      gst: sql`sum(${invoices.gstAmount})`,
    })
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))
    .groupBy(sql`strftime('%Y-%m', ${invoices.createdAt})`)
    .orderBy(sql`strftime('%Y-%m', ${invoices.createdAt}) desc`)

  const [ajKiReport] = await db
    .select({
      ajKiBikri: sql`coalesce(sum(${invoices.totalAmount}), 0)`,
      ajKeBill: sql`count(*)`,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.tenantId, session.tenantId),
        sql`date(${invoices.createdAt}) = date('now')`
      )
    )

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-gray-800 mb-2">रिपोर्ट</h2>

      {/* आज का summary */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
          <p className="text-xs text-blue-500 mb-1">आज की बिक्री</p>
          <p className="text-xl font-bold text-blue-700">₹{ajKiReport?.ajKiBikri ?? 0}</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">आज के बिल</p>
          <p className="text-xl font-bold text-gray-700">{ajKiReport?.ajKeBill ?? 0}</p>
        </div>
      </div>

      {/* GSTR Export button */}
      <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-5">
        <p className="text-sm font-semibold text-green-700 mb-2">📊 GSTR-1 Export</p>
        <p className="text-xs text-gray-500 mb-3">महीने का चुनें और CSV डाउनलोड करें</p>
        <GstrExport />
      </div>

      {/* Monthly breakdown */}
      <h3 className="text-sm font-semibold text-gray-700 mb-3">महीनेवार बिक्री</h3>
      <div className="space-y-3">
        {mahwariBikri.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">अभी कोई रिपोर्ट नहीं</p>
        )}
        {mahwariBikri.map((row) => {
          const paid = Number(row.paid)
          const unpaid = Number(row.unpaid)
          const kul = Number(row.kul)
          const paidPct = kul > 0 ? Math.round((paid / kul) * 100) : 0
          return (
            <div key={row.mahina} className="bg-white rounded-xl px-4 py-3 border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-800">{row.mahina}</p>
                  <p className="text-xs text-gray-400">{row.count} बिल • GST ₹{Number(row.gst)}</p>
                </div>
                <p className="text-sm font-bold text-blue-600">₹{kul}</p>
              </div>
              {/* Paid vs Unpaid bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-400 rounded-full"
                  style={{ width: `${paidPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-green-600">✓ ₹{paid} मिला</span>
                <span className="text-orange-500">⏳ ₹{unpaid} बाकी</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}