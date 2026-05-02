import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, LogOut, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <Moon className="h-6 w-6 text-gold transition-transform group-hover:rotate-12" />
            <Sparkles className="absolute -right-1 -top-1 h-3 w-3 text-primary animate-pulse" />
          </div>
          <span className="font-display text-2xl font-semibold text-gradient-gold">
            Lunara
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-gold transition-colors" activeOptions={{ exact: true }} activeProps={{ className: "text-gold" }}>
            홈
          </Link>
          <Link to="/pricing" className="hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>
            요금제
          </Link>
          {user && (
            <Link to="/dashboard" className="hover:text-gold transition-colors" activeProps={{ className: "text-gold" }}>
              대시보드
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden sm:inline text-xs text-muted-foreground">
                {user.email}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">로그인</Link>
              </Button>
              <Button size="sm" className="bg-gradient-mystic shadow-glow hover:opacity-90" asChild>
                <Link to="/auth">시작하기</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}