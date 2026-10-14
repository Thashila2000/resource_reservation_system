"use client";

import Link from "next/link";
import { ShieldCheck, Calendar, Cpu, Wrench, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0b0f17]">
      {/* Ambient background glow effects */}
      <div className="absolute top-1/4 -left-32 h-96 w-96 rounded-full bg-indigo-600/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px] pointer-events-none" />

      {/* Main Content Container */}
      <main className="relative z-10 flex flex-col items-center gap-8 px-6 text-center max-w-4xl mx-auto">
        
        {/* Top Announcement Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur-md shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
          <span>PrimeWave Lab Centralized Platform</span>
        </div>

        

        {/* Hero text */}
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.15] tracking-tight text-white sm:text-6xl">
          Resource Reservation{" "}
          <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Management System
          </span>
        </h1>

        <p className="max-w-xl text-base leading-relaxed text-slate-400 sm:text-lg">
          Streamline meeting rooms, lab hardware, and equipment bookings. Schedule smarter, eliminate conflicts, and log damage or issue reports instantly.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full justify-center">
          <Link
            href="/login"
            className="glass-button inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold w-full sm:w-auto shadow-lg shadow-indigo-500/10"
          >
            Sign In 
            <ArrowRight className="h-4 w-4 shrink-0" />
          </Link>
          
        </div>

        {/* Feature chips */}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
            <Calendar className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Real time Availability</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
            <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Conflict Prevention</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium text-slate-300 backdrop-blur-md">
            <Cpu className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Role based Access</span>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-medium text-indigo-200 backdrop-blur-md">
            <Wrench className="h-4 w-4 text-indigo-400 shrink-0" />
            <span>Damage & Issue Reports</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 text-xs text-slate-500 font-medium">
        © 2026 PrimeWave Lab. All rights reserved.
      </footer>
    </div>
  );
}