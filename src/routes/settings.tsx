import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Settings as SettingsIcon, Eye, EyeOff, Loader2, ExternalLink } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useUserSettings, saveUserSettings } from "@/hooks/use-user-settings";
import { toast } from "sonner";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "설정 — 자개빛" }] }),
  component: SettingsPage,
});

function maskKey(k: string) {
  if (!k) return "";
  if (k.length <= 10) return k;
  return k.slice(0, 6) + "•".repeat(Math.min(12, k.length - 6));
}

function SettingsPage() {
  const { user } = useAuth();
  const { settings, loading, reload } = useUserSettings();
  const [geminiKey, setGeminiKey] = useState("");
  const [kakaoUrl, setKakaoUrl] = useState("");
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setGeminiKey(settings.gemini_api_key ?? "");
      setKakaoUrl(settings.kakao_channel_url ?? "");
    }
  }, [settings]);

  const hasKey = !!settings?.gemini_api_key;

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserSettings(user.id, {
        gemini_api_key: geminiKey.trim() || null,
        kakao_channel_url: kakaoUrl.trim() || null,
      });
      toast.success("저장되었습니다.");
      setEditing(false);
      await reload();
    } catch (e) {
      toast.error((e as Error).message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageShell icon={SettingsIcon} title="설정" description="API 키 및 계정 설정">
      <div className="grid gap-5 max-w-2xl">
        <Card className="p-6 bg-card/60 border-border/50 space-y-4">
          <h3 className="font-display text-lg">계정</h3>
          <div className="space-y-2">
            <Label>이메일</Label>
            <Input value={user?.email ?? ""} readOnly className="bg-background/50" />
          </div>
        </Card>

        <Card className="p-6 bg-card/60 border-border/50 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg">Gemini API 키</h3>
            {hasKey && !editing && (
              <span className="text-xs text-emerald-400">✓ 등록됨</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            채팅 상담 · 운세 PDF · 영상 메이커에 사용됩니다.
          </p>

          {hasKey && !editing ? (
            <div className="flex items-center gap-2">
              <Input value={maskKey(settings!.gemini_api_key!)} readOnly className="bg-background/50 font-mono text-sm" />
              <Button variant="outline" size="sm" onClick={() => { setEditing(true); setGeminiKey(""); }}>변경</Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="pr-10 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Google AI Studio에서 키 발급 <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          <div className="space-y-2 pt-2 border-t border-border/40">
            <Label className="text-sm">카카오 채널 URL</Label>
            <Input
              value={kakaoUrl}
              onChange={(e) => setKakaoUrl(e.target.value)}
              placeholder="https://pf.kakao.com/..."
            />
            <p className="text-xs text-muted-foreground">
              무료 타로 채팅 하단 상담 연결에 사용됩니다.
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="w-full bg-gradient-to-r from-primary to-pink-500 text-primary-foreground"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />저장 중...</> : "저장"}
          </Button>
        </Card>

        <Card className="p-6 bg-card/60 border-border/50 space-y-4">
          <h3 className="font-display text-lg">알림</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">신규 상담 이메일 알림</p>
              <p className="text-xs text-muted-foreground">새 상담이 들어오면 이메일로 받아보세요.</p>
            </div>
            <Switch defaultChecked />
          </div>
        </Card>
      </div>
    </PageShell>
  );
}
