import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, Download, Shuffle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";

export const Route = createFileRoute("/tarot-pdf")({
  head: () => ({ meta: [{ title: "MZ타로 PDF — 자개빛" }] }),
  component: TarotPdfPage,
});

const TAROT_DECK = [
  // 메이저 아르카나 22장
  "바보","마법사","여사제","여황제","황제","교황","연인","전차","힘","은둔자","운명의수레바퀴",
  "정의","매달린사람","죽음","절제","악마","탑","별","달","태양","심판","세계",
  // 완드 14장
  "완드 에이스","완드 2","완드 3","완드 4","완드 5","완드 6","완드 7","완드 8","완드 9","완드 10",
  "완드 시종","완드 기사","완드 여왕","완드 왕",
  // 컵 14장
  "컵 에이스","컵 2","컵 3","컵 4","컵 5","컵 6","컵 7","컵 8","컵 9","컵 10",
  "컵 시종","컵 기사","컵 여왕","컵 왕",
  // 소드 14장
  "소드 에이스","소드 2","소드 3","소드 4","소드 5","소드 6","소드 7","소드 8","소드 9","소드 10",
  "소드 시종","소드 기사","소드 여왕","소드 왕",
  // 펜타클 14장
  "펜타클 에이스","펜타클 2","펜타클 3","펜타클 4","펜타클 5","펜타클 6","펜타클 7","펜타클 8","펜타클 9","펜타클 10",
  "펜타클 시종","펜타클 기사","펜타클 여왕","펜타클 왕",
];

type CardDraw = { name: string; reversed: boolean };
type Reading = { question: string; cards: CardDraw[]; text: string; loading: boolean };

function pickCards(n: number): CardDraw[] {
  const pool = [...TAROT_DECK];
  return Array.from({ length: n }, () => {
    const idx = Math.floor(Math.random() * pool.length);
    const name = pool.splice(idx, 1)[0];
    return { name, reversed: Math.random() < 0.5 };
  });
}

type Template = {
  id: string;
  name: string;
  title: string;
  bg: string;
  fg: string;
  accent: string;
  cardBg: string;
  font: string;
  tags: string;
};

const TEMPLATES: Template[] = [
  { id: "bowling-pink", name: "볼링핑크", title: "Tarot Diary", bg: "#ffe4ec", fg: "#3a1a25", accent: "#ff5c8a", cardBg: "#ffffffaa", font: "'Caveat', cursive", tags: "Y2K핑크·하트" },
  { id: "moonlit", name: "마녀의 비밀", title: "MOONLIT TAROT", bg: "#1a1638", fg: "#ece8ff", accent: "#b794f4", cardBg: "#2a2350", font: "'Cinzel', serif", tags: "딥크론·달·별자리" },
  { id: "celestial", name: "셀레스티얼 골드", title: "Celestial Reading", bg: "#f4ead5", fg: "#3a2a14", accent: "#b8860b", cardBg: "#fff8e8", font: "Georgia, serif", tags: "베이지·골드포일" },
  { id: "minimal", name: "미니멀 페이퍼", title: "TAROT REPORT", bg: "#ffffff", fg: "#1a1a1a", accent: "#1a1a1a", cardBg: "#f5f5f5", font: "Georgia, serif", tags: "화이트·세리프" },
  { id: "dusty-rose", name: "더스티 로즈", title: "Roses & Cards", bg: "#e8c4c4", fg: "#3d1f1f", accent: "#a13e4a", cardBg: "#f5dada", font: "'Helvetica Neue', sans-serif", tags: "솜빛핑크·장미" },
  { id: "cyber-y2k", name: "사이버 Y2K", title: "TAROT.EXE", bg: "#0a0e2c", fg: "#a0f0ff", accent: "#ff00aa", cardBg: "#1a1e3c", font: "'Courier New', monospace", tags: "네온·픽셀" },
  { id: "haiku-zen", name: "하이쿠 젠", title: "静", bg: "#f5f0e6", fg: "#2a2418", accent: "#8a6a3a", cardBg: "#ffffff", font: "'Noto Serif KR', serif", tags: "여백·정적" },
  { id: "noir", name: "럭셔리 누아르", title: "TAROT NOIR", bg: "#0a0a0a", fg: "#d4af37", accent: "#d4af37", cardBg: "#1a1a1a", font: "'Cormorant Garamond', serif", tags: "블랙·골드" },
  { id: "daydream", name: "Daydream", title: "Daydream", bg: "#e6dcff", fg: "#2a1a4a", accent: "#9370db", cardBg: "#f3eeff", font: "'Dancing Script', cursive", tags: "연보라·필기체" },
  { id: "vol01", name: "VOL.01", title: "VOL.01", bg: "#ffffff", fg: "#000000", accent: "#000000", cardBg: "#f0f0f0", font: "'Helvetica Neue', sans-serif", tags: "흰+검정·볼드" },
  { id: "secret", name: "SECRET✦", title: "SECRET✦", bg: "#ff3d8b", fg: "#fff5f8", accent: "#fff5f8", cardBg: "#ff63a5", font: "'Playfair Display', serif", tags: "핫핑크·이탤릭" },
  { id: "classica", name: "TAROT CLASSICA", title: "TAROT CLASSICA", bg: "#f7f0e0", fg: "#2a1f10", accent: "#8b4513", cardBg: "#fffaf0", font: "Georgia, serif", tags: "크림·클래식" },
];

const SAMPLE_QUESTIONS = [
  "요즘 썸타는 사람이랑 잘 될까요?",
  "이번 달 안에 이직 결정해도 될까요?",
  "올해 안에 새로운 인연을 만날 수 있을까요?",
];

function TarotPdfPage() {
  const { settings } = useUserSettings();
  const [pkg, setPkg] = useState<1 | 3>(1);
  const [nickname, setNickname] = useState("");
  const [questionsText, setQuestionsText] = useState("");
  const [readings, setReadings] = useState<Reading[]>([]);
  const [tplId, setTplId] = useState("bowling-pink");
  const [generating, setGenerating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const tpl = TEMPLATES.find(t => t.id === tplId)!;

  const parsedQuestions = useMemo(
    () => questionsText.split("\n").map(q => q.trim()).filter(Boolean).slice(0, pkg),
    [questionsText, pkg],
  );

  const fillSample = () => {
    setQuestionsText(SAMPLE_QUESTIONS.slice(0, pkg).join("\n"));
  };

  const drawCards = () => {
    if (parsedQuestions.length === 0) {
      toast.error("질문을 먼저 입력해주세요");
      return;
    }
    setReadings(parsedQuestions.map(q => ({
      question: q,
      cards: pickCards(3),
      text: "",
      loading: false,
    })));
    toast.success(`${parsedQuestions.length}개 질문에 카드 3장씩 뽑았어요`);
  };

  const reshuffleCard = (rIdx: number, cIdx: number) => {
    setReadings(prev => prev.map((r, i) => {
      if (i !== rIdx) return r;
      const used = r.cards.map(c => c.name);
      const pool = TAROT_DECK.filter(n => !used.includes(n) || n === r.cards[cIdx].name);
      const newName = pool[Math.floor(Math.random() * pool.length)];
      return {
        ...r,
        cards: r.cards.map((c, j) => j === cIdx ? { name: newName, reversed: Math.random() < 0.5 } : c),
      };
    }));
  };

  const generateReadings = async () => {
    if (!settings?.gemini_api_key) {
      toast.error("설정에서 Gemini API 키를 먼저 등록해주세요");
      return;
    }
    if (readings.length === 0) {
      toast.error("먼저 카드를 뽑아주세요");
      return;
    }
    setGenerating(true);
    try {
      for (let i = 0; i < readings.length; i++) {
        try {
          setReadings(prev => prev.map((r, idx) => idx === i ? { ...r, loading: true } : r));
          const r = readings[i];
          if (!r || !Array.isArray(r.cards) || r.cards.length === 0) {
            console.warn(`[tarot-pdf] reading ${i} has no cards, skipping`);
            continue;
          }
          const cardStr = r.cards.map(c => `${c?.name ?? "?"}(${c?.reversed ? "역방향" : "정방향"})`);
          console.log(`[tarot-pdf] ${i + 1}번 카드:`, cardStr);
          const text = await callAI("tarot-mz", {
            nickname: nickname || "고객",
            question: r.question,
            cards: cardStr,
          }, settings.gemini_api_key);
          console.log(`[tarot-pdf] ${i + 1}번 응답 길이:`, text?.length ?? 0);
          const safeText = (text && typeof text === "string" && text.trim())
            ? text
            : "AI 응답을 받지 못했습니다. 다시 시도해주세요.";
          setReadings(prev => prev.map((rd, idx) => idx === i ? { ...rd, text: safeText, loading: false } : rd));
        } catch (e) {
          console.error(`[tarot-pdf] ${i + 1}번 질문 처리 중 오류:`, e);
          setReadings(prev => prev.map((rd, idx) => idx === i ? { ...rd, loading: false } : rd));
          toast.error(`${i + 1}번 질문 생성 실패: ${(e as Error)?.message ?? "알 수 없는 오류"}`);
        }
      }
      toast.success("MZ톤 리딩 생성 완료!");
    } catch (e) {
      console.error("[tarot-pdf] generateReadings 전체 오류:", e);
      toast.error("리딩 생성 중 오류가 발생했습니다: " + ((e as Error)?.message ?? ""));
    } finally {
      setGenerating(false);
    }
  };

  const downloadPdf = async () => {
    if (!previewRef.current) return;
    setDownloading(true);
    try {
      const pages = previewRef.current.querySelectorAll<HTMLElement>("[data-pdf-page]");
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pdfW = 210;
      const pdfH = 297;
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, backgroundColor: tpl.bg, useCORS: true });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, pdfW, pdfH);
      }
      pdf.save(`${nickname || "고객"}_타로리딩_자개빛.pdf`);
      toast.success("PDF 다운로드 완료");
    } catch (e) {
      toast.error("PDF 생성 실패: " + (e as Error).message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageShell icon={Sparkles} title="MZ타로 PDF" description="고객 질문 → 카드 3장 → MZ톤 리딩 PDF">
      <div className="grid lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        {/* LEFT */}
        <div className="space-y-5">
          <Card className="p-5 space-y-1">
            <h2 className="font-display text-xl font-semibold">고객 질문 → 카드 3장 → MZ톤 리딩 PDF</h2>
            <p className="text-sm text-muted-foreground">1질문 3,000원 / 3질문 8,000원 패키지. 고객이 보낸 질문을 그대로 붙여넣고 카드 추천 후 PDF로 내보내세요.</p>
          </Card>

          {!settings?.gemini_api_key && (
            <Link to="/settings" className="block">
              <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
                ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
              </div>
            </Link>
          )}

          {/* Package */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { n: 1 as const, title: "1질문 패키지", price: "질문 1개 · 3,000원" },
              { n: 3 as const, title: "3질문 패키지", price: "질문 3개 · 8,000원" },
            ].map(p => (
              <button
                key={p.n}
                onClick={() => setPkg(p.n)}
                className={`rounded-xl border-2 p-4 text-left transition ${pkg === p.n ? "border-primary bg-primary/5" : "border-border bg-card/30 hover:border-primary/40"}`}
              >
                <div className="font-semibold">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.price}</div>
              </button>
            ))}
          </div>

          {/* Nickname */}
          <div className="space-y-1.5">
            <Label>고객 닉네임 (선택, 표지용)</Label>
            <Input value={nickname} onChange={e => setNickname(e.target.value)} placeholder="예: 미미님" />
          </div>

          {/* Questions */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>고객 질문 (줄바꿈으로 구분, 최대 {pkg}개)</Label>
              <button type="button" onClick={fillSample} className="text-xs text-primary hover:underline">예시 채우기</button>
            </div>
            <Textarea
              value={questionsText}
              onChange={e => setQuestionsText(e.target.value)}
              rows={pkg === 1 ? 3 : 6}
              placeholder={`질문을 한 줄에 하나씩 입력 (최대 ${pkg}개)`}
            />
            <div className="text-xs text-muted-foreground">현재 {parsedQuestions.length}개 인식 / 최대 {pkg}개</div>
          </div>

          <Button onClick={drawCards} variant="outline" className="w-full">
            <Shuffle className="h-4 w-4" /> 카드 추천하기
          </Button>

          {/* Drawn cards */}
          {readings.length > 0 && (
            <div className="space-y-3">
              {readings.map((r, ri) => (
                <Card key={ri} className="p-3 space-y-2">
                  <div className="text-sm font-medium line-clamp-1">Q{ri + 1}. {r.question}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {r.cards.map((c, ci) => (
                      <button
                        key={ci}
                        onClick={() => reshuffleCard(ri, ci)}
                        className="rounded-lg border border-border p-2 text-center hover:border-primary transition"
                        title="클릭해서 교체"
                      >
                        <div className="text-xs text-muted-foreground">#{ci + 1}</div>
                        <div className="text-sm font-semibold">{c.name}</div>
                        <div className={`text-xs ${c.reversed ? "text-orange-400" : "text-emerald-400"}`}>
                          {c.reversed ? "역방향" : "정방향"}
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Templates */}
          <div className="space-y-2">
            <h3 className="font-semibold">🎨 PDF 템플릿 (12종)</h3>
            <p className="text-xs text-muted-foreground">고객 분위기에 맞는 디자인을 골라주세요. 표지·본문 폰트와 컬러, 장식이 모두 바뀝니다.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTplId(t.id)}
                  className={`relative rounded-lg border-2 overflow-hidden transition ${tplId === t.id ? "border-primary" : "border-border hover:border-primary/40"}`}
                >
                  <div className="h-16 flex items-center justify-center text-xs font-bold p-1" style={{ background: t.bg, color: t.fg, fontFamily: t.font }}>
                    {t.title}
                  </div>
                  <div className="p-1.5 bg-card text-left">
                    <div className="text-[10px] font-medium truncate">{t.name}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{t.tags}</div>
                  </div>
                  {tplId === t.id && (
                    <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 rounded-full">✓</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={generateReadings}
            disabled={generating || readings.length === 0}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            ✨ MZ톤 리딩 PDF 생성하기
          </Button>
        </div>

        {/* RIGHT — preview */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">📄 PDF 미리보기</h3>
            <Button onClick={downloadPdf} disabled={downloading || readings.every(r => !r.text)} size="sm">
              {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              📥 PDF 다운로드
            </Button>
          </div>

          <div ref={previewRef} className="space-y-3">
            {/* Cover */}
            <PreviewPage tpl={tpl}>
              <div className="h-full flex flex-col items-center justify-center text-center p-12" style={{ fontFamily: tpl.font }}>
                <div className="text-sm tracking-widest opacity-70 mb-4">{tpl.title}</div>
                <div className="text-5xl font-bold mb-3" style={{ color: tpl.accent }}>
                  {nickname || "고객님"}
                </div>
                <div className="text-lg mb-8 opacity-80">타로 리딩 리포트</div>
                <div className="text-xs opacity-60">{new Date().toLocaleDateString("ko-KR")}</div>
                <div className="mt-12 text-xs tracking-widest opacity-50">— 자개빛 —</div>
              </div>
            </PreviewPage>

            {/* Per-question pages */}
            {readings.length === 0 ? (
              <Card className="p-8 text-center text-sm text-muted-foreground">
                질문 입력 후 "카드 추천하기" → "MZ톤 리딩 생성하기" 순으로 진행해주세요
              </Card>
            ) : readings.map((r, ri) => (
              <PreviewPage key={ri} tpl={tpl}>
                <div className="h-full p-10" style={{ fontFamily: tpl.font }}>
                  <div className="text-xs tracking-widest opacity-60 mb-2">QUESTION {ri + 1}</div>
                  <div className="text-xl font-semibold mb-6" style={{ color: tpl.accent }}>
                    {r.question}
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {r.cards.map((c, ci) => (
                      <div key={ci} className="rounded-lg p-3 text-center" style={{ background: tpl.cardBg }}>
                        <div className="text-[10px] opacity-60">#{ci + 1}</div>
                        <div className="text-sm font-bold mt-1">{c.name}</div>
                        <div className="text-[10px] mt-1 opacity-70">{c.reversed ? "역방향" : "정방향"}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap" style={{ minHeight: "200px" }}>
                    {r.loading ? "✨ 리딩 생성 중..." : r.text || "아직 리딩이 생성되지 않았어요. ‘MZ톤 리딩 PDF 생성하기’를 눌러주세요."}
                  </div>
                </div>
              </PreviewPage>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}

function PreviewPage({ tpl, children }: { tpl: Template; children: React.ReactNode }) {
  return (
    <div
      data-pdf-page
      className="rounded-lg shadow-lg overflow-hidden"
      style={{
        background: tpl.bg,
        color: tpl.fg,
        aspectRatio: "210 / 297",
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}
