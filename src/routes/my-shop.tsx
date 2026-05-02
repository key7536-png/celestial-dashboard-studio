import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/my-shop")({
  head: () => ({ meta: [{ title: "내 상점 — Lunara" }] }),
  component: () => (
    <PageShell icon={Store} title="내 상점" description="상점 디자인과 정보 관리">
      <Card className="p-6 bg-card/60 border-border/50 space-y-4 max-w-2xl">
        <div className="space-y-2">
          <Label>상점 이름</Label>
          <Input defaultValue="달의 신탁" className="bg-background/50" />
        </div>
        <div className="space-y-2">
          <Label>소개</Label>
          <Textarea rows={4} defaultValue="당신의 길을 비추는 따뜻한 타로 리딩." className="bg-background/50" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>대표 색상</Label>
            <Input type="color" defaultValue="#a78bfa" className="h-10 bg-background/50" />
          </div>
          <div className="space-y-2">
            <Label>상점 URL</Label>
            <Input defaultValue="lunara.app/luna" className="bg-background/50" />
          </div>
        </div>
        <Button className="bg-gradient-gold text-gold-foreground font-semibold">저장하기</Button>
      </Card>
    </PageShell>
  ),
});
