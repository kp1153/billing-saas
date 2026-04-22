'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NayaBillPage() {
  const router = useRouter()
  const [sabGrahak, setSabGrahak] = useState([])
  const [sabSaman, setSabSaman] = useState([])
  const [selectedGrahak, setSelectedGrahak] = useState('')
  const [items, setItems] = useState([])
  const [discount, setDiscount] = useState(0)
  const [status, setStatus] = useState('unpaid')
  const [paymentMode, setPaymentMode] = useState('cash')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/grahak').then((r) => r.json()).then((d) => setSabGrahak(d.data || []))
    fetch('/api/saman').then((r) => r.json()).then((d) => setSabSaman(d.data || []))
  }, [])

  function samanJodo(saman) {
    if (items.find((i) => i.productId === saman.id)) return
    setItems([...items, {
      productId: saman.id,
      name: saman.name,
      unit: saman.unit,
      pricePerUnit: saman.pricePerUnit,
      gstPercent: saman.gstPercent,
      quantity: 1,
    }])
  }

  function matrabadlo(productId, qty) {
    setItems(items.map((i) =>
      i.productId === productId ? { ...i, quantity: Math.max(1, parseInt(qty) || 1) } : i
    ))
  }

  function samanHatao(productId) {
    setItems(items.filter((i) => i.productId !== productId))
  }

  const subtotal = items.reduce((s, i) => s + i.pricePerUnit * i.quantity, 0)
  const gstAmount = items.reduce((s, i) => s + Math.round(i.pricePerUnit * i.quantity * i.gstPercent / 100), 0)
  const total = subtotal + gstAmount - parseInt(discount || 0)

  async function submit() {
    if (items.length === 0) return alert('कम से कम एक सामान जोड़ें')
    setLoading(true)
    const res = await fetch('/api/bill', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: selectedGrahak || null,
        items,
        discount: parseInt(discount || 0),
        status,
        paymentMode,
        totalAmount: total,
        gstAmount,
      }),
    })
    const data = await res.json()
    if (data.success) {
      router.push(`/dashboard/bill/${data.invoiceId}`)
    } else {
      alert('कुछ गलत हुआ')
      setLoading(false)
    }
  }

  const modeConfig = {
    cash:  { label: '💵 नकद',  color: 'green' },
    upi:   { label: '📱 UPI',   color: 'purple' },
    card:  { label: '💳 कार्ड', color: 'blue' },
    credit:{ label: '📋 उधार', color: 'orange' },
  }

  return (
    <div className="px-4 py-5">
      <div className="flex items-center gap-2 mb-5">
        <button onClick={() => router.back()} className="text-gray-500 text-xl">←</button>
        <h2 className="text-lg font-bold text-gray-800">नया बिल</h2>
      </div>

      {/* ग्राहक */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">ग्राहक (वैकल्पिक)</label>
        <select
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
          value={selectedGrahak}
          onChange={(e) => setSelectedGrahak(e.target.value)}
        >
          <option value="">— नकद / वॉक-इन —</option>
          {sabGrahak.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}{g.phone ? ` (${g.phone})` : ''}{g.bakaya > 0 ? ` ⚠️ ₹${g.bakaya} बाकी` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* सामान चुनें */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-2 block">सामान चुनें</label>
        {sabSaman.length === 0 && (
          <p className="text-xs text-gray-400">पहले सामान जोड़ें</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {sabSaman.map((s) => {
            const added = !!items.find((i) => i.productId === s.id)
            const kamStock = s.currentStock <= s.minStock
            return (
              <button
                key={s.id}
                onClick={() => samanJodo(s)}
                className={`text-left border rounded-xl px-3 py-2 text-sm transition ${
                  added ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
                }`}
              >
                <p className="font-medium text-gray-800 truncate">{s.name}</p>
                <p className="text-xs text-gray-400">₹{s.pricePerUnit}/{s.unit}</p>
                {kamStock && (
                  <p className="text-xs text-red-500">⚠️ {s.currentStock} बचा</p>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* चुने गए items */}
      {items.length > 0 && (
        <div className="mb-4 space-y-2">
          <label className="text-xs text-gray-500 block">मात्रा तय करें</label>
          {items.map((item) => (
            <div key={item.productId} className="bg-white border border-gray-100 rounded-xl px-3 py-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">
                  ₹{item.pricePerUnit} × {item.quantity} = ₹{item.pricePerUnit * item.quantity}
                </p>
              </div>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => matrabadlo(item.productId, e.target.value)}
                className="w-14 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center"
              />
              <button onClick={() => samanHatao(item.productId)} className="text-red-400 text-xl leading-none">×</button>
            </div>
          ))}
        </div>
      )}

      {/* छूट */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">छूट (₹)</label>
        <input
          type="number"
          min="0"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
          placeholder="0"
        />
      </div>

      {/* भुगतान का तरीका — नया */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-2 block">भुगतान का तरीका</label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(modeConfig).map(([mode, cfg]) => (
            <button
              key={mode}
              onClick={() => {
                setPaymentMode(mode)
                if (mode === 'credit') setStatus('unpaid')
                else setStatus('paid')
              }}
              className={`py-2.5 rounded-xl text-xs font-semibold border transition ${
                paymentMode === mode
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </div>

      {/* भुगतान स्थिति */}
      <div className="mb-5">
        <label className="text-xs text-gray-500 mb-2 block">स्थिति</label>
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('paid')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
              status === 'paid'
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            ✓ मिल गया
          </button>
          <button
            onClick={() => setStatus('unpaid')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition ${
              status === 'unpaid'
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-gray-600 border-gray-200'
            }`}
          >
            ⏳ बाकी है
          </button>
        </div>
      </div>

      {/* कुल */}
      {items.length > 0 && (
        <div className="bg-gray-50 rounded-xl p-4 mb-5 space-y-1.5">
          <div className="flex justify-between text-sm text-gray-600">
            <span>उप-कुल</span><span>₹{subtotal}</span>
          </div>
          {gstAmount > 0 && (
            <div className="flex justify-between text-sm text-gray-600">
              <span>GST</span><span>₹{gstAmount}</span>
            </div>
          )}
          {parseInt(discount) > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>छूट</span><span>-₹{discount}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-200 pt-2">
            <span>कुल</span><span>₹{total}</span>
          </div>
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading || items.length === 0}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {loading ? 'बन रहा है...' : 'बिल बनाएं'}
      </button>
    </div>
  )
}