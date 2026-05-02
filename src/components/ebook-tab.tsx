import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2, Sparkles, RotateCw, Download, Save, Trash2, FolderOpen, Plus,
  Image as ImageIcon, FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EBOOK_STORAGE_KEY = "jagaebit:lastEbook";

const CATEGORIES = ["타로", "사주", "풍수", "명리", "운세"];

// 20 themes — pairs of background + accent
const THEMES: Array<{ id: string; name: string; bg: string; accent: string; text: string }> = [
  { id: "midnight", name: "먹빛", bg: "#0a0a0f", accent: "#b794f4", text: "#e2e8f0" },
  { id: "ivory", name: "상아", bg: "#faf6ec", accent: "#a16207", text: "#1c1917" },
  { id: "rose", name: "장미", bg: "#fdf2f8", accent: "#be185d", text: "#1f2937" },
  { id: "ocean", name: "심해", bg: "#0c1e36", accent: "#38bdf8", text: "#e0f2fe" },
  { id: "forest", name: "숲", bg: "#0f1f17", accent: "#86efac", text: "#ecfdf5" },
  { id: "gold", name: "황금", bg: "#1c1612", accent: "#f6ad55", text: "#fef3c7" },
  { id: "lavender", name: "라벤더", bg: "#1a1530", accent: "#c4b5fd", text: "#ede9fe" },
  { id: "sakura", name: "사쿠라", bg: "#fff1f2", accent: "#e11d48", text: "#1f2937" },
  { id: "sand", name: "사막", bg: "#fef3c7", accent: "#92400e", text: "#1c1917" },
  { id: "mint", name: "민트", bg: "#ecfdf5", accent: "#047857", text: "#1c1917" },
  { id: "ink", name: "묵향", bg: "#111114", accent: "#e5e7eb", text: "#f3f4f6" },
  { id: "wine", name: "와인", bg: "#1f0a14", accent: "#f43f5e", text: "#fce7f3" },
  { id: "cosmos", name: "코스모스", bg: "#0a0a23", accent: "#a78bfa", text: "#ede9fe" },
  { id: "earth", name: "대지", bg: "#1c1410", accent: "#d97706", text: "#fef3c7" },
  { id: "sky", name: "하늘", bg: "#dbeafe", accent: "#1d4ed8", text: "#0f172a" },
  { id: "obsidian", name: "흑요석", bg: "#020617", accent: "#22d3ee", text: "#cffafe" },
  { id: "pearl", name: "진주", bg: "#f5f3ff", accent: "#7c3aed", text: "#1e1b4b" },
  { id: "blossom", name: "벚꽃", bg: "#fdf4ff", accent: "#a21caf", text: "#1f2937" },
  { id: "amber", name: "호박", bg: "#fef3c7", accent: "#b45309", text: "#1c1917" },
  { id: "jade", name: "옥", bg: "#064e3b", accent: "#fbbf24", text: "#ecfdf5" },
];

type Block = {
  id: string;
  level: 1 | 2 | 3;
  heading: string;
  content: string;
  image?: string;
};

type StoredProject = {
  id: string;
  title: string | null;
  subject: string | null;
  category: string | null;
  pages: number | null;
  blocks: Block[];
  theme: string;
  updated_at: string;
};

function uid() { return Math.random().toString(36).slice(2, 10); }

// Parse markdown into blocks (split by # headings)
function parseMarkdownToBlocks(md: string): Block[] {
  const lines = md.split("\n");
  const blocks: Block[] = [];
  let cur: Block | null = null;
  const flush = () => { if (cur) { cur.content = cur.content.trim(); blocks.push(cur); cur = null; } };
  for (const line of lines) {
    const m = line.match(/^(#{1,3})\s+(.+)$/);
    if (m) {
      flush();
      cur = { id: uid(), level: m[1].length as 1 | 2 | 3, heading: m[2].trim(), content: "" };
    } else {
      if (!cur) cur = { id: uid(), level: 2, heading: "서문", content: "" };
      cur.content += line + "\n";
    }
  }
  flush();
  return blocks;
}

export function EbookTab() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [pages, setPages] = useState(30);
  const [category, setCategory] = useState("타로");
  const [generating, setGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("midnight");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projects, setProjects] = useState<StoredProject[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">("idle");
  const [exporting, setExporting] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const currentTheme = useMemo(() => THEMES.find((t) => t.id === theme) ?? THEMES[0], [theme]);

  // Load projects list
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

  // Auto-save (debounced)
  useEffect(() => {
    if (!user || (!title && !blocks.length && !subject)) return;
    setSavingState("saving");
    const t = setTimeout(async () => {
      try {
        const payload = {
          user_id: user.id,
          title: title || "제목 없음",
          subject,
          category,
          pages,
          blocks: blocks as unknown as never,
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
      } catch (err) {
        console.error(err);
        setSavingState("idle");
      }
    }, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, blocks, subject, category, pages, theme, user]);

  async function handleGenerate() {
    if (!subject.trim()) {
      toast.error("주제를 입력해주세요.");
      return;
    }
    setGenerating(true);
    setStreamingText("");
    setBlocks([]);
    let acc = "";
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ebook-generate`;
      const resp = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ subject, pages, category }),
      });
      if (!resp.ok || !resp.body) {
        if (resp.status === 429) toast.error("요청이 많습니다. 잠시 후 다시 시도해주세요.");
        else if (resp.status === 402) toast.error("AI 크레딧이 부족합니다.");
        else toast.error("생성에 실패했습니다.");
        setGenerating(false);
        return;
      }
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";
      let done = false;
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
              setStreamingText(acc);
            }
          } catch {
            buf = line + "\n" + buf;
            break;
          }
        }
      }
      // After streaming, parse into blocks
      const parsed = parseMarkdownToBlocks(acc);
      const titleBlock = parsed.find((b) => b.level === 1);
      if (titleBlock) setTitle(titleBlock.heading);
      setBlocks(parsed.filter((b) => b.level !== 1));
      toast.success("전자책이 생성되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "생성 실패");
    } finally {
      setGenerating(false);
    }
  }

  async function handleRewriteBlock(idx: number) {
    const block = blocks[idx];
    if (!block) return;
    toast.message("AI가 다시 쓰는 중...");
    try {
      const { data, error } = await supabase.functions.invoke("ebook-rewrite", {
        body: { heading: block.heading, content: block.content },
      });
      if (error) throw error;
      const md = (data as { markdown?: string })?.markdown ?? "";
      const parsed = parseMarkdownToBlocks(md);
      if (parsed[0]) {
        setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, heading: parsed[0].heading || b.heading, content: parsed[0].content } : b));
        toast.success("블록을 다시 썼습니다.");
      }
    } catch (err) {
      console.error(err);
      toast.error("다시쓰기 실패");
    }
  }

  function handleImageUpload(idx: number, file: File) {
    if (!/^image\//.test(file.type)) { toast.error("이미지 파일만 가능합니다."); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("5MB 이하 이미지만 가능합니다."); return; }
    const reader = new FileReader();
    reader.onload = () => {
      setBlocks((prev) => prev.map((b, i) => i === idx ? { ...b, image: reader.result as string } : b));
    };
    reader.readAsDataURL(file);
  }

  function handleNewProject() {
    setProjectId(null);
    setTitle("");
    setSubject("");
    setBlocks([]);
    setStreamingText("");
    setSavingState("idle");
    setDrawerOpen(false);
    toast.success("새 프로젝트를 시작합니다.");
  }

  function handleLoadProject(p: StoredProject) {
    setProjectId(p.id);
    setTitle(p.title ?? "");
    setSubject(p.subject ?? "");
    setCategory(p.category ?? "타로");
    setPages(p.pages ?? 30);
    setBlocks((p.blocks ?? []) as Block[]);
    setTheme(p.theme ?? "midnight");
    setStreamingText("");
    setDrawerOpen(false);
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

  async function handleExportPdf() {
    if (!previewRef.current) return;
    setExporting(true);
    try {
      const [{ default: jsPDF }, html2canvas] = await Promise.all([
        import("jspdf"),
        import("html2canvas").then((m) => m.default),
      ]);
      const node = previewRef.current;
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: currentTheme.bg, useCORS: true });
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
      pdf.save(`${title || "전자책"}.pdf`);
      toast.success("PDF가 다운로드되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error("PDF 생성 실패");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h3 className="font-display text-xl font-semibold mb-1">📖 AI 전자책 생성기</h3>
          <p className="text-sm text-muted-foreground">
            주제와 분량을 입력하고 AI가 실시간으로 원고를 작성해드립니다.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {savingState === "saving" ? "저장 중..." : savingState === "saved" ? "✓ 자동저장됨" : ""}
          </span>
          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-1.5" />내 프로젝트 ({projects.length})
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[380px] sm:max-w-[380px] bg-card border-border">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>📁 저장된 프로젝트</span>
                  <Button size="sm" onClick={handleNewProject} className="bg-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-1" />새 프로젝트
                  </Button>
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4 space-y-2 overflow-auto max-h-[calc(100vh-120px)]">
                {projects.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">아직 저장된 프로젝트가 없습니다.</p>
                ) : projects.map((p) => (
                  <div key={p.id} className="group flex items-center gap-2 p-3 rounded-lg border border-border/60 hover:border-primary/60 bg-background/40 cursor-pointer transition-colors">
                    <button onClick={() => handleLoadProject(p)} className="flex-1 text-left">
                      <div className="font-medium text-sm truncate">{p.title || "제목 없음"}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">단권 · {new Date(p.updated_at).toLocaleDateString("ko-KR")}</div>
                    </button>
                    <button onClick={() => handleDeleteProject(p.id)} aria-label="삭제" className="p-1.5 rounded-md text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Generation form */}
      <Card className="p-5 bg-card/60 border-border/60 space-y-4">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">주제</label>
          <Textarea
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="예: 초보자를 위한 타로 카드 78장 완벽 가이드"
            className="min-h-[80px]"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">페이지 수: {pages}p</label>
            <Slider value={[pages]} min={10} max={100} step={5} onValueChange={(v) => setPages(v[0])} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">분야</label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-colors",
                    category === c ? "bg-primary text-primary-foreground border-primary" : "border-border/60 text-muted-foreground hover:text-foreground"
                  )}
                >{c}</button>
              ))}
            </div>
          </div>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground hover:opacity-90"
        >
          {generating ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <><Sparkles className="h-4 w-4 mr-2" />전자책 생성</>}
        </Button>
      </Card>

      {/* Streaming preview */}
      {generating && streamingText && (
        <Card className="p-5 bg-card/40 border-primary/30">
          <div className="text-xs text-primary mb-2 flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />실시간 생성 중...
          </div>
          <pre className="whitespace-pre-wrap text-sm text-foreground/80 max-h-[300px] overflow-auto font-sans">{streamingText}</pre>
        </Card>
      )}

      {/* Title editor */}
      {(blocks.length > 0 || title) && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">전자책 제목</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="전자책 제목" className="text-lg font-semibold" />
        </div>
      )}

      {/* Block editor */}
      {blocks.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />블록 편집 ({blocks.length}개)
          </h4>
          {blocks.map((b, i) => (
            <Card key={b.id} className="p-4 bg-card/60 border-border/60 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/30">
                  H{b.level}
                </span>
                <Input
                  value={b.heading}
                  onChange={(e) => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, heading: e.target.value } : x))}
                  className="flex-1 font-semibold"
                />
                <Button size="sm" variant="ghost" onClick={() => handleRewriteBlock(i)}>
                  <RotateCw className="h-3.5 w-3.5 mr-1" />AI 다시쓰기
                </Button>
                <label className="cursor-pointer">
                  <Button size="sm" variant="ghost" asChild><span><ImageIcon className="h-3.5 w-3.5 mr-1" />이미지</span></Button>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); }} />
                </label>
                <Button size="sm" variant="ghost" onClick={() => setBlocks((prev) => prev.filter((_, idx) => idx !== i))}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {b.image && (
                <div className="relative inline-block">
                  <img src={b.image} alt="" className="max-h-40 rounded-md border border-border/60" />
                  <button onClick={() => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, image: undefined } : x))} className="absolute top-1 right-1 p-1 rounded bg-background/80">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
              <Textarea
                value={b.content}
                onChange={(e) => setBlocks((prev) => prev.map((x, idx) => idx === i ? { ...x, content: e.target.value } : x))}
                className="min-h-[140px] text-sm"
              />
            </Card>
          ))}
        </div>
      )}

      {/* Theme picker */}
      {blocks.length > 0 && (
        <Card className="p-5 bg-card/60 border-border/60">
          <h4 className="font-semibold text-sm mb-3">🎨 템플릿 색상 ({THEMES.length}종)</h4>
          <div className="grid grid-cols-10 gap-2">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.name}
                className={cn(
                  "h-12 rounded-lg border-2 transition-all flex items-end justify-center pb-1",
                  theme === t.id ? "border-primary scale-110 shadow-glow" : "border-border/60 hover:border-primary/60"
                )}
                style={{ background: `linear-gradient(135deg, ${t.bg} 60%, ${t.accent} 60%)` }}
              >
                <span className="text-[8px] font-medium" style={{ color: t.accent }}>{t.name}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Preview + PDF */}
      {blocks.length > 0 && (
        <Card className="p-5 bg-card/60 border-border/60">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm">📘 미리보기</h4>
            <Button onClick={handleExportPdf} disabled={exporting} className="bg-primary text-primary-foreground">
              {exporting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : <><Download className="h-4 w-4 mr-2" />PDF 다운로드</>}
            </Button>
          </div>
          <div className="overflow-auto max-h-[600px] rounded-lg border border-border/60">
            <div
              ref={previewRef}
              className="p-10 mx-auto"
              style={{ background: currentTheme.bg, color: currentTheme.text, width: "595px", minHeight: "842px", fontFamily: "Noto Sans KR, sans-serif" }}
            >
              {/* Cover */}
              <div className="mb-12 pb-8 border-b" style={{ borderColor: currentTheme.accent }}>
                <div className="text-xs uppercase tracking-widest mb-3" style={{ color: currentTheme.accent }}>
                  {category} · 전자책
                </div>
                <h1 className="text-3xl font-bold mb-3" style={{ color: currentTheme.accent }}>{title || "제목 없음"}</h1>
                <p className="text-sm opacity-80">{subject}</p>
              </div>
              {/* Body */}
              {blocks.map((b) => (
                <div key={b.id} className="mb-8">
                  {b.level === 2 && (
                    <h2 className="text-xl font-bold mb-3 pb-1 border-b" style={{ color: currentTheme.accent, borderColor: `${currentTheme.accent}40` }}>{b.heading}</h2>
                  )}
                  {b.level === 3 && (
                    <h3 className="text-lg font-semibold mb-2" style={{ color: currentTheme.accent }}>{b.heading}</h3>
                  )}
                  {b.image && <img src={b.image} alt="" className="my-3 rounded max-w-full" />}
                  <div className="text-[13px] leading-relaxed whitespace-pre-wrap" style={{ color: currentTheme.text }}>
                    {b.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
