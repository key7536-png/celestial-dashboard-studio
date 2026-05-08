import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/auth" });
  };

  const nickname = user?.email?.split("@")[0] ?? "게스트";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="font-display text-2xl font-semibold text-gradient-mystic tracking-tight">
            자개빛
          </span>
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-foreground/90">
                <span className="text-gradient-mystic font-semibold">{nickname}</span>
                <span className="text-muted-foreground"> 님</span>
              </span>
              <button
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link to="/auth" className="text-muted-foreground hover:text-foreground transition-colors">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
