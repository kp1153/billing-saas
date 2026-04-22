'use client'
import { useState } from 'react'

export default function GstrExport() {
  const thisMonth = new Date().toISOString().slice(0, 7)
  const [month, setMonth] = useState(thisMonth)

  return (
    <div className="flex gap-2 items-center">
      <input
        type="month"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1"
      />
      <a
        href={`/api/export/gstr1?month=${month}`}
        className="bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-semibold whitespace-nowrap"
        download
      >
        ⬇️ Export
      </a>
    </div>
  )
}