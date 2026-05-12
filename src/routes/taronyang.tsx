import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { isAuthed } from "@/lib/dashboard-auth";

export const Route = createFileRoute("/taronyang")({
  head: () => ({
    meta: [
      { title: "타로냥 — 타로·사주 전문 상담" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" },
      { name: "description", content: "20년 명리학 전문가 1:1 상담 | 즉시 PDF 다운로드" },
      { property: "og:title", content: "타로냥 — 타로·사주 전문 상담" },
      { property: "og:description", content: "20년 명리학 전문가 1:1 상담 | 즉시 PDF 다운로드" },
      { property: "og:url", content: "https://타로냥.shop" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TaroNyangShop,
});

// ─────────────────────────── 데이터 ───────────────────────────
type Product = {
  id: number;
  name: string;
  price: number;
  original: number | null;
  desc: string;
  badge: string;
  emoji: string;
  bg: string;
  imageUrl: string;
  isPdf?: boolean;
  active?: boolean;
};

const DEFAULT_PRODUCTS: Product[] = [
  { id: 1, name: "사주 1질문 상담", price: 5000, original: 10000, desc: "지금 가장 궁금한 것 하나, 명리학으로 답해드려요", badge: "인기", emoji: "☯️", bg: "linear-gradient(135deg, #1a0533, #4a1942)", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", active: true },
  { id: 2, name: "사주 30분 상담권", price: 19000, original: null, desc: "30분 동안 사주 전반을 깊이 있게 살펴드립니다", badge: "", emoji: "🌙", bg: "linear-gradient(135deg, #0d1b4b, #1a3a6b)", imageUrl: "https://images.unsplash.com/photo-1518281361980-b26bfd556770?w=400&q=80", active: true },
  { id: 3, name: "타로 1질문 리딩", price: 5000, original: 10000, desc: "카드가 전하는 지금 이 순간의 메시지", badge: "인기", emoji: "🃏", bg: "linear-gradient(135deg, #2d0a4e, #6b21a8)", imageUrl: "https://images.unsplash.com/photo-1559181567-c3190ca9d6c9?w=400&q=80", active: true },
  { id: 4, name: "타로 채팅 30분", price: 19000, original: null, desc: "카카오채널에서 편하게 30분 타로 채팅 상담", badge: "", emoji: "💬", bg: "linear-gradient(135deg, #1a0a2e, #3b0764)", imageUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=400&q=80", active: true },
  { id: 5, name: "VIP 종합 상담 60분", price: 39000, original: null, desc: "사주+타로 통합 60분 프리미엄 집중 상담", badge: "VIP", emoji: "👑", bg: "linear-gradient(135deg, #431407, #92400e)", imageUrl: "https://images.unsplash.com/photo-1531171673193-06b674bdb5cd?w=400&q=80", active: true },
  { id: 6, name: "2026 삼재 가이드 PDF", price: 15000, original: null, desc: "돼지·토끼·양띠 묵삼재 완전 분석 즉시 다운로드", badge: "즉시다운로드", emoji: "📖", bg: "linear-gradient(135deg, #14532d, #166534)", imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80", isPdf: true, active: true },
  { id: 7, name: "PDF 미니 운세 리포트", price: 9900, original: null, desc: "핵심만 담은 나만의 미니 운세 리포트", badge: "즉시다운로드", emoji: "📋", bg: "linear-gradient(135deg, #1e3a5f, #1e40af)", imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&q=80", isPdf: true, active: true },
  { id: 8, name: "PDF 스탠다드 리포트", price: 15000, original: null, desc: "상세한 운세 분석과 월별 가이드 포함", badge: "즉시다운로드", emoji: "📘", bg: "linear-gradient(135deg, #312e81, #4338ca)", imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&q=80", isPdf: true, active: true },
  { id: 9, name: "PDF 프리미엄 리포트", price: 25000, original: null, desc: "가장 깊이 있는 종합 운세 + 전문가 코멘트", badge: "프리미엄", emoji: "💎", bg: "linear-gradient(135deg, #4c0519, #881337)", imageUrl: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&q=80", isPdf: true, active: true },
];

const KAKAO = "https://pf.kakao.com/_YCzEX";
const BANK = "국민은행 570202-01-019049 박선진";
const STORAGE_KEY = "taronyang_products";
const TOSS_KEY_STORAGE = "toss_client_key";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

const badgeStyle = (b: string) => {
  if (b === "VIP") return { bg: "rgba(246,173,85,0.15)", color: "#f6ad55", border: "rgba(246,173,85,0.4)" };
  if (b === "프리미엄") return { bg: "rgba(232,121,249,0.15)", color: "#e879f9", border: "rgba(232,121,249,0.4)" };
  if (b === "즉시다운로드") return { bg: "rgba(104,211,145,0.15)", color: "#68d391", border: "rgba(104,211,145,0.4)" };
  if (b === "인기") return { bg: "rgba(244,114,182,0.15)", color: "#f472b6", border: "rgba(244,114,182,0.4)" };
  return null;
};

declare global {
  interface Window {
    TossPayments?: (key: string) => {
      requestPayment: (method: string, params: Record<string, unknown>) => Promise<void>;
    };
  }
}

function loadTossScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return resolve();
    if (window.TossPayments) return resolve();
    const existing = document.getElementById("toss-payments-sdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Toss SDK load failed")));
      return;
    }
    const s = document.createElement("script");
    s.id = "toss-payments-sdk";
    s.src = "https://js.tosspayments.com/v1/payment";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Toss SDK load failed"));
    document.head.appendChild(s);
  });
}

// ─────────────────────────── 메인 ───────────────────────────
function TaroNyangShop() {
  const [admin, setAdmin] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [buying, setBuying] = useState<Product | null>(null);
  const [success, setSuccess] = useState<{ isPdf: boolean } | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  // 초기 로드
  useEffect(() => {
    setAdmin(isAuthed());
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProducts(JSON.parse(saved));
    } catch {}
    // 결제 성공 콜백
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("success") === "1") {
        setSuccess({ isPdf: params.get("pdf") === "1" });
        // URL 정리
        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, "", url.toString());
      } else if (params.get("fail") === "1") {
        toast.error("결제가 취소되었습니다");
        const url = new URL(window.location.href);
        url.search = "";
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  const persistProducts = (next: Product[]) => {
    setProducts(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const visible = useMemo(() => products.filter((p) => p.active !== false), [products]);

  // 캐러셀 인디케이터 추적
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const onScroll = () => {
      const w = el.clientWidth;
      setCarouselIdx(Math.round(el.scrollLeft / w));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [visible.length]);

  const scrollToIdx = (i: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="taronyang-root" style={rootStyle}>
      <style>{globalCss}</style>

      {/* 헤더 */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 26 }}>🐱</span>
          <span style={{ fontWeight: 800, color: "#b794f4", letterSpacing: "0.02em" }}>타로냥</span>
        </div>
        <div style={{ flex: 1, textAlign: "center", color: "#aaa", fontSize: 13 }} className="hide-mobile">
          타로냥 · 운명을 읽다
        </div>
        {admin && (
          <button onClick={() => setShowAdmin((s) => !s)} style={adminBtnStyle}>
            {showAdmin ? "닫기" : "관리"}
          </button>
        )}
      </header>

      {/* 히어로 */}
      <section style={heroStyle}>
        <div className="stars" aria-hidden>
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="star" style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%`, animationDelay: `${(i % 10) * 0.4}s` }} />
          ))}
        </div>
        <div style={{ position: "relative", textAlign: "center", padding: "0 20px" }}>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 38px)", fontWeight: 800, color: "#fff", margin: 0 }}>
            🔮 당신의 운명이 궁금하다면
          </h1>
          <p style={{ marginTop: 14, color: "#cbb8e8", fontSize: "clamp(13px, 2.4vw, 17px)" }}>
            20년 명리학 전문가의 타로·사주 리딩
          </p>
        </div>
      </section>

      {/* 관리자 패널 */}
      {admin && showAdmin && (
        <AdminPanel products={products} onChange={persistProducts} />
      )}

      {/* 상품 — PC 그리드 */}
      <section className="products-grid hide-mobile" style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} onBuy={() => setBuying(p)} />
          ))}
        </div>
      </section>

      {/* 상품 — 모바일 캐러셀 */}
      <section className="show-mobile" style={{ marginTop: 24 }}>
        <div ref={carouselRef} style={carouselStyle}>
          {visible.map((p) => (
            <div key={p.id} style={carouselSlideStyle}>
              <ProductCard product={p} onBuy={() => setBuying(p)} />
            </div>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 14 }}>
          {visible.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIdx(i)}
              aria-label={`상품 ${i + 1}`}
              style={{
                width: i === carouselIdx ? 18 : 6,
                height: 6,
                borderRadius: 999,
                background: i === carouselIdx ? "#b794f4" : "rgba(183,148,244,0.3)",
                border: "none",
                transition: "all 0.2s",
                padding: 0,
              }}
            />
          ))}
        </div>
      </section>

      {/* 푸터 */}
      <footer style={{ padding: "60px 20px 40px", textAlign: "center", color: "#666", fontSize: 12 }}>
        <div>🐱 타로냥 · 타로·사주 전문 상담</div>
        <div style={{ marginTop: 6 }}>문의: 카카오채널 @타로냥</div>
      </footer>

      {/* 결제 모달 */}
      {buying && (
        <PurchaseSheet
          product={buying}
          onClose={() => setBuying(null)}
        />
      )}

      {/* 결제 성공 모달 */}
      {success && (
        <SuccessModal isPdf={success.isPdf} onClose={() => setSuccess(null)} />
      )}
    </div>
  );
}

// ─────────────────────────── 상품 카드 ───────────────────────────
function ProductCard({ product, onBuy }: { product: Product; onBuy: () => void }) {
  const [imgFailed, setImgFailed] = useState(false);
  const bs = badgeStyle(product.badge);

  return (
    <article style={cardStyle}>
      <div className="product-image" style={{ ...cardImageStyle, background: product.bg }}>
        {!imgFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgFailed(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", fontSize: 64 }}>
            {product.emoji}
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(10,10,15,0.6) 100%)" }} />
        <div style={{ position: "absolute", bottom: 8, right: 10, fontSize: 28, opacity: 0.85 }}>{product.emoji}</div>
      </div>

      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        {bs && (
          <span
            style={{
              alignSelf: "flex-start",
              fontSize: 10,
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: 999,
              background: bs.bg,
              color: bs.color,
              border: `1px solid ${bs.border}`,
            }}
          >
            {product.badge}
          </span>
        )}
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>{product.name}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "#a8a8b3", lineHeight: 1.55, minHeight: 36 }}>{product.desc}</p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" }}>
          {product.original && (
            <span style={{ fontSize: 13, color: "#666", textDecoration: "line-through" }}>{won(product.original)}</span>
          )}
          <span style={{ fontSize: 20, fontWeight: 800, color: "#f6ad55" }}>{won(product.price)}</span>
        </div>
        <button onClick={onBuy} style={primaryBtnStyle}>
          지금 구매하기
        </button>
      </div>
    </article>
  );
}

// ─────────────────────────── 결제 모달 (모바일 bottom sheet) ───────────────────────────
function PurchaseSheet({ product, onClose }: { product: Product; onClose: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submitToss = async () => {
    if (!name.trim() || !phone.trim()) return toast.error("이름과 연락처를 입력해주세요");
    if (product.isPdf && !email.trim()) return toast.error("PDF 발송용 이메일을 입력해주세요");
    setLoading(true);
    try {
      await loadTossScript();
      if (!window.TossPayments) throw new Error("Toss SDK unavailable");
      const key = localStorage.getItem(TOSS_KEY_STORAGE) || "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";
      const tp = window.TossPayments(key);
      const successUrl = window.location.origin + `/taronyang?success=1${product.isPdf ? "&pdf=1" : ""}`;
      const failUrl = window.location.origin + "/taronyang?fail=1";
      await tp.requestPayment("카드", {
        amount: product.price,
        orderId: "ORDER-" + Date.now(),
        orderName: product.name,
        customerName: name,
        customerMobilePhone: phone.replace(/[^0-9]/g, ""),
        customerEmail: email || undefined,
        successUrl,
        failUrl,
      });
    } catch (e) {
      console.error(e);
      toast.error("결제창을 여는 중 오류가 발생했습니다");
    } finally {
      setLoading(false);
    }
  };

  const submitBank = () => {
    if (!name.trim() || !phone.trim()) return toast.error("이름과 연락처를 입력해주세요");
    navigator.clipboard.writeText(BANK);
    toast.success("계좌번호가 복사되었습니다 — 입금 후 카카오채널로 알려주세요");
    window.open(KAKAO, "_blank");
  };

  return (
    <div className="tn-modal-overlay" style={modalOverlay} onClick={onClose}>
      <div className="purchase-sheet" style={sheetStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: "#3a3a45" }} className="show-mobile" />
        </div>
        <div style={{ padding: "16px 22px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: "#fff" }}>{product.name}</h3>
              <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800, color: "#f6ad55" }}>{won(product.price)}</div>
            </div>
            <button onClick={onClose} aria-label="닫기" style={{ background: "transparent", color: "#888", border: "none", fontSize: 22, cursor: "pointer" }}>✕</button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="구매자 이름" style={inputStyle} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="연락처 (010-0000-0000)" style={inputStyle} />
            {product.isPdf && (
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="이메일 (PDF 발송용)" style={inputStyle} />
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 18 }}>
            <button onClick={submitToss} disabled={loading} style={primaryBtnStyle}>
              {loading ? "결제창을 여는 중..." : "💳 카드로 결제"}
            </button>
            <button onClick={submitBank} style={outlineBtnStyle}>
              🏦 계좌이체
            </button>
          </div>

          <div style={{ marginTop: 14, padding: 12, background: "rgba(183,148,244,0.06)", border: "1px solid rgba(183,148,244,0.15)", borderRadius: 10, fontSize: 12, color: "#aaa", textAlign: "center" }}>
            계좌: <span style={{ color: "#b794f4", fontWeight: 600 }}>{BANK}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── 결제 성공 모달 ───────────────────────────
function SuccessModal({ isPdf, onClose }: { isPdf: boolean; onClose: () => void }) {
  return (
    <div className="tn-modal-overlay" style={modalOverlay} onClick={onClose}>
      <div style={{ ...sheetStyle, maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <h3 style={{ margin: "12px 0 6px", color: "#fff", fontSize: 20, fontWeight: 800 }}>결제 완료!</h3>
          <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>카카오채널로 안내드릴게요</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 24 }}>
            <a href={KAKAO} target="_blank" rel="noreferrer" style={{ ...primaryBtnStyle, textDecoration: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#fee500", color: "#000" }}>
              💬 카카오 채널 바로가기
            </a>
            {isPdf && (
              <button onClick={() => toast.success("이메일로 다운로드 링크를 보내드렸어요 💌")} style={outlineBtnStyle}>
                📥 PDF 다운로드
              </button>
            )}
            <button onClick={onClose} style={{ ...outlineBtnStyle, borderColor: "#333", color: "#888" }}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────── 관리자 패널 ───────────────────────────
function AdminPanel({ products, onChange }: { products: Product[]; onChange: (p: Product[]) => void }) {
  const update = (id: number, patch: Partial<Product>) => {
    onChange(products.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };
  const remove = (id: number) => {
    if (!confirm("정말 삭제할까요?")) return;
    onChange(products.filter((p) => p.id !== id));
    toast.success("삭제되었습니다");
  };
  const add = () => {
    const name = prompt("상품명")?.trim();
    if (!name) return;
    const priceStr = prompt("가격(원)", "10000");
    const price = Number(priceStr) || 0;
    const desc = prompt("설명", "")?.trim() || "";
    const emoji = prompt("이모지", "✨")?.trim() || "✨";
    const badge = prompt("뱃지(인기/즉시다운로드/VIP/프리미엄, 비우면 없음)", "")?.trim() || "";
    const newId = Math.max(0, ...products.map((p) => p.id)) + 1;
    onChange([
      ...products,
      {
        id: newId,
        name,
        price,
        original: null,
        desc,
        badge,
        emoji,
        bg: "linear-gradient(135deg, #2d0a4e, #6b21a8)",
        imageUrl: "",
        active: true,
      },
    ]);
    toast.success("상품이 추가되었습니다");
  };

  return (
    <div style={{ background: "#13131a", borderTop: "1px solid rgba(183,148,244,0.2)", borderBottom: "1px solid rgba(183,148,244,0.2)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: "#b794f4", fontSize: 16, fontWeight: 700 }}>🔧 상품 관리</h3>
          <button onClick={add} style={{ ...primaryBtnStyle, width: "auto", padding: "10px 16px", height: "auto" }}>
            + 상품 추가
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {products.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "32px 1fr 120px 90px 80px", gap: 8, alignItems: "center", padding: 10, background: "#0f0f15", border: "1px solid #222", borderRadius: 10 }} className="admin-row">
              <span style={{ fontSize: 22, textAlign: "center" }}>{p.emoji}</span>
              <input value={p.name} onChange={(e) => update(p.id, { name: e.target.value })} style={{ ...inputStyle, padding: "8px 10px" }} />
              <input type="number" value={p.price} onChange={(e) => update(p.id, { price: Number(e.target.value) || 0 })} style={{ ...inputStyle, padding: "8px 10px" }} />
              <button
                onClick={() => update(p.id, { active: p.active === false })}
                style={{
                  height: 36,
                  borderRadius: 8,
                  border: `1px solid ${p.active === false ? "#333" : "rgba(104,211,145,0.4)"}`,
                  background: p.active === false ? "transparent" : "rgba(104,211,145,0.1)",
                  color: p.active === false ? "#666" : "#68d391",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {p.active === false ? "OFF" : "ON"}
              </button>
              <button onClick={() => remove(p.id)} style={{ height: 36, borderRadius: 8, border: "1px solid rgba(248,113,113,0.4)", background: "transparent", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                삭제
              </button>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 14, fontSize: 11, color: "#666" }}>변경 사항은 자동으로 저장됩니다 (localStorage)</p>
      </div>
    </div>
  );
}

// ─────────────────────────── 스타일 ───────────────────────────
const rootStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#0a0a0f",
  color: "#fff",
  fontFamily: "'Noto Sans KR', sans-serif",
  paddingBottom: "env(safe-area-inset-bottom)",
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 20px",
  paddingTop: "calc(14px + env(safe-area-inset-top))",
  background: "rgba(10,10,15,0.85)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(183,148,244,0.15)",
};

const adminBtnStyle: React.CSSProperties = {
  padding: "8px 14px",
  borderRadius: 8,
  border: "1px solid rgba(183,148,244,0.4)",
  background: "rgba(183,148,244,0.1)",
  color: "#b794f4",
  fontSize: 12,
  fontWeight: 600,
  cursor: "pointer",
};

const heroStyle: React.CSSProperties = {
  position: "relative",
  minHeight: "min(70vh, 480px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #1a0533 0%, #0a0a0f 100%)",
  overflow: "hidden",
};

const cardStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  background: "#13131a",
  border: "1px solid rgba(183,148,244,0.15)",
  borderRadius: 18,
  overflow: "hidden",
  transition: "transform 0.2s, border-color 0.2s",
};

const cardImageStyle: React.CSSProperties = {
  position: "relative",
  width: "100%",
  height: 200,
  overflow: "hidden",
};

const primaryBtnStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  padding: "0 18px",
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #b794f4, #9f7be0)",
  color: "#0a0a0f",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
  transition: "opacity 0.2s",
};

const outlineBtnStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 52,
  padding: "0 18px",
  border: "2px solid #f6ad55",
  borderRadius: 12,
  background: "transparent",
  color: "#f6ad55",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "#0e0e14",
  border: "1px solid #2a2a35",
  borderRadius: 10,
  color: "#fff",
  fontSize: 14,
  outline: "none",
  fontFamily: "inherit",
};

const carouselStyle: React.CSSProperties = {
  display: "flex",
  overflowX: "auto",
  scrollSnapType: "x mandatory",
  scrollbarWidth: "none",
  WebkitOverflowScrolling: "touch",
  paddingBottom: 8,
};

const carouselSlideStyle: React.CSSProperties = {
  flex: "0 0 100%",
  scrollSnapAlign: "center",
  padding: "0 20px",
  boxSizing: "border-box",
};

const modalOverlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 100,
  background: "rgba(0,0,0,0.75)",
  backdropFilter: "blur(6px)",
  display: "flex",
  justifyContent: "center",
  paddingBottom: "env(safe-area-inset-bottom)",
};

const sheetStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 480,
  background: "#13131a",
  border: "1px solid rgba(183,148,244,0.3)",
  borderRadius: "20px 20px 0 0",
  maxHeight: "92vh",
  overflowY: "auto",
};

const globalCss = `
  .taronyang-root *::-webkit-scrollbar { display: none; }
  .taronyang-root .show-mobile { display: none; }
  .taronyang-root .tn-modal-overlay { align-items: flex-end; }
  @media (max-width: 768px) {
    .taronyang-root .show-mobile { display: block; }
    .taronyang-root .hide-mobile { display: none !important; }
    .taronyang-root .product-image { height: 160px !important; }
    .taronyang-root .admin-row { grid-template-columns: 32px 1fr 80px !important; }
    .taronyang-root .admin-row > :nth-child(4),
    .taronyang-root .admin-row > :nth-child(5) { grid-column: span 1; }
    .taronyang-root { font-size: 14px; }
  }
  @media (min-width: 769px) {
    .taronyang-root { font-size: 16px; }
    .taronyang-root .tn-modal-overlay { align-items: center !important; padding: 20px; }
    .taronyang-root .purchase-sheet { border-radius: 20px !important; }
  }
  .taronyang-root .stars { position: absolute; inset: 0; pointer-events: none; }
  .taronyang-root .star {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #fff;
    border-radius: 50%;
    opacity: 0;
    box-shadow: 0 0 6px rgba(255,255,255,0.8);
    animation: tnTwinkle 3.5s ease-in-out infinite;
  }
  @keyframes tnTwinkle {
    0%, 100% { opacity: 0; transform: scale(0.6); }
    50% { opacity: 0.9; transform: scale(1.2); }
  }
`;
