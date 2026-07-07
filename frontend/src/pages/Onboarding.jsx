import React, { useState } from "react";
import { Mountain, ArrowRight } from "lucide-react";
import day1 from "../data/day1.json";

export default function Onboarding({ onBegin }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const disabled = trimmed.length === 0;
  const brief = day1.onboarding;

  const submit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onBegin(trimmed);
  };

  return (
    <div className="min-h-screen w-full grain relative">
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10">
        {/* Top status band */}
        <div className="mountain-band absolute inset-x-0 top-0 h-56 md:h-64 -z-10" />

        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-3 text-white mb-8 md:mb-10">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur flex items-center justify-center border border-white/15">
              <Mountain className="w-5 h-5 text-[color:var(--amber-500)]" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-xl">Mission Everest</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/60 font-mono-tick">
                Leadership Internship · Stage 1
              </div>
            </div>
          </div>

          <div
            data-testid="onboarding-briefing-card"
            className="bg-white border border-[color:var(--granite-200)] rounded-2xl shadow-[0_20px_60px_-30px_rgba(14,21,32,0.4)] overflow-hidden"
          >
            <div className="px-6 md:px-8 pt-6 md:pt-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[color:var(--ice-700)] font-mono-tick">
                <span className="w-2 h-2 rounded-full bg-[color:var(--amber-500)]" />
                Command Briefing · Confidential
              </div>
              <h1 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-[color:var(--granite-900)]">
                {brief.title}
              </h1>
              <div className="mt-1 text-sm text-[color:var(--granite-500)] font-mono-tick uppercase tracking-widest">
                {brief.author}
              </div>
            </div>

            <div className="px-6 md:px-8 py-6 space-y-4 text-[15px] leading-relaxed text-[color:var(--granite-800)]">
              {brief.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <p className="italic text-[color:var(--granite-500)]">
                {brief.signoff}
              </p>
            </div>

            <form
              onSubmit={submit}
              className="px-6 md:px-8 py-6 border-t border-[color:var(--granite-200)] bg-[color:var(--ice-50)]"
            >
              <label
                htmlFor="intern-name"
                className="block text-xs uppercase tracking-[0.2em] font-mono-tick text-[color:var(--ice-700)] mb-2"
              >
                Coordinator Name — enter for the manifest
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  id="intern-name"
                  data-testid="onboarding-name-input"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Riya Menon"
                  className="flex-1 rounded-xl border border-[color:var(--granite-200)] bg-white px-4 py-3 text-[15px] outline-none focus:border-[color:var(--ice-500)] focus:ring-2 focus:ring-[color:var(--ice-500)]/20 transition"
                />
                <button
                  type="submit"
                  disabled={disabled}
                  data-testid="onboarding-begin-btn"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-display text-sm font-semibold text-white transition
                    bg-[color:var(--granite-900)] hover:bg-black
                    disabled:bg-[color:var(--granite-200)] disabled:text-[color:var(--granite-500)] disabled:cursor-not-allowed"
                >
                  Begin Expedition
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>

          <div className="mt-6 text-center text-xs text-white/70 font-mono-tick uppercase tracking-[0.2em]">
            Three days. One mission.
          </div>
        </div>
      </div>
    </div>
  );
}
