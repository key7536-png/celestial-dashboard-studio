import { createFileRoute } from "@tanstack/react-router";
import { ChatScaffold, drawTarot } from "@/components/chat-scaffold";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { useUserSettings } from "@/hooks/use-user-settings";

export const Route = createFileRoute("/chat/free")({
  head: () => ({ meta: [{ title: "무료 타로 채팅 — 자개빛" }] }),
  component: FreeChat,
});

interface Form { name: string; question: string; cards: string[] }

function FreeChat() {
  const { settings } = useUserSettings();
  return (
    <ChatScaffold<Form>
      chatType="free"
      aiMode="tarot-free"
      title="무료 타로 채팅 (1질문 무료)"
      subtitle="첫 한 질문은 무료로 봐드린다고 안내하는 채팅이에요"
      submitLabel="🎁 무료 답변 생성"
      initialForm={{ name: "", question: "", cards: [] }}
      validate={(f) => (!f.name || !f.question.trim()) ? "이름과 질문을 입력해주세요." : f.cards.length === 0 ? "카드를 먼저 뽑아주세요." : null}
      buildPayload={(f) => ({ question: `[${f.name}] ${f.question}`, card: f.cards[0] })}
      clientName={(f) => f.name}
      footer={
        <div className="rounded-lg border border-primary/40 bg-primary/5 p-3 space-y-2">
          <p className="text-xs">💬 더 자세한 상담은 유료로 진행됩니다</p>
          {settings?.kakao_channel_url ? (
            <a href={settings.kakao_channel_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="w-full border-primary/50">카카오 채널로 상담 →</Button>
            </a>
          ) : (
            <p className="text-[10px] text-muted-foreground">설정에서 카카오 채널 URL을 등록하세요</p>
          )}
        </div>
      }
      renderForm={(f, set) => (
        <>
          <Field label="내담자 이름"><Input value={f.name} onChange={(e) => set({ name: e.target.value })} /></Field>
          <Field label="질문 (1개)"><Textarea value={f.question} onChange={(e) => set({ question: e.target.value })} className="min-h-[80px]" /></Field>
          <Button type="button" variant="outline" size="sm" onClick={() => set({ cards: drawTarot(1) })}>
            <Sparkles className="h-3.5 w-3.5 mr-1" /> 카드 1장 뽑기
          </Button>
          {f.cards.length > 0 && (
            <div className="flex justify-center pt-1">
              <div className="w-32 aspect-[2/3] rounded-lg bg-gradient-to-br from-gold/20 to-primary/20 border-2 border-gold/60 flex items-center justify-center text-center text-sm px-2 font-medium">
                {f.cards[0]}
              </div>
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
