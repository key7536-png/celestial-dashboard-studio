import { createFileRoute } from "@tanstack/react-router";
import { ChatScaffold, drawTarot } from "@/components/chat-scaffold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/chat/relation")({
  head: () => ({ meta: [{ title: "관계 타로 채팅 — 자개빛" }] }),
  component: RelationChat,
});

interface Form {
  name: string; partner: string; question: string;
  myCards: string[]; partnerCards: string[];
}

function RelationChat() {
  return (
    <ChatScaffold<Form>
      chatType="relation"
      aiMode="tarot-relation"
      title="관계 타로 채팅 상담"
      subtitle="두 사람 관계에 대한 타로 답변을 만들어드려요"
      submitLabel="💞 관계 답변 생성"
      initialForm={{ name: "", partner: "", question: "", myCards: [], partnerCards: [] }}
      validate={(f) => (!f.name || !f.partner || !f.question.trim()) ? "이름·상대·질문을 모두 입력해주세요."
        : (f.myCards.length === 0 || f.partnerCards.length === 0) ? "양쪽 카드를 모두 뽑아주세요." : null}
      buildPayload={(f) => ({
        myCards: f.myCards, partnerCards: f.partnerCards,
        question: `[${f.name} ↔ ${f.partner}] ${f.question}`,
        mySituation: "",
      })}
      clientName={(f) => `${f.name} - ${f.partner}`}
      renderForm={(f, set) => (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="내담자 이름"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
            <Field label="상대 (이름/관계)"><Input value={f.partner} onChange={(e) => set({ partner: e.target.value })} placeholder="예: 남자친구" /></Field>
          </div>
          <Field label="질문">
            <Textarea
              value={f.question}
              onChange={(e) => set({ question: e.target.value })}
              placeholder="예: 이 관계가 발전할까요? 상대방 마음은?"
              className="min-h-[80px]"
            />
          </Field>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">내담자 카드 (3장)</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => set({ myCards: drawTarot(3) })}>
                <Sparkles className="h-3.5 w-3.5 mr-1" /> 뽑기
              </Button>
            </div>
            <CardGrid cards={f.myCards} accent="primary" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">상대방 카드 (3장)</Label>
              <Button type="button" size="sm" variant="outline" onClick={() => set({ partnerCards: drawTarot(3) })}>
                <Sparkles className="h-3.5 w-3.5 mr-1" /> 뽑기
              </Button>
            </div>
            <CardGrid cards={f.partnerCards} accent="pink" />
          </div>
        </>
      )}
    />
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

function CardGrid({ cards, accent }: { cards: string[]; accent: "primary" | "pink" }) {
  if (cards.length === 0) return <p className="text-xs text-muted-foreground">아직 뽑지 않았어요</p>;
  const cls = accent === "primary"
    ? "from-primary/20 to-purple-500/20 border-primary/60"
    : "from-pink-500/20 to-rose-500/20 border-pink-500/60";
  return (
    <div className="grid grid-cols-3 gap-2">
      {cards.map((c, i) => (
        <div key={i} className={`aspect-[2/3] rounded-lg bg-gradient-to-br ${cls} border-2 flex items-center justify-center text-center text-xs px-1 font-medium`}>
          {c}
        </div>
      ))}
    </div>
  );
}
