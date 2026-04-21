import Link from "next/link"

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-blue-600">निशांत बिलिंग</h1>
          <p className="text-gray-500 text-sm mt-1">अपने खाते में प्रवेश करें</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <Link
            href="/api/auth/google"
            className="flex items-center justify-center gap-3 w-full border border-gray-200 rounded-xl py-3 text-gray-700 font-medium hover:bg-gray-50 transition"
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.14 0 5.95 1.08 8.17 2.84l6.08-6.08C34.46 3.09 29.5 1 24 1 14.82 1 7.07 6.48 3.64 14.22l7.08 5.5C12.4 13.16 17.73 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.1 24.5c0-1.64-.15-3.22-.42-4.75H24v9h12.42c-.54 2.9-2.18 5.36-4.64 7.01l7.19 5.58C43.19 37.01 46.1 31.2 46.1 24.5z"/>
              <path fill="#FBBC05" d="M10.72 28.28A14.6 14.6 0 0 1 9.5 24c0-1.49.26-2.93.72-4.28l-7.08-5.5A23.93 23.93 0 0 0 0 24c0 3.87.93 7.52 2.56 10.73l8.16-6.45z"/>
              <path fill="#34A853" d="M24 47c5.5 0 10.12-1.82 13.49-4.94l-7.19-5.58C28.6 37.96 26.43 38.5 24 38.5c-6.27 0-11.6-3.66-13.28-8.72l-8.16 6.45C6.07 43.52 14.46 47 24 47z"/>
            </svg>
            Google से लॉगिन करें
          </Link>
          <p className="text-center text-xs text-gray-400 mt-4">
            लॉगिन करके आप हमारी{" "}
            <span className="text-blue-500">शर्तों</span> से सहमत हैं
          </p>
        </div>
      </div>
    </main>
  )
}