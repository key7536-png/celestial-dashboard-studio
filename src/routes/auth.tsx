import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "입장 — 자개빛" }] }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading, signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  const handleEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("올바른 이메일을 입력해주세요");
      return;
    }
    setSubmitting(true);
    try {
      await signInWithEmail(email);
      toast.success("환영합니다 ✨");
      navigate({ to: "/dashboard" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cosmic opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <span className="font-display text-3xl font-semibold text-gradient-mystic">자개빛</span>
        </Link>

        <div className="rounded-2xl border border-primary/20 bg-card/80 backdrop-blur-xl p-8 shadow-card-mystic">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h1 className="font-display text-2xl font-semibold mb-1">전문가 대시보드 입장</h1>
            <p className="text-sm text-muted-foreground">이메일만 입력하면 바로 시작할 수 있어요</p>
          </div>

          <form onSubmit={handleEnter} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-background/50"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-mystic shadow-glow hover:opacity-90 h-11"
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              전문가 대시보드 입장
            </Button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            20년 명리 전문가의 운영 도구
          </p>
        </div>
      </div>
    </div>
  );
}
