import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Video, Loader2, Copy } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/video-maker")({
  head: () => ({ meta: [{ title: "영상 메이커 — 자개빛" }] }),
  component: VideoMakerPage,
});

function VideoMakerPage() {
  return (
    <PageShell icon={Video} title="영상 메이커" description="타로·사주 유튜브 대본 생성">
      <Tabs defaultValue="tarot" className="max-w-3xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="tarot">🎴 타로 영상</TabsTrigger>
          <TabsTrigger value="saju">🌌 사주 영상</TabsTrigger>
        </TabsList>
        <TabsContent value="tarot" className="mt-6"><ScriptForm mode="video-tarot" /></TabsContent>
        <TabsContent value="saju" className="mt-6"><ScriptForm mode="video-saju" /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

function ScriptForm({ mode }: { mode: "video-tarot" | "video-saju" }) {
  const { settings } = useUserSettings();
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60초");
  const [tone, setTone] = useState("신비로운");
  const [subtitleStyle, setSubtitleStyle] = useState("자세하게 설명");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return toast.error("주제를 입력해주세요.");
    setLoading(true);
    setScript("");
    try {
      const content = await callAI(mode, { topic, duration, tone, subtitleStyle }, settings?.gemini_api_key);
      setScript(content);
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    toast.success("전체 대본을 복사했습니다.");
  }

  async function copySubtitles() {
    if (!script) return;
    const subtitles = script
      .split("\n")
      .filter((l) => l.trim().startsWith("자막:"))
      .map((l) => l.replace(/^자막:\s*/, ""))
      .join("\n");
    await navigator.clipboard.writeText(subtitles || script);
    toast.success("자막을 복사했습니다.");
  }

  function downloadTxt() {
    if (!script) return;
    const blob = new Blob([script], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${mode === "video-tarot" ? "타로" : "사주"}_영상대본_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4 bg-card/60">
        {!settings?.gemini_api_key && (
          <Link to="/settings" className="block">
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
              ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
            </div>
          </Link>
        )}
        <Field label={mode === "video-tarot" ? "타로 주제 / 질문" : "사주 주제"}>
          <Textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={mode === "video-tarot" ? "예: 이번주 연애운, 재회 가능성, 직장 변화" : "예: 2025년 전체운, 이번달 연애운, 삼재 조심할 것"}
            className="min-h-[60px]"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="영상 길이">
            <RadioGroup value={duration} onValueChange={setDuration} className="flex gap-3 pt-2 flex-wrap">
              {["30초","1분","3분","5분"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
            </RadioGroup>
          </Field>
          <Field label="톤">
            <RadioGroup value={tone} onValueChange={setTone} className="flex gap-3 pt-2 flex-wrap">
              {["신비로운","친근한","전문적"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
            </RadioGroup>
          </Field>
        </div>
        {mode === "video-tarot" && (
          <Field label="자막 스타일">
            <RadioGroup value={subtitleStyle} onValueChange={setSubtitleStyle} className="flex gap-3 pt-2 flex-wrap">
              {["짧고 강렬하게","자세하게 설명"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
            </RadioGroup>
          </Field>
        )}
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : `🎬 ${mode === "video-tarot" ? "타로" : "사주"} 영상 대본 생성`}
        </Button>
      </Card>

      {script && (
        <Card className="p-6 bg-card/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">생성된 대본</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copyAll}><Copy className="h-3.5 w-3.5 mr-1" />전체</Button>
              <Button size="sm" variant="outline" onClick={copySubtitles}>자막</Button>
              <Button size="sm" variant="outline" onClick={downloadTxt}>📥 TXT</Button>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">{script}</pre>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
