import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { invoices } from "@/db/schema.js"
import { eq, sql } from "drizzle-orm"

export default async function ReportPage() {
  const session = await getSession()

  const mahwariBikri = await db
    .select({
      mahina: sql`strftime('%Y-%m', ${invoices.createdAt})`,
      kul: sql`sum(${invoices.totalAmount})`,
      count: sql`count(*)`,
    })
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))
    .groupBy(sql`strftime('%Y-%m', ${invoices.createdAt})`)

  return (
    <div className="px-4 py-5">
      <h2 className="text-lg font-bold text-gray-800 mb-5">रिपोर्ट</h2>
      <div className="space-y-3">
        {mahwariBikri.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">अभी कोई रिपोर्ट नहीं</p>
        )}
        {mahwariBikri.map((row) => (
          <div key={row.mahina} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">{row.mahina}</p>
              <p className="text-xs text-gray-400">{row.count} बिल</p>
            </div>
            <p className="text-sm font-bold text-blue-600">₹{row.kul}</p>
          </div>
        ))}
      </div>
    </div>
  )
}