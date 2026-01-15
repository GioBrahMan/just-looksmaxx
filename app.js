// --- Storage keys ---
const K_SAVED_PROTOCOL = "looksmaxx95_savedProtocol";
const K_SAVED_GOALS    = "looksmaxx95_savedGoals";

const K_DRAFT_TODAY    = "looksmaxx95_draftToday";
const K_DRAFT_GOALS    = "looksmaxx95_draftGoals";

const K_STREAK         = "looksmaxx95_streak";
const K_LAST           = "looksmaxx95_lastCheckInISO"; // YYYY-MM-DD

// --- Elements ---
const goalsEl = document.getElementById("goals");
const todayEl = document.getElementById("today");

const savedGoalsBox = document.getElementById("savedGoalsBox");
const savedProtocolBox = document.getElementById("savedProtocolBox");

const streakNumEl = document.getElementById("streakNum");
const lastEl = document.getElementById("lastCheckIn");
const statusLine = document.getElementById("statusLine");

const dotEl = document.getElementById("streakDot");
const stateEl = document.getElementById("streakState");

const saveGoalsBtn = document.getElementById("saveGoalsBtn");
const saveProtocolBtn = document.getElementById("saveProtocolBtn");
const checkInBtn = document.getElementById("checkInBtn");
const resetBtn = document.getElementById("resetBtn");

// --- Guard: if any key element is missing, stop and show why in console ---
const mustExist = [
  ["goals", goalsEl],
  ["today", todayEl],
  ["savedGoalsBox", savedGoalsBox],
  ["savedProtocolBox", savedProtocolBox],
  ["streakNum", streakNumEl],
  ["lastCheckIn", lastEl],
  ["statusLine", statusLine],
  ["streakDot", dotEl],
  ["streakState", stateEl],
  ["saveGoalsBtn", saveGoalsBtn],
  ["saveProtocolBtn", saveProtocolBtn],
  ["checkInBtn", checkInBtn],
  ["resetBtn", resetBtn],
];

const missing = mustExist.filter(([, el]) => !el).map(([id]) => id);
if (missing.length) {
  console.error("Just Looksmaxx: missing element IDs in HTML:", missing);
  // If buttons don't work, this is the #1 reason.
  // Don't throw; just stop.
} else {

  // --- Helpers ---
  const pad2 = (n) => String(n).padStart(2, "0");

  const todayISO = () => {
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
  };

  const parseISODate = (iso) => {
    const [y, m, dd] = (iso || "").split("-").map(Number);
    if (!y || !m || !dd) return null;
    return new Date(y, m - 1, dd);
  };

  const daysBetween = (a, b) => {
    const ms = 24 * 60 * 60 * 1000;
    const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
    return Math.floor((utcB - utcA) / ms);
  };

  const fmtPretty = (iso) => {
    const d = parseISODate(iso);
    if (!d) return "never";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const setStatus = (msg) => { statusLine.textContent = `Status: ${msg}`; };

  const getStreak = () => Number(localStorage.getItem(K_STREAK) || "0");
  const setStreak = (n) => localStorage.setItem(K_STREAK, String(Math.max(0, n)));
  const getLast = () => localStorage.getItem(K_LAST) || "";
  const setLast = (iso) => localStorage.setItem(K_LAST, iso);

  const getSavedGoals = () => localStorage.getItem(K_SAVED_GOALS) || "";
  const getSavedProtocol = () => localStorage.getItem(K_SAVED_PROTOCOL) || "";

  const renderSaved = () => {
    const g = getSavedGoals().trim();
    const p = getSavedProtocol().trim();
    savedGoalsBox.textContent = g ? g : "— nothing saved yet";
    savedProtocolBox.textContent = p ? p : "— nothing saved yet";
  };

  function applyAutoResetIfMissed() {
    const last = getLast();
    if (!last) return;

    const lastD = parseISODate(last);
    const nowD = parseISODate(todayISO());
    if (!lastD || !nowD) return;

    const diff = daysBetween(lastD, nowD);
    if (diff >= 2) setStreak(0);
  }

  function renderStreak() {
    applyAutoResetIfMissed();

    const streak = getStreak();
    const last = getLast();
    const t = todayISO();

    streakNumEl.textContent = String(streak);
    lastEl.textContent = `Last check-in: ${fmtPretty(last)}`;

    if (!last) {
      dotEl.className = "dot warn";
      stateEl.textContent = "not checked in";
    } else if (last === t) {
      dotEl.className = "dot ok";
      stateEl.textContent = "checked in today";
    } else {
      const lastD = parseISODate(last);
      const nowD = parseISODate(t);
      const diff = (lastD && nowD) ? daysBetween(lastD, nowD) : 999;

      if (diff === 1) {
        dotEl.className = "dot warn";
        stateEl.textContent = "check in today";
      } else {
        dotEl.className = "dot bad";
        stateEl.textContent = "streak broken";
      }
    }
  }

  // --- Boot: load drafts + saved reference ---
  goalsEl.value = localStorage.getItem(K_DRAFT_GOALS) || "";
  todayEl.value = localStorage.getItem(K_DRAFT_TODAY) || "";
  renderSaved();
  renderStreak();
  setStatus("ready.");

  // --- Autosave drafts while typing ---
  let t1 = null, t2 = null;

  goalsEl.addEventListener("input", () => {
    clearTimeout(t1);
    t1 = setTimeout(() => {
      localStorage.setItem(K_DRAFT_GOALS, goalsEl.value);
      setStatus("draft goals autosaved.");
    }, 250);
  });

  todayEl.addEventListener("input", () => {
    clearTimeout(t2);
    t2 = setTimeout(() => {
      localStorage.setItem(K_DRAFT_TODAY, todayEl.value);
      setStatus("draft check-in autosaved.");
    }, 250);
  });

  // --- Save buttons (update right-side reference boxes) ---
  saveGoalsBtn.addEventListener("click", () => {
    localStorage.setItem(K_SAVED_GOALS, goalsEl.value);
    renderSaved();
    setStatus("goals saved.");
  });

  saveProtocolBtn.addEventListener("click", () => {
    localStorage.setItem(K_SAVED_PROTOCOL, todayEl.value);
    renderSaved();
    setStatus("protocol saved.");
  });

  // --- Check in ---
  checkInBtn.addEventListener("click", () => {
    const t = todayISO();
    const last = getLast();

    if (last === t) {
      setStatus("already checked in today.");
      renderStreak();
      return;
    }

    const typed = (todayEl.value || "").trim();
    if (!typed) {
      setStatus("type your check-in first (cannot be empty).");
      return;
    }

    applyAutoResetIfMissed();

    const current = getStreak();
    setStreak(current + 1);
    setLast(t);

    setStatus("check-in complete. streak updated.");
    renderStreak();
  });

  // --- Reset ---
  resetBtn.addEventListener("click", () => {
    const ok = confirm("Reset streak and clear ALL fields (drafts + saved reference)? This cannot be undone.");
    if (!ok) return;

    localStorage.removeItem(K_SAVED_PROTOCOL);
    localStorage.removeItem(K_SAVED_GOALS);
    localStorage.removeItem(K_DRAFT_TODAY);
    localStorage.removeItem(K_DRAFT_GOALS);

    localStorage.removeItem(K_STREAK);
    localStorage.removeItem(K_LAST);

    goalsEl.value = "";
    todayEl.value = "";

    renderSaved();
    renderStreak();
    setStatus("reset complete.");
  });
}
