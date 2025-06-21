"use client";

interface error {
    message : string
}

export default function ErrorPage({ error } : error) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-rose-200">
        <div className="text-rose-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-rose-800 mb-2">
          Oops! Something went wrong
        </h2>
        <p className="text-rose-600">{error?.message || "Unknown error"}</p>
      </div>
    </div>
  );
}
