import { createFileRoute, Link } from "@tanstack/react-router";
import { Moon, Sparkles, Stars, Wand2, Heart, TrendingUp, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import heroImg from "@/assets/hero-mystic.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lunara — 신비로운 타로 리딩" },
      { name: "description", content: "달빛 아래에서 펼쳐지는 AI 타로 리딩. 당신만을 위한 메시지를 받아보세요." },
      { property: "og:title", content: "Lunara — 신비로운 타로 리딩" },
      { property: "og:description", content: "달빛 아래에서 펼쳐지는 AI 타로 리딩." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden stars-bg">
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              maskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
              WebkitMaskImage: "linear-gradient(to bottom, black 30%, transparent 100%)",
            }}
          />
          <div className="container relative mx-auto px-4 pt-24 pb-32 md:pt-32 md:pb-40 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/5 px-4 py-1.5 text-xs text-gold mb-8">
              <Sparkles className="h-3 w-3" />
              <span>AI가 풀어주는 신비의 카드</span>
            </div>
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-semibold leading-[1.1] mb-6">
              <span className="text-gradient-gold">달빛 아래에서</span>
              <br />
              <span className="text-foreground">당신의 운명을 만나다</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg md:text-xl text-muted-foreground mb-10">
              Lunara는 고대 타로의 지혜와 현대 AI를 결합한 신비로운 리딩 경험을 선사합니다.
              지금 첫 카드를 뽑아보세요. ✨
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="bg-gradient-mystic shadow-glow text-base px-8 h-12 hover:opacity-90" asChild>
                <Link to="/auth">
                  <Wand2 className="mr-2 h-4 w-4" />
                  무료로 리딩 시작
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-gold/40 text-gold hover:bg-gold/10 h-12 px-8" asChild>
                <Link to="/pricing">요금제 보기</Link>
              </Button>
            </div>

            {/* Floating cards decoration */}
            <div className="mt-20 flex items-center justify-center gap-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="animate-float w-20 h-32 md:w-28 md:h-44 rounded-lg bg-gradient-to-br from-primary/40 to-mystic/60 border border-gold/40 shadow-gold backdrop-blur-sm flex items-center justify-center"
                  style={{ animationDelay: `${i * 0.5}s`, transform: `rotate(${(i - 1) * 8}deg)` }}
                >
                  <Stars className="h-8 w-8 text-gold/80" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="container mx-auto px-4 py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              <span className="text-gradient-mystic">신비로운 기능들</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              전통 타로의 깊이와 AI의 통찰이 만나는 곳
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Wand2, title: "다양한 스프레드", desc: "한 장 카드부터 켈틱 크로스까지, 상황에 맞는 리딩 방식을 선택하세요." },
              { icon: Sparkles, title: "AI 심층 해석", desc: "고급 AI가 카드의 조합과 위치를 분석해 당신만의 메시지를 전합니다." },
              { icon: Heart, title: "리딩 히스토리", desc: "지난 모든 리딩을 안전하게 보관하고 시간이 지나며 패턴을 발견하세요." },
              { icon: Moon, title: "월간 운세", desc: "매월 달의 위상에 맞춘 특별한 리딩을 받아보세요." },
              { icon: TrendingUp, title: "성장 인사이트", desc: "리딩 데이터를 바탕으로 당신의 여정을 시각화합니다." },
              { icon: Shield, title: "프라이버시 보호", desc: "당신의 리딩은 오직 당신만의 것. 안전하게 암호화됩니다." },
            ].map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 hover:border-gold/40 hover:shadow-gold transition-all"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-mystic shadow-glow mb-4 group-hover:scale-110 transition-transform">
                  <f.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-20">
          <div className="rounded-2xl border border-gold/30 bg-gradient-cosmic p-12 text-center stars-bg shadow-card-mystic">
            <Moon className="h-12 w-12 text-gold mx-auto mb-6 animate-float" />
            <h2 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-gradient-gold">
              오늘 밤, 별이 당신에게 속삭입니다
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              회원가입은 무료입니다. 매일 한 장의 카드를 선물로 받아보세요.
            </p>
            <Button size="lg" className="bg-gradient-gold text-gold-foreground hover:opacity-90 h-12 px-8 font-semibold" asChild>
              <Link to="/auth">
                <Sparkles className="mr-2 h-4 w-4" />
                지금 시작하기
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
