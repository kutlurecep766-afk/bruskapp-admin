'use client'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#020408] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-red-100 rounded-3xl p-8 text-center shadow-xl">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-gray-900 font-bold text-lg">Bir şeyler ters gitti</h2>
        <p className="text-gray-500 text-sm mt-2 leading-relaxed">Sayfa yüklenirken beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.</p>
        {error?.digest && <p className="text-[10px] text-gray-400 font-mono mt-3">Hata kodu: {error.digest}</p>}
        <button onClick={reset}
          className="mt-6 px-6 py-2.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/30 hover:from-blue-700 hover:to-blue-800 hover:scale-105 active:scale-95 transition-all">
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}