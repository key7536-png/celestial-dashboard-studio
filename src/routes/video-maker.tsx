import { createFileRoute } from "@tanstack/react-router";
import { Video } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/video-maker")({
  head: () => ({ meta: [{ title: "영상 메이커 — 자개빛" }] }),
  component: VideoMakerPage,
});

const KINDS = [
  { emoji: "🎴", title: "타로 유튜브 대본", desc: "오늘의 카드 / 주간 운세 / 연애운 등 롱폼·쇼츠" },
  { emoji: "🌌", title: "사주 유튜브 대본", desc: "띠별 운세, 월간 운세, 신년운세 대본" },
];

function VideoMakerPage() {
  return (
    <PageShell icon={Video} title="영상 메이커" description="타로·사주 유튜브 대본 생성">
      <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
        {KINDS.map((k) => (
          <Card key={k.title} className="p-7 hover:border-primary/50 transition-colors cursor-pointer">
            <div className="text-4xl mb-4">{k.emoji}</div>
            <h3 className="font-display text-xl font-semibold mb-2">{k.title}</h3>
            <p className="text-sm text-muted-foreground">{k.desc}</p>
          </Card>
        ))}
      </div>
      <p className="text-center text-sm text-muted-foreground mt-8">
        ✦ 대본 생성 기능은 곧 연결됩니다
      </p>
    </PageShell>
  );
}
