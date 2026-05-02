import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Share2,
  Trash2,
  Copy,
  Save,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "상담 관리 — 자개빛" }] }),
  component: ConsultationsPage,
});

type Consultation = {
  id: string;
  user_id: string;
  question: string;
  status: string;
  ai_response: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = ["무료상담중", "유료상담중", "완료"] as const;
const STYLE_OPTIONS = ["타로냥 🐱", "전문가", "신비로운", "따뜻한"] as const;
const CARD_OPTIONS = [1, 3, 5] as const;

function statusBadgeClass(status: string) {
  switch (status) {
    case "무료상담중":
      return "border-emerald-500/60 text-emerald-400";
    case "유료상담중":
      return "border-primary/60 text-primary";
    case "완료":
      return "border-muted-foreground/40 text-muted-foreground";
    default:
      return "border-border text-muted-foreground";
  }
}

function statusLabel(status: string) {
  if (status === "무료상담중") return "무료 상담중";
  if (status === "유료상담중") return "유료 상담중";
  if (status === "완료") return "상담 완료";
  return status;
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("ko-KR", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function ConsultationsPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // AI generation state
  const [style, setStyle] = useState<(typeof STYLE_OPTIONS)[number]>(STYLE_OPTIONS[0]);
  const [cardCount, setCardCount] = useState<number>(3);
  const [generating, setGenerating] = useState(false);

  // editable buffers
  const [aiBuffer, setAiBuffer] = useState<string>("");
  const [notesBuffer, setNotesBuffer] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [user, authLoading, navigate]);

  // Load consultations
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("consultations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error("상담 목록을 불러오지 못했습니다.");
          console.error(error);
        } else {
          setItems((data ?? []) as Consultation[]);
        }
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  // Realtime updates
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`consultations:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "consultations", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === "INSERT") {
              const row = payload.new as Consultation;
              if (prev.some((p) => p.id === row.id)) return prev;
              return [row, ...prev].sort(
                (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
              );
            }
            if (payload.eventType === "UPDATE") {
              const row = payload.new as Consultation;
              return prev.map((p) => (p.id === row.id ? row : p));
            }
            if (payload.eventType === "DELETE") {
              const row = payload.old as Consultation;
              return prev.filter((p) => p.id !== row.id);
            }
            return prev;
          });
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const selected = useMemo(
    () => items.find((i) => i.id === selectedId) ?? null,
    [items, selectedId],
  );

  // Sync buffers when selection changes
  useEffect(() => {
    setAiBuffer(selected?.ai_response ?? "");
    setNotesBuffer(selected?.notes ?? "");
  }, [selectedId, selected?.ai_response, selected?.notes]);

  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("tarot-reading", {
        body: {
          question: selected.question,
          style,
          cardCount,
        },
      });
      if (error) throw error;
      const content = (data as { content?: string })?.content ?? "";
      if (!content) {
        toast.error("AI 답변이 비어있습니다.");
        return;
      }
      setAiBuffer(content);
      toast.success("타로 리딩이 생성되었습니다.");
    } catch (err) {
      console.error(err);
      toast.error((err as Error)?.message ?? "AI 생성에 실패했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSaveAi() {
    if (!selected) return;
    const { error } = await supabase
      .from("consultations")
      .update({ ai_response: aiBuffer })
      .eq("id", selected.id);
    if (error) {
      toast.error("저장에 실패했습니다.");
      return;
    }
    toast.success("답변이 저장되었습니다.");
  }

  async function handleSaveNotes() {
    if (!selected) return;
    const { error } = await supabase
      .from("consultations")
      .update({ notes: notesBuffer })
      .eq("id", selected.id);
    if (error) {
      toast.error("메모 저장에 실패했습니다.");
      return;
    }
    toast.success("메모가 저장되었습니다.");
  }

  async function handleStatusChange(value: string) {
    if (!selected) return;
    const { error } = await supabase
      .from("consultations")
      .update({ status: value })
      .eq("id", selected.id);
    if (error) {
      toast.error("상태 변경에 실패했습니다.");
      return;
    }
    toast.success("상태가 변경되었습니다.");
  }

  async function handleDelete() {
    if (!selected) return;
    const { error } = await supabase.from("consultations").delete().eq("id", selected.id);
    if (error) {
      toast.error("삭제에 실패했습니다.");
      return;
    }
    setSelectedId(null);
    setDeleteOpen(false);
    toast.success("상담이 삭제되었습니다.");
  }

  async function handleShare() {
    if (!selected) return;
    const url = `${window.location.origin}/consultations?id=${selected.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("링크가 복사되었습니다.");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  async function handleCopyAnswer() {
    if (!aiBuffer) return;
    try {
      await navigator.clipboard.writeText(aiBuffer);
      toast.success("복사됨!");
    } catch {
      toast.error("복사에 실패했습니다.");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Left sidebar */}
      <aside className="w-[250px] shrink-0 border-r border-border/60 flex flex-col">
        <div className="p-4 border-b border-border/60 space-y-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            뒤로
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold">상담 목록</h1>
            <div className="flex items-center gap-1">
              <button
                aria-label="공유"
                disabled={!selected}
                onClick={handleShare}
                className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              <button
                aria-label="삭제"
                disabled={!selected}
                onClick={() => setDeleteOpen(true)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-6 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : items.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              아직 상담이 없습니다
            </div>
          ) : (
            <ul>
              {items.map((it) => {
                const active = it.id === selectedId;
                return (
                  <li key={it.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(it.id)}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-border/40 transition-colors block",
                        "hover:bg-card/60",
                        active
                          ? "bg-primary/10 border-l-2 border-l-primary"
                          : "border-l-2 border-l-transparent",
                      )}
                    >
                      <div className="text-sm text-foreground truncate font-medium">
                        {it.question}
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-muted-foreground truncate">
                          {formatDate(it.created_at)}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full border whitespace-nowrap",
                            statusBadgeClass(it.status),
                          )}
                        >
                          {statusLabel(it.status)}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Right detail panel */}
      <main className="flex-1 overflow-y-auto">
        {!selected ? (
          <div className="h-full min-h-screen flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="h-16 w-16 mb-4 opacity-40" />
            <p className="text-base">상담을 선택하세요</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto p-8 space-y-6">
            {/* Header */}
            <header className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-xl font-bold text-foreground">{selected.question}</h2>
                <Select value={selected.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="w-[140px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>
                        {statusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {formatDate(selected.created_at)}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border",
                    statusBadgeClass(selected.status),
                  )}
                >
                  {statusLabel(selected.status)}
                </span>
              </div>
            </header>

            {/* Question card */}
            <section className="rounded-xl border border-border/60 bg-card/60 p-5">
              <div className="text-xs text-muted-foreground mb-2">💬 고객 질문</div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                {selected.question}
              </p>
            </section>

            {/* AI generation */}
            <section className="space-y-4">
              <div className="text-sm font-semibold text-foreground">✦ AI 타로 답변 생성</div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">스타일:</span>
                {STYLE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStyle(s)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-colors",
                      style === s
                        ? "bg-primary/15 border-primary text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground mr-1">카드 수:</span>
                {CARD_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCardCount(n)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border transition-colors",
                      cardCount === n
                        ? "bg-primary/15 border-primary text-primary"
                        : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {n}장
                  </button>
                ))}
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-gradient-to-r from-primary to-pink-500 hover:opacity-90 text-primary-foreground"
              >
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    카드를 펼치는 중...
                  </>
                ) : (
                  <>✦ AI 답변 생성하기</>
                )}
              </Button>
            </section>

            {/* AI response */}
            {(aiBuffer || generating) && (
              <section className="rounded-xl border border-l-4 border-border/60 border-l-primary bg-primary/5 p-5">
                <div className="text-xs text-primary mb-2">🔮 타로 리딩 결과</div>
                {generating && !aiBuffer ? (
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    카드를 펼치는 중...
                  </div>
                ) : (
                  <Textarea
                    value={aiBuffer}
                    onChange={(e) => setAiBuffer(e.target.value)}
                    className="min-h-[180px] bg-background/40 border-border/40 whitespace-pre-wrap"
                  />
                )}
                {aiBuffer && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopyAnswer}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" /> 답변 복사
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleSaveAi}>
                      <Save className="h-3.5 w-3.5 mr-1.5" /> 답변 저장
                    </Button>
                  </div>
                )}
              </section>
            )}

            {/* Notes */}
            <section className="space-y-2">
              <div className="text-sm font-semibold text-foreground">📝 운영자 메모</div>
              <Textarea
                value={notesBuffer}
                onChange={(e) => setNotesBuffer(e.target.value)}
                placeholder="고객 관련 메모를 남겨두세요..."
                className="min-h-[100px] bg-card/60 border-border/60"
              />
              <div>
                <Button size="sm" variant="outline" onClick={handleSaveNotes}>
                  메모 저장
                </Button>
              </div>
            </section>
          </div>
        )}
      </main>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>상담을 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              삭제된 상담은 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
