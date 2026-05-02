import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "jagaebit:user";

// Lightweight user shape — compatible with existing code that reads user.id / user.email
export interface SimpleUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: SimpleUser | null;
  session: { user: SimpleUser } | null;
  loading: boolean;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Stable per-email pseudo-UUID so Supabase rows scoped by user_id remain consistent across sessions.
async function emailToId(email: string): Promise<string> {
  const data = new TextEncoder().encode(email.trim().toLowerCase());
  const hash = await crypto.subtle.digest("SHA-256", data);
  const b = Array.from(new Uint8Array(hash)).map((x) => x.toString(16).padStart(2, "0")).join("");
  // Format as UUID v4-ish (deterministic, not cryptographically a real v4)
  return `${b.slice(0, 8)}-${b.slice(8, 12)}-4${b.slice(13, 16)}-8${b.slice(17, 20)}-${b.slice(20, 32)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setUser(JSON.parse(raw) as SimpleUser);
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const signInWithEmail = async (email: string) => {
    const id = await emailToId(email);
    const u: SimpleUser = { id, email: email.trim().toLowerCase() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  };

  const signOut = async () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, session: user ? { user } : null, loading, signInWithEmail, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
