import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import magicianImg from "@/assets/jagae-magician.png";
import tarotBackImg from "@/assets/tarot-back.png";

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

// ============ TAROT PICK ============
const TAROT_DECK = [
  { id: "magician", name: "The Magician", korean: "마법사", meaning: "새로운 시작 · 의지 · 창조의 힘" },
  { id: "high-priestess", name: "The High Priestess", korean: "여사제", meaning: "직관 · 내면의 지혜 · 신비" },
  { id: "empress", name: "The Empress", korean: "여황제", meaning: "풍요 · 사랑 · 모성의 따스함" },
  { id: "lovers", name: "The Lovers", korean: "연인", meaning: "사랑 · 조화 · 운명의 선택" },
  { id: "star", name: "The Star", korean: "별", meaning: "희망 · 영감 · 빛나는 미래" },
  { id: "sun", name: "The Sun", korean: "태양", meaning: "기쁨 · 성공 · 따뜻한 행복" },
  { id: "moon", name: "The Moon", korean: "달", meaning: "꿈 · 무의식 · 숨겨진 진실" },
  { id: "wheel", name: "Wheel of Fortune", korean: "운명의 수레바퀴", meaning: "전환점 · 행운 · 기회" },
  { id: "world", name: "The World", korean: "세계", meaning: "완성 · 성취 · 새로운 여정" },
];

const POSITIONS = ["과거", "현재", "미래"] as const;

function TarotPickSection() {
  const [picked, setPicked] = useState<number[]>([]);

  const togglePick = (idx: number) => {
    setPicked((prev) => {
      if (prev.includes(idx)) return prev.filter((i) => i !== idx);
      if (prev.length >= 3) return prev;
      return [...prev, idx];
    });
  };

  const reset = () => setPicked([]);
  const allPicked = picked.length === 3;

  return (
    <section className="max-w-3xl mx-auto px-5 pt-14 pb-14 relative">
      <style>{`
        .rose-deco {
          position: absolute;
          font-size: 2.2rem;
          opacity: 0.55;
          filter: drop-shadow(0 4px 10px rgba(244,168,184,0.45));
          pointer-events: none;
          user-select: none;
        }
        .wheel-slot {
          position: relative;
          width: 100%;
          aspect-ratio: 2 / 3;
          border-radius: 14px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.4s cubic-bezier(.4,.2,.2,1), box-shadow 0.4s, filter 0.4s;
          background: #fdf4f0;
        }
        .wheel-slot img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .wheel-slot.idle {
          filter: brightness(0.92) saturate(0.85);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.5) inset,
            0 8px 20px -8px rgba(184,154,220,0.35);
        }
        .wheel-slot.idle:hover {
          transform: translateY(-4px) rotate(-0.5deg);
          filter: brightness(1) saturate(1);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.6) inset,
            0 14px 28px -10px rgba(184,154,220,0.55),
            0 0 40px -8px rgba(244,168,184,0.5);
        }
        .wheel-slot.picked {
          filter: brightness(1.05) saturate(1.1);
          box-shadow:
            0 0 0 2px rgba(244,197,197,0.9) inset,
            0 0 0 4px rgba(240,208,128,0.7),
            0 14px 32px -8px rgba(184,154,220,0.6),
            0 0 50px -8px rgba(240,208,128,0.55);
          transform: translateY(-3px);
        }
        .wheel-slot.disabled {
          opacity: 0.35;
          cursor: not-allowed;
          filter: grayscale(0.4) brightness(0.85);
        }
        .pos-badge {
          position: absolute;
          top: -10px; left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 999px;
          color: #fff;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-shadow: 0 1px 2px rgba(120,60,90,0.3);
          box-shadow: 0 4px 12px -3px rgba(184,154,220,0.5);
          z-index: 5;
        }
        .hero-result {
          position: relative;
          margin: 0 auto;
          max-width: 320px;
          padding: 28px 20px 24px;
          border-radius: 24px;
          background:
            radial-gradient(ellipse at 50% 25%, rgba(244,197,197,0.55), transparent 60%),
            radial-gradient(ellipse at 50% 80%, rgba(201,160,220,0.4), transparent 65%),
            linear-gradient(180deg, #fdf4f0 0%, #f7e6ea 100%);
          border: 1px solid rgba(244,168,184,0.45);
          box-shadow:
            0 1px 0 rgba(255,255,255,0.7) inset,
            0 20px 50px -15px rgba(184,154,220,0.5),
            0 0 60px -10px rgba(240,208,128,0.4);
          text-align: center;
        }
        .hero-result img {
          width: 78%;
          margin: 0 auto 14px;
          display: block;
          border-radius: 14px;
          box-shadow: 0 18px 40px -12px rgba(120,60,90,0.45);
        }
      `}</style>

      <span className="rose-deco" style={{ top: "10px", left: "8px" }}>🌹</span>
      <span className="rose-deco" style={{ top: "30px", right: "10px", fontSize: "1.6rem" }}>🌹</span>
      <span className="rose-deco" style={{ bottom: "20px", left: "20px", fontSize: "1.6rem" }}>🌹</span>
      <span className="rose-deco" style={{ bottom: "10px", right: "8px" }}>🌹</span>

      <h2
        className="text-center text-sm tracking-[0.4em] text-[#b8865a] mb-3 font-semibold"
        style={{ fontFamily: "'Noto Serif KR', serif" }}
      >
        — 오늘의 타로 —
      </h2>
      <p className="text-center text-[13px] text-[#6a4858] mb-8 leading-relaxed">
        마음을 비우고 카드 9장 중 <span className="font-bold text-[#b89adc]">3장</span>을 골라보세요.<br />
        <span className="text-[11px] text-[#a87888]">과거 · 현재 · 미래의 메시지가 정방향으로 펼쳐집니다.</span>
      </p>

      <div className="grid grid-cols-3 gap-3 md:gap-5 max-w-md md:max-w-xl mx-auto">
        {TAROT_DECK.map((card, idx) => {
          const isPicked = picked.includes(idx);
          const order = isPicked ? picked.indexOf(idx) : -1;
          const disabled = !isPicked && picked.length >= 3;
          const cls = isPicked ? "picked" : disabled ? "disabled" : "idle";
          return (
            <div key={card.id} className="relative">
              {isPicked && (
                <span className="pos-badge" style={{ background: BTN_GRADIENT }}>
                  {POSITIONS[order]}
                </span>
              )}
              <div
                role="button"
                tabIndex={0}
                onClick={() => !disabled && togglePick(idx)}
                onKeyDown={(e) => {
                  if ((e.key === "Enter" || e.key === " ") && !disabled) togglePick(idx);
                }}
                className={`wheel-slot ${cls}`}
                aria-label={isPicked ? `${POSITIONS[order]} — 운명의 수레바퀴` : `카드 ${idx + 1} 뽑기`}
              >
                <img src={wheelImg} alt="운명의 수레바퀴" />
              </div>
              {isPicked && (
                <div className="mt-2 text-center">
                  <div className="text-[11px] font-bold text-[#4a2a3a]" style={{ fontFamily: "'Noto Serif KR', serif" }}>
                    운명의 수레바퀴
                  </div>
                  <div className="text-[9px] text-[#a87888] mt-0.5 leading-tight">전환점 · 행운 · 기회</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allPicked && (
        <div className="mt-10">
          <p className="text-center text-[11px] tracking-[0.35em] text-[#b8865a] font-bold mb-4">
            ✦ 미 래 의 메 시 지 ✦
          </p>
          <div className="hero-result">
            <img src={magicianImg} alt="자개빛 마법사" />
            <p
              className="text-[11px] tracking-[0.3em] text-[#b89adc] font-semibold mb-2"
              style={{ fontFamily: "'Noto Serif KR', serif" }}
            >
              J A G A E B I T
            </p>
            <h3
              className="text-[18px] font-bold mb-3 leading-snug"
              style={{
                fontFamily: "'Noto Serif KR', serif",
                background: JAGAE_GRADIENT,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              자개빛 천운이<br/>당신에게 다가옵니다
            </h3>
            <p className="text-[12px] text-[#6a4858] leading-relaxed mb-1">
              세 장의 카드가 모두 <span className="font-bold text-[#b89adc]">정방향</span>으로 펼쳐졌어요.
            </p>
            <p className="text-[11px] text-[#a87888]">더 깊은 해석은 1:1 상담에서 만나보세요.</p>
          </div>
        </div>
      )}

      {picked.length > 0 && (
        <div className="mt-6 text-center">
          <button
            onClick={reset}
            className="text-xs px-5 py-2 rounded-full text-[#6a4858] bg-white/70 border border-[#f4a8b8]/50 hover:bg-white transition font-semibold"
          >
            다시 뽑기
          </button>
        </div>
      )}
    </section>
  );
}
