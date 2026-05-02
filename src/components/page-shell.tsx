import type { ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { ArrowLeft, Loader2, type LucideIcon } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";

interface PageShellProps {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}

export function PageShell({ icon: Icon, title, description, children }: PageShellProps) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col stars-bg">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-10">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gold transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> 대시보드
        </Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-xl bg-gradient-mystic border border-gold/30 shadow-glow flex items-center justify-center">
            <Icon className="h-7 w-7 text-gold" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-semibold text-gradient-gold">{title}</h1>
            <p className="text-muted-foreground text-sm mt-1">{description}</p>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
