import { createFileRoute } from "@tanstack/react-router";
import { Megaphone, Video, Hash } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/sns")({
  head: () => ({ meta: [{ title: "SNS 홍보 — Lunara" }] }),
  component: () => (
    <PageShell icon={Megaphone} title="SNS 홍보" description="숏츠 영상 & 쓰레드 텍스트 자동 생성">
      <div className="grid md:grid-cols-2 gap-5">
        <Card className="p-6 bg-card/60 border-border/50">
          <Video className="h-7 w-7 text-gold mb-3" />
          <h3 className="font-display text-xl mb-1">숏츠 영상</h3>
          <p className="text-sm text-muted-foreground mb-4">오늘의 카드 한 장으로 9:16 영상을 만들어보세요.</p>
          <Button className="bg-gradient-mystic shadow-glow">영상 만들기</Button>
        </Card>
        <Card className="p-6 bg-card/60 border-border/50">
          <Hash className="h-7 w-7 text-gold mb-3" />
          <h3 className="font-display text-xl mb-1">쓰레드 텍스트</h3>
          <p className="text-sm text-muted-foreground mb-4">SNS에 바로 올릴 캡션과 해시태그를 자동 생성합니다.</p>
          <Button className="bg-gradient-mystic shadow-glow">텍스트 생성</Button>
        </Card>
      </div>
    </PageShell>
  ),
});
