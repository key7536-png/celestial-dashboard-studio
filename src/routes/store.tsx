import { createFileRoute, Link } from "@tanstack/react-router";

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
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap",
      } as any,
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
  badge?: "인기" | "추천";
  kind: "consult" | "pdf";
};

const PRODUCTS: Product[] = [
  { id: "tarot-10", name: "타로/사주 10분 상담", price: 10000, kind: "consult",
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

const JAGAE_GRADIENT =
  "linear-gradient(135deg, #b794f4 0%, #f687b3 35%, #76e4f7 70%, #f6e05e 100%)";

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
      className="min-h-screen text-[#f0e6ff] relative"
      style={{
        backgroundColor: "#0a0a0f",
        backgroundImage: `
          radial-gradient(ellipse at 15% 10%, rgba(183,148,244,0.18), transparent 55%),
          radial-gradient(ellipse at 85% 20%, rgba(246,135,179,0.14), transparent 55%),
          radial-gradient(ellipse at 50% 90%, rgba(118,228,247,0.12), transparent 55%),
          radial-gradient(ellipse at 90% 80%, rgba(246,224,94,0.10), transparent 55%)
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
          background: #13131a;
          border: 1px solid rgba(183,148,244,0.15);
          border-radius: 18px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.02) inset,
            0 8px 40px -12px rgba(183,148,244,0.25),
            0 0 60px -20px rgba(246,135,179,0.15);
          transition: transform .35s ease, box-shadow .35s ease;
          overflow: hidden;
        }
        .jagae-card::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: ${JAGAE_GRADIENT};
          background-size: 200% 200%;
          animation: jagae-shimmer 5s ease infinite;
        }
        .jagae-card::after {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 18px;
          padding: 1px;
          background: ${JAGAE_GRADIENT};
          background-size: 200% 200%;
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity .4s ease;
          pointer-events: none;
          animation: jagae-shimmer 3s ease infinite;
        }
        .jagae-card:hover {
          transform: translateY(-4px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 16px 50px -10px rgba(183,148,244,0.45),
            0 0 80px -10px rgba(246,135,179,0.3);
        }
        .jagae-card:hover::after { opacity: 1; }
        .jagae-btn {
          background: ${JAGAE_GRADIENT};
          background-size: 200% 200%;
          color: #0a0a0f;
          font-weight: 700;
          animation: jagae-shimmer 4s ease infinite;
          box-shadow: 0 4px 20px -4px rgba(183,148,244,0.5);
          transition: transform .2s ease, box-shadow .2s ease;
        }
        .jagae-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px -2px rgba(246,135,179,0.6);
        }
        .jagae-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(183,148,244,0.4), rgba(246,135,179,0.4), rgba(118,228,247,0.4), transparent);
        }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0a0a0f]/70 border-b border-[#1f1a2e]">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link
            to="/store"
            className="text-xl tracking-wider font-semibold jagae-text"
            style={{ fontFamily: "'Noto Serif KR', serif" }}
          >
            자개빛 天運
          </Link>
          <a
            href="https://pf.kakao.com/"
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-[#b794f4]/40 text-[#f0e6ff] hover:bg-[#b794f4]/10 transition"
          >
            카카오톡 문의
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-16 pb-12 text-center">
        <p className="text-[11px] tracking-[0.5em] text-[#f6ad55] mb-5">JAGAEBIT · 자개빛 천운</p>
        <h1
          className="text-3xl md:text-4xl leading-relaxed mb-7 font-semibold jagae-text"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          자개빛 천운에 오신 것을<br />환영합니다
        </h1>
        <p
          className="text-sm md:text-base text-[#d9ccf0] leading-loose whitespace-pre-line"
          style={{ fontFamily: "'Noto Sans KR', sans-serif" }}
        >
          {`명리상담사 1급 · 타로상담사 1급 · 타로마스터 1급
세 가지 자격을 갖춘 전문 상담사가
당신의 이야기를 진심으로 읽어드립니다.

답답한 마음, 이곳에서 풀어가세요.`}
        </p>
        <div className="mt-8 flex justify-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#b794f4]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#f687b3]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#76e4f7]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#f6e05e]" />
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-5">
        <div className="jagae-divider" />
      </div>

      {/* PRODUCTS */}
      <section className="max-w-3xl mx-auto px-5 pt-12 pb-16">
        <h2
          className="text-center text-sm tracking-[0.4em] text-[#f6ad55] mb-10"
          style={{ fontFamily: "'Noto Serif KR', serif" }}
        >
          — 상품 안내 —
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRODUCTS.map((p) => (
            <article key={p.id} className="jagae-card p-6 flex flex-col">
              {p.badge && (
                <span
                  className="absolute top-3 right-3 text-[10px] tracking-wider px-2.5 py-1 rounded-full font-bold"
                  style={{
                    background: JAGAE_GRADIENT,
                    color: "#0a0a0f",
                  }}
                >
                  {p.badge}
                </span>
              )}
              <div className="text-[11px] tracking-widest text-[#b794f4] mb-2">
                {p.kind === "consult" ? "1:1 상담" : "PDF 리포트"}
              </div>
              <h3
                className="text-lg font-semibold text-[#f0e6ff] mb-3 leading-snug"
                style={{ fontFamily: "'Noto Serif KR', serif" }}
              >
                {p.name}
              </h3>
              <p className="text-[13px] text-[#b8aed1] leading-relaxed whitespace-pre-line mb-5 flex-1">
                {p.desc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#2a2238]">
                <span
                  className="text-xl font-semibold text-[#f6ad55]"
                  style={{ fontFamily: "'Noto Serif KR', serif" }}
                >
                  {fmt(p.price)}
                </span>
                <button
                  onClick={() => payWithToss(p)}
                  className="jagae-btn px-5 py-2 rounded-lg text-sm"
                >
                  결제하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#1f1a2e] bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 py-10 text-xs text-[#a89bc4] leading-relaxed">
          <p
            className="text-base font-semibold mb-4 jagae-text inline-block"
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
            <Link to="/refund-policy" className="text-[#b794f4] hover:text-[#f687b3] transition">
              환불규정
            </Link>
            <a
              href="https://pf.kakao.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#b794f4] hover:text-[#f687b3] transition"
            >
              카카오톡 채널 문의
            </a>
          </div>
          <p className="mt-6 text-[11px] text-[#6b5e80] flex items-center justify-between gap-3 flex-wrap">
            <span>© {new Date().getFullYear()} 자개빛 (JAGAEBIT). All rights reserved.</span>
            <Link
              to="/dashboard"
              className="text-[10px] tracking-wider px-2.5 py-1 rounded-full border border-[#2a2238] text-[#6b5e80] hover:text-[#b794f4] hover:border-[#b794f4]/50 transition"
            >
              관리자 대시보드
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
