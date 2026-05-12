// Lightweight client-side password gate for the operator dashboard.
// NOT real security — easily bypassable via devtools. Use as an access curtain only.

const PW_KEY = "jagaebit_pw";
const SESSION_KEY = "jagaebit_auth";
const PW_VERSION_KEY = "jagaebit_pw_version";
const PW_VERSION = "2"; // bump to force-reset stored password
export const DEFAULT_PASSWORD = "sj37700@@";

export function getStoredPassword(): string {
  if (typeof window === "undefined") return DEFAULT_PASSWORD;
  // Force reset if version changed (so default password updates take effect)
  if (localStorage.getItem(PW_VERSION_KEY) !== PW_VERSION) {
    localStorage.setItem(PW_KEY, DEFAULT_PASSWORD);
    localStorage.setItem(PW_VERSION_KEY, PW_VERSION);
    return DEFAULT_PASSWORD;
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
  if (pw !== getStoredPassword()) return false;
  sessionStorage.setItem(SESSION_KEY, "true");
  return true;
}

export function logout() {
  sessionStorage.removeItem(SESSION_KEY);
}
