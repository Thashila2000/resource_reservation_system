"use client";

import { useActionState, useEffect, useRef } from "react";
import { loginUser } from "@/lib/actions";
import { showErrorAlert } from "@/lib/alerts";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prevState: { error?: string } | undefined, formData: FormData) => {
      return await loginUser(formData);
    },
    undefined
  );

  // Show SweetAlert error popup whenever login fails
  const prevErrorRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state?.error && state.error !== prevErrorRef.current) {
      prevErrorRef.current = state.error;
      showErrorAlert("Login Failed", state.error);
    }
  }, [state]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0b0f17] px-4">
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
            <span className="text-lg font-extrabold text-white">R</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            RRMS
          </span>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <h1 className="mb-1 text-2xl font-bold text-white">Welcome back</h1>
          <p className="mb-6 text-sm text-slate-400">
            Sign in to access your workspace
          </p>

          <form action={formAction} className="space-y-4">
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
                placeholder="you@primewave.com"
                className="glass-input"
              />
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
                autoComplete="current-password"
                placeholder="••••••••"
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
                  Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer notice */}
          <p className="mt-6 text-center text-xs text-slate-500">
            Accounts are registered and provisioned by administrators.
            <br />
            Contact your facility manager or IT admin to request access.
          </p>
        </div>
      </div>
    </div>
  );
}
