import React from "react";
import { CharacterAvatar } from "../components/expedition/CharacterAvatar";
import characters from "../data/characters.json";
import { VARIABLE_LABELS, DEFAULT_STATE } from "../lib/expeditionStore";
import { Mountain, Trophy, Sparkles, RotateCcw } from "lucide-react";

const SKILL_KEYS = ["leadership", "teamwork", "risk_management", "decision_quality"];
const TRUST_KEYS = ["trust_arjun", "trust_maya", "trust_tenzin", "trust_priya"];
const CONDITION_KEYS = [
  "weather_risk",
  "team_health",
  "summit_readiness",
  "expedition_progress",
];

function pickHighestSkill(variables) {
  let bestKey = SKILL_KEYS[0];
  let bestVal = -Infinity;
  for (const k of SKILL_KEYS) {
    if ((variables[k] ?? 0) > bestVal) {
      bestVal = variables[k];
      bestKey = k;
    }
  }
  return { key: bestKey, label: VARIABLE_LABELS[bestKey], value: bestVal };
}

const trustCharKey = (k) => k.replace("trust_", "");

export default function FinalSummary({ state, onStartOver }) {
  const v = state.variables;
  const highest = pickHighestSkill(v);
  const delta = (key) => v[key] - (DEFAULT_STATE.variables[key] ?? 0);

  return (
    <div className="min-h-screen w-full grain relative">
      <div className="mountain-band absolute inset-x-0 top-0 h-64 md:h-72 -z-10" />
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-5 py-10">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center">
              <Mountain className="w-5 h-5 text-[color:var(--amber-500)]" />
            </div>
            <div>
              <div className="font-display text-lg">Mission Everest</div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-white/60 font-mono-tick">
                {state.intern_name || "Coordinator"} · Expedition Debrief
              </div>
            </div>
          </div>

          <div
            data-testid="final-summary-card"
            className="bg-white border border-[color:var(--granite-200)] rounded-2xl shadow-[0_20px_60px_-30px_rgba(14,21,32,0.4)] overflow-hidden"
          >
            <div className="px-6 md:px-8 pt-6 md:pt-8">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-[color:var(--ice-700)] font-mono-tick">
                <Trophy className="w-3.5 h-3.5 text-[color:var(--amber-500)]" />
                Expedition Debrief · Final Report
              </div>
              <h2 className="mt-3 font-display text-2xl md:text-3xl leading-tight text-[color:var(--granite-900)]">
                Mission Everest — Expedition Complete
              </h2>
              <p className="mt-2 text-[14.5px] leading-relaxed text-[color:var(--granite-500)]">
                Three days. One team. From Base Camp to the summit and safely
                back down. These are the final readings across all twelve
                variables you moved this week.
              </p>
            </div>

            {/* Signature line */}
            <div
              className="mx-6 md:mx-8 mt-5 rounded-xl bg-[color:var(--granite-900)] text-white px-4 py-4 flex items-center gap-3"
              data-testid="highest-skill-line"
            >
              <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-[color:var(--amber-500)]" />
              </div>
              <div className="leading-tight">
                <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tick text-white/60">
                  Signature Trait
                </div>
                <div className="font-display text-lg">
                  Your strongest trait this expedition: {highest.label}
                </div>
              </div>
              <div className="ml-auto font-mono-tick text-white/80 text-sm">
                {highest.value}
              </div>
            </div>

            {/* Skill grid */}
            <div className="px-6 md:px-8 py-6 space-y-6">
              <ReadoutGroup title="Leadership Skills" keys={SKILL_KEYS} vars={v} deltaFn={delta} testIdPrefix="skill" />
              <ReadoutGroup
                title="Expedition Conditions"
                keys={CONDITION_KEYS}
                vars={v}
                deltaFn={delta}
                testIdPrefix="condition"
              />
              <div>
                <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tick text-[color:var(--granite-500)] mb-3">
                  Team Trust
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TRUST_KEYS.map((k) => {
                    const cid = trustCharKey(k);
                    const c = characters[cid];
                    const val = v[k];
                    const d = delta(k);
                    return (
                      <div
                        key={k}
                        data-testid={`trust-${cid}`}
                        className="rounded-xl border border-[color:var(--granite-200)] bg-white p-3 flex items-center gap-3"
                      >
                        <CharacterAvatar character={c} size={38} />
                        <div className="min-w-0 leading-tight">
                          <div className="text-[13px] font-display text-[color:var(--granite-900)] truncate">
                            {c.short}
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono-tick text-sm text-[color:var(--granite-900)]">
                              {val}
                            </span>
                            <DeltaBadge d={d} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-6 md:px-8 py-5 border-t border-[color:var(--granite-200)] bg-[color:var(--ice-50)] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-[11.5px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)]">
                No certificate is generated for this internship.
              </div>
              <button
                onClick={onStartOver}
                data-testid="start-over-btn"
                className="rounded-xl px-5 py-2.5 font-display text-sm text-white bg-[color:var(--granite-900)] hover:bg-black transition inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Start Over
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-[11px] font-mono-tick uppercase tracking-[0.22em] text-white/70">
            Vidyaloop Learning &amp; Innovation Labs · Mission Everest
          </div>
        </div>
      </div>
    </div>
  );
}

function ReadoutGroup({ title, keys, vars, deltaFn, testIdPrefix }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tick text-[color:var(--granite-500)] mb-3">
        {title}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {keys.map((k) => (
          <ReadoutRow
            key={k}
            label={VARIABLE_LABELS[k]}
            value={vars[k]}
            delta={deltaFn(k)}
            testId={`${testIdPrefix}-${k}`}
          />
        ))}
      </div>
    </div>
  );
}

function ReadoutRow({ label, value, delta, testId }) {
  const capped = Math.max(0, Math.min(100, value));
  return (
    <div
      data-testid={testId}
      className="rounded-xl border border-[color:var(--granite-200)] bg-white p-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-display text-[color:var(--granite-900)]">{label}</div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono-tick text-[color:var(--granite-900)]">{value}</span>
          <DeltaBadge d={delta} />
        </div>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-[color:var(--granite-50)] overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-[color:var(--ice-500)] to-[color:var(--ice-700)] rounded-full"
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  );
}

function DeltaBadge({ d }) {
  if (d === 0) {
    return (
      <span className="text-[10px] font-mono-tick text-[color:var(--granite-500)]">±0</span>
    );
  }
  const positive = d > 0;
  return (
    <span
      className={`text-[10px] font-mono-tick px-1.5 py-0.5 rounded ${
        positive
          ? "text-emerald-700 bg-emerald-50"
          : "text-rose-700 bg-rose-50"
      }`}
    >
      {positive ? "+" : ""}
      {d}
    </span>
  );
}
