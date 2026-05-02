import { createFileRoute } from "@tanstack/react-router";
import { Layers, Plus } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/card-designer")({
  head: () => ({ meta: [{ title: "카드 디자인 — Lunara" }] }),
  component: () => (
    <PageShell icon={Layers} title="카드 디자인" description="나만의 타로 카드팩 만들기">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="aspect-[3/4] bg-card/40 border-2 border-dashed border-gold/30 hover:border-gold/60 flex flex-col items-center justify-center cursor-pointer transition-all">
          <Plus className="h-8 w-8 text-gold mb-2" />
          <span className="text-sm text-muted-foreground">새 카드팩</span>
        </Card>
        {["문라이트 덱", "시크릿 가든", "코스믹 드림"].map((name) => (
          <Card key={name} className="aspect-[3/4] bg-gradient-mystic border-gold/30 shadow-card-mystic p-4 flex flex-col justify-end cursor-pointer hover:scale-[1.02] transition-transform">
            <Button size="sm" variant="ghost" className="self-start mb-auto text-gold">편집</Button>
            <h3 className="font-display text-lg text-gradient-gold">{name}</h3>
            <p className="text-xs text-muted-foreground">22장 · 메이저</p>
          </Card>
        ))}
      </div>
    </PageShell>
  ),
});
