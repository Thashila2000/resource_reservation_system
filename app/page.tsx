import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f17]">
      {/* Content */}
      <main className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-600/25">
            <span className="text-xl font-extrabold text-white">R</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            RRMS
          </span>
        </div>

        {/* Hero text */}
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          Resource Reservation{" "}
          <span className="text-indigo-400">
            Management System
          </span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
          PrimeWave Lab&apos;s centralized platform for managing meeting rooms,
          lab hardware, and equipment — schedule smarter, avoid conflicts.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Link
            href="/login"
            className="glass-button inline-flex items-center justify-center px-8 py-3 text-sm font-semibold"
          >
            Sign In to System
          </Link>
        </div>

        {/* Feature chips */}
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {[
            "Real-time Availability",
            "Conflict Prevention",
            "Role-based Access",
            "Instant Approvals",
          ].map((feat) => (
            <span
              key={feat}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-sm"
            >
              {feat}
            </span>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-slate-600">
        © 2026 PrimeWave Lab — All rights reserved.
      </footer>
    </div>
  );
}
