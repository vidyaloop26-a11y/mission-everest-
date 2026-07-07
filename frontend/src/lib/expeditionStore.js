// Simple sessionStorage-backed store for the Mission Everest simulation.
// A future migration path to Supabase can replace these helpers without
// touching call-sites.

const KEY = "mission_everest_state";

export const DEFAULT_STATE = {
  intern_name: "",
  current_day: 1,
  current_scene_index: 0, // pointer into current day's scenes array
  onboarded: false,
  day1_completed_decisions: {},
  day2_completed_decisions: {},
  day3_completed_decisions: {},
  day1_reflection_choice: null,
  day2_reflection_choice: null,
  day3_reflection_choice: null,
  variables: {
    leadership: 50,
    teamwork: 50,
    risk_management: 50,
    decision_quality: 50,
    weather_risk: 50,
    team_health: 50,
    summit_readiness: 50,
    expedition_progress: 0,
    trust_arjun: 50,
    trust_maya: 50,
    trust_tenzin: 50,
    trust_priya: 50,
  },
};

export function loadState() {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATE,
      ...parsed,
      variables: { ...DEFAULT_STATE.variables, ...(parsed.variables || {}) },
      day1_completed_decisions: { ...(parsed.day1_completed_decisions || {}) },
      day2_completed_decisions: { ...(parsed.day2_completed_decisions || {}) },
      day3_completed_decisions: { ...(parsed.day3_completed_decisions || {}) },
    };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function saveState(state) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(state));
}

export function resetState() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}

export function applyChanges(variables, changes) {
  const next = { ...variables };
  for (const [k, v] of Object.entries(changes || {})) {
    next[k] = (next[k] ?? 0) + v;
  }
  return next;
}

export const VARIABLE_LABELS = {
  leadership: "Leadership",
  teamwork: "Teamwork",
  risk_management: "Risk Management",
  decision_quality: "Decision Quality",
  weather_risk: "Weather Risk",
  team_health: "Team Health",
  summit_readiness: "Summit Readiness",
  expedition_progress: "Expedition Progress",
  trust_arjun: "Trust · Arjun",
  trust_maya: "Trust · Maya",
  trust_tenzin: "Trust · Tenzin",
  trust_priya: "Trust · Priya",
};
