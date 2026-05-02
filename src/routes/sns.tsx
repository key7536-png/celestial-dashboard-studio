import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft, Search, Loader2, Copy } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/sns")({
  head: () => ({ meta: [{ title: "SNS 홍보 — 자개빛" }] }),
  component: SnsPage,
});

type QType = "YES/NO" | "4카드" | "타임라인" | "경징";
type Question = { emoji: string; q: string; type: QType; cat: string };

const TAROT_QUESTIONS: Question[] = [
  { emoji: "📱", q: "이번주 안에 연락 올까요?", type: "YES/NO", cat: "연애" },
  { emoji: "❤️", q: "그 사람 나 좋아해?", type: "YES/NO", cat: "연애" },
  { emoji: "🔄", q: "우리 재회할 수 있을까?", type: "YES/NO", cat: "연애" },
  { emoji: "💬", q: "썸남/썸녀 속마음은?", type: "4카드", cat: "연애" },
  { emoji: "✉️", q: "고백하면 성공할까?", type: "YES/NO", cat: "연애" },
  { emoji: "🤔", q: "이 관계 계속해도 될까?", type: "YES/NO", cat: "연애" },
  { emoji: "💔", q: "올해 안에 연인 생길까?", type: "YES/NO", cat: "연애" },
  { emoji: "🚩", q: "그 사람 바람 피고 있을까?", type: "YES/NO", cat: "연애" },
  { emoji: "😢", q: "이별 후 상대방 후회할까?", type: "YES/NO", cat: "연애" },
  { emoji: "😤", q: "짝사랑 이루어질까?", type: "YES/NO", cat: "연애" },
  { emoji: "⭐", q: "이번달 나의 운세는?", type: "4카드", cat: "연애" },
  { emoji: "📖", q: "지금 내 인생 어디쯤이야?", type: "타임라인", cat: "인생" },
  { emoji: "🍀", q: "올해 가장 행운이 오는 달은?", type: "경징", cat: "연애" },
  { emoji: "👀", q: "지금 내가 놓치고 있는 것은?", type: "4카드", cat: "인생" },
  { emoji: "✨", q: "나의 숨겨진 재능은?", type: "4카드", cat: "인생" },
  { emoji: "💼", q: "이직해도 될까?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "💰", q: "이번달 금전운은?", type: "4카드", cat: "직업/돈" },
  { emoji: "📊", q: "이 사업 성공할까?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "🎓", q: "시험/면접 합격할까?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "🎰", q: "로또 당첨될 운인가?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "😐", q: "그 사람이 거짓말하고 있을까?", type: "YES/NO", cat: "연애" },
  { emoji: "🧙", q: "전생에 나는 누구였을까?", type: "4카드", cat: "특수" },
  { emoji: "🧚", q: "내 수호천사가 전하는 메시지", type: "타임라인", cat: "특수" },
  { emoji: "🔥", q: "내 인생 터닝포인트는 언제?", type: "타임라인", cat: "인생" },
  { emoji: "⚖️", q: "지금 결정 A vs B 뭐가 나아?", type: "4카드", cat: "인생" },
  { emoji: "👫", q: "내 전남친/전여친 지금 뭐해?", type: "4카드", cat: "연애" },
  { emoji: "⚠️", q: "올해 꼭 조심해야 할 것은?", type: "YES/NO", cat: "특수" },
  { emoji: "💎", q: "내가 모르는 나의 매력은?", type: "4카드", cat: "인생" },
  { emoji: "😱", q: "그 사람 다른 이성 있을까?", type: "YES/NO", cat: "연애" },
  { emoji: "🎨", q: "나에게 행운을 가져다줄 색깔은?", type: "경징", cat: "특수" },
  { emoji: "🏃", q: "솔로 탈출 언제?", type: "타임라인", cat: "연애-솔로탈출" },
  { emoji: "🌈", q: "내 꿈은 이루어질까?", type: "YES/NO", cat: "인생" },
  { emoji: "💍", q: "결혼 상대는 어떤 사람?", type: "4카드", cat: "연애" },
  { emoji: "🌙", q: "내 전생 인연은 누구?", type: "4카드", cat: "특수" },
  { emoji: "🌐", q: "지금 우주가 나에게 보내는 신호", type: "4카드", cat: "특수" },
  { emoji: "💝", q: "현재 썸남과의 관계, 앞으로 어떻게 흘러갈까요?", type: "4카드", cat: "연애-관계운" },
  { emoji: "⭐", q: "새로운 인연은 언제쯤 나타날까요? 어떤 사람일까요?", type: "타임라인", cat: "연애-솔로탈출" },
  { emoji: "💔", q: "헤어진 그 사람, 다시 만날 수 있을까요?", type: "YES/NO", cat: "연애" },
  { emoji: "💑", q: "그 사람과 나는 천생연분일까요?", type: "경징", cat: "연애" },
  { emoji: "💌", q: "짝사랑 상대에게 고백해도 될까요? 성공할까요?", type: "YES/NO", cat: "연애" },
  { emoji: "💍", q: "이 사람과 결혼해도 행복할까요? 우리의 미래는?", type: "4카드", cat: "연애" },
  { emoji: "😔", q: "우리 관계에 위기가 찾아왔어요. 극복할 수 있을까요?", type: "타임라인", cat: "연애-관계운" },
  { emoji: "👫", q: "가까운 이성 친구, 혹시 나를 좋아할까요?", type: "YES/NO", cat: "연애" },
  { emoji: "☕", q: "소개팅에서 좋은 인상을 남기려면 어떻게 해야 할까요?", type: "경징", cat: "연애-솔로탈출" },
  { emoji: "💧", q: "이별 후유증, 언제쯤 괜찮아질까요?", type: "타임라인", cat: "연애" },
  { emoji: "👩‍❤️‍👨", q: "나의 미래 배우자는 어떤 사람일까요?", type: "4카드", cat: "연애" },
  { emoji: "✨", q: "나의 연애 매력 포인트는 무엇일까요?", type: "경징", cat: "연애-솔로탈출" },
  { emoji: "❓", q: "두 사람 중 누가 나에게 더 좋은 인연일까요?", type: "YES/NO", cat: "연애" },
  { emoji: "😊", q: "연인에게 말 못할 비밀, 어떻게 해야 할까요?", type: "타임라인", cat: "연애" },
  { emoji: "💡", q: "내 연애에 필요한 핵심 조언은 무엇일까요?", type: "경징", cat: "연애" },
  { emoji: "😤", q: "연인과 싸웠어요. 먼저 화해해도 괜찮을까요?", type: "YES/NO", cat: "연애" },
  { emoji: "🌟", q: "나의 숨겨진 재능은? 잠재력을 깨워 부자 되는 법!", type: "경징", cat: "직업/돈" },
  { emoji: "💳", q: "이번 달 월급, 어떻게 관리해야 현명할까? 나만의 재테크 전략!", type: "타임라인", cat: "직업/돈" },
  { emoji: "💡", q: "창업을 꿈꾸는 당신! 나에게 맞는 아이템은?", type: "4카드", cat: "직업/돈" },
  { emoji: "💻", q: "새로운 부업, 나에게 득이 될까?", type: "4카드", cat: "직업/돈" },
  { emoji: "📈", q: "나의 소비 패턴, 괜찮을까?", type: "타임라인", cat: "직업/돈" },
  { emoji: "👔", q: "내 상사와의 관계, 어떻게 해야 풀릴까?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "📅", q: "현재 하는 일, 꾸준히 하는 것이 맞을까?", type: "YES/NO", cat: "직업/돈" },
  { emoji: "🎯", q: "나의 적성은 무엇일까?", type: "4카드", cat: "직업/돈" },
  { emoji: "😔", q: "갑작스러운 지출, 이번 달 재정은 괜찮을까?", type: "경징", cat: "직업/돈" },
  { emoji: "🏠", q: "지금 집을 살까 말까 고민 중인데, 좋은 결정일까요?", type: "4카드", cat: "인생" },
  { emoji: "😊", q: "새로운 사람들과의 관계, 어떻게 시작해야 할까요?", type: "경징", cat: "인생" },
  { emoji: "🌱", q: "나는 어떤 것을 성장시켜야 할까?", type: "경징", cat: "인생" },
  { emoji: "💼", q: "내년 나의 커리어 운, 이렇게 흘러갈 거예요!", type: "타임라인", cat: "인생" },
  { emoji: "😤", q: "그 선택, 정말 괜찮을까요? YES or NO?", type: "YES/NO", cat: "인생" },
  { emoji: "💰", q: "나의 재물운, 이렇게 달라질 거예요!", type: "4카드", cat: "인생" },
  { emoji: "🔑", q: "올해, 내가 집중해야 할 인생의 키워드는?", type: "4카드", cat: "인생" },
  { emoji: "✈️", q: "운명적인 여행지는 어디일까요?", type: "타임라인", cat: "인생" },
  { emoji: "👥", q: "나에게 힘이 되어줄 친구는 누구일까요?", type: "경징", cat: "인생" },
  { emoji: "😊", q: "나의 행복 지수를 높여줄 것은 무엇일까요?", type: "YES/NO", cat: "인생" },
  { emoji: "🦋", q: "인생의 전환점을 위한 메시지는?", type: "타임라인", cat: "특수" },
  { emoji: "✏️", q: "상처받은 마음, 어떻게 치유할까요?", type: "경징", cat: "특수" },
  { emoji: "💔", q: "나의 연약함, 괜찮을까요?", type: "타임라인", cat: "특수" },
  { emoji: "🙏", q: "지금 감사해야 할 것은 무엇일까요?", type: "4카드", cat: "특수" },
  { emoji: "🌙", q: "어젯밤 꿈, 나에게 어떤 메시지를 전해주고 있을까요?", type: "4카드", cat: "특수" },
  { emoji: "💝", q: "내 소울메이트는 어떤 사람이며, 언제 만날 수 있을까요?", type: "경징", cat: "특수" },
  { emoji: "💼", q: "지금 고민하는 이직, 나에게 정말 맞는 선택일까요?", type: "YES/NO", cat: "특수" },
];

const SAJU_QUESTIONS: Question[] = [
  { emoji: "💰", q: "올해 나의 재물운은 어떤가요?", type: "YES/NO", cat: "재물" },
  { emoji: "❤️", q: "올해 인연이 찾아올까요?", type: "YES/NO", cat: "연애" },
  { emoji: "💼", q: "직장운이 좋아질까요?", type: "4카드", cat: "직업" },
  { emoji: "🏥", q: "건강에 특별히 조심해야 할 것은?", type: "경징", cat: "건강" },
  { emoji: "🏠", q: "올해 이사하면 좋을까요?", type: "YES/NO", cat: "인생" },
  { emoji: "📚", q: "학업운은 어떤가요?", type: "4카드", cat: "직업" },
  { emoji: "👨‍👩‍👧", q: "가족 관계가 좋아질까요?", type: "YES/NO", cat: "가족" },
  { emoji: "🌟", q: "올해 나의 전반적인 운세는?", type: "타임라인", cat: "연애" },
  { emoji: "💍", q: "결혼 운이 들어올까요?", type: "YES/NO", cat: "연애" },
  { emoji: "🚗", q: "사고수가 있나요?", type: "YES/NO", cat: "특수" },
];

const ZODIAC_QUESTIONS: Question[] = [
  { emoji: "♈", q: "양자리의 이번 달 연애운은?", type: "YES/NO", cat: "연애" },
  { emoji: "♉", q: "황소자리의 재물운 상승 시기는?", type: "4카드", cat: "재물" },
  { emoji: "♊", q: "쌍둥이자리, 지금 결정을 내려도 될까요?", type: "YES/NO", cat: "인생" },
  { emoji: "♋", q: "게자리의 올해 사랑 운세는?", type: "타임라인", cat: "연애" },
  { emoji: "♌", q: "사자자리, 지금이 도전할 때일까요?", type: "YES/NO", cat: "직업" },
  { emoji: "♍", q: "처녀자리의 건강 주의 사항은?", type: "경징", cat: "건강" },
  { emoji: "♎", q: "천칭자리, 중요한 선택의 기로에 서 있어요", type: "4카드", cat: "인생" },
  { emoji: "♏", q: "전갈자리의 숨겨진 매력은?", type: "경징", cat: "인생" },
];

const TAB_TOTALS = { tarot: 353, saju: 77, zodiac: 30 };
const TAROT_FILTERS = ["전체", "연애", "인생", "직업/돈", "특수", "연애-관계운", "연애-솔로탈출"];
const SAJU_FILTERS = ["전체", "연애", "재물", "직업", "건강", "가족"];
const ZODIAC_FILTERS = ["전체", "연애", "재물", "직업"];

function badgeClass(type: QType) {
  switch (type) {
    case "YES/NO": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/40";
    case "4카드": return "bg-muted/40 text-muted-foreground border-border";
    case "타임라인": return "bg-blue-500/15 text-blue-400 border-blue-500/40";
    case "경징": return "bg-amber-500/15 text-amber-400 border-amber-500/40";
  }
}

function badgeIcon(type: QType) {
  switch (type) {
    case "YES/NO": return "✅";
    case "4카드": return "📱";
    case "타임라인": return "📈";
    case "경징": return "🏆";
  }
}

function SnsPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState<"tarot" | "saju" | "zodiac">("tarot");
  const [filter, setFilter] = useState("전체");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Question | null>(null);

  const dataset = activeTab === "tarot" ? TAROT_QUESTIONS : activeTab === "saju" ? SAJU_QUESTIONS : ZODIAC_QUESTIONS;
  const filters = activeTab === "tarot" ? TAROT_FILTERS : activeTab === "saju" ? SAJU_FILTERS : ZODIAC_FILTERS;

  const filtered = useMemo(() => {
    return dataset.filter((it) => {
      const okCat = filter === "전체" || it.cat === filter;
      const okSearch = !search || it.q.toLowerCase().includes(search.toLowerCase());
      return okCat && okSearch;
    });
  }, [dataset, filter, search]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <Link to="/dashboard" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="h-4 w-4" /> 대시보드
        </Link>

        <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6">📢 SNS 콘텐츠 메이커</h1>

        {/* Category tabs */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          {([
            { key: "tarot", label: `📱 타로 (${TAB_TOTALS.tarot})` },
            { key: "saju", label: `🔴 사주 (${TAB_TOTALS.saju})` },
            { key: "zodiac", label: `⭐ 별자리 (${TAB_TOTALS.zodiac})` },
          ] as const).map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setFilter("전체"); }}
              className={cn(
                "py-3 rounded-lg text-sm font-medium transition-colors border",
                activeTab === t.key
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/40 text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="질문 검색..."
            className="pl-9 bg-card/60 border-border/60"
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs whitespace-nowrap border transition-colors",
                filter === f
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card/40 text-muted-foreground border-border hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Question grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">검색 결과가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((q, i) => (
              <button
                key={`${q.q}-${i}`}
                onClick={() => setSelected(q)}
                className="p-4 rounded-xl bg-card border border-border/60 hover:border-primary/60 hover:shadow-glow transition-all text-left flex flex-col gap-2 min-h-[140px]"
              >
                <div className="text-2xl">{q.emoji}</div>
                <div className="text-sm text-foreground line-clamp-2 flex-1">{q.q}</div>
                <span className={cn("self-start text-[10px] px-2 py-0.5 rounded-full border", badgeClass(q.type))}>
                  {badgeIcon(q.type)} {q.type}
                </span>
              </button>
            ))}
          </div>
        )}
      </main>

      <ContentDialog
        question={selected}
        open={!!selected}
        onOpenChange={(o) => { if (!o) setSelected(null); }}
      />
    </div>
  );
}

/* ------------------------- 콘텐츠 생성 모달 ------------------------- */
function ContentDialog({
  question, open, onOpenChange,
}: {
  question: Question | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [tab, setTab] = useState<"shorts" | "thread" | "caption">("shorts");
  // Shorts
  const [length, setLength] = useState("60초");
  const [tone, setTone] = useState("신비로운");
  // Thread
  const [count, setCount] = useState(5);
  const [hashtags, setHashtags] = useState(true);
  // Caption
  const [mood, setMood] = useState("신비로운");
  const [emoji, setEmoji] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    if (!question) return;
    setGenerating(true);
    setResult("");
    try {
      const options =
        tab === "shorts" ? { length, tone } :
        tab === "thread" ? { count, hashtags } :
        { mood, emoji };
      const { data, error } = await supabase.functions.invoke("sns-content", {
        body: { question: question.q, contentType: tab, options },
      });
      if (error) throw error;
      const content = (data as { content?: string })?.content ?? "";
      if (!content) {
        toast.error("결과가 비어있습니다.");
        return;
      }
      setResult(content);
      toast.success("생성 완료!");
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast.success("복사됨!");
    } catch {
      toast.error("복사 실패");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>✦ SNS 콘텐츠 생성</DialogTitle>
        </DialogHeader>

        {question && (
          <Card className="p-4 bg-card/60 border-border/60 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{question.emoji}</span>
              <span className="text-sm">{question.q}</span>
            </div>
          </Card>
        )}

        <Tabs value={tab} onValueChange={(v) => { setTab(v as typeof tab); setResult(""); }}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="shorts">📱 숏츠 대본</TabsTrigger>
            <TabsTrigger value="thread">🧵 쓰레드</TabsTrigger>
            <TabsTrigger value="caption">📸 인스타 캡션</TabsTrigger>
          </TabsList>

          <TabsContent value="shorts" className="space-y-3 mt-4">
            <PillGroup label="길이" options={["30초", "60초", "90초"]} value={length} onChange={setLength} />
            <PillGroup label="톤" options={["신비로운", "친근한", "전문적인"]} value={tone} onChange={setTone} />
            <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <>🎬 대본 생성</>}
            </Button>
          </TabsContent>

          <TabsContent value="thread" className="space-y-3 mt-4">
            <PillGroup label="게시물 수" options={["3", "5", "7"]} value={String(count)} onChange={(v) => setCount(Number(v))} />
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span className="text-sm">해시태그 자동 추천</span>
              <Switch checked={hashtags} onCheckedChange={setHashtags} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <>🧵 쓰레드 생성</>}
            </Button>
          </TabsContent>

          <TabsContent value="caption" className="space-y-3 mt-4">
            <PillGroup label="이미지 분위기" options={["신비로운", "감성적인", "유머러스한"]} value={mood} onChange={setMood} />
            <div className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2">
              <span className="text-sm">이모지 포함</span>
              <Switch checked={emoji} onCheckedChange={setEmoji} />
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
              {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <>📸 캡션 생성</>}
            </Button>
          </TabsContent>
        </Tabs>

        {result && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">결과</span>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />복사
              </Button>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 whitespace-pre-wrap text-sm leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function PillGroup({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">{label}:</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={cn(
            "text-xs px-3 py-1.5 rounded-full border transition-colors",
            value === o
              ? "bg-primary/15 border-primary text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
