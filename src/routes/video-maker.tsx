import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Video, Loader2, Copy } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [topic, setTopic] = useState("");
  const [duration, setDuration] = useState("60초");
  const [tone, setTone] = useState("신비로운");
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState("");

  async function handleGenerate() {
    if (!topic.trim()) return toast.error("주제를 입력해주세요.");
    setLoading(true);
    setScript("");
    try {
      const { data, error } = await supabase.functions.invoke("ai-generate", {
        body: { mode, data: { topic, duration, tone } },
      });
      if (error) throw error;
      setScript((data as { content: string }).content ?? "");
    } catch (e) {
      toast.error((e as Error).message ?? "생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function copyAll() {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    toast.success("복사했습니다.");
  }

  return (
    <div className="space-y-5">
      <Card className="p-6 space-y-4 bg-card/60">
        <Field label={mode === "video-tarot" ? "타로 주제 / 질문" : "사주 주제"}>
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={mode === "video-tarot" ? "예: 이번주 연애운" : "예: 2026 띠별 신년운세"} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="영상 길이">
            <RadioGroup value={duration} onValueChange={setDuration} className="flex gap-3 pt-2">
              {["30초","60초","3분"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
            </RadioGroup>
          </Field>
          <Field label="톤">
            <RadioGroup value={tone} onValueChange={setTone} className="flex gap-3 pt-2">
              {["신비로운","친근한","전문적"].map((v) => (<label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>))}
            </RadioGroup>
          </Field>
        </div>
        <Button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중...</> : "🎬 영상 대본 생성"}
        </Button>
      </Card>

      {script && (
        <Card className="p-6 bg-card/60 relative">
          <Button size="sm" variant="ghost" onClick={copyAll} className="absolute top-3 right-3">
            <Copy className="h-3.5 w-3.5 mr-1" />전체 복사
          </Button>
          <h3 className="font-display text-lg font-semibold mb-3">생성된 대본</h3>
          <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans pr-20">{script}</pre>
        </Card>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
