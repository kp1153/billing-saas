'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function BillPage() {
  const [bills, setBills] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/bill')
      .then((r) => r.json())
      .then((d) => { setBills(d.data || []); setLoading(false) })
  }, [])

  return (
    <div className="px-4 py-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800">बिल</h2>
        <Link
          href="/dashboard/bill/naya"
          className="bg-blue-600 text-white text-sm px-4 py-2 rounded-xl"
        >
          + नया बिल
        </Link>
      </div>

      {loading && (
        <p className="text-center text-gray-400 text-sm py-10">लोड हो रहा है...</p>
      )}

      {!loading && bills.length === 0 && (
        <p className="text-center text-gray-400 text-sm py-10">
          कोई बिल नहीं — पहला बिल बनाएं
        </p>
      )}

      <div className="space-y-2">
        {bills.map((bill) => (
          <Link key={bill.id} href={`/dashboard/bill/${bill.id}`}>
            <div className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-800">{bill.invoiceNumber}</p>
                <p className="text-xs text-gray-400">
                  {bill.grahakNaam || 'वॉक-इन'} • {bill.createdAt?.slice(0, 10)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-blue-600">₹{bill.totalAmount}</p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    bill.status === 'paid'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {bill.status === 'paid' ? 'चुकाया' : 'बाकी'}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}