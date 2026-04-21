import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">निशांत बिलिंग</h1>
        <p className="text-gray-500 mb-8 text-sm">हर दुकान के लिए — आसान, तेज़, हिंदी में</p>
        <Link
          href="/login"
          className="block w-full bg-blue-600 text-white py-3 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
        >
          शुरू करें
        </Link>
        <p className="mt-4 text-xs text-gray-400">7 दिन मुफ़्त — कोई कार्ड नहीं</p>
      </div>
    </main>
  )
}