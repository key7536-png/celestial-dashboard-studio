import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle, Loader2, Copy, ArrowLeft, Sparkles } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "채팅 상담 — 자개빛" }] }),
  component: ChatPage,
});

type Mode = null | "saju-personal" | "saju-couple" | "tarot-personal" | "tarot-relation" | "tarot-free";

const MENUS: { mode: Exclude<Mode, null>; emoji: string; title: string; desc: string }[] = [
  { mode: "saju-personal",  emoji: "🌙", title: "개인 사주 채팅",  desc: "생년월일로 보는 나의 사주" },
  { mode: "saju-couple",    emoji: "💞", title: "궁합(커플) 채팅", desc: "두 사람 생년월일 궁합 분석" },
  { mode: "tarot-personal", emoji: "🔮", title: "개인 타로 채팅",  desc: "78장 중 3장 뽑기" },
  { mode: "tarot-relation", emoji: "🃏", title: "관계 타로 채팅",  desc: "나·상대 각 3장 관계 리딩" },
  { mode: "tarot-free",     emoji: "✨", title: "무료 타로 채팅",  desc: "1장으로 빠른 메시지" },
];

const TAROT_DECK = [
  "바보(0)","마법사(I)","여사제(II)","여황제(III)","황제(IV)","교황(V)","연인(VI)","전차(VII)","힘(VIII)","은둔자(IX)","운명의수레바퀴(X)",
  "정의(XI)","매달린남자(XII)","죽음(XIII)","절제(XIV)","악마(XV)","탑(XVI)","별(XVII)","달(XVIII)","태양(XIX)","심판(XX)","세계(XXI)",
  "컵 에이스","컵 2","컵 3","컵 4","컵 5","컵 6","컵 7","컵 8","컵 9","컵 10","컵 시종","컵 기사","컵 여왕","컵 왕",
  "검 에이스","검 2","검 3","검 4","검 5","검 6","검 7","검 8","검 9","검 10","검 시종","검 기사","검 여왕","검 왕",
  "동전 에이스","동전 2","동전 3","동전 4","동전 5","동전 6","동전 7","동전 8","동전 9","동전 10","동전 시종","동전 기사","동전 여왕","동전 왕",
  "지팡이 에이스","지팡이 2","지팡이 3","지팡이 4","지팡이 5","지팡이 6","지팡이 7","지팡이 8","지팡이 9","지팡이 10","지팡이 시종","지팡이 기사","지팡이 여왕","지팡이 왕",
];

function pickCards(n: number): string[] {
  const pool = [...TAROT_DECK];
  const out: string[] = [];
  for (let i = 0; i < n; i++) out.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return out;
}

function ChatPage() {
  const [mode, setMode] = useState<Mode>(null);

  return (
    <PageShell icon={MessageCircle} title="채팅 상담" description="사주·타로 AI 채팅 5종">
      {!mode ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {MENUS.map((m) => (
            <button
              key={m.mode}
              onClick={() => setMode(m.mode)}
              className="text-left rounded-2xl border border-border/60 bg-card/50 p-6 hover:border-primary/50 hover:bg-card/80 transition-all"
            >
              <div className="text-4xl mb-3">{m.emoji}</div>
              <h3 className="font-display text-lg font-semibold mb-1">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.desc}</p>
            </button>
          ))}
        </div>
      ) : (
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => setMode(null)}
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4"
          >
            <ArrowLeft className="h-4 w-4" /> 메뉴로
          </button>
          <ChatRoom mode={mode} />
        </div>
      )}
    </PageShell>
  );
}

function ChatRoom({ mode }: { mode: Exclude<Mode, null> }) {
  const { settings } = useUserSettings();
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [mySituation, setMySituation] = useState("");

  // Common fields
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [calendar, setCalendar] = useState("양력");
  const [gender, setGender] = useState("여성");
  const [time, setTime] = useState("");
  const [question, setQuestion] = useState("");
  // Couple
  const [partnerName, setPartnerName] = useState("");
  const [partnerBirth, setPartnerBirth] = useState("");
  // Tarot
  const [cards, setCards] = useState<string[]>([]);
  const [partnerCards, setPartnerCards] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);

  function drawCards(n: number, target: "self" | "partner" = "self") {
    const picked = pickCards(n);
    if (target === "self") {
      setCards(picked);
      setRevealed(new Array(n).fill(false));
    } else {
      setPartnerCards(picked);
    }
  }

  async function handleSend() {
    if (!question.trim() && mode !== "tarot-free") {
      toast.error("질문을 입력해주세요.");
      return;
    }
    let data: Record<string, unknown> = {};
    if (mode === "saju-personal") {
      if (!name || !birth) return toast.error("이름·생년월일을 입력해주세요.");
      data = { name, birth, calendar, gender, time, question };
    } else if (mode === "saju-couple") {
      if (!name || !birth || !partnerName || !partnerBirth) return toast.error("두 사람 정보를 모두 입력해주세요.");
      data = { myName: name, myBirth: birth, partnerName, partnerBirth, question };
    } else if (mode === "tarot-personal") {
      if (cards.length === 0) return toast.error("카드를 먼저 뽑아주세요.");
      data = { question, cards };
    } else if (mode === "tarot-relation") {
      if (cards.length === 0 || partnerCards.length === 0) return toast.error("양쪽 카드를 모두 뽑아주세요.");
      data = { myCards: cards, partnerCards, question, mySituation };
    } else if (mode === "tarot-free") {
      if (!question.trim()) return toast.error("질문을 입력해주세요.");
      if (cards.length === 0) return toast.error("카드를 먼저 뽑아주세요.");
      data = { question, card: cards[0] };
    }

    setLoading(true);
    setAnswer("");
    try {
      const content = await callAI(mode, data, settings?.gemini_api_key);
      setAnswer(content);
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function copyAnswer() {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
    toast.success("복사했습니다.");
  }

  const showSajuFields = mode === "saju-personal";
  const showCoupleFields = mode === "saju-couple";
  const tarotCount = mode === "tarot-personal" ? 3 : mode === "tarot-relation" ? 3 : mode === "tarot-free" ? 1 : 0;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* 좌: 입력 */}
      <Card className="p-6 space-y-4 bg-card/60">
        <h3 className="font-display text-xl font-semibold">{MENUS.find((m) => m.mode === mode)?.title}</h3>

        {showSajuFields && (
          <>
            <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="생년월일"><Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
              <Field label="시간 (모르면 비움)"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="달력">
                <RadioGroup value={calendar} onValueChange={setCalendar} className="flex gap-3">
                  {["양력","음력"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
                  ))}
                </RadioGroup>
              </Field>
              <Field label="성별">
                <RadioGroup value={gender} onValueChange={setGender} className="flex gap-3">
                  {["여성","남성"].map((v) => (
                    <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
                  ))}
                </RadioGroup>
              </Field>
            </div>
          </>
        )}

        {showCoupleFields && (
          <>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-semibold">나</p>
              <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
              <Field label="생년월일"><Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
            </div>
            <div className="space-y-3 pt-2 border-t border-border/40">
              <p className="text-xs text-muted-foreground font-semibold">상대방</p>
              <Field label="이름"><Input value={partnerName} onChange={(e) => setPartnerName(e.target.value)} /></Field>
              <Field label="생년월일"><Input type="date" value={partnerBirth} onChange={(e) => setPartnerBirth(e.target.value)} /></Field>
            </div>
          </>
        )}

        {tarotCount > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{mode === "tarot-relation" ? "나의 카드 (3장)" : `카드 ${tarotCount}장`}</Label>
              <Button size="sm" variant="outline" onClick={() => drawCards(tarotCount, "self")}>
                <Sparkles className="h-3.5 w-3.5 mr-1" />뽑기
              </Button>
            </div>
            <CardRow cards={cards} revealed={revealed} onReveal={(i) => setRevealed((r) => r.map((v, idx) => idx === i ? true : v))} />

            {mode === "tarot-relation" && (
              <>
                <div className="flex items-center justify-between pt-2">
                  <Label>상대 카드 (3장)</Label>
                  <Button size="sm" variant="outline" onClick={() => drawCards(3, "partner")}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />뽑기
                  </Button>
                </div>
                <CardRow cards={partnerCards} revealed={partnerCards.map(() => true)} onReveal={() => {}} />
              </>
            )}
          </div>
        )}

        <Field label="질문">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={mode === "tarot-free" ? "한 가지 질문을 적어주세요" : "궁금한 점을 자세히 적어주세요"}
            className="min-h-[80px]"
          />
        </Field>

        <Button
          onClick={handleSend}
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground"
        >
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />분석 중...</> : "✦ AI에게 묻기"}
        </Button>

        {mode === "tarot-free" && (
          <a href="https://pf.kakao.com" target="_blank" rel="noopener noreferrer" className="block">
            <Button variant="outline" className="w-full">💎 더 깊은 유료 상담 안내</Button>
          </a>
        )}
      </Card>

      {/* 우: 답변 */}
      <Card className="p-6 bg-card/60 min-h-[400px] relative">
        {answer ? (
          <>
            <Button size="sm" variant="ghost" onClick={copyAnswer} className="absolute top-3 right-3">
              <Copy className="h-3.5 w-3.5 mr-1" />복사
            </Button>
            <div className="prose prose-sm prose-invert max-w-none whitespace-pre-wrap pr-16 leading-relaxed">
              {answer}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <Sparkles className="h-10 w-10 mb-3 opacity-50" />
            <p className="text-sm">왼쪽에서 정보를 입력하고<br />AI에게 묻기를 눌러주세요</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function CardRow({ cards, revealed, onReveal }: { cards: string[]; revealed: boolean[]; onReveal: (i: number) => void }) {
  if (cards.length === 0) return <p className="text-xs text-muted-foreground">아직 카드를 뽑지 않았어요</p>;
  return (
    <div className="flex gap-2">
      {cards.map((c, i) => (
        <button
          key={i}
          onClick={() => onReveal(i)}
          className={cn(
            "flex-1 aspect-[2/3] rounded-lg border-2 text-xs font-medium flex items-center justify-center text-center px-1 transition-all",
            revealed[i]
              ? "bg-gradient-to-br from-primary/20 to-pink-500/20 border-primary/60 text-foreground"
              : "bg-gradient-to-br from-indigo-900 to-purple-900 border-indigo-500/40 text-indigo-200 hover:scale-[1.03]",
          )}
        >
          {revealed[i] ? c : "✦"}
        </button>
      ))}
    </div>
  );
}
