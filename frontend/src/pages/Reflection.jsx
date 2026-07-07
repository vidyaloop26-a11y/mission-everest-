import React, { useState } from "react";
import day1 from "../data/day1.json";
import day2 from "../data/day2.json";
import day3 from "../data/day3.json";
import characters from "../data/characters.json";
import { CharacterAvatar } from "../components/expedition/CharacterAvatar";
import { Mountain, Sparkles, ArrowRight } from "lucide-react";

const DAYS = { 1: day1, 2: day2, 3: day3 };

export default function Reflection({ state, setState, onAdvanceDay }) {
  const day = state.current_day;
  const dayData = DAYS[day] || day1;
  const q = dayData.reflection;

  const savedChoiceKey =
    day === 3
      ? "day3_reflection_choice"
      : day === 2
        ? "day2_reflection_choice"
        : "day1_reflection_choice";
  const [choice, setChoice] = useState(state[savedChoiceKey] || null);
  const chosen = choice ? q.options.find((o) => o.key === choice) : null;

  // Trust-tier tone selector (Stage 4)
  const chosenResponseText = (() => {
    if (!chosen) return "";
    const r = chosen.response;
    const t = state.variables?.[`trust_${r.character}`] ?? 50;
    if (t <= 29 && r.low) return r.low;
    if (t >= 70 && r.high) return r.high;
    return r.text || "";
  })();

  const pick = (opt) => {
    setChoice(opt.key);
    setState((s) => ({ ...s, [savedChoiceKey]: opt.key }));
  };

  const nextDayLabel =
    day === 1 ? "Report for Day 2" : day === 2 ? "Report for Day 3" : "View Final Summary";
  // Day 1 & 2 & 3 can all advance; Day 3 advances to the Final Summary Card.
  const canAdvance = !!choice;
  const btnTestId =
    day === 1 ? "report-day2-btn" : day === 2 ? "report-day3-btn" : "view-summary-btn";

  return (
    <div className="min-h-screen w-full grain relative">
      <div className="mountain-band absolute inset-x-0 top-0 h-56 md:h-64 -z-10" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <div className="max-w-2xl w-full">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-[color:var(--amber-500)]" />
            </div>
            <div>
              <div className="font-display text-lg">End of Day {day}</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono-tick">
                Reflection · {state.intern_name || "Coordinator"}
              </div>
            </div>
          </div>

          <div
            data-testid={`reflection-card-day-${day}`}
            className="bg-white border border-[color:var(--granite-200)] rounded-2xl shadow-[0_20px_60px_-30px_rgba(14,21,32,0.4)] overflow-hidden"
          >
            <div className="px-6 md:px-8 pt-6 md:pt-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--ice-700)] font-mono-tick">
                <Sparkles className="w-3.5 h-3.5 text-[color:var(--amber-500)]" />
                Day {day} Reflection
              </div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-[color:var(--granite-900)]">
                {q.question}
              </h2>
            </div>

            <div className="px-6 md:px-8 py-6 space-y-2">
              {q.options.map((o) => {
                const active = choice === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => pick(o)}
                    disabled={!!choice && !active}
                    data-testid={`reflection-option-${o.key}`}
                    className={`w-full text-left rounded-xl border px-4 py-3 flex items-start gap-3 transition ${
                      active
                        ? "border-[color:var(--ice-500)] bg-[color:var(--ice-50)]"
                        : choice
                          ? "border-[color:var(--granite-200)] bg-white opacity-60"
                          : "border-[color:var(--granite-200)] bg-white hover:border-[color:var(--ice-500)] hover:shadow-md"
                    }`}
                  >
                    <span
                      className={`mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-display ${
                        active
                          ? "bg-[color:var(--ice-500)] text-white"
                          : "bg-[color:var(--granite-900)] text-white"
                      }`}
                    >
                      {o.key}
                    </span>
                    <span className="text-[14.5px] leading-relaxed text-[color:var(--granite-900)]">
                      {o.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {chosen && (
              <div className="px-6 md:px-8 pb-6 msg-in" data-testid="reflection-response">
                <div className="flex items-start gap-3 rounded-xl bg-[color:var(--granite-900)] text-white p-4">
                  <CharacterAvatar character={characters[chosen.response.character]} size={38} ring />
                  <div>
                    <div className="text-[12px] font-display">
                      {characters[chosen.response.character].short}
                      <span className="ml-2 text-[10.5px] uppercase font-mono-tick tracking-widest text-white/60">
                        {characters[chosen.response.character].role}
                      </span>
                    </div>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-white/90">
                      {chosenResponseText}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="px-6 md:px-8 py-5 border-t border-[color:var(--granite-200)] bg-[color:var(--ice-50)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[11.5px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)]">
                {day === 1
                  ? "Day 2 briefing is ready when you are"
                  : day === 2
                    ? "Day 3 briefing prepares overnight"
                    : "Expedition debrief and final report are ready"}
              </div>
              <button
                data-testid={btnTestId}
                onClick={canAdvance ? onAdvanceDay : undefined}
                disabled={!canAdvance}
                title={canAdvance ? "Continue" : "Choose a reflection first"}
                className={`rounded-xl px-5 py-2.5 font-display text-sm inline-flex items-center gap-2 transition ${
                  canAdvance
                    ? "bg-[color:var(--granite-900)] text-white hover:bg-black"
                    : "bg-[color:var(--granite-200)] text-[color:var(--granite-500)] cursor-not-allowed"
                }`}
              >
                {nextDayLabel}
                {canAdvance && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
