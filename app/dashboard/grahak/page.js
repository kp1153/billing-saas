import { getSession } from "@/lib/session.js"
import { db } from "@/lib/db.js"
import { customers } from "@/db/schema.js"
import { eq } from "drizzle-orm"
import Link from "next/link"

export default async function GrahakPage() {
  const session = await getSession()
  const sabGrahak = await db
    .select()
    .from(customers)
    .where(eq(customers.tenantId, session.tenantId))

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">ग्राहक</h2>
        <Link href="/dashboard/grahak/naya" className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl">
          + नया
        </Link>
      </div>
      <div className="space-y-2">
        {sabGrahak.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-10">कोई ग्राहक नहीं</p>
        )}
        {sabGrahak.map((g) => (
          <div key={g.id} className="bg-white rounded-xl px-4 py-3 border border-gray-100">
            <p className="text-sm font-medium text-gray-800">{g.name}</p>
            <p className="text-xs text-gray-400">{g.phone ?? "फोन नहीं"} • {g.email ?? ""}</p>
          </div>
        ))}
      </div>
    </div>
  )
}