import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/consultations")({
  head: () => ({ meta: [{ title: "상담 관리 — Lunara" }] }),
  component: () => (
    <PageShell icon={MessageSquare} title="상담 관리" description="고객 상담을 확인하고 관리하세요">
      <div className="space-y-3">
        {[
          { name: "달빛여우", topic: "연애운 1년 흐름", status: "신규", time: "방금 전" },
          { name: "별헤는밤", topic: "이직 타이밍 상담", status: "진행중", time: "2시간 전" },
          { name: "고요한바다", topic: "재물운 종합 리딩", status: "완료", time: "어제" },
        ].map((c) => (
          <Card key={c.name} className="p-5 bg-card/60 border-border/50 hover:border-gold/40 transition-all flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{c.name}</span>
                <Badge variant={c.status === "신규" ? "default" : "secondary"}>{c.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{c.topic}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">{c.time}</span>
              <Button size="sm" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10">답변</Button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  ),
});
