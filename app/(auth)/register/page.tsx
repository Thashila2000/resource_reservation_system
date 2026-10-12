"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerUser } from "@/lib/actions";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await registerUser(formData);
    },
    undefined
  );

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0f17] px-4">
      {/* Ambient orb */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-1/4 right-1/3 h-[400px] w-[400px] rounded-full opacity-15"
        style={{
          background:
            "radial-gradient(circle, rgba(56,189,248,0.5) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400">
            <span className="text-lg font-extrabold text-white">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            RRMS
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="mb-1 text-2xl font-bold text-white">
            Create Account
          </h1>
          <p className="mb-6 text-sm text-slate-400">
            Join PrimeWave Lab&apos;s resource system
          </p>

          {/* Error message */}
          {state?.error && (
            <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Doe"
                className="glass-input"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@primewave.com"
                className="glass-input"
              />
            </div>

            {/* Department */}
            <div>
              <label
                htmlFor="department"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Department{" "}
                <span className="text-slate-600">(optional)</span>
              </label>
              <input
                id="department"
                name="department"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Engineering"
                className="glass-input"
              />
            </div>

            {/* Role */}
            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Account Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue="EMPLOYEE"
                className="glass-input [&>option]:bg-[#121722] [&>option]:text-white"
              >
                <option value="EMPLOYEE">Employee (Browse & Book Resources)</option>
                <option value="ADMIN">Admin (Facility Manager / IT Approvals)</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Min. 6 characters"
                className="glass-input"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="glass-button mt-2 w-full py-2.5 text-sm font-semibold"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="opacity-25"
                    />
                    <path
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                      className="opacity-75"
                    />
                  </svg>
                  Creating account…
                </span>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
