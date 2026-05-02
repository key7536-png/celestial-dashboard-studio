import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Moon, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [{ title: "로그인 — Lunara" }],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate({ to: "/dashboard" });
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error("로그인 실패: " + error.message);
      return;
    }
    toast.success("환영합니다! ✨");
    navigate({ to: "/dashboard" });
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const redirectUrl = `${window.location.origin}/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    setSubmitting(false);
    if (error) {
      toast.error("회원가입 실패: " + error.message);
      return;
    }
    toast.success("계정이 생성되었어요! 🌙");
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center stars-bg px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-cosmic opacity-50 pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <Moon className="h-7 w-7 text-gold transition-transform group-hover:rotate-12" />
          <span className="font-display text-3xl font-semibold text-gradient-gold">
            Lunara
          </span>
        </Link>

        <div className="rounded-2xl border border-gold/20 bg-card/80 backdrop-blur-xl p-8 shadow-card-mystic">
          <div className="text-center mb-6">
            <Sparkles className="h-8 w-8 text-gold mx-auto mb-3" />
            <h1 className="font-display text-2xl font-semibold mb-1">
              별이 당신을 기다립니다
            </h1>
            <p className="text-sm text-muted-foreground">
              로그인하고 신비로운 여정을 시작하세요
            </p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-in">이메일</Label>
                  <Input id="email-in" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-in">비밀번호</Label>
                  <Input id="pw-in" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-mystic shadow-glow hover:opacity-90">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  로그인
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-up">이메일</Label>
                  <Input id="email-up" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pw-up">비밀번호 (6자 이상)</Label>
                  <Input id="pw-up" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50" />
                </div>
                <Button type="submit" disabled={submitting} className="w-full bg-gradient-mystic shadow-glow hover:opacity-90">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  회원가입
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
}
