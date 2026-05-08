import { createFileRoute } from "@tanstack/react-router";
import { ChatScaffold, drawTarot } from "@/components/chat-scaffold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/chat/tarot")({
  head: () => ({ meta: [{ title: "개인 타로 채팅 — 자개빛" }] }),
  component: TarotChat,
});

interface Form { name: string; question: string; cardCount: number; cards: string[] }

function TarotChat() {
  return (
    <ChatScaffold<Form>
      chatType="tarot"
      aiMode="tarot-personal"
      title="개인 타로 채팅 상담"
      subtitle="한 사람의 타로 답변을 만들어드려요"
      submitLabel="🃏 타로 답변 생성"
      initialForm={{ name: "", question: "", cardCount: 3, cards: [] }}
      validate={(f) => (!f.name || !f.question.trim()) ? "이름과 질문을 입력해주세요." : f.cards.length === 0 ? "카드를 먼저 뽑아주세요." : null}
      buildPayload={(f) => ({ question: `[${f.name}] ${f.question}`, cards: f.cards })}
      clientName={(f) => f.name}
      renderForm={(f, set) => (
        <>
          <Field label="내담자 이름"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="질문"><Textarea value={f.question} onChange={(e) => set({ question: e.target.value })} className="min-h-[80px]" /></Field>
          <div className="space-y-2">
            <Label className="text-xs">카드 수</Label>
            <div className="flex gap-2">
              {[1,3,5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => set({ cardCount: n })}
                  className={`px-4 py-1.5 rounded-md text-xs border ${f.cardCount === n ? "bg-primary text-primary-foreground border-primary" : "border-border"}`}
                >{n}장</button>
              ))}
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => set({ cards: drawTarot(f.cardCount) })}>
            <Sparkles className="h-3.5 w-3.5 mr-1" /> 카드 뽑기
          </Button>
          {f.cards.length > 0 && (
            <div className="grid grid-cols-3 gap-2 pt-1">
              {f.cards.map((c, i) => (
                <div key={i} className="aspect-[2/3] rounded-lg bg-gradient-to-br from-primary/20 to-pink-500/20 border-2 border-primary/60 flex items-center justify-center text-center text-xs px-1 font-medium">
                  {c}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
