import { type ReactNode, useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, Plus, Loader2, Copy, Save, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI, type AiMode } from "@/lib/call-ai";

export type ChatType = "saju" | "couple" | "tarot" | "relation" | "free";

export interface ChatSession {
  id: string;
  client_name: string;
  input_data: Record<string, unknown>;
  generated_response: string | null;
  created_at: string;
}

export interface ChatScaffoldProps<TForm> {
  chatType: ChatType;
  aiMode: AiMode;
  title: string;
  subtitle: string;
  /** Initial empty form state */
  initialForm: TForm;
  /** Render form inputs given the form state and updater */
  renderForm: (
    form: TForm,
    setForm: (patch: Partial<TForm>) => void,
    helpers: { drawCards: (n: number, key?: string) => string[] },
  ) => ReactNode;
  /** Validate before submit. Return error message string to abort. */
  validate?: (form: TForm) => string | null;
  /** Build the data payload sent to the AI edge function */
  buildPayload: (form: TForm) => Record<string, unknown>;
  /** Derive the client name to save */
  clientName: (form: TForm) => string;
  /** Submit button label */
  submitLabel: string;
  /** Footer slot (e.g. free-tarot upsell) */
  footer?: ReactNode;
}

const TAROT_DECK = [
  "바보(0)","마법사(I)","여사제(II)","여황제(III)","황제(IV)","교황(V)","연인(VI)","전차(VII)","힘(VIII)","은둔자(IX)","운명의수레바퀴(X)",
  "정의(XI)","매달린남자(XII)","죽음(XIII)","절제(XIV)","악마(XV)","탑(XVI)","별(XVII)","달(XVIII)","태양(XIX)","심판(XX)","세계(XXI)",
  "컵 에이스","컵 2","컵 3","컵 4","컵 5","컵 6","컵 7","컵 8","컵 9","컵 10","컵 시종","컵 기사","컵 여왕","컵 왕",
  "검 에이스","검 2","검 3","검 4","검 5","검 6","검 7","검 8","검 9","검 10","검 시종","검 기사","검 여왕","검 왕",
  "동전 에이스","동전 2","동전 3","동전 4","동전 5","동전 6","동전 7","동전 8","동전 9","동전 10","동전 시종","동전 기사","동전 여왕","동전 왕",
  "지팡이 에이스","지팡이 2","지팡이 3","지팡이 4","지팡이 5","지팡이 6","지팡이 7","지팡이 8","지팡이 9","지팡이 10","지팡이 시종","지팡이 기사","지팡이 여왕","지팡이 왕",
];

export function drawTarot(n: number): string[] {
  const pool = [...TAROT_DECK];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const card = pool.splice(idx, 1)[0];
    const orient = Math.random() < 0.5 ? "정방향" : "역방향";
    out.push(`${card} (${orient})`);
  }
  return out;
}

export function ChatScaffold<TForm extends Record<string, unknown>>(props: ChatScaffoldProps<TForm>) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { settings } = useUserSettings();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeId, setActiveId] = useState<string | "new" | null>(null);
  const [form, setFormState] = useState<TForm>(props.initialForm);
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth" });
  }, [authLoading, user, navigate]);

  const reload = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_sessions")
      .select("id, client_name, input_data, generated_response, created_at")
      .eq("user_id", user.id)
      .eq("chat_type", props.chatType)
      .order("created_at", { ascending: false });
    setSessions((data ?? []) as ChatSession[]);
  }, [user, props.chatType]);

  useEffect(() => { void reload(); }, [reload]);

  const setForm = (patch: Partial<TForm>) => setFormState((f) => ({ ...f, ...patch }));

  function startNew() {
    setActiveId("new");
    setFormState(props.initialForm);
    setAnswer("");
  }

  function openSession(s: ChatSession) {
    setActiveId(s.id);
    setFormState({ ...props.initialForm, ...(s.input_data as Partial<TForm>) });
    setAnswer(s.generated_response ?? "");
  }

  async function handleGenerate() {
    if (props.validate) {
      const err = props.validate(form);
      if (err) { toast.error(err); return; }
    }
    setLoading(true);
    setAnswer("");
    try {
      const payload = props.buildPayload(form);
      const content = await callAI(props.aiMode, payload, settings?.gemini_api_key);
      setAnswer(content);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    if (!answer) { toast.error("저장할 답변이 없어요."); return; }
    setSaving(true);
    try {
      const name = props.clientName(form) || "이름없음";
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          chat_type: props.chatType,
          client_name: name,
          input_data: form as never,
          generated_response: answer,
        } as never)
        .select("id")
        .single();
      if (error) throw error;
      toast.success("저장했어요!");
      setActiveId(data.id);
      await reload();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function copyAnswer() {
    if (!answer) return;
    await navigator.clipboard.writeText(answer);
    toast.success("복사됨!");
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col stars-bg">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-5">
          <Link to="/dashboard" className="hover:text-gold inline-flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> 대시보드
          </Link>
          <span className="opacity-50">/</span>
          <Link to="/chat" className="hover:text-gold">💬 채팅 상담</Link>
        </div>

        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-gradient-gold">{props.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{props.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          {/* 내담자 목록 */}
          <Card className="bg-card/60 p-3 h-fit lg:sticky lg:top-20">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="text-sm font-semibold">내담자 목록</h3>
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={startNew} title="새 상담">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {sessions.length === 0 ? (
              <div className="text-center py-8 px-2">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p className="text-xs text-muted-foreground mb-3">아직 상담이 없어요</p>
                <Button size="sm" variant="outline" className="border-primary/50 text-primary text-xs" onClick={startNew}>
                  + 첫 상담 시작
                </Button>
              </div>
            ) : (
              <ul className="space-y-1 max-h-[60vh] overflow-y-auto">
                {sessions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => openSession(s)}
                      className={cn(
                        "w-full text-left rounded-md px-2 py-2 text-xs transition-colors hover:bg-primary/10",
                        activeId === s.id && "bg-primary/15 border-l-2 border-primary pl-1.5",
                      )}
                    >
                      <div className="font-medium truncate">{s.client_name}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(s.created_at).toLocaleDateString("ko-KR")}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* 메인 영역 */}
          {activeId === null ? (
            <Card className="bg-[#1a1f2e] border-border/40 min-h-[420px] flex items-center justify-center text-center px-8">
              <div>
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/40" />
                <p className="text-muted-foreground text-sm">왼쪽에서 상담을 선택하거나 새로 시작하세요</p>
                <Button onClick={startNew} className="mt-5 bg-gradient-to-r from-primary to-pink-500">
                  <Plus className="h-4 w-4 mr-1" /> 새 상담 시작
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* 입력 폼 */}
              <Card className="bg-card/60 p-5 space-y-4">
                {props.renderForm(form, setForm, { drawCards: drawTarot })}

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground"
                >
                  {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 생성 중...</> : props.submitLabel}
                </Button>

                {!settings?.gemini_api_key && (
                  <Link to="/settings" className="block">
                    <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300">
                      ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
                    </div>
                  </Link>
                )}

                {props.footer}
              </Card>

              {/* 결과 */}
              <Card className="bg-white text-zinc-900 p-5 min-h-[420px] relative">
                {answer ? (
                  <>
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-zinc-200">
                      <span className="text-xs text-zinc-500">{answer.length}자</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={copyAnswer} className="text-zinc-800 border-zinc-300">
                          <Copy className="h-3.5 w-3.5 mr-1" /> 카톡에 복사
                        </Button>
                        <Button size="sm" onClick={handleSave} disabled={saving} className="bg-primary text-primary-foreground">
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Save className="h-3.5 w-3.5 mr-1" /> 저장</>}
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed text-sm">{answer}</div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center text-zinc-400">
                    <Sparkles className="h-10 w-10 mb-3 opacity-50" />
                    <p className="text-sm">왼쪽에서 정보를 입력하고<br />생성 버튼을 눌러주세요</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
