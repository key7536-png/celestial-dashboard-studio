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
      <Tabs defaultValue="saju" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="saju">🌙 종합 사주 PDF</TabsTrigger>
          <TabsTrigger value="tarot">🔮 종합 타로 PDF</TabsTrigger>
        </TabsList>
        <TabsContent value="saju" className="mt-6"><SajuPdfForm /></TabsContent>
        <TabsContent value="tarot" className="mt-6"><TarotPdfForm /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

function SajuPdfForm() {
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [calendar, setCalendar] = useState("양력");
  const [gender, setGender] = useState("여성");
  const [time, setTime] = useState("");
  const [pages, setPages] = useState("30");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function handleGenerate() {
    if (!name || !birth) return toast.error("이름·생년월일을 입력해주세요.");
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { mode: "saju-pdf", data: { name, birth, calendar, gender, time, pages } },
      });
      if (error) throw error;
      const text = (data as { content: string }).content ?? "";
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
  const [question, setQuestion] = useState("");
  const [cardCount, setCardCount] = useState("5");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  async function handleGenerate() {
    if (!question.trim()) return toast.error("질문/주제를 입력해주세요.");
    setLoading(true);
    try {
      const cards = pickCards(parseInt(cardCount));
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { mode: "tarot-pdf", data: { question, cardCount, cards } },
      });
      if (error) throw error;
      const text = (data as { content: string }).content ?? "";
      setContent(text);
      await generatePdf("종합 타로 리포트", `질문: ${question}\n카드: ${cards.join(", ")}\n\n${text}`, `종합타로_자개빛.pdf`);
      toast.success("PDF가 다운로드되었습니다!");
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 space-y-4 bg-card/60">
      <Field label="질문 또는 주제">
        <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="예: 2026년 나의 연애운" className="min-h-[80px]" />
      </Field>
      <Field label="카드 수">
        <RadioGroup value={cardCount} onValueChange={setCardCount} className="flex gap-3 pt-2">
          {["3","5","10"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}장</label>))}
        </RadioGroup>
      </Field>
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
