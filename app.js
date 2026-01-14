// Storage keys
const K_SAVED_PROTOCOL = "looksmaxx95_savedProtocol";
const K_SAVED_GOALS = "looksmaxx95_savedGoals";
const K_DRAFT_TODAY = "looksmaxx95_draftToday";
const K_DRAFT_GOALS = "looksmaxx95_draftGoals";
const K_STREAK = "looksmaxx95_streak";
const K_LAST = "looksmaxx95_lastCheckInISO";

// Elements
const goalsEl = document.getElementById("goals");
const todayEl = document.getElementById("today");
const savedGoalsBox = document.getElementById("savedGoalsBox");
const savedProtocolBox = document.getElementById("savedProtocolBox");
const streakNumEl = document.getElementById("streakNum");
const lastEl = document.getElementById("lastCheckIn");
const statusLine = document.getElementById("statusLine");
const dotEl = document.getElementById("streakDot");
const stateEl = document.getElementById("streakState");

// Helpers
const pad2 = n => String(n).padStart(2,"0");
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
};

const setStatus = msg => statusLine.textContent = `Status: ${msg}`;

const getStreak = () => Number(localStorage.getItem(K_STREAK) || 0);
const setStreak = n => localStorage.setItem(K_STREAK, Math.max(0,n));
const getLast = () => localStorage.getItem(K_LAST) || "";
const setLast = iso => localStorage.setItem(K_LAST, iso);

// Boot
goalsEl.value = localStorage.getItem(K_DRAFT_GOALS) || "";
todayEl.value = localStorage.getItem(K_DRAFT_TODAY) || "";
savedGoalsBox.textContent = localStorage.getItem(K_SAVED_GOALS) || "— nothing saved yet —";
savedProtocolBox.textContent = localStorage.getItem(K_SAVED_PROTOCOL) || "— nothing saved yet —";
streakNumEl.textContent = getStreak();
lastEl.textContent = `Last check-in: ${getLast() || "never"}`;
