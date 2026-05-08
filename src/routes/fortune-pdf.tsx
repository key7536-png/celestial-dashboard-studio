import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/fortune-pdf")({
  head: () => ({ meta: [{ title: "운세 PDF — 자개빛" }] }),
  component: FortunePdfPage,
});

const KINDS = [
  { emoji: "🌙", title: "종합 사주 PDF", desc: "생년월일시 기반 평생·연간·월간 운세" },
  { emoji: "🔮", title: "종합 타로 PDF", desc: "켈틱크로스 10장 풀 리딩 리포트" },
];

function FortunePdfPage() {
  return (
    <PageShell icon={FileText} title="운세 PDF" description="종합사주·종합타로 PDF 생성">
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
        ✦ PDF 생성 기능은 곧 연결됩니다
      </p>
    </PageShell>
  );
}
