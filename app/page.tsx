import Link from "next/link";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f17]">
      {/* Ambient gradient orbs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.6) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 right-0 h-[360px] w-[360px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)",
        }}
      />

      {/* Content */}
      <main className="relative z-10 flex flex-col items-center gap-8 px-6 text-center">
        {/* Logo mark */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/25">
            <span className="text-xl font-extrabold text-white">R</span>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            RRMS
          </span>
        </div>

        {/* Hero text */}
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl">
          Resource Reservation{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        <p className="max-w-lg text-base leading-relaxed text-slate-400 sm:text-lg">
          PrimeWave Lab&apos;s centralized platform for managing meeting rooms,
          lab hardware, and vehicles — schedule smarter, avoid conflicts.
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
