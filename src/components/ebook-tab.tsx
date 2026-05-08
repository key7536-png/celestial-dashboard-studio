import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Sparkles, Download, Copy, Trash2, FolderOpen, Plus, X,
  Image as ImageIcon, Type, ChevronLeft, ChevronRight, BookOpen, Eye,
} from "lucide-react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EBOOK_STORAGE_KEY = "jagaebit:lastEbook";

// 20 themes per spec
const THEMES: Array<{ id: string; name: string; bg: string; accent: string; text: string }> = [
  { id: "midnight", name: "미드나이트", bg: "#0f172a", accent: "#a78bfa", text: "#e2e8f0" },
  { id: "forest", name: "포레스트", bg: "#0f1f17", accent: "#86efac", text: "#ecfdf5" },
  { id: "sunset", name: "선셋", bg: "#fff1ec", accent: "#ea580c", text: "#1c1917" },
  { id: "rose", name: "로즈", bg: "#fdf2f8", accent: "#be185d", text: "#1f2937" },
  { id: "sky", name: "스카이", bg: "#dbeafe", accent: "#1d4ed8", text: "#0f172a" },
  { id: "purple", name: "퍼플", bg: "#1a1530", accent: "#c4b5fd", text: "#ede9fe" },
  { id: "sand", name: "샌드", bg: "#fef3c7", accent: "#92400e", text: "#1c1917" },
  { id: "charcoal", name: "차콜", bg: "#262626", accent: "#a3a3a3", text: "#f5f5f5" },
  { id: "coral", name: "코랄", bg: "#fff5f5", accent: "#fb7185", text: "#1f2937" },
  { id: "navy", name: "네이비", bg: "#0c1e36", accent: "#38bdf8", text: "#e0f2fe" },
  { id: "burgundy", name: "버건디", bg: "#1f0a14", accent: "#f43f5e", text: "#fce7f3" },
  { id: "slate", name: "슬레이트", bg: "#1e293b", accent: "#94a3b8", text: "#f1f5f9" },
  { id: "emerald", name: "에메랄드", bg: "#064e3b", accent: "#fbbf24", text: "#ecfdf5" },
  { id: "brown", name: "브라운", bg: "#3e2723", accent: "#d7a86e", text: "#fef3c7" },
  { id: "lavender", name: "라벤더", bg: "#f5f3ff", accent: "#7c3aed", text: "#1e1b4b" },
  { id: "olive", name: "올리브", bg: "#3a3a1f", accent: "#bef264", text: "#fef9c3" },
  { id: "teal", name: "틸", bg: "#042f2e", accent: "#5eead4", text: "#ccfbf1" },
  { id: "indigo", name: "인디고", bg: "#1e1b4b", accent: "#818cf8", text: "#e0e7ff" },
  { id: "darkbrown", name: "다크브라운", bg: "#1c1410", accent: "#d97706", text: "#fef3c7" },
  { id: "standard", name: "스탠다드·미드나이트", bg: "#000000", accent: "#ffffff", text: "#ffffff" },
];

type Block = {
  id: string;
  type: "heading" | "text" | "image";
  level?: 1 | 2 | 3;
  content: string;
  image?: string;
};

type Plan = { title: string; target: string; hook: string };

type StoredProject = {
  id: string;
  title: string | null;
  subtitle: string | null;
  subject: string | null;
  style: string | null;
  book_type: string | null;
  content: Block[] | null;
  blocks: Block[] | null;
  selected_theme: string | null;
  theme: string | null;
  updated_at: string;
};

function uid() { return Math.random().toString(36).slice(2, 10); }

function planToBlocks(plan: {
  title: string;
  subtitle?: string;
  chapters: Array<{ chapter_num: number; title: string; sections: Array<{ heading: string; content: string }> }>;
}): Block[] {
  const blocks: Block[] = [];
  for (const ch of plan.chapters || []) {
    blocks.push({ id: uid(), type: "heading", level: 2, content: `${ch.chapter_num}. ${ch.title}` });
    for (const s of ch.sections || []) {
      blocks.push({ id: uid(), type: "heading", level: 3, content: s.heading });
      blocks.push({ id: uid(), type: "text", content: s.content });
    }
  }
  return blocks;
}

export function EbookTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [style, setStyle] = useState("");
  const [bookType, setBookType] = useState<"single" | "appendix">("single");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [theme, setTheme] = useState("midnight");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState<string>("");

  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [pdfBodySize, setPdfBodySize] = useState(12);
  const [pdfTitleScale, setPdfTitleScale] = useState(1.8);
  const [pdfHeadScale, setPdfHeadScale] = useState(1.4);
  const [pdfTheme, setPdfTheme] = useState("midnight");
  const [exporting, setExporting] = useState(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPage, setPreviewPage] = useState(0);

  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [proofreading, setProofreading] = useState(false);
  const [proofreport, setProofreport] = useState<string>("");
  const coverRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTheme = useMemo(() => THEMES.find((t) => t.id === theme) ?? THEMES[0], [theme]);
  const pdfThemeObj = useMemo(() => THEMES.find((t) => t.id === pdfTheme) ?? THEMES[0], [pdfTheme]);

  const totalChars = useMemo(() => blocks.reduce((a, b) => a + (b.content?.length || 0), 0), [blocks]);
  const estimatedPages = Math.max(1, Math.round(totalChars / 600));

  const loadProjects = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("ebook_projects")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) { console.error(error); return; }
    setProjects((data ?? []) as unknown as StoredProject[]);
  }, [user]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  // Local draft restore (works even when not logged in)
  const DRAFT_KEY = "jagaebit:ebookDraft";
  const restoredRef = useRef(false);
  useEffect(() => {
    if (restoredRef.current) return;
    restoredRef.current = true;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw);
      if (d.title) setTitle(d.title);
      if (d.subtitle) setSubtitle(d.subtitle);
      if (d.subject) setSubject(d.subject);
      if (d.style) setStyle(d.style);
      if (d.bookType) setBookType(d.bookType);
      if (d.theme) setTheme(d.theme);
      if (Array.isArray(d.blocks) && d.blocks.length) {
        setBlocks(d.blocks);
        toast.success("이전 작업을 복원했습니다.");
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-save (cloud + local)
  useEffect(() => {
    if (!title && !blocks.length && !subject) return;
    setSavingState("saving");
    const t = setTimeout(async () => {
      // Always back up locally so nothing is lost on refresh
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ title, subtitle, subject, style, bookType, theme, blocks }));
      } catch { /* ignore */ }

      if (!user) {
        setSavingState("idle");
        return;
      }
      try {
        const payload = {
          user_id: user.id,
          title: title || "제목 없음",
          subtitle,
          subject,
          style,
          book_type: bookType,
          content: blocks as unknown as never,
          blocks: blocks as unknown as never,
          selected_theme: theme,
          theme,
        };
        if (projectId) {
          const { error } = await supabase.from("ebook_projects").update(payload).eq("id", projectId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase.from("ebook_projects").insert(payload).select("id").single();
          if (error) throw error;
          if (data?.id) setProjectId(data.id);
        }
        setSavingState("saved");
        try { localStorage.setItem(EBOOK_STORAGE_KEY, JSON.stringify({ title, subject, chapters: blocks.length })); } catch { /* ignore */ }
        loadProjects();
      } catch (err) {
        console.error(err);
        setSavingState("idle");
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, subtitle, blocks, subject, style, bookType, theme, user]);

  // === Step 1: Plan recommendations ===
  async function handleRecommendPlans() {
    if (!subject.trim()) { toast.error("주제를 입력해주세요."); return; }
    setLoadingPlans(true);
    setPlans([]);
    try {
      const { data, error } = await supabase.functions.invoke("ebook-plans", { body: { subject } });
      if (error) throw error;
      const list = (data as { plans?: Plan[] })?.plans ?? [];
      if (!list.length) { toast.error("추천 결과가 비어있습니다."); return; }
      setPlans(list);
      toast.success(`${list.length}개 기획안이 생성되었습니다.`);
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "추천 실패");
    } finally {
      setLoadingPlans(false);
    }
  }

  // === Step 2: Generate ebook (streaming JSON) ===
  async function handleGenerate() {
    if (!title.trim() && !subject.trim()) { toast.error("주제 또는 제목을 입력해주세요."); return; }
    setGenerating(true);
    setProgress("AI 작업 시작...");
    let acc = "";
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ebook-generate`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          subject: title || subject,
          pages: bookType === "single" ? 100 : 30,
          category: "타로",
          style,
          book_type: bookType,
        }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("요청이 많습니다.");
        else if (resp.status === 402) toast.error("AI 크레딧이 부족합니다.");
        else toast.error("생성 실패");
        setGenerating(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
      let charCount = 0;
      while (!done) {
        const { done: d, value } = await reader.read();
        if (d) break;
        buf += decoder.decode(value, { stream: true });
        let i: number;
        while ((i = buf.indexOf("\n")) !== -1) {
          let line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || !line.trim()) continue;
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") { done = true; break; }
          try {
            const parsed = JSON.parse(payload);
            const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (delta) {
              acc += delta;
              charCount += delta.length;
              setProgress(`목차 생성 중... 약 ${Math.round(charCount / 600)}p`);
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      // Parse markdown into blocks
      const lines = acc.split("\n");
      const newBlocks: Block[] = [];
      let curText = "";
      let firstTitle = "";
      const flushText = () => {
        if (curText.trim()) { newBlocks.push({ id: uid(), type: "text", content: curText.trim() }); curText = ""; }
      };
      for (const line of lines) {
        const m = line.match(/^(#{1,3})\s+(.+)$/);
        if (m) {
          flushText();
          const lvl = m[1].length as 1 | 2 | 3;
          if (lvl === 1 && !firstTitle) { firstTitle = m[2].trim(); continue; }
          newBlocks.push({ id: uid(), type: "heading", level: lvl, content: m[2].trim() });
        } else {
          curText += line + "\n";
        }
      }
      flushText();
      if (firstTitle && !title) setTitle(firstTitle);
      setBlocks(newBlocks);
      toast.success("전자책이 생성되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("생성 실패");
    } finally {
      setGenerating(false);
      setProgress("");
    }
  }

  function handleNewProject() {
    setProjectId(null); setTitle(""); setSubtitle(""); setSubject(""); setStyle("");
    setBlocks([]); setPlans([]); setBookType("single"); setSavingState("idle");
    setCoverImage(null); setOverlayOpen(false);
    toast.success("새 프로젝트를 시작합니다.");
  }

  function handleLoadProject(p: StoredProject) {
    setProjectId(p.id);
    setTitle(p.title ?? ""); setSubtitle(p.subtitle ?? "");
    setSubject(p.subject ?? ""); setStyle(p.style ?? "");
    setBookType((p.book_type as "single" | "appendix") ?? "single");
    setBlocks((p.content ?? p.blocks ?? []) as Block[]);
    setTheme(p.selected_theme ?? p.theme ?? "midnight");
    setOverlayOpen(false);
    toast.success("프로젝트를 불러왔습니다.");
  }

  async function handleDeleteProject(id: string) {
    if (!confirm("이 프로젝트를 삭제하시겠어요?")) return;
    const { error } = await supabase.from("ebook_projects").delete().eq("id", id);
    if (error) { toast.error("삭제 실패"); return; }
    if (projectId === id) handleNewProject();
    await loadProjects();
    toast.success("삭제되었습니다.");
  }

  function moveBlock(idx: number, dir: -1 | 1) {
    setBlocks((prev) => {
      const next = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[idx], next[j]] = [next[j], next[idx]];
      return next;
    });
  }

  function addBlock(type: "text" | "image") {
    setBlocks((prev) => [...prev, { id: uid(), type, content: "" }]);
  }

  function handleImageUpload(idx: number, file: File) {
    if (!/^image\//.test(file.type)) { toast.error("이미지 파일만 가능합니다."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("5MB 이하만 가능합니다."); return; }
    const reader = new FileReader();
    reader.onload = () => setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, image: reader.result as string } : b));
    reader.readAsDataURL(file);
  }

  async function handleCopyAll() {
    const text = `${title}\n${subtitle}\n\n` + blocks.map((b) => b.content).join("\n\n");
    try { await navigator.clipboard.writeText(text); toast.success("복사되었습니다."); }
    catch { toast.error("복사 실패"); }
  }

  async function handleExportPdf() {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas").then((m) => m.default),
      ]);
      const node = previewRef.current;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: pdfThemeObj.bg, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 0.92);
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgW = pageWidth;
      const imgH = (canvas.height * imgW) / canvas.width;
      let heightLeft = imgH;
      let position = 0;
      pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
      heightLeft -= pageHeight;
      while (heightLeft > 0) {
        position = heightLeft - imgH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgW, imgH);
        heightLeft -= pageHeight;
      }
      pdf.save(`${title || "전자책"}_자개빛.pdf`);
      setPdfModalOpen(false);
      toast.success("PDF가 다운로드되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("PDF 생성 실패");
    } finally {
      setExporting(false);
    }
  }

  async function handleGenerateCover() {
    if (!coverRef.current) return;
    try {
      const html2canvas = await import("html2canvas").then((m) => m.default);
      const canvas = await html2canvas(coverRef.current, { scale: 2, backgroundColor: null });
      const data = canvas.toDataURL("image/png");
      setCoverImage(data);
      try { localStorage.setItem("jagaebit:lastCover", data); } catch { /* ignore */ }
      toast.success("✓ 표지가 생성되었습니다. 썸네일 탭에서 목업을 만들어보세요!");
    } catch (err) {
      console.error(err);
      toast.error("표지 생성 실패");
    }
  }

  async function handleProofread() {
    if (!blocks.length) { toast.error("점검할 원고가 없습니다."); return; }
    setProofreading(true);
    setProofreport("");
    try {
      const { data, error } = await supabase.functions.invoke("ebook-proofread", {
        body: { title, subtitle, blocks },
      });
      if (error) throw error;
      setProofreport((data as { report?: string })?.report ?? "결과 없음");
      toast.success("원고 점검 완료");
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "점검 실패");
    } finally {
      setProofreading(false);
    }
  }

  // Group blocks into preview pages (cover + chapters)
  const previewPages = useMemo(() => {
    const pages: Array<{ kind: "cover" | "content"; blocks: Block[] }> = [{ kind: "cover", blocks: [] }];
    let cur: Block[] = [];
    for (const b of blocks) {
      if (b.type === "heading" && b.level === 2 && cur.length) {
        pages.push({ kind: "content", blocks: cur });
        cur = [];
      }
      cur.push(b);
    }
    if (cur.length) pages.push({ kind: "content", blocks: cur });
    return pages;
  }, [blocks]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-xl font-semibold mb-1">📖 AI 전자책 생성기</h3>
          <p className="text-sm text-muted-foreground">주제 추천부터 PDF 내보내기까지 한 번에.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "저장 중..." : savingState === "saved" ? "✓ 저장됨" : ""}
          </span>
          <Button variant="outline" size="sm" onClick={() => setOverlayOpen(true)}>
            <FolderOpen className="h-4 w-4 mr-1.5" />내 프로젝트 ({projects.length})
          </Button>
        </div>
      </div>

      {!user && (
        <div className="p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-sm text-amber-200 flex items-center justify-between gap-3 flex-wrap">
          <span>⚠️ 로그인하지 않아 클라우드에 저장되지 않습니다. 작업은 이 브라우저에 임시 저장돼요. 로그인하면 모든 기기에서 불러올 수 있어요.</span>
          <a href="/auth" className="underline shrink-0">로그인하기 →</a>
        </div>
      )}

      <Card className="p-5 bg-card/60 border-border/60 space-y-4">
        <h4 className="font-display text-lg font-semibold">✦ Step 1. 주제 & 기획안 추천</h4>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">주제 *</label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="예: 타로 카드 입문, 연애운, 재물운, 펫 타로 등"
          />
        </div>
        <Button onClick={handleRecommendPlans} disabled={loadingPlans} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground hover:opacity-90">
          {loadingPlans ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />C AI 기획안 생성 중...</> : <><Sparkles className="h-4 w-4 mr-2" />타겟 & 기획안 6가지 추천받기</>}
        </Button>
        {plans.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {plans.map((p, i) => (
              <button key={i} onClick={() => { setTitle(p.title); toast.success("제목이 입력되었습니다."); }}
                className="text-left p-4 rounded-lg border border-border/60 bg-background/40 hover:border-primary/60 hover:bg-primary/5 transition-colors">
                <div className="font-semibold text-sm mb-2">{p.title}</div>
                <div className="text-xs text-muted-foreground mb-1.5"><span className="text-primary">타겟:</span> {p.target}</div>
                <div className="text-xs text-muted-foreground"><span className="text-pink-400">훅:</span> {p.hook}</div>
              </button>
            ))}
          </div>
        )}
      </Card>

      {/* Step 2 */}
      <Card className="p-5 bg-card/60 border-border/60 space-y-4">
        <h4 className="font-display text-lg font-semibold">📖 Step 2. 유형 선택 & 생성</h4>

        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { id: "single", label: "📦 단권", desc: "독립 전자책 1권" },
            { id: "appendix", label: "📋 관련 부록", desc: "워크북/부록 형태" },
          ].map((opt) => (
            <button key={opt.id} onClick={() => setBookType(opt.id as "single" | "appendix")}
              className={cn("text-left p-4 rounded-lg border-2 transition-all",
                bookType === opt.id ? "border-primary bg-primary/10" : "border-border/60 hover:border-primary/40")}>
              <div className="font-semibold text-sm">{opt.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">제목 (편집 가능)</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="기획안 클릭 또는 직접 입력" />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">문체/스타일</label>
          <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="예: 친근하고 쉬운 설명체 (존댓말)" />
        </div>

        <div className="p-3 rounded-md bg-muted/40 border border-border/40 text-xs text-muted-foreground space-y-1">
          {bookType === "single" ? (
            <>
              <div>📄 예상 분량: 80~150페이지 (A4 기준)</div>
              <div>💰 예상 API 비용: ~$0.056 (GPT-4o-mini 기준)</div>
              <div>AI가 최적 챕터 수를 자동 결정 → 블록 편집기에서 수정 가능</div>
            </>
          ) : (
            <>
              <div>📄 예상 분량: 약 30페이지 (A4 기준)</div>
              <div>💰 예상 API 비용: ~$0.012</div>
            </>
          )}
        </div>

        <Button onClick={handleGenerate} disabled={generating} className="w-full bg-gradient-to-r from-pink-500 to-primary text-primary-foreground hover:opacity-90">
          {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <><BookOpen className="h-4 w-4 mr-2" />{bookType === "single" ? "단권 전자책 생성 (80~150p)" : "부록 전자책 생성 (~30p)"}</>}
        </Button>
        {generating && progress && (
          <div className="text-xs text-center text-primary">{progress}</div>
        )}
      </Card>

      {/* Editor */}
      {blocks.length > 0 && (
        <>
          <Card className="p-5 bg-card/60 border-border/60 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h4 className="font-semibold flex items-center gap-2">▮ 전자책 편집기</h4>
                <div className="text-xs text-muted-foreground mt-1">
                  {blocks.length}블록 · ~{totalChars.toLocaleString()}자 · 약 {estimatedPages}페이지 (A4 기준)
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPdfModalOpen(true)}>
                  <Download className="h-3.5 w-3.5 mr-1.5" />PDF
                </Button>
                <Button size="sm" variant="outline" onClick={handleCopyAll}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />복사
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground mb-1 block">제목</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold mb-2" />
              <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="부제목 (선택)" />
            </div>
          </Card>

          {/* Theme picker */}
          <Card className="p-5 bg-card/60 border-border/60">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h4 className="font-semibold text-sm">🎨 템플릿 선택 (총 {THEMES.length}개)</h4>
              <Button size="sm" variant="outline" onClick={() => { setPreviewPage(0); setPreviewOpen(true); }}>
                <Eye className="h-3.5 w-3.5 mr-1.5" />📱 풀림 미리보기
              </Button>
            </div>
            <div className="grid grid-cols-10 gap-2">
              {THEMES.map((t) => (
                <button key={t.id} onClick={() => setTheme(t.id)} title={t.name}
                  className={cn("h-14 rounded-lg border-2 transition-all overflow-hidden flex flex-col",
                    theme === t.id ? "border-primary scale-105 shadow-glow" : "border-border/60 hover:border-primary/60")}>
                  <div className="flex-1" style={{ background: t.bg }} />
                  <div className="bg-white py-1 px-1 space-y-0.5">
                    <div className="h-0.5 bg-gray-300 rounded-full w-full" />
                    <div className="h-0.5 bg-gray-300 rounded-full w-2/3" />
                  </div>
                </button>
              ))}
            </div>
            <div className="text-xs text-center text-muted-foreground mt-3">
              스탠다드 · {currentTheme.name}
            </div>
          </Card>

          {/* Block editor */}
          <div className="space-y-2">
            {blocks.map((b, i) => (
              <Card key={b.id} className="p-3 bg-card/60 border-border/60">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30 shrink-0 mt-1">
                    {b.type === "heading" ? `H${b.level}` : b.type === "image" ? "IMG" : "TXT"}
                  </span>
                  <div className="flex-1 space-y-2">
                    {b.type === "heading" ? (
                      <Input value={b.content} onChange={(e) => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, content: e.target.value } : x))}
                        className="font-semibold" />
                    ) : b.type === "image" ? (
                      <>
                        {b.image ? (
                          <div className="relative inline-block">
                            <img src={b.image} alt="" className="max-h-40 rounded-md border border-border/60" />
                            <button onClick={() => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, image: undefined } : x))}
                              className="absolute top-1 right-1 p-1 rounded bg-background/80"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <label className="block border-2 border-dashed border-border/60 rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 text-xs text-muted-foreground">
                            이미지 업로드 (JPG/PNG/WebP)
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); }} />
                          </label>
                        )}
                      </>
                    ) : (
                      <>
                        <Textarea value={b.content} onChange={(e) => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, content: e.target.value } : x))}
                          className="min-h-[100px] text-sm" />
                        <div className="text-[10px] text-muted-foreground text-right">{b.content.length}자</div>
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveBlock(i, -1)}>↑</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveBlock(i, 1)}>↓</Button>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setBlocks((prev) => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            <div className="grid sm:grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => addBlock("text")}>
                <Plus className="h-3.5 w-3.5 mr-1" /><Type className="h-3.5 w-3.5 mr-1" />텍스트 블록 추가
              </Button>
              <Button variant="outline" onClick={() => addBlock("image")}>
                <Plus className="h-3.5 w-3.5 mr-1" /><ImageIcon className="h-3.5 w-3.5 mr-1" />이미지 블록 추가
              </Button>
            </div>
          </div>

          {/* Proofread */}
          <Card className="p-5 bg-card/60 border-border/60 space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div>
                <h4 className="font-semibold text-sm">🔍 원고 점검 (오타·위치·일관성)</h4>
                <p className="text-xs text-muted-foreground mt-1">AI가 글자/위치/구조를 한 번에 점검해 두 번 일하지 않도록 도와줍니다.</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleProofread} disabled={proofreading || blocks.length === 0}>
                {proofreading ? <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />점검 중...</> : <>✦ 원고 점검 실행</>}
              </Button>
            </div>
            {proofreport && (
              <div className="text-xs whitespace-pre-wrap p-3 rounded-md bg-background/40 border border-border/60 max-h-64 overflow-auto">{proofreport}</div>
            )}
          </Card>

          {/* Cover image generator + 3D mockup */}
          <Card className="p-5 bg-card/60 border-border/60 space-y-3">
            <div>
              <h4 className="font-semibold text-sm">📕 표지 생성 → 3D 목업 바로 만들기</h4>
              <p className="text-xs text-muted-foreground mt-1">표지를 생성하고 다운로드한 뒤, Mockey.ai로 바로 이동해 3D 전자책 목업을 만들 수 있어요.</p>
            </div>
            <div className="flex gap-4 items-start flex-wrap">
              <div ref={coverRef} className="shrink-0 flex flex-col items-center justify-between p-6 rounded-lg"
                style={{ width: 210, height: 297, background: `linear-gradient(135deg, ${currentTheme.bg}, ${currentTheme.accent})`, color: currentTheme.text }}>
                <div className="text-[8px] tracking-widest opacity-60">JAGAEBIT</div>
                <div className="text-center">
                  <div className="text-base font-bold leading-tight" style={{ color: currentTheme.text }}>{title || "제목 없음"}</div>
                  {subtitle && <div className="text-[10px] opacity-80 mt-1">{subtitle}</div>}
                </div>
                <div className="text-[8px] opacity-70">{subject}</div>
              </div>
              <div className="flex-1 min-w-[200px] space-y-2">
                <Button onClick={handleGenerateCover} className="bg-primary text-primary-foreground w-full">
                  <ImageIcon className="h-4 w-4 mr-2" />1. 표지 이미지 생성
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={!coverImage}
                  onClick={() => {
                    if (!coverImage) return;
                    const a = document.createElement("a");
                    a.href = coverImage;
                    a.download = `${title || "ebook"}_cover.png`;
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />2. 표지 다운로드
                </Button>
                <a
                  href="https://mockey.ai/mockup/book"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn("block", !coverImage && "pointer-events-none opacity-50")}
                >
                  <Button className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground" disabled={!coverImage}>
                    📦 3. Mockey.ai에서 3D 목업 만들기 →
                  </Button>
                </a>
                {coverImage && (
                  <div className="text-xs text-emerald-400">✓ 표지 준비 완료. 다운로드한 PNG를 Mockey.ai에 업로드하세요.</div>
                )}
              </div>
            </div>
          </Card>

          {/* Hidden PDF render area */}
          <div className="fixed -left-[10000px] top-0 pointer-events-none" aria-hidden>
            <div ref={previewRef} className="p-12" style={{ background: pdfThemeObj.bg, color: pdfThemeObj.text, width: 595, fontFamily: "Noto Sans KR, sans-serif" }}>
              <div className="mb-12 pb-8 border-b text-center" style={{ borderColor: pdfThemeObj.accent }}>
                <h1 className="font-bold mb-3" style={{ color: pdfThemeObj.accent, fontSize: pdfBodySize * pdfTitleScale }}>{title}</h1>
                {subtitle && <p style={{ fontSize: pdfBodySize, opacity: 0.8 }}>{subtitle}</p>}
              </div>
              {blocks.map((b) => (
                <div key={b.id} className="mb-6">
                  {b.type === "heading" && b.level === 2 && (
                    <h2 className="font-bold mb-3 pb-1 border-b" style={{ color: pdfThemeObj.accent, fontSize: pdfBodySize * pdfHeadScale, borderColor: `${pdfThemeObj.accent}40` }}>{b.content}</h2>
                  )}
                  {b.type === "heading" && b.level === 3 && (
                    <h3 className="font-semibold mb-2" style={{ color: pdfThemeObj.accent, fontSize: pdfBodySize * 1.1 }}>{b.content}</h3>
                  )}
                  {b.type === "image" && b.image && <img src={b.image} alt="" className="my-3 max-w-full rounded" />}
                  {b.type === "text" && (
                    <div className="whitespace-pre-wrap" style={{ fontSize: pdfBodySize, lineHeight: 1.8 }}>{b.content}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* === Project Overlay === */}
      {overlayOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-sm overflow-auto">
          <div className="max-w-4xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">📁 저장된 프로젝트</h2>
              <div className="flex gap-2">
                <Button onClick={handleNewProject} className="bg-primary text-primary-foreground">
                  <Plus className="h-4 w-4 mr-1" />새 프로젝트
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setOverlayOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              {projects.length === 0 ? (
                <p className="text-center text-muted-foreground py-12">아직 저장된 프로젝트가 없습니다.</p>
              ) : projects.map((p) => (
                <div key={p.id} className="group flex items-center gap-3 p-4 rounded-lg border border-border/60 hover:border-primary/60 bg-card/40 transition-colors">
                  <button onClick={() => handleLoadProject(p)} className="flex-1 text-left">
                    <div className="font-medium">{p.title || "제목 없음"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {p.book_type === "appendix" ? "부록" : "단권"} · {new Date(p.updated_at).toLocaleDateString("ko-KR")}
                    </div>
                  </button>
                  <button onClick={() => handleDeleteProject(p.id)} aria-label="삭제"
                    className="p-2 rounded-md text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* === PDF Modal === */}
      {pdfModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
          <Card className="w-full max-w-2xl bg-card border-border/60 p-6 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">⚙️ PDF 내보내기 설정</h3>
              <Button variant="ghost" size="icon" onClick={() => setPdfModalOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">본문 크기</label>
              <div className="flex gap-2 flex-wrap">
                {[{ v: 10, l: "작게 10pt" }, { v: 11, l: "보통 11pt" }, { v: 12, l: "크게 12pt ★" }, { v: 14, l: "매우크게 14pt" }].map((o) => (
                  <button key={o.v} onClick={() => setPdfBodySize(o.v)}
                    className={cn("px-3 py-1.5 text-xs rounded-md border", pdfBodySize === o.v ? "bg-primary text-primary-foreground border-primary" : "border-border/60")}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">제목 배율</label>
              <div className="flex gap-2">
                {[{ v: 1.6, l: "×1.6" }, { v: 1.8, l: "×1.8 ★" }, { v: 2.0, l: "×2.0" }].map((o) => (
                  <button key={o.v} onClick={() => setPdfTitleScale(o.v)}
                    className={cn("px-3 py-1.5 text-xs rounded-md border", pdfTitleScale === o.v ? "bg-primary text-primary-foreground border-primary" : "border-border/60")}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">소제목 배율</label>
              <div className="flex gap-2">
                {[{ v: 1.2, l: "×1.2" }, { v: 1.4, l: "×1.4 ★" }, { v: 1.6, l: "×1.6" }].map((o) => (
                  <button key={o.v} onClick={() => setPdfHeadScale(o.v)}
                    className={cn("px-3 py-1.5 text-xs rounded-md border", pdfHeadScale === o.v ? "bg-primary text-primary-foreground border-primary" : "border-border/60")}>
                    {o.l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">테마 색상</label>
              <div className="grid grid-cols-10 gap-2">
                {THEMES.map((t) => (
                  <button key={t.id} onClick={() => setPdfTheme(t.id)} title={t.name}
                    className={cn("h-10 rounded border-2", pdfTheme === t.id ? "border-primary scale-110" : "border-border/60")}
                    style={{ background: `linear-gradient(135deg, ${t.bg} 60%, ${t.accent} 60%)` }} />
                ))}
              </div>
              <div className="text-xs text-center text-muted-foreground mt-2">스탠다드 · {pdfThemeObj.name}</div>
            </div>
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-md p-3">
              여백: 상30/하32/좌20/우20mm · 줄간격 1.8 · centered 표지
            </div>
            <Button onClick={handleExportPdf} disabled={exporting} className="w-full bg-primary text-primary-foreground">
              {exporting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <><Download className="h-4 w-4 mr-2" />📄 PDF 다운로드 ({blocks.length}블록)</>}
            </Button>
          </Card>
        </div>,
        document.body
      )}

      {/* === Preview Modal === */}
      {previewOpen && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
          <div className="flex items-center justify-between w-full max-w-3xl mb-4">
            <div className="flex items-center gap-2 text-white">
              <h3 className="font-display text-lg">전자책 미리보기</h3>
              <span className="text-xs px-2 py-1 rounded bg-primary/20 border border-primary/40">{currentTheme.name}</span>
            </div>
            <div className="flex items-center gap-3 text-white text-sm">
              <span>{previewPage + 1} / {previewPages.length}</span>
              <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}><X className="h-5 w-5" /></Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setPreviewPage((p) => Math.max(0, p - 1))} disabled={previewPage === 0}>
              <ChevronLeft className="h-6 w-6 text-white" />
            </Button>
            <div className="rounded-lg shadow-2xl p-10 overflow-auto"
              style={{ width: 480, height: 680, background: currentTheme.bg, color: currentTheme.text }}>
              {previewPages[previewPage]?.kind === "cover" ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <h1 className="text-3xl font-bold mb-3" style={{ color: currentTheme.accent }}>{title || "제목 없음"}</h1>
                  {subtitle && <p className="opacity-80">{subtitle}</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {previewPages[previewPage]?.blocks.map((b) => (
                    <div key={b.id}>
                      {b.type === "heading" && b.level === 2 && <h2 className="text-xl font-bold mb-2" style={{ color: currentTheme.accent }}>{b.content}</h2>}
                      {b.type === "heading" && b.level === 3 && <h3 className="text-base font-semibold mb-1" style={{ color: currentTheme.accent }}>{b.content}</h3>}
                      {b.type === "text" && <div className="text-sm whitespace-pre-wrap leading-relaxed">{b.content}</div>}
                      {b.type === "image" && b.image && <img src={b.image} alt="" className="rounded max-w-full" />}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPreviewPage((p) => Math.min(previewPages.length - 1, p + 1))} disabled={previewPage >= previewPages.length - 1}>
              <ChevronRight className="h-6 w-6 text-white" />
            </Button>
          </div>
          <p className="text-xs text-white/60 mt-4">페이지를 드래그하거나 버튼으로 넘겨보세요</p>
        </div>,
        document.body
      )}
    </div>
  );
}

// Suppress unused warning if helper kept for future use
void planToBlocks;
