import { createFileRoute } from "@tanstack/react-router";
import { Settings as SettingsIcon } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "설정 — Lunara" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user } = useAuth();
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

        <Card className="p-6 bg-card/60 border-border/50 space-y-3">
          <h3 className="font-display text-lg">AI 엔진</h3>
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm space-y-1.5">
            <p className="font-semibold text-primary">✦ Lovable AI 자동 연결됨</p>
            <p className="text-muted-foreground text-xs leading-relaxed">
              채팅 상담 · 운세 PDF · 영상 메이커 · 전자책 · 상세페이지 · SNS 콘텐츠 모두
              <strong className="text-foreground"> Gemini 모델</strong>로 작동합니다.
              별도의 API 키 입력이 필요하지 않아요.
            </p>
          </div>
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
