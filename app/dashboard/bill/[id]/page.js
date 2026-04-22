'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function BillDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [bill, setBill] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/bill/${id}`)
      .then((r) => r.json())
      .then((d) => { setBill(d.data); setLoading(false) })
  }, [id])

  async function statusBadlo(newStatus) {
    await fetch(`/api/bill/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    setBill({ ...bill, status: newStatus })
  }

  function whatsappShare() {
    if (!bill) return
    const lines = [
      `*बिल: ${bill.invoiceNumber}*`,
      `दिनांक: ${bill.createdAt?.slice(0, 10)}`,
      bill.grahakNaam ? `ग्राहक: ${bill.grahakNaam}` : '',
      '',
      ...bill.items.map((i) => `• ${i.name} x${i.quantity} = Rs.${i.total}`),
      '',
      `*कुल: Rs.${bill.totalAmount}*`,
    ].filter((l) => l !== null)

    const msg = lines.join('\n')
    const phone = bill.grahakPhone?.replace(/\D/g, '')
    const normalized = phone?.startsWith('91') && phone.length === 12 ? phone : phone ? `91${phone}` : null
    const url = normalized
      ? `https://wa.me/${normalized}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-400 text-sm">लोड हो रहा है...</p>
      </div>
    )
  }

  if (!bill) {
    return <div className="px-4 py-10 text-center text-gray-400">बिल नहीं मिला</div>
  }

  return (
    <>
      {/* Thermal + A4 Print CSS */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; background: white; }
          .bill-wrap {
            width: 80mm;
            max-width: 80mm;
            margin: 0 auto;
            padding: 4mm;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            color: #000;
          }
          .bill-header { text-align: center; margin-bottom: 4mm; }
          .bill-header h1 { font-size: 14px; font-weight: bold; margin: 0 0 1mm 0; }
          .bill-header p { font-size: 10px; margin: 0; }
          .bill-divider { border-top: 1px dashed #000; margin: 2mm 0; }
          .bill-row { display: flex; justify-content: space-between; margin: 1mm 0; font-size: 11px; }
          .bill-item-name { flex: 1; }
          .bill-item-amt { text-align: right; white-space: nowrap; margin-left: 2mm; }
          .bill-total { font-size: 13px; font-weight: bold; }
          .bill-footer { text-align: center; font-size: 10px; margin-top: 4mm; }
        }
      `}</style>

      <div className="px-4 py-5 max-w-lg mx-auto bill-wrap">

        {/* Screen header — print पर नहीं दिखेगा */}
        <div className="flex items-center gap-2 mb-5 no-print">
          <button onClick={() => router.back()} className="text-gray-500 text-xl">←</button>
          <h2 className="text-lg font-bold text-gray-800 flex-1">{bill.invoiceNumber}</h2>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            bill.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
          }`}>
            {bill.status === 'paid' ? '✓ चुकाया' : '⏳ बाकी'}
          </span>
        </div>

        {/* Print header — सिर्फ print पर */}
        <div className="hidden bill-header">
          <h1>निशांत बिलिंग</h1>
          <p>बिल: {bill.invoiceNumber}</p>
          <p>दिनांक: {bill.createdAt?.slice(0, 10)}</p>
          {bill.grahakNaam && <p>ग्राहक: {bill.grahakNaam}</p>}
          {bill.grahakPhone && <p>फोन: {bill.grahakPhone}</p>}
        </div>

        {/* Screen — bill info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 space-y-2 no-print">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">दिनांक</span>
            <span className="text-gray-700">{bill.createdAt?.slice(0, 10)}</span>
          </div>
          {bill.grahakNaam && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">ग्राहक</span>
              <span className="text-gray-700">{bill.grahakNaam}</span>
            </div>
          )}
          {bill.grahakPhone && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">फोन</span>
              <span className="text-gray-700">{bill.grahakPhone}</span>
            </div>
          )}
        </div>

        {/* Print divider */}
        <div className="hidden bill-divider" />

        {/* Items — screen + print दोनों */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 no-print">
          <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">सामान</p>
          <div className="space-y-3">
            {bill.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-400">
                    ₹{item.pricePerUnit} × {item.quantity}
                    {item.gstPercent > 0 ? ` + GST ${item.gstPercent}%` : ''}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-800">₹{item.total}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Print items */}
        <div className="hidden">
          {bill.items.map((item) => (
            <div key={item.id} className="bill-row">
              <span className="bill-item-name">
                {item.name} x{item.quantity}
                {item.gstPercent > 0 ? ` (GST ${item.gstPercent}%)` : ''}
              </span>
              <span className="bill-item-amt">Rs.{item.total}</span>
            </div>
          ))}
        </div>

        {/* Print divider */}
        <div className="hidden bill-divider" />

        {/* Totals — screen */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2 no-print">
          {bill.gstAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST</span><span>₹{bill.gstAmount}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>छूट</span><span>-₹{bill.discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-2">
            <span>कुल</span><span>₹{bill.totalAmount}</span>
          </div>
        </div>

        {/* Totals — print */}
        <div className="hidden">
          {bill.gstAmount > 0 && (
            <div className="bill-row">
              <span>GST</span><span>Rs.{bill.gstAmount}</span>
            </div>
          )}
          {bill.discount > 0 && (
            <div className="bill-row">
              <span>छूट</span><span>-Rs.{bill.discount}</span>
            </div>
          )}
          <div className="bill-divider" />
          <div className="bill-row bill-total">
            <span>कुल</span><span>Rs.{bill.totalAmount}</span>
          </div>
        </div>

        {/* Print footer */}
        <div className="hidden bill-footer">
          <div className="bill-divider" />
          <p>धन्यवाद! फिर आएं 🙏</p>
          <p>निशांत सॉफ्टवेयर्स</p>
        </div>

        {/* Buttons — सिर्फ screen पर */}
        <div className="space-y-2 no-print">
          {bill.status !== 'paid' && (
            <button
              onClick={() => statusBadlo('paid')}
              className="w-full bg-green-500 text-white py-3 rounded-xl font-semibold"
            >
              ✓ पैसे मिल गए
            </button>
          )}
          {bill.status === 'paid' && (
            <button
              onClick={() => statusBadlo('unpaid')}
              className="w-full bg-orange-400 text-white py-3 rounded-xl font-semibold"
            >
              ↩ वापस बाकी करें
            </button>
          )}
          <button
            onClick={whatsappShare}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            📤 WhatsApp पर भेजें
          </button>
          <button
            onClick={() => window.print()}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold"
          >
            🖨️ प्रिंट करें
          </button>
        </div>
      </div>
    </>
  )
}