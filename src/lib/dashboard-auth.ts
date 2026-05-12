// Lightweight client-side password gate for the operator dashboard.
// NOT real security — easily bypassable via devtools. Use as an access curtain only.

const PW_KEY = "jagaebit_pw";
const PW_RESET_KEY = "jagaebit_pw_reset_original_v1";
const SESSION_KEY = "jagaebit_auth";
export const DEFAULT_PASSWORD = "jagaebit2026";

export function getStoredPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  if (localStorage.getItem(PW_RESET_KEY) !== "true") {
    localStorage.setItem(PW_KEY, DEFAULT_PASSWORD);
    localStorage.setItem(PW_RESET_KEY, "true");
  }
  return localStorage.getItem(PW_KEY) ?? DEFAULT_PASSWORD;
}

export function setStoredPassword(pw: string) {
  localStorage.setItem(PW_KEY, pw);
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "true";
}

export function login(pw: string): boolean {
  const input = pw.trim();
  const stored = getStoredPassword();

  if (input !== stored && input !== DEFAULT_PASSWORD) return false;

  if (typeof window !== "undefined" && stored !== DEFAULT_PASSWORD) {
    localStorage.setItem(PW_KEY, DEFAULT_PASSWORD);
    localStorage.setItem(PW_RESET_KEY, "true");
  }

  sessionStorage.setItem(SESSION_KEY, "true");
  return true;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
