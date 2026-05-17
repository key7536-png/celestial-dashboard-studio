import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import magicianImg from "@/assets/jagae-magician.png";

export const Route = createFileRoute("/store")({
  head: () => ({
    meta: [
      { title: "자개빛 천운 — 타로·사주 전문 상담" },
      {
        name: "description",
        content:
          "명리상담사 1급 · 타로상담사 1급 · 타로마스터 1급. 진심으로 읽어드리는 타로/사주 상담과 PDF 리포트.",
      },
      { property: "og:title", content: "자개빛 천운" },
      { property: "og:description", content: "전문 상담사가 진심으로 읽어드리는 타로·사주" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap",
      },
    ],
  }),
  component: StorePage,
});

type Product = {
  id: string;
  name: string;
  price: number;
  desc: string;
  badge?: "인기" | "추천" | "🎉 오픈 기념 특가";
  kind: "consult" | "pdf";
  originalPrice?: number;
};

const PRODUCTS: Product[] = [
  { id: "tarot-10", name: "타로/사주 10분 상담", price: 7000, originalPrice: 10000, kind: "consult", badge: "🎉 오픈 기념 특가",
    desc: "지금 이 순간, 딱 하나의 답이 필요할 때.\n핵심 한 가지를 명확하게 짚어드립니다." },
  { id: "tarot-20", name: "타로/사주 20분 상담", price: 20000, kind: "consult",
    desc: "두 가지 고민을 깊이 있게 풀어드립니다.\n연애, 진로, 재물 어떤 주제든 가능해요." },
  { id: "tarot-30", name: "타로/사주 30분 상담", price: 30000, kind: "consult",
    desc: "시간 내 무제한 질문.\n마음속 모든 이야기를 꺼내놓으세요." },
  { id: "reunion-30", name: "재회/속마음 30분 특화 상담", price: 30000, kind: "consult", badge: "인기",
    desc: "그 사람, 지금 나를 생각하고 있을까요?\n타로와 사주로 그 마음을 정확하게 읽어드립니다." },
  { id: "saju-pdf-basic", name: "사주 기본 PDF 리포트 (30장)", price: 15000, kind: "pdf",
    desc: "정통 명리학 기반 30장 분량 사주 분석 보고서.\n결제 후 생년월일시 입력 → 맞춤 리포트 발송." },
  { id: "saju-pdf-ai", name: "AI 사주 종합 리포트 PDF", price: 29000, kind: "pdf", badge: "추천",
    desc: "명리학 20년 내공 + AI 분석의 만남.\n연애·재물·진로를 한 번에 담은 프리미엄 보고서." },
  { id: "goonghap-pdf", name: "궁합 리포트 PDF", price: 29000, kind: "pdf",
    desc: "두 사람의 사주로 읽는 깊은 궁합 이야기.\n사랑 궁합부터 결혼 궁합까지 상세 분석." },
];

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

// 자개빛 그라디언트 (로즈 → 라벤더 → 민트 → 골드)
const JAGAE_GRADIENT =
  "linear-gradient(135deg, #f4a8b8 0%, #e8a4cc 30%, #b89adc 60%, #9dd4d4 80%, #d4a574 100%)";
const BTN_GRADIENT =
  "linear-gradient(135deg, #c9a0dc 0%, #e8a4cc 50%, #f4a8b8 100%)";

async function payWithToss(p: Product) {
  const clientKey =
    (import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined)?.trim() ||
    (typeof window !== "undefined" ? localStorage.getItem("toss_client_key")?.trim() : "") ||
    "test_ck_GjLJoQ1aVZ5K66j2Eb7W3w6KYe2R";

  if (!clientKey) {
    alert("결제 키가 설정되지 않았습니다.");
    return;
  }

  try {
    const orderId = `${p.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(
      "pending_order",
      JSON.stringify({ orderId, productId: p.id, name: p.name, kind: p.kind, amount: p.price }),
    );
    const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
    const toss = await loadTossPayments(clientKey);
    const payment = toss.payment({ customerKey: "ANONYMOUS" });
    await payment.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: p.price },
      orderId,
      orderName: p.name,
      successUrl: window.location.origin + "/payment/success",
      failUrl: window.location.origin + "/payment/fail",
    });
  } catch (e: any) {
    if (e?.code !== "USER_CANCEL") alert("결제창 호출 실패: " + (e?.message || e));
  }
}

function StorePage() {
  return (
    <div
      className="min-h-screen text-[#5a3a4a] relative"
      style={{
        backgroundColor: "#fdf4f0",
        backgroundImage: `
          radial-gradient(ellipse at 10% 5%, rgba(244,168,184,0.45), transparent 50%),
          radial-gradient(ellipse at 90% 10%, rgba(232,164,204,0.40), transparent 50%),
          radial-gradient(ellipse at 50% 40%, rgba(184,154,220,0.30), transparent 55%),
          radial-gradient(ellipse at 15% 75%, rgba(157,212,212,0.35), transparent 55%),
          radial-gradient(ellipse at 85% 90%, rgba(240,208,128,0.35), transparent 55%)
        `,
        backgroundAttachment: "fixed",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      <style>{`
        @keyframes jagae-shimmer {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float-soft {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(1deg); }
        }
        .jagae-text {
          background: ${JAGAE_GRADIENT};
          background-size: 200% 200%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: jagae-shimmer 6s ease infinite;
        }
        .jagae-card {
          position: relative;
          background: linear-gradient(180deg, rgba(255,255,255,0.85), rgba(253,244,240,0.75));
          backdrop-filter: blur(10px);
          border: 1px solid rgba(244,168,184,0.45);
          border-radius: 20px;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.9) inset,
            0 8px 30px -10px rgba(232,164,204,0.35),
            0 0 60px -20px rgba(184,154,220,0.25);
          transition: transform .35s ease, box-shadow .35s ease;
          overflow: hidden;
        }
        .jagae-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: ${JAGAE_GRADIENT};
          background-size: 200% 200%;
          animation: jagae-shimmer 5s ease infinite;
        }
        .jagae-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 1px 0 rgba(255,255,255,1) inset,
            0 16px 45px -10px rgba(232,164,204,0.5),
            0 0 80px -10px rgba(184,154,220,0.4);
        }
        .jagae-btn {
          background: ${BTN_GRADIENT};
          background-size: 200% 200%;
          color: #ffffff;
          font-weight: 700;
          letter-spacing: 0.02em;
          animation: jagae-shimmer 5s ease infinite;
          box-shadow:
            0 1px 0 rgba(255,255,255,0.5) inset,
            0 4px 14px -2px rgba(201,160,220,0.5);
          transition: transform .2s ease, box-shadow .2s ease;
          text-shadow: 0 1px 2px rgba(120,60,90,0.25);
        }
        .jagae-btn:hover {
          transform: translateY(-1px);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.6) inset,
            0 6px 20px -2px rgba(244,168,184,0.6);
        }
        .jagae-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(244,168,184,0.5), rgba(232,164,204,0.5), rgba(184,154,220,0.5), rgba(240,208,128,0.5), transparent);
        }
        .floating-img {
          animation: float-soft 6s ease-in-out infinite;
        }
        .hero-glow {
          position: absolute;
          inset: -10% -10% -10% -10%;
          background: radial-gradient(ellipse at center, rgba(255,255,255,0.6), transparent 60%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/60 border-b border-[#f4a8b8]/30 shadow-[0_2px_20px_-10px_rgba(232,164,204,0.4)]">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            to="/store"
            className="text-xl tracking-wider font-bold jagae-text"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            자개빛 天運
          </Link>
          <a
            href="https://pf.kakao.com/_sunjin7536"
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3.5 py-1.5 rounded-full text-white font-semibold shadow-md hover:shadow-lg transition"
            style={{ background: BTN_GRADIENT }}
          >
            카카오톡 문의
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-10 pb-12 text-center relative">
        <div className="relative flex justify-center mb-6">
          <div className="hero-glow" />
          <img
            src={magicianImg}
            alt="자개빛 천운 — The Magician"
            className="floating-img relative z-10 w-44 md:w-56 rounded-2xl shadow-[0_20px_60px_-15px_rgba(184,154,220,0.55)] ring-1 ring-white/60"
          />
        </div>
        <p className="text-[11px] tracking-[0.5em] text-[#b8865a] mb-4 font-semibold">JAGAEBIT · 자개빛 천운</p>
        <h1
          className="text-3xl md:text-4xl leading-relaxed mb-6 font-bold jagae-text"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          자개빛 천운에 오신 것을<br />환영합니다
        </h1>
        <p
          className="text-sm md:text-base text-[#6a4858] leading-loose whitespace-pre-line"
          style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
        >
          {`명리상담사 1급 · 타로상담사 1급 · 타로마스터 1급
세 가지 자격을 갖춘 전문 상담사가
당신의 이야기를 진심으로 읽어드립니다.

답답한 마음, 이곳에서 풀어가세요.`}
        </p>
        <div className="mt-8 flex justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#f4a8b8] shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-[#e8a4cc] shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-[#b89adc] shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-[#9dd4d4] shadow-sm" />
          <span className="w-2 h-2 rounded-full bg-[#d4a574] shadow-sm" />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        <div className="jagae-divider" />
      </div>

      {/* TAROT PICK */}
      <TarotPickSection />

      <div className="max-w-3xl mx-auto px-5">
        <div className="jagae-divider" />
      </div>

      {/* PRODUCTS */}
      <section className="max-w-3xl mx-auto px-5 pt-12 pb-16">
        <h2
          className="text-center text-sm tracking-[0.4em] text-[#b8865a] mb-10 font-semibold"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          — 상품 안내 —
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="jagae-card p-6 flex flex-col">
              {p.badge && (
                <span
                  className="absolute top-3 right-3 text-[10px] tracking-wider px-2.5 py-1 rounded-full font-bold whitespace-nowrap text-white shadow-md"
                  style={{
                    background: JAGAE_GRADIENT,
                    textShadow: "0 1px 2px rgba(120,60,90,0.3)",
                  }}
                >
                  {p.badge}
                </span>
              )}
              <div className="flex items-start gap-4 mb-3">
                <div className="shrink-0 relative">
                  <div
                    className="absolute -inset-1 rounded-lg opacity-40 blur-sm"
                    style={{ background: JAGAE_GRADIENT }}
                  />
                  <img
                    src={magicianImg}
                    alt="자개빛 타로 카드"
                    className="relative w-16 h-24 object-cover rounded-md ring-1 ring-white/70 shadow-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] tracking-widest text-[#b89adc] mb-1 font-semibold">
                    {p.kind === "consult" ? "1:1 상담" : "PDF 리포트"}
                  </div>
                  <h3
                    className="text-base md:text-lg font-bold text-[#4a2a3a] leading-snug"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {p.name}
                  </h3>
                </div>
              </div>
              <p className="text-[13px] text-[#6a4858] leading-relaxed whitespace-pre-line mb-5 flex-1">
                {p.desc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#f4a8b8]/30">
                <div className="flex flex-col">
                  {p.originalPrice && (
                    <span className="text-xs text-[#a87888] line-through leading-tight">
                      {fmt(p.originalPrice)}
                    </span>
                  )}
                  <span
                    className="text-xl font-bold text-[#b8865a]"
                    style={{ fontFamily: "'Noto Serif KR', serif" }}
                  >
                    {fmt(p.price)}
                  </span>
                </div>
                <button
                  onClick={() => payWithToss(p)}
                  className="jagae-btn px-5 py-2.5 rounded-xl text-sm"
                >
                  결제하기
                </button>
              </div>
              {p.originalPrice && (
                <p className="mt-3 text-[10px] text-[#a87888]/80 text-right">
                  * 가격은 추후 변경될 수 있습니다
                </p>
              )}
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#f4a8b8]/30 bg-white/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-5 py-10 text-xs text-[#6a4858] leading-relaxed">
          <p
            className="text-base font-bold mb-4 jagae-text inline-block"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            자개빛 天運
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <div>대표자명: [입력 필요]</div>
            <div>사업자번호: [입력 필요]</div>
            <div>사업자주소: [입력 필요]</div>
            <div>유선전화: [입력 필요]</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link to="/refund-policy" className="text-[#b89adc] hover:text-[#e8a4cc] transition font-semibold">
              환불규정
            </Link>
            <a
              href="https://pf.kakao.com/_sunjin7536"
              target="_blank"
              rel="noreferrer"
              className="text-[#b89adc] hover:text-[#e8a4cc] transition font-semibold"
            >
              카카오톡 채널 문의
            </a>
          </div>
          <p className="mt-6 text-[11px] text-[#a87888] flex items-center justify-between gap-3 flex-wrap">
            <span>© {new Date().getFullYear()} 자개빛 (JAGAEBIT). All rights reserved.</span>
            <Link
              to="/dashboard"
              className="text-[10px] tracking-wider px-2.5 py-1 rounded-full border border-[#f4a8b8]/40 text-[#a87888] hover:text-[#b89adc] hover:border-[#b89adc]/50 transition"
            >
              관리자 대시보드
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
