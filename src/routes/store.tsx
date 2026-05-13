import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import storeBg from "@/assets/jagaebit-store-bg.jpg";

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
  { id: "saju-premium-pdf", name: "사주 종합 프리미엄 PDF (80~100p)", price: 29000, kind: "pdf", badge: "추천",
    desc: "명리학 20년 내공 + AI 분석의 만남.\n연애·재물·진로·건강·대운까지 80~100장 분량의 프리미엄 보고서.\n결제 후 입력하신 이메일로 발송됩니다." },
  { id: "goonghap-pdf", name: "궁합 리포트 PDF", price: 29000, kind: "pdf",
    desc: "두 사람의 사주로 읽는 깊은 궁합 이야기.\n사랑 궁합부터 결혼 궁합까지 상세 분석." },
];

const fmt = (n: number) => n.toLocaleString("ko-KR") + "원";

async function payWithToss(p: Product) {
  const clientKey =
    (import.meta.env.VITE_TOSS_CLIENT_KEY as string | undefined)?.trim() ||
    (typeof window !== "undefined" ? localStorage.getItem("toss_client_key")?.trim() : "") ||
    "test_ck_GjLJoQ1aVZ5K66j2Eb7W3w6KYe2R"; // 자개빛 천운 토스 테스트 클라이언트 키

  if (!clientKey) {
    alert("결제 키가 설정되지 않았습니다.");
    return;
  }

  let email = "";
  if (p.kind === "pdf") {
    const input = window.prompt(
      `${p.name}\n\nPDF 리포트는 결제 후 이메일로 발송됩니다.\n받으실 이메일 주소를 입력해주세요.`,
      ""
    );
    if (!input) return;
    email = input.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("올바른 이메일 주소를 입력해주세요.");
      return;
    }
  }

  try {
    const orderId = `${p.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(
      "pending_order",
      JSON.stringify({ orderId, productId: p.id, name: p.name, kind: p.kind, amount: p.price, email }),
    );
    const { loadTossPayments } = await import("@tosspayments/tosspayments-sdk");
    const toss = await loadTossPayments(clientKey);
    const payment = toss.payment({ customerKey: "ANONYMOUS" });
    await payment.requestPayment({
      method: "CARD",
      amount: { currency: "KRW", value: p.price },
      orderId,
      orderName: p.name,
      ...(email ? { customerEmail: email } : {}),
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
      className="min-h-screen text-[#3a2e26]"
      style={{
        backgroundImage: `linear-gradient(rgba(250,244,234,0.85), rgba(245,236,222,0.92)), url(${storeBg})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif",
      }}
    >
      {/* HEADER */}
      <header className="border-b border-[#d8c8b8]/50 backdrop-blur-sm bg-[#faf4ea]/40 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link to="/store" className="text-xl tracking-wider font-semibold text-[#6b4e3d]">
            자개빛 <span className="text-[#a98ba8]">天運</span>
          </Link>
          <a
            href="http://pf.kakao.com/_sunjin7536/chat"
            target="_blank"
            rel="noreferrer"
            className="text-xs px-3 py-1.5 rounded-full border border-[#c8a9c0] text-[#7a5a78] hover:bg-[#c8a9c0]/10 transition"
          >
            카카오톡 문의
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="max-w-3xl mx-auto px-5 pt-12 pb-10 text-center">
        <p className="text-xs tracking-[0.4em] text-[#a98ba8] mb-4">JAGAEBIT · 자개빛 천운</p>
        <h1
          className="text-3xl md:text-4xl leading-relaxed mb-6 font-semibold"
          style={{
            background: "linear-gradient(135deg, #c8a9c0 0%, #b8c4d4 50%, #d4b8c4 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          자개빛 천운에 오신 것을<br />환영합니다
        </h1>
        <p className="text-sm md:text-base text-[#5a4636] leading-loose whitespace-pre-line">
          {`명리상담사 1급 · 타로상담사 1급 · 타로마스터 1급
세 가지 자격을 갖춘 전문 상담사가
당신의 이야기를 진심으로 읽어드립니다.

답답한 마음, 이곳에서 풀어가세요.`}
        </p>
        <div className="mt-8 flex justify-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c8a9c0]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#b8c4d4]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[#d4b8c4]" />
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-3xl mx-auto px-5 pb-16">
        <h2 className="text-center text-sm tracking-[0.3em] text-[#8a6d5a] mb-8">— 상품 안내 —</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="relative bg-[#fffaf2]/80 backdrop-blur-sm border border-[#e3d3bf] rounded-2xl p-6 shadow-[0_8px_30px_-15px_rgba(180,150,120,0.4)] hover:shadow-[0_12px_40px_-10px_rgba(200,169,192,0.5)] transition flex flex-col"
            >
              {p.badge && (
                <span
                  className="absolute -top-2 right-4 text-[10px] tracking-wider px-2.5 py-1 rounded-full text-white font-semibold shadow"
                  style={{
                    background:
                      p.badge === "인기"
                        ? "linear-gradient(135deg,#c8a9c0,#a98ba8)"
                        : "linear-gradient(135deg,#d4b8c4,#b8a4c8)",
                  }}
                >
                  {p.badge}
                </span>
              )}
              <div className="text-[11px] tracking-widest text-[#a98ba8] mb-2">
                {p.kind === "consult" ? "1:1 상담" : "PDF 리포트"}
              </div>
              <h3 className="text-lg font-semibold text-[#4a3a2e] mb-2 leading-snug">{p.name}</h3>
              <p className="text-[13px] text-[#6b5a48] leading-relaxed whitespace-pre-line mb-5 flex-1">
                {p.desc}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-[#ead9c2]">
                <span className="text-xl font-semibold text-[#6b4e3d]">{fmt(p.price)}</span>
                <button
                  onClick={() => payWithToss(p)}
                  className="px-4 py-2 rounded-lg text-sm text-white font-medium hover:opacity-90 transition shadow"
                  style={{ background: "linear-gradient(135deg, #c8a9c0, #b8c4d4)" }}
                >
                  결제하기
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#d8c8b8]/60 bg-[#f5ecde]/60 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-5 py-10 text-xs text-[#7a6a58] leading-relaxed">
          <p className="text-sm font-semibold text-[#5a4636] mb-3">자개빛</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1 gap-x-6">
            <div>대표자명: [입력 필요]</div>
            <div>사업자번호: [입력 필요]</div>
            <div>사업자주소: [입력 필요]</div>
            <div>유선전화: [입력 필요]</div>
          </div>
          <div className="mt-5 flex flex-wrap gap-4">
            <Link to="/refund-policy" className="text-[#7a5a78] hover:underline">
              환불규정
            </Link>
            <a
              href="https://pf.kakao.com/"
              target="_blank"
              rel="noreferrer"
              className="text-[#7a5a78] hover:underline"
            >
              카카오톡 채널 문의
            </a>
          </div>
          <p className="mt-6 text-[11px] text-[#a89888]">
            © {new Date().getFullYear()} 자개빛 (JAGAEBIT). All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
