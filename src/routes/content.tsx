import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileText, Image as ImageIcon, Layout } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/content")({
  head: () => ({ meta: [{ title: "콘텐츠 생성 — Lunara" }] }),
  component: () => (
    <PageShell icon={BookOpen} title="콘텐츠 생성" description="전자책, 썸네일, 상세페이지 만들기">
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: FileText, title: "전자책", desc: "타로 가이드 PDF 자동 생성" },
          { icon: ImageIcon, title: "썸네일", desc: "감성적인 카드 썸네일 디자인" },
          { icon: Layout, title: "상세페이지", desc: "판매용 랜딩 페이지 제작" },
        ].map((t) => (
          <Card key={t.title} className="p-6 bg-card/60 border-border/50 hover:border-gold/40 transition-all cursor-pointer">
            <t.icon className="h-7 w-7 text-gold mb-3" />
            <h3 className="font-display text-lg font-semibold mb-1">{t.title}</h3>
            <p className="text-sm text-muted-foreground">{t.desc}</p>
          </Card>
        ))}
      </div>
    </PageShell>
  ),
});
