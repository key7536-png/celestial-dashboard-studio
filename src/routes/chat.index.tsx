import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/chat/")({
  head: () => ({ meta: [{ title: "채팅 상담 — 자개빛" }] }),
  component: ChatHub,
});

const MENUS = [
  { to: "/chat/saju",     emoji: "🔮", title: "개인 사주 채팅",         desc: "한 명의 사주로 카톡 답변을 만들어드려요" },
  { to: "/chat/couple",   emoji: "💑", title: "궁합(커플) 채팅",        desc: "두 사람 생년월일로 궁합 답변을 만들어드려요" },
  { to: "/chat/tarot",    emoji: "🃏", title: "개인 타로 채팅",         desc: "한 사람의 타로 답변을 만들어드려요" },
  { to: "/chat/relation", emoji: "💞", title: "관계 타로 채팅",         desc: "두 사람 관계에 대한 타로 답변을 만들어드려요" },
  { to: "/chat/free",     emoji: "🎁", title: "무료 타로 채팅 (1질문)", desc: "첫 질문은 무료로 봐드린다고 안내하는 채팅이에요" },
] as const;

function ChatHub() {
  return (
    <PageShell icon={MessageCircle} title="채팅 상담" description="사주·타로 카톡 답변 생성">
      <div className="grid sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
        {MENUS.map((m) => (
          <Link
            key={m.to}
            to={m.to}
            className="rounded-2xl border border-border/60 bg-card/50 p-7 hover:border-primary/50 hover:bg-card/80 transition-all"
          >
            <div className="text-4xl mb-4">{m.emoji}</div>
            <h3 className="font-display text-lg font-semibold mb-1.5">{m.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
