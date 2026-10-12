import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0f17] px-4">
      {/* Ambient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(99,102,241,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 shadow-lg shadow-indigo-500/20">
            <span className="text-lg font-extrabold text-white">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            PrimeWave RRMS
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8 text-center space-y-5">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-lg shadow-amber-500/10">
            <ShieldAlert className="h-7 w-7" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-white">
              Public Registration Restricted
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              User registration is restricted to system administrators only.
              Accounts cannot be created publicly.
            </p>
          </div>

          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs text-slate-400 text-left space-y-2">
            <p className="font-semibold text-slate-300">How to get an account:</p>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Contact your facility administrator or team lead.</li>
              <li>An administrator will register your employee profile.</li>
              <li>You will receive your login credentials directly.</li>
            </ul>
          </div>

          <Link
            href="/login"
            className="glass-button flex w-full items-center justify-center gap-2 py-2.5 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
