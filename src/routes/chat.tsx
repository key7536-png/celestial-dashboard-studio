import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "채팅 상담 — 자개빛" }] }),
  component: ChatPage,
});

const TYPES = [
  { emoji: "🔮", title: "타로 1장 뽑기", desc: "오늘의 한 장 카드 리딩" },
  { emoji: "🃏", title: "타로 3장 스프레드", desc: "과거·현재·미래 해석" },
  { emoji: "✨", title: "사주 간이 풀이", desc: "생년월일로 보는 운세" },
  { emoji: "💖", title: "연애운 상담", desc: "관계와 인연에 대한 조언" },
  { emoji: "💼", title: "직업·재물운", desc: "커리어와 금전운 분석" },
];

function ChatPage() {
  return (
    <PageShell icon={MessageCircle} title="채팅 상담" description="사주·타로 AI 채팅 5종">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
        {TYPES.map((t) => (
          <Card key={t.title} className="p-6 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="text-3xl mb-3">{t.emoji}</div>
            <h3 className="font-display text-lg font-semibold mb-1">{t.title}</h3>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        ✦ 채팅 UI는 곧 연결됩니다
      </p>
    </PageShell>
  );
}
