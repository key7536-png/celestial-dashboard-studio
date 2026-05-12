import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { login, isAuthed } from "@/lib/dashboard-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "입장 — 자개빛 JAGAEBIT" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthed()) navigate({ to: "/dashboard" });
  }, [navigate]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    if (login(pw)) {
      navigate({ to: "/dashboard" });
    } else {
      setError("비밀번호가 올바르지 않습니다");
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0a0f" }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 shadow-2xl"
        style={{
          background: "#13131a",
          border: "1px solid rgba(183, 148, 244, 0.35)",
          boxShadow: "0 0 60px rgba(183, 148, 244, 0.15)",
        }}
      >
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1
            className="font-display text-3xl font-semibold mb-1"
            style={{
              background: "linear-gradient(135deg, #b794f4, #f6ad55)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            자개빛 JAGAEBIT
          </h1>
          <p className="text-sm text-muted-foreground">전문가 전용 운영 대시보드</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="비밀번호"
              autoFocus
              className="w-full h-12 px-4 pr-11 rounded-lg bg-background/40 border border-border/60 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/60 transition-colors"
              style={{ background: "#0a0a0f" }}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-rose-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !pw}
            className="w-full h-12 rounded-lg font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90 inline-flex items-center justify-center gap-2"
            style={{
              background: "linear-gradient(135deg, #b794f4 0%, #805ad5 100%)",
              boxShadow: "0 8px 24px rgba(183, 148, 244, 0.3)",
            }}
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            입장하기
          </button>
        </form>
      </div>
    </div>
  );
}
