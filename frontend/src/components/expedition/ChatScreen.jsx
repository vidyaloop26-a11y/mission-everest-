import React, { useEffect, useRef, useState, useCallback } from "react";
import { CharacterAvatar } from "./CharacterAvatar";
import characters from "../../data/characters.json";
import day1 from "../../data/day1.json";
import day2 from "../../data/day2.json";
import day3 from "../../data/day3.json";
import { applyChanges } from "../../lib/expeditionStore";
import { CheckCircle2, MapPin, Clock } from "lucide-react";

const DAYS = { 1: day1, 2: day2, 3: day3 };

const TYPING_MIN = 300;
const TYPING_MAX = 800;
const rand = (min, max) => Math.floor(min + Math.random() * (max - min));

// Trust-tier tone selector (Stage 4).
// 0–29 → low (guarded, formal); 30–69 → neutral (default `text`); 70–100 → high (warmer, candid).
function pickTrustVariant(payload, characterId, variables) {
  if (!payload) return "";
  const trustKey = `trust_${characterId}`;
  const t = variables?.[trustKey] ?? 50;
  if (t <= 29 && payload.low) return payload.low;
  if (t >= 70 && payload.high) return payload.high;
  return payload.text || payload.low || payload.high || "";
}

export default function ChatScreen({ state, setState }) {
  const dayData = DAYS[state.current_day] || day1;
  const scenes = dayData.scenes;
  const sceneIdx = state.current_scene_index;
  const scene = scenes[Math.min(sceneIdx, scenes.length - 1)];
  const dayComplete = sceneIdx >= scenes.length;

  // Chat log built cumulatively across scenes. Each entry:
  // { kind: "message"|"scene-header"|"system-card"|"decision-result"|"reaction"|"continue-marker",
  //   character?, text?, sceneId, ... }
  const [log, setLog] = useState([]);
  const [typingChar, setTypingChar] = useState(null);
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [showContinue, setShowContinue] = useState(false);
  const [resolvedScenes, setResolvedScenes] = useState(new Set());

  const scrollRef = useRef(null);
  const runIdRef = useRef(0);

  // Auto-scroll on log/typing changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 200;
    }
  }, [log, typingChar, decisionOpen, showContinue]);

  const appendLog = useCallback((entry) => {
    setLog((prev) => [...prev, entry]);
  }, []);

  // Play a scene: header, messages (with typing delay), then decision or continue.
  useEffect(() => {
    if (dayComplete) return;
    if (resolvedScenes.has(scene.id)) return;

    const localRun = ++runIdRef.current;
    let cancelled = false;

    const timeouts = [];
    const wait = (ms) =>
      new Promise((res) => {
        const t = setTimeout(res, ms);
        timeouts.push(t);
      });

    (async () => {
      // Scene header (dedupe against StrictMode double-invoke)
      setLog((prev) => {
        if (prev.some((e) => e.kind === "scene-header" && e.sceneId === scene.id)) {
          return prev;
        }
        return [
          ...prev,
          {
            kind: "scene-header",
            sceneId: scene.id,
            title: scene.title,
            location: scene.location,
            time: scene.time,
          },
        ];
      });

      // System card (before messages) — unless flagged as after
      if (scene.system_card && !scene.system_card_after) {
        await wait(500);
        if (cancelled || runIdRef.current !== localRun) return;
        appendLog({ kind: "system-card", sceneId: scene.id, card: scene.system_card });
      }

      // Messages
      for (const m of scene.messages || []) {
        await wait(rand(TYPING_MIN, TYPING_MAX));
        if (cancelled || runIdRef.current !== localRun) return;
        setTypingChar(m.character);
        await wait(rand(500, 900));
        if (cancelled || runIdRef.current !== localRun) return;
        setTypingChar(null);
        appendLog({
          kind: "message",
          sceneId: scene.id,
          character: m.character,
          text: m.text,
        });
      }

      // System card (after messages)
      if (scene.system_card && scene.system_card_after) {
        await wait(500);
        if (cancelled || runIdRef.current !== localRun) return;
        appendLog({ kind: "system-card", sceneId: scene.id, card: scene.system_card });
      }

      // Decision or continue-to-next
      await wait(300);
      if (cancelled || runIdRef.current !== localRun) return;

      if (scene.decision) {
        setDecisionOpen(true);
      } else {
        // No decision (scenes 1.1 and 1.2) — offer Continue
        setShowContinue(true);
      }
    })();

    return () => {
      cancelled = true;
      timeouts.forEach((t) => clearTimeout(t));
      setTypingChar(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scene?.id, dayComplete]);

  const handleContinue = () => {
    setShowContinue(false);
    setResolvedScenes((prev) => new Set(prev).add(scene.id));
    setState((s) => ({ ...s, current_scene_index: s.current_scene_index + 1 }));
  };

  const handleDecide = async (option) => {
    setDecisionOpen(false);

    // 1. Outgoing (student) bubble first
    appendLog({
      kind: "decision-result",
      sceneId: scene.id,
      decisionLabel: scene.decision.label,
      optionKey: option.key,
      optionLabel: option.label,
    });

    // 2. Apply variable changes AND select trust-tier variant on the POST-change trust
    const decisionsKey =
      state.current_day === 3
        ? "day3_completed_decisions"
        : state.current_day === 2
          ? "day2_completed_decisions"
          : "day1_completed_decisions";
    let postVariables;
    setState((s) => {
      postVariables = applyChanges(s.variables, option.changes);
      return {
        ...s,
        variables: postVariables,
        [decisionsKey]: {
          ...(s[decisionsKey] || {}),
          [scene.decision.id]: option.key,
        },
      };
    });

    // 3. Character typing + reaction (variant chosen from post-change trust)
    await new Promise((r) => setTimeout(r, 450));
    setTypingChar(option.reaction.character);
    await new Promise((r) => setTimeout(r, rand(600, 950)));
    setTypingChar(null);
    const reactionText = pickTrustVariant(
      option.reaction,
      option.reaction.character,
      postVariables || state.variables,
    );
    appendLog({
      kind: "reaction",
      sceneId: scene.id,
      character: option.reaction.character,
      text: reactionText,
      changes: option.changes,
    });

    // 4. Continue button
    setShowContinue(true);
  };

  return (
    <div className="flex flex-col h-full min-h-0" data-testid="chat-screen">
      {/* Team row */}
      <div className="px-4 md:px-6 py-3 border-b border-[color:var(--granite-200)] bg-white/70 backdrop-blur">
        <div className="flex items-center gap-4 overflow-x-auto scroll-thin">
          {Object.values(characters).map((c) => (
            <div
              key={c.id}
              className="flex items-center gap-2 shrink-0"
              data-testid={`team-chip-${c.id}`}
            >
              <CharacterAvatar character={c} size={34} />
              <div className="leading-tight">
                <div className="text-[13px] font-display text-[color:var(--granite-900)]">
                  {c.short}
                </div>
                <div className="text-[10.5px] uppercase tracking-widest text-[color:var(--granite-500)] font-mono-tick">
                  {c.role}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat log */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scroll-thin px-4 md:px-6 py-6 space-y-4"
        data-testid="chat-log"
      >
        {log.map((entry, i) => (
          <LogEntry key={i} entry={entry} internName={state.intern_name} />
        ))}

        {typingChar && <TypingBubble character={characters[typingChar]} />}

        {decisionOpen && scene?.decision && (
          <InlineDecision
            label={scene.decision.label}
            options={scene.decision.options}
            onChoose={handleDecide}
          />
        )}

        {showContinue && !decisionOpen && !dayComplete && (
          <div className="msg-in flex justify-center pt-2">
            <button
              onClick={handleContinue}
              data-testid={`continue-btn-${scene.id}`}
              className="rounded-full px-5 py-2.5 bg-[color:var(--granite-900)] text-white text-sm font-display hover:bg-black transition inline-flex items-center gap-2"
            >
              Continue
              <span aria-hidden>→</span>
            </button>
          </div>
        )}

        {dayComplete && <div className="h-4" />}
      </div>
    </div>
  );
}

function LogEntry({ entry, internName }) {
  if (entry.kind === "scene-header") {
    return (
      <div className="msg-in flex items-center gap-3 py-2">
        <div className="h-px flex-1 bg-[color:var(--granite-200)]" />
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] font-mono-tick text-[color:var(--granite-500)]">
          <MapPin className="w-3.5 h-3.5 text-[color:var(--ice-500)]" />
          <span>{entry.location}</span>
          <span className="w-1 h-1 rounded-full bg-[color:var(--granite-200)]" />
          <Clock className="w-3.5 h-3.5" />
          <span>{entry.time}</span>
        </div>
        <div className="h-px flex-1 bg-[color:var(--granite-200)]" />
      </div>
    );
  }

  if (entry.kind === "system-card") {
    const c = entry.card;
    return (
      <div
        className="msg-in bg-[color:var(--granite-900)] text-white rounded-2xl p-5 md:p-6 shadow-sm"
        data-testid="system-card"
      >
        <div className="text-[11px] uppercase tracking-[0.22em] font-mono-tick text-[color:var(--amber-500)]">
          {c.heading}
        </div>
        <div className="font-display text-xl mt-1">{c.subheading}</div>
        <p className="mt-3 text-[14.5px] leading-relaxed text-white/80">{c.body}</p>
        {c.metrics && (
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {c.metrics.map((m) => (
              <div
                key={m}
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-mono-tick uppercase tracking-wider text-white/85"
              >
                {m}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (entry.kind === "message" || entry.kind === "reaction") {
    const char = charactersLookup(entry.character);
    return (
      <div className="msg-in flex items-start gap-3" data-testid={`msg-${entry.character}`}>
        <CharacterAvatar character={char} size={36} />
        <div className="max-w-[85%]">
          <div className="text-[12px] font-display text-[color:var(--granite-800)] mb-0.5">
            {char.short}
            <span className="ml-2 text-[10.5px] font-mono-tick uppercase tracking-widest text-[color:var(--granite-500)]">
              {char.role}
            </span>
          </div>
          <div className="rounded-2xl rounded-tl-sm bg-white border border-[color:var(--granite-200)] px-4 py-2.5 text-[14.5px] leading-relaxed text-[color:var(--granite-900)] shadow-sm">
            {entry.text}
          </div>
          {entry.changes && (
            <ChangeChips changes={entry.changes} testId={`changes-${entry.character}`} />
          )}
        </div>
      </div>
    );
  }

  if (entry.kind === "decision-result") {
    return (
      <div className="msg-in flex justify-end" data-testid={`decision-result-${entry.optionKey}`}>
        <div className="max-w-[85%]">
          <div className="text-[10.5px] uppercase font-mono-tick tracking-widest text-[color:var(--granite-500)] text-right mb-0.5">
            You · {internName || "Coordinator"} · Option {entry.optionKey}
          </div>
          <div className="rounded-2xl rounded-tr-sm px-4 py-2.5 text-[14.5px] leading-relaxed text-white bg-gradient-to-br from-[color:var(--ice-500)] to-[color:var(--ice-700)] shadow-sm">
            {entry.optionLabel}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function charactersLookup(id) {
  const c = characters[id];
  if (c) return c;
  return { id, name: id, short: id, role: "", initials: "•" };
}

function TypingBubble({ character }) {
  return (
    <div className="flex items-center gap-3" data-testid={`typing-${character.id}`}>
      <CharacterAvatar character={character} size={32} />
      <div className="rounded-2xl rounded-tl-sm bg-white border border-[color:var(--granite-200)] px-4 py-2 shadow-sm">
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--granite-500)] mr-1" />
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--granite-500)] mr-1" />
        <span className="typing-dot inline-block w-1.5 h-1.5 rounded-full bg-[color:var(--granite-500)]" />
      </div>
    </div>
  );
}

function InlineDecision({ label, options, onChoose }) {
  return (
    <div
      className="msg-in rounded-2xl border border-[color:var(--ice-300)] bg-gradient-to-br from-white to-[color:var(--ice-50)] p-4 md:p-5 shadow-sm"
      data-testid="decision-card"
    >
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] font-mono-tick text-[color:var(--ice-700)]">
        <span className="w-2 h-2 rounded-full bg-[color:var(--amber-500)]" />
        {label}
      </div>
      <div className="mt-3 space-y-2">
        {options.map((o) => (
          <button
            key={o.key}
            data-testid={`decision-option-${o.key}`}
            onClick={() => onChoose(o)}
            className="w-full text-left group rounded-xl border border-[color:var(--granite-200)] bg-white px-4 py-3 hover:border-[color:var(--ice-500)] hover:shadow-md transition flex items-start gap-3"
          >
            <span className="mt-0.5 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[color:var(--granite-900)] text-white text-xs font-display group-hover:bg-[color:var(--ice-500)] transition">
              {o.key}
            </span>
            <span className="text-[14.5px] leading-relaxed text-[color:var(--granite-900)]">
              {o.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ChangeChips({ changes, testId }) {
  const entries = Object.entries(changes);
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" data-testid={testId}>
      {entries.map(([k, v]) => {
        const positive = v >= 0;
        return (
          <span
            key={k}
            className={`inline-flex items-center gap-1 text-[10.5px] font-mono-tick uppercase tracking-widest px-2 py-0.5 rounded-full border ${
              positive
                ? "text-emerald-700 border-emerald-200 bg-emerald-50"
                : "text-rose-700 border-rose-200 bg-rose-50"
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            {k.replace(/_/g, " ")} {positive ? "+" : ""}
            {v}
          </span>
        );
      })}
    </div>
  );
}
