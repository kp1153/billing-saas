import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { invoices, customers, products } from "@/db/schema.js"
import { eq, desc, sql } from "drizzle-orm"

export default async function DashboardPage() {
  const session = await getSession()

  const [ajKiBikri] = await db
    .select({ kul: sql`sum(${invoices.totalAmount})` })
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))

  const [billCount] = await db
    .select({ count: sql`count(*)` })
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))

  const [grahakCount] = await db
    .select({ count: sql`count(*)` })
    .from(customers)
    .where(eq(customers.tenantId, session.tenantId))

  const aakhiriBill = await db
    .select()
    .from(invoices)
    .where(eq(invoices.tenantId, session.tenantId))
    .orderBy(desc(invoices.createdAt))
    .limit(5)

  return (
    <div className="px-4 py-5">
      <p className="text-gray-500 text-sm mb-4">नमस्ते, {session.name} 👋</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">आज की बिक्री</p>
          <p className="text-xl font-bold text-blue-600">₹{ajKiBikri?.kul ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">कुल बिल</p>
          <p className="text-xl font-bold text-gray-800">{billCount?.count ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">ग्राहक</p>
          <p className="text-xl font-bold text-gray-800">{grahakCount?.count ?? 0}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-gray-100">
          <p className="text-xs text-gray-400 mb-1">योजना</p>
          <p className="text-xl font-bold text-green-600">{session.plan === "free" ? "मुफ़्त" : "प्रो"}</p>
        </div>
      </div>
      <h2 className="text-sm font-semibold text-gray-700 mb-3">हाल के बिल</h2>
      <div className="space-y-2">
        {aakhiriBill.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-6">अभी कोई बिल नहीं</p>
        )}
        {aakhiriBill.map((bill) => (
          <div key={bill.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
            <div>
              <p className="text-sm font-medium text-gray-800">बिल #{bill.invoiceNumber}</p>
              <p className="text-xs text-gray-400">{bill.createdAt}</p>
            </div>
            <p className="text-sm font-bold text-blue-600">₹{bill.totalAmount}</p>
          </div>
        ))}
      </div>
    </div>
  )
}