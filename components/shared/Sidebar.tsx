"use client";

/**
 * Sidebar — role-aware navigation.
 * Role detection and active link highlighting will be wired in the auth step.
 */
export function Sidebar() {
  return (
    <aside className="w-64 flex-shrink-0 glass-card rounded-none border-r border-white/5 flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">R</span>
          </div>
          <span className="text-base font-bold text-white tracking-tight">
            RRMS
          </span>
        </div>
      </div>

      {/* Navigation — will be populated with role-based links in auth step */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="text-xs text-slate-600 px-3 mb-2">NAVIGATION</p>
        <div className="space-y-1">
          {["Dashboard", "Resources", "Reservations"].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white cursor-pointer transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              {item}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-white/5 p-4">
        <p className="text-xs text-slate-600 text-center">PrimeWave Lab</p>
      </div>
    </aside>
  );
}
