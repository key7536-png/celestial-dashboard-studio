import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Image as ImageIcon, Layout, Upload, Trash2, ExternalLink, Loader2, Copy, AlertTriangle } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EbookTab } from "@/components/ebook-tab";

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "콘텐츠 생성 — 자개빛" }] }),
  component: ContentPage,
});

type DetailBlock = { type: string; title: string; content: string };

const EBOOK_STORAGE_KEY = "jagaebit:lastEbook";

type StoredEbook = { title: string; subject: string; chapters?: number };

function ContentPage() {
  return (
    <PageShell icon={BookOpen} title="콘텐츠 생성" description="전자책, 썸네일, 상세페이지 만들기">
      <Tabs defaultValue="ebook" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="ebook"><BookOpen className="h-4 w-4 mr-1.5" />전자책</TabsTrigger>
          <TabsTrigger value="thumbnail"><ImageIcon className="h-4 w-4 mr-1.5" />썸네일</TabsTrigger>
          <TabsTrigger value="detail"><Layout className="h-4 w-4 mr-1.5" />상세페이지</TabsTrigger>
        </TabsList>

        <TabsContent value="ebook" className="mt-6">
          <EbookTab />
        </TabsContent>

        <TabsContent value="thumbnail" className="mt-6">
          <ThumbnailTab />
        </TabsContent>

        <TabsContent value="detail" className="mt-6">
          <DetailTab />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}




/* ------------------------- 썸네일 탭 ------------------------- */
function ThumbnailTab() {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpe?g|png)$/i.test(file.type)) {
      toast.error("JPG, PNG 파일만 업로드 가능합니다.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-semibold mb-1">✨ 표지 → 목업 만들기 (30종)</h3>
        <p className="text-sm text-muted-foreground">
          전자책 표지 이미지를 업로드하면 30종의 목업 스타일을 적용할 수 있어요
        </p>
      </div>

      {preview ? (
        <div className="relative inline-block">
          <img src={preview} alt="표지 미리보기" className="max-h-[360px] rounded-xl border border-border/60" />
          <button
            onClick={() => setPreview(null)}
            aria-label="삭제"
            className="absolute top-2 right-2 p-2 rounded-full bg-background/80 backdrop-blur border border-border/60 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "block border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-colors",
            dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/60",
          )}
        >
          <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground mb-1">표지 이미지 업로드</p>
          <p className="text-xs text-muted-foreground">JPG, PNG (최대 10MB)</p>
          <input
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0] ?? undefined)}
          />
        </label>
      )}

      <Card className="p-6 bg-muted/40 border-border/60">
        <div className="flex items-start gap-4">
          <span className="text-3xl">📚</span>
          <div className="flex-1">
            <h4 className="font-semibold mb-1">전문 목업 도구를 활용하세요!</h4>
            <p className="text-sm text-muted-foreground mb-4">
              600종 이상의 무료 책·전자책 목업을 제공하는 전문 서비스입니다.
              표지 이미지를 업로드하면 고품질 목업을 바로 만들 수 있어요.
            </p>
            <a href="https://mockey.ai" target="_blank" rel="noopener noreferrer">
              <Button className="bg-gradient-to-r from-primary to-pink-500 text-primary-foreground hover:opacity-90">
                <ExternalLink className="h-4 w-4 mr-2" />
                Mockey.ai에서 목업 만들기
              </Button>
            </a>
            <p className="text-xs text-muted-foreground mt-3">무료 · 회원가입 없이 사용 가능</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ------------------------- 상세페이지 탭 ------------------------- */
function DetailTab() {
  const [ebook, setEbook] = useState<StoredEbook | null>(null);
  const [manualTitle, setManualTitle] = useState("");
  const [manualSubject, setManualSubject] = useState("");
  const [generating, setGenerating] = useState(false);
  const [blocks, setBlocks] = useState<DetailBlock[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(EBOOK_STORAGE_KEY);
      if (raw) setEbook(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const effective: StoredEbook | null = ebook ?? (manualTitle ? { title: manualTitle, subject: manualSubject } : null);

  async function handleGenerate() {
    if (!effective?.title) {
      toast.error("전자책 제목을 입력하거나 전자책을 먼저 생성해주세요.");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("detail-page", {
        body: { title: effective.title, subject: effective.subject },
      });
      if (error) throw error;
      const result = (data as { blocks?: DetailBlock[] })?.blocks ?? [];
      if (!result.length) {
        toast.error("결과가 비어있습니다. 다시 시도해주세요.");
        return;
      }
      setBlocks(result);
      toast.success("12블록 상세페이지가 생성되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  function updateBlock(idx: number, patch: Partial<DetailBlock>) {
    setBlocks((prev) => prev.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  async function handleCopyAll() {
    if (!blocks.length) return;
    const text = blocks
      .map((b, i) => `[${i + 1}. ${b.title}]\n${b.content}`)
      .join("\n\n");
    try {
      await navigator.clipboard.writeText(text);
      toast.success("전체 내용을 복사했습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-display text-xl font-semibold mb-1">📄 후킹 높은 상세페이지</h3>
        <p className="text-sm text-muted-foreground">
          전자책 내용을 기반으로 12블록 고전환 마케팅 상세페이지를 자동 생성합니다.
        </p>
      </div>

      {!ebook ? (
        <Card className="p-6 border-2 border-dashed border-border/70 bg-card/30">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-400 mt-0.5" />
            <div className="text-sm">
              <p className="text-foreground mb-1">⚠️ 먼저 전자책 탭에서 전자책을 생성해주세요</p>
              <p className="text-muted-foreground">
                또는 아래에 직접 제목/주제를 입력해 테스트해볼 수 있습니다.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">전자책 제목</label>
              <Input
                value={manualTitle}
                onChange={(e) => setManualTitle(e.target.value)}
                placeholder="예: 타로 카드 입문 완벽 가이드"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">주제</label>
              <Input
                value={manualSubject}
                onChange={(e) => setManualSubject(e.target.value)}
                placeholder="예: 초보자를 위한 78장 카드 해석법"
              />
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-5 bg-card/60 border-border/60">
          <div className="text-xs text-muted-foreground mb-1">선택된 전자책</div>
          <div className="font-semibold">{ebook.title}</div>
          {ebook.chapters ? (
            <div className="text-xs text-muted-foreground mt-1">{ebook.chapters}개 챕터</div>
          ) : null}
        </Card>
      )}

      <Button
        onClick={handleGenerate}
        disabled={generating || !effective?.title}
        className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground hover:opacity-90"
      >
        {generating ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</>
        ) : (
          <>✦ 12블록 상세페이지 생성하기</>
        )}
      </Button>

      {blocks.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold">생성된 12블록</h4>
            <Button size="sm" variant="outline" onClick={handleCopyAll}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />전체 복사
            </Button>
          </div>
          <Accordion type="multiple" className="space-y-2" defaultValue={["item-0"]}>
            {blocks.map((b, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border border-border/60 rounded-lg bg-card/40 px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-2 text-left">
                    <span className="text-[10px] uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                      {b.type}
                    </span>
                    <span className="font-medium">{i + 1}. {b.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pt-2">
                  <Input
                    value={b.title}
                    onChange={(e) => updateBlock(i, { title: e.target.value })}
                    className="bg-background/40"
                  />
                  <Textarea
                    value={b.content}
                    onChange={(e) => updateBlock(i, { content: e.target.value })}
                    className="min-h-[120px] bg-background/40"
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      )}
    </div>
  );
}
