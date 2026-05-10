import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Loader2, Download } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/fortune-pdf")({
  head: () => ({ meta: [{ title: "운세 PDF — 자개빛" }] }),
  component: FortunePdfPage,
});

const TAROT_DECK = [
  "바보","마법사","여사제","여황제","황제","교황","연인","전차","힘","은둔자","운명의수레바퀴",
  "정의","매달린남자","죽음","절제","악마","탑","별","달","태양","심판","세계",
];

function pickCards(n: number) {
  const pool = [...TAROT_DECK];
  return Array.from({ length: n }, () => pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
}

async function generatePdf(title: string, content: string, fileName: string) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  // 한글 폰트 (jsPDF 기본 폰트는 한글 미지원 → notoSansKR base64를 동적 로드 필요. MVP는 한글 가능한 fallback으로 처리)
  // 간단 대안: html2canvas로 dom 캡처. 여기선 가독성을 위해 줄바꿈 + splitTextToSize만 사용.
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 20, 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(content, 170);
  let y = 45;
  for (const line of lines) {
    if (y > 280) { doc.addPage(); y = 20; }
    doc.text(line, 20, y);
    y += 6;
  }
  doc.save(fileName);
}

function FortunePdfPage() {
  return (
    <PageShell icon={FileText} title="운세 PDF" description="종합 사주·타로 PDF 자동 생성">
      <Tabs defaultValue="report" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="report">✦ 운명 분석 보고서 (69p)</TabsTrigger>
          <TabsTrigger value="saju">🌙 종합 사주 PDF</TabsTrigger>
          <TabsTrigger value="tarot">🔮 종합 타로 PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="report" className="mt-6">
          <Card className="p-2 bg-card/60 overflow-hidden">
            <iframe
              src="/fortune-report-generator.html"
              title="운명 분석 보고서 생성기"
              className="w-full rounded-md"
              style={{ height: "calc(100vh - 220px)", minHeight: 600, border: 0 }}
            />
            <div className="px-3 py-2 text-[11px] text-muted-foreground">
              💡 브라우저 새 탭에서 열려면{" "}
              <a href="/fortune-report-generator.html" target="_blank" rel="noreferrer" className="text-primary underline">
                여기를 클릭
              </a>
              하세요.
            </div>
          </Card>
        </TabsContent>
        <TabsContent value="saju" className="mt-6"><SajuPdfForm /></TabsContent>
        <TabsContent value="tarot" className="mt-6"><TarotPdfForm /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

function KeyWarning() {
  return (
    <Link to="/settings" className="block">
      <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
        ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
      </div>
    </Link>
  );
}

function SajuPdfForm() {
  const { settings } = useUserSettings();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [calendar, setCalendar] = useState("양력");
  const [gender, setGender] = useState("여성");
  const [time, setTime] = useState("");
  const [pages, setPages] = useState("30");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function handleGenerate() {
    if (!name || !birth) return toast.error("이름·생년월일을 입력해주세요.");
    setLoading(true);
    try {
      const text = await callAI(
        "saju-pdf",
        { name, birth, calendar, gender, time, pages, request },
        settings?.gemini_api_key,
      );
      setContent(text);
      await generatePdf(`${name}님의 종합사주 리포트`, text, `${name}_종합사주_자개빛.pdf`);
      toast.success("PDF가 다운로드되었습니다!");
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 space-y-4 bg-card/60">
      {!settings?.gemini_api_key && <KeyWarning />}
      <div className="grid grid-cols-2 gap-3">
        <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="생년월일"><Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
        <Field label="시간 (모르면 비움)"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
        <Field label="달력">
          <RadioGroup value={calendar} onValueChange={setCalendar} className="flex gap-3 pt-2">
            {["양력","음력"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
          </RadioGroup>
        </Field>
        <Field label="성별">
          <RadioGroup value={gender} onValueChange={setGender} className="flex gap-3 pt-2">
            {["여성","남성"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
          </RadioGroup>
        </Field>
        <Field label="분량">
          <RadioGroup value={pages} onValueChange={setPages} className="flex gap-3 pt-2">
            {["15","30","50"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}장</label>))}
          </RadioGroup>
        </Field>
      </div>
      <Field label="특별 요청사항 (선택)">
        <Textarea value={request} onChange={(e) => setRequest(e.target.value)} placeholder="예: 이직 시기를 자세히 봐주세요" className="min-h-[60px]" />
      </Field>
      <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <>📋 종합사주 PDF 생성하기</>}
      </Button>
      {content && (
        <div className="pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground mb-2">미리보기</p>
          <div className="text-sm whitespace-pre-wrap max-h-60 overflow-auto p-3 bg-background/40 rounded">{content}</div>
        </div>
      )}
    </Card>
  );
}

function TarotPdfForm() {
  const { settings } = useUserSettings();
  const [name, setName] = useState("");
  const [question, setQuestion] = useState("");
  const [cardCount, setCardCount] = useState("3");
  const [style, setStyle] = useState("전문적");
  const [drawn, setDrawn] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function handleGenerate() {
    if (!question.trim()) return toast.error("질문/주제를 입력해주세요.");
    setLoading(true);
    try {
      const cards = drawn.length ? drawn : pickCards(parseInt(cardCount));
      setDrawn(cards);
      const text = await callAI(
        "tarot-pdf",
        { name, question, cardCount, cards, style },
        settings?.gemini_api_key,
      );
      setContent(text);
      await generatePdf(
        `종합 타로 리포트${name ? ` - ${name}` : ""}`,
        `질문: ${question}\n카드: ${cards.join(", ")}\n\n${text}`,
        `${name || "종합타로"}_자개빛.pdf`,
      );
      toast.success("PDF가 다운로드되었습니다!");
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 space-y-4 bg-card/60">
      {!settings?.gemini_api_key && <KeyWarning />}
      <Field label="이름 (선택)"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <Field label="질문 또는 주제">
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="예: 2026년 나의 연애운" className="min-h-[80px]" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="카드 수">
          <RadioGroup value={cardCount} onValueChange={(v) => { setCardCount(v); setDrawn([]); }} className="flex gap-3 pt-2">
            {["3","7","10"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}장</label>))}
          </RadioGroup>
        </Field>
        <Field label="리딩 스타일">
          <RadioGroup value={style} onValueChange={setStyle} className="flex gap-3 pt-2 flex-wrap">
            {["신비로운","전문적","친근한"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
          </RadioGroup>
        </Field>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs">카드 뽑기</Label>
          <Button size="sm" variant="outline" onClick={() => setDrawn(pickCards(parseInt(cardCount)))}>
            🃏 {cardCount}장 뽑기
          </Button>
        </div>
        {drawn.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {drawn.map((c, i) => (
              <div key={i} className="rounded-md border border-primary/40 bg-primary/10 px-2 py-1.5 text-xs">{c}</div>
            ))}
          </div>
        )}
      </div>
      <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
        {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <><Download className="h-4 w-4 mr-2" />종합타로 PDF 생성하기</>}
      </Button>
      {content && (
        <div className="pt-3 border-t border-border/40">
          <div className="text-sm whitespace-pre-wrap max-h-60 overflow-auto p-3 bg-background/40 rounded">{content}</div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

