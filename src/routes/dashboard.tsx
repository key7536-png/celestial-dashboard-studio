import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Sparkles, MessageSquare, BookOpen, Megaphone, Layers, Store, Settings, Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "대시보드 — Lunara" }] }),
  component: Dashboard,
});

const MENU: ReadonlyArray<{
  to: string;
  title: string;
  desc: string;
  icon: typeof MessageSquare;
  badge?: number;
}> = [
  { to: "/consultations", title: "상담 관리", desc: "고객 상담을 확인하고 관리하세요", icon: MessageSquare, badge: 1 },
  { to: "/content", title: "콘텐츠 생성", desc: "전자책, 썸네일, 상세페이지 만들기", icon: BookOpen },
  { to: "/sns", title: "SNS 홍보", desc: "숏츠 영상 & 쓰레드 텍스트 자동 생성", icon: Megaphone },
  { to: "/cards", title: "카드 디자인", desc: "나만의 타로 카드팩 만들기", icon: Layers },
  { to: "/shop", title: "내 상점", desc: "상점 디자인과 정보 관리", icon: Store },
  { to: "/settings", title: "설정", desc: "API 키 및 계정 설정", icon: Settings },
];

function Dashboard() {
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

  const nickname = user.email?.split("@")[0] ?? "별빛 여행자";

  return (
    <div className="min-h-screen flex flex-col stars-bg">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="font-display text-4xl md:text-5xl font-semibold flex items-center gap-3">
            안녕하세요,{" "}
            <span className="text-gradient-gold">{nickname}님!</span>
            <Sparkles className="h-7 w-7 text-gold" />
          </h1>
          <p className="text-muted-foreground mt-2">나만의 타로 상점을 관리하세요</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MENU.map((item) => (
            <Link key={item.to} to={item.to} className="group">
              <Card className="relative h-full p-6 bg-card/60 backdrop-blur-md border-border/50 hover:border-gold/50 hover:shadow-card-mystic transition-all">
                {item.badge ? (
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center shadow-glow">
                    {item.badge}
                  </span>
                ) : null}
                <item.icon className="h-8 w-8 text-gold mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-display text-xl font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
