import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Sparkles, Moon, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "요금제 — Lunara" },
      { name: "description", content: "Lunara 타로 리딩 요금제. 무료 플랜부터 무제한 리딩까지." },
    ],
  }),
  component: Pricing,
});

const PLANS = [
  {
    name: "Seeker",
    price: "무료",
    period: "",
    desc: "별을 만나는 첫 걸음",
    icon: Star,
    features: ["하루 1장의 카드", "기본 카드 의미", "원 카드 스프레드"],
    cta: "지금 시작하기",
    highlight: false,
  },
  {
    name: "Mystic",
    price: "₩9,900",
    period: "/월",
    desc: "신비를 깊이 탐험하는 분께",
    icon: Moon,
    features: [
      "무제한 리딩",
      "AI 심층 해석",
      "쓰리 카드 · 켈틱 크로스",
      "리딩 히스토리 저장",
      "월간 운세",
    ],
    cta: "Mystic 시작",
    highlight: true,
  },
  {
    name: "Oracle",
    price: "₩24,900",
    period: "/월",
    desc: "타로 리더를 위한 모든 것",
    icon: Sparkles,
    features: [
      "Mystic의 모든 기능",
      "고객 리딩 관리",
      "PDF 리포트 출력",
      "우선 지원",
      "독점 카드 덱",
    ],
    cta: "Oracle 시작",
    highlight: false,
  },
];

function Pricing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-20 stars-bg">
        <div className="text-center mb-16">
          <p className="text-gold text-sm mb-3 flex items-center justify-center gap-2">
            <Sparkles className="h-3 w-3" /> 요금제
          </p>
          <h1 className="font-display text-5xl md:text-6xl font-semibold mb-4 text-gradient-gold">
            당신에게 맞는 길을 선택하세요
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            언제든 변경하거나 취소할 수 있습니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={`relative p-8 backdrop-blur-md transition-all ${
                plan.highlight
                  ? "border-gold bg-gradient-cosmic shadow-glow scale-105"
                  : "border-border/50 bg-card/60 hover:border-gold/40"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-gold-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  ✨ 가장 인기
                </div>
              )}
              <plan.icon className="h-8 w-8 text-gold mb-4" />
              <h3 className="font-display text-2xl font-semibold mb-1">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>
              <div className="mb-6">
                <span className="font-display text-4xl font-semibold">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className={`w-full ${
                  plan.highlight
                    ? "bg-gradient-gold text-gold-foreground hover:opacity-90 font-semibold"
                    : "bg-gradient-mystic hover:opacity-90"
                }`}
              >
                <Link to="/auth">{plan.cta}</Link>
              </Button>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
