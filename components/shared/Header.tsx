"use client";

/**
 * Header — top bar with page title, user avatar, and notifications.
 * Session user data will be injected in the auth step.
 */
export function Header({ title }: { title?: string }) {
  return (
    <header className="glass-card h-16 rounded-none border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0">
      {/* Page title */}
      <div>
        {title && (
          <h2 className="text-sm font-semibold text-white">{title}</h2>
        )}
      </div>

      {/* Right slot — user avatar + name */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-medium text-white">User</p>
          <p className="text-xs text-slate-500">employee@primewave.com</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      </div>
    </header>
  );
}
