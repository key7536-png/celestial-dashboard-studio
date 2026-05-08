import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "대시보드 — Lunara" }] }),
  component: Dashboard,
});

type MenuItem = {
  to: string;
  title: string;
  desc: string;
  emoji: string;
  badge?: number;
};

const MENU: ReadonlyArray<MenuItem> = [
  { to: "/consultations", title: "상담 관리", desc: "고객 상담을 확인하고 관리하세요", emoji: "💬" },
  { to: "/content", title: "콘텐츠 생성", desc: "전자책, 썸네일, 상세페이지 만들기", emoji: "📖" },
  { to: "/sns", title: "SNS 홍보", desc: "숏츠 영상 & 쓰레드 텍스트 자동 생성", emoji: "📣" },
  { to: "/card-designer", title: "카드 디자인", desc: "나만의 타로 카드팩 만들기", emoji: "🃏" },
  { to: "/my-shop", title: "내 상점", desc: "상점 디자인과 정보 관리", emoji: "🏪" },
  { to: "/products", title: "상품 관리", desc: "상점에 노출될 상품 등록·수정", emoji: "📦" },
  { to: "/chat", title: "채팅 상담", desc: "사주·타로 AI 채팅 5종", emoji: "💬" },
  { to: "/fortune-pdf", title: "운세 PDF", desc: "종합사주·종합타로 PDF 생성", emoji: "📋" },
  { to: "/tarot-pdf", title: "MZ타로 PDF", desc: "고객 질문 → 카드 3장 → MZ톤 PDF", emoji: "🌸" },
  { to: "/video-maker", title: "영상 메이커", desc: "타로·사주 유튜브 대본 생성", emoji: "🎬" },
  { to: "/settings", title: "설정", desc: "API 키 및 계정 설정", emoji: "⚙️" },
];

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeConsultations, setActiveConsultations] = useState(0);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchCount = async () => {
      const { count } = await supabase
        .from("consultations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .in("status", ["무료상담중", "유료상담중"]);
      setActiveConsultations(count ?? 0);
    };
    fetchCount();
    const channel = supabase
      .channel(`dashboard-consultations:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultations", filter: `user_id=eq.${user.id}` },
        () => fetchCount(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const nickname = user.email?.split("@")[0] ?? "별빛 여행자";

  return (
    <div className="min-h-screen flex flex-col grid-bg">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-6 py-12 max-w-6xl">
        <div className="mb-12">
          <h1 className="font-display text-4xl md:text-5xl font-semibold flex items-center gap-3 tracking-tight">
            <span className="text-foreground">안녕하세요,</span>
            <span className="text-gradient-mystic">{nickname}님!</span>
            <span className="text-primary text-3xl">✦</span>
          </h1>
          <p className="text-muted-foreground mt-3 text-base">나만의 타로 상점을 관리하세요</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MENU.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm p-7 hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              {(() => {
                const badge = item.to === "/consultations" ? activeConsultations : item.badge ?? 0;
                return badge > 0 ? (
                  <span className="absolute -top-2 -right-2 h-6 min-w-6 px-1.5 rounded-full bg-destructive text-destructive-foreground text-xs font-semibold flex items-center justify-center shadow-glow">
                    {badge}
                  </span>
                ) : null;
              })()}
              <div className="text-4xl mb-5 group-hover:scale-110 transition-transform inline-block">
                {item.emoji}
              </div>
              <h3 className="font-display text-xl font-semibold mb-1.5 text-foreground">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
