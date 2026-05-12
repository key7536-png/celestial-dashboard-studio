import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { isAuthed } from "@/lib/dashboard-auth";
import { drawCards, type DrawnCard } from "@/lib/tarot-deck";

export const Route = createFileRoute("/shop")({
  head: () => ({
    meta: [
      { title: "자개빛 — 20년 명리학 전문가 상점" },
      { name: "description", content: "타로 PDF 리딩. 결제 즉시 카드 3장이 전하는 메시지를 받아보세요." },
      { property: "og:title", content: "자개빛 (JAGAEBIT) 상점" },
      { property: "og:description", content: "20년 명리학 전문가의 타로 PDF 리딩" },
    ],
  }),
  component: ShopPage,
});

type Badge = "인기" | "VIP" | "즉시다운로드" | "즉시확인 + 다운로드" | null;
type Product = {
  id: string;
  name: string;
  price: number;
  regular?: number;
  badge?: Badge;
  isPdf?: boolean;
  description?: string;
  active?: boolean; // false = 숨김 (데이터는 유지)
};

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "tarot-pdf-reading",
    name: "🔮 나만을 위한 타로 리딩 PDF",
    price: 15000,
    badge: "즉시확인 + 다운로드",
    isPdf: true,
    description: "카드 3장이 전하는 당신만의 메시지 · 결제 즉시 확인",
    active: true,
  },
  { id: "saju-1q", name: "사주 1질문 상담", price: 5000, regular: 10000, badge: "인기", active: false },
  { id: "saju-30", name: "사주 30분 상담권", price: 19000, active: false },
  { id: "tarot-1q", name: "타로 1질문 리딩", price: 5000, regular: 10000, badge: "인기", active: false },
  { id: "tarot-30", name: "타로 채팅 30분", price: 19000, active: false },
  { id: "vip-60", name: "VIP 종합 상담 60분", price: 39000, badge: "VIP", active: false },
  { id: "pdf-samjae", name: "2026 삼재 가이드 PDF", price: 15000, badge: "즉시다운로드", isPdf: true, active: false },
  { id: "pdf-mini", name: "PDF 미니 운세 리포트", price: 9900, badge: "즉시다운로드", isPdf: true, active: false },
  { id: "pdf-std", name: "PDF 스탠다드", price: 15000, badge: "즉시다운로드", isPdf: true, active: false },
  { id: "pdf-prem", name: "PDF 프리미엄", price: 25000, badge: "즉시다운로드", isPdf: true, active: false },
];

type Order = {
  id: string;
  productName: string;
  customerName: string;
  amount: number;
  date: string;
  status: "결제완료" | "발송대기" | "완료";
  isPdf: boolean;
  email?: string;
};

type PaySettings = {
  env: "test" | "live";
  clientKey: string;
  secretKey: string;
};

const KAKAO = "https://pf.kakao.com/_YCzEX";
const SHOP_URL = "https://자개빛.shop/shop";
const KMONG = "https://kmong.com/@퍼플문타로사주";
const BANK = "국민은행 570202-01-019049 박선진";

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

const badgeClass = (b: Badge) => {
  if (b === "VIP") return "bg-[#f6ad55]/15 text-[#f6ad55] border-[#f6ad55]/40";
  if (b === "즉시다운로드" || b === "즉시확인 + 다운로드")
    return "bg-[#b794f4]/15 text-[#b794f4] border-[#b794f4]/40";
  if (b === "인기") return "bg-pink-500/15 text-pink-300 border-pink-400/40";
  return "";
};

// ─────────────────── 타로 리딩 텍스트 생성 ───────────────────
const READING_LIBRARY: Record<string, string> = {
  upright:
    "지금 당신을 둘러싼 흐름이 자연스럽게 풀려 가고 있어요. 마음속 작은 직감을 무시하지 말고, 한 걸음씩 신뢰하면서 나아가세요. 결과에 집착하지 않을수록 더 좋은 길이 열립니다.",
  reversed:
    "잠시 멈추라는 신호예요. 무리해서 밀어붙이기보다 한 호흡 쉬어가는 시간이 필요합니다. 감정을 정리하고 나면, 보이지 않던 길이 선명하게 드러날 거예요.",
};

function generateReading(cards: DrawnCard[], name: string) {
  const sections = cards.map((c, i) => {
    const base = c.reversed ? READING_LIBRARY.reversed : READING_LIBRARY.upright;
    const intro =
      i === 0
        ? "첫 번째 카드는 지금 당신의 현재 상황을 비춰줍니다."
        : i === 1
        ? "두 번째 카드는 당신이 마주한 흐름과 도전을 보여줍니다."
        : "세 번째 카드는 앞으로 펼쳐질 가능성과 조언을 담고 있어요.";
    return {
      title: `${c.name}${c.reversed ? " (역방향)" : ""}`,
      body: `${intro}\n\n${base}\n\n${name ? `${name}님, ` : ""}이 카드는 당신에게 "지금 이 순간을 충분히 살아내라"는 메시지를 전합니다. 작은 변화 하나가 큰 흐름을 바꿀 수 있어요.`,
    };
  });
  const summary = `${name ? `${name}님께 전하는 종합 메시지입니다.\n\n` : ""}세 장의 카드는 모두 한 방향을 가리키고 있어요. 지금 당신의 마음 깊은 곳에 있는 진짜 바람을 외면하지 않는 것, 그것이 시작입니다. 결과를 두려워하기보다 과정을 사랑하세요. 자개빛이 응원합니다 ✨`;
  return { sections, summary };
}

type Reading = ReturnType<typeof generateReading>;

function ShopPage() {
  const [admin, setAdmin] = useState(false);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState<"products" | "pay" | "orders">("products");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<"all" | Order["status"]>("all");
  const [pay, setPay] = useState<PaySettings>({ env: "test", clientKey: "", secretKey: "" });
  const [buying, setBuying] = useState<Product | null>(null);
  const [reading, setReading] = useState<{ name: string; date: string; cards: DrawnCard[]; reading: Reading } | null>(null);

  useEffect(() => {
    setAdmin(isAuthed());
    try {
      const saved = localStorage.getItem("jagaebit_products");
      if (saved) setProducts(JSON.parse(saved));
      const o = localStorage.getItem("jagaebit_orders");
      if (o) setOrders(JSON.parse(o));
      const h = localStorage.getItem("jagaebit_hidden");
      if (h) setHidden(JSON.parse(h));
      const p = localStorage.getItem("jagaebit_pay");
      if (p) setPay(JSON.parse(p));
    } catch {}
  }, []);

  const persistOrders = (next: Order[]) => {
    setOrders(next);
    localStorage.setItem("jagaebit_orders", JSON.stringify(next));
  };
  const persistHidden = (next: Record<string, boolean>) => {
    setHidden(next);
    localStorage.setItem("jagaebit_hidden", JSON.stringify(next));
  };

  const copy = (text: string, label = "링크") => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} 복사됨 ✅`);
  };

  // 고객은 active===true만 표시 / 관리자도 active 기준 사용 (수동 hidden은 보조)
  const visibleProducts = admin
    ? products
    : products.filter((p) => p.active !== false && !hidden[p.id]);
  const filteredOrders = orders.filter((o) => orderFilter === "all" || o.status === orderFilter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <header className="border-b border-[#1e1e1e] bg-[#0a0a0f]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">🔮</span>
            <span className="font-bold text-[#b794f4] text-lg hidden sm:inline">자개빛</span>
          </div>
          <div className="flex-1 text-center">
            <div className="text-[#b794f4] font-semibold tracking-wide">jagaebit.shop</div>
            <div className="text-xs text-[#888] mt-0.5">20년 명리학 전문가 · 타로 · 사주 · 운세</div>
          </div>
          <a
            href={KAKAO}
            target="_blank"
            rel="noreferrer"
            className="flex-shrink-0 bg-[#fee500] text-black text-sm font-semibold px-3 py-2 rounded-lg hover:opacity-90 transition"
          >
            💬 카카오 문의
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-6">
        {admin && (
          <div className="mb-5 flex items-center justify-between bg-[#13131a] border border-[#b794f4]/30 rounded-xl p-3">
            <span className="text-xs text-[#b794f4]">🔐 관리자 모드 — 고객은 이 영역을 볼 수 없습니다</span>
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="text-xs border border-[#b794f4]/40 text-[#b794f4] font-semibold px-3 py-1.5 rounded-lg hover:bg-[#b794f4]/10 transition"
              >
                🏠 대시보드
              </Link>
              <button
                onClick={() => copy(SHOP_URL, "상점 링크")}
                className="text-xs bg-[#b794f4] text-black font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition"
              >
                🔗 상점 링크
              </button>
            </div>
          </div>
        )}

        {admin && (
          <div className="flex gap-1 mb-5 border-b border-[#1e1e1e]">
            {[
              { id: "products", label: "🛍️ 상품 목록" },
              { id: "pay", label: "💳 결제 설정" },
              { id: "orders", label: "📦 주문 내역" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as typeof tab)}
                className={`px-4 py-2.5 text-sm transition border-b-2 -mb-px ${
                  tab === t.id
                    ? "text-[#b794f4] border-[#b794f4] font-semibold"
                    : "text-[#888] border-transparent hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {(!admin || tab === "products") && (
          <section className={admin ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
            {visibleProducts.map((p) => {
              const isHidden = !!hidden[p.id] || p.active === false;
              return (
                <div
                  key={p.id}
                  className={`bg-[#13131a] border rounded-2xl p-6 transition ${
                    isHidden ? "border-[#333] opacity-60" : "border-[#2a2a2a] hover:border-[#b794f4]/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg sm:text-xl font-bold leading-snug">{p.name}</h3>
                    {p.badge && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap ${badgeClass(p.badge)}`}>
                        {p.badge}
                      </span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-sm text-[#aaa] mb-4 leading-relaxed">{p.description}</p>
                  )}
                  <div className="flex items-baseline gap-2 mb-5">
                    {p.regular && (
                      <span className="text-sm text-[#666] line-through">{won(p.regular)}</span>
                    )}
                    <span className="text-2xl font-bold text-[#f6ad55]">{won(p.price)}</span>
                  </div>

                  {admin ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => persistHidden({ ...hidden, [p.id]: !hidden[p.id] })}
                        className={`flex-1 text-xs py-2 rounded-lg border transition ${
                          hidden[p.id] || p.active === false
                            ? "border-[#333] text-[#666] hover:border-[#b794f4] hover:text-[#b794f4]"
                            : "border-[#b794f4]/40 text-[#b794f4] bg-[#b794f4]/10"
                        }`}
                      >
                        {hidden[p.id] || p.active === false ? "숨김" : "판매중"}
                      </button>
                      <button
                        onClick={() => {
                          const name = prompt("상품명", p.name);
                          if (name == null) return;
                          const priceStr = prompt("가격(원)", String(p.price));
                          if (priceStr == null) return;
                          setProducts((prev) =>
                            prev.map((x) => (x.id === p.id ? { ...x, name, price: Number(priceStr) || x.price } : x))
                          );
                        }}
                        className="flex-1 text-xs py-2 rounded-lg border border-[#2a2a2a] text-[#aaa] hover:border-[#f6ad55] hover:text-[#f6ad55] transition"
                      >
                        ✏️ 수정
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setBuying(p)}
                      className="w-full bg-gradient-to-r from-[#b794f4] to-[#9f7be0] text-black font-bold py-3.5 rounded-xl hover:opacity-90 transition text-base"
                    >
                      지금 받아보기
                    </button>
                  )}
                </div>
              );
            })}
            {!admin && visibleProducts.length === 0 && (
              <div className="text-center py-16 text-[#666]">현재 판매 중인 상품이 없습니다.</div>
            )}
          </section>
        )}

        {admin && tab === "pay" && (
          <section className="space-y-5 max-w-2xl">
            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-2xl p-5">
              <h3 className="font-bold mb-4">💳 토스페이먼츠</h3>
              <div className="flex gap-2 mb-4">
                {(["test", "live"] as const).map((e) => (
                  <button
                    key={e}
                    onClick={() => setPay({ ...pay, env: e })}
                    className={`flex-1 py-2 text-sm rounded-lg border transition ${
                      pay.env === e
                        ? "border-[#b794f4] text-[#b794f4] bg-[#b794f4]/10"
                        : "border-[#2a2a2a] text-[#888] hover:border-[#444]"
                    }`}
                  >
                    {e === "test" ? "🧪 테스트" : "🚀 실서비스"}
                  </button>
                ))}
              </div>
              <label className="text-xs text-[#888] block mb-1">클라이언트 키</label>
              <input
                value={pay.clientKey}
                onChange={(e) => setPay({ ...pay, clientKey: e.target.value })}
                placeholder="test_ck_..."
                className="w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm mb-3 focus:border-[#b794f4] outline-none"
              />
              <label className="text-xs text-[#888] block mb-1">시크릿 키</label>
              <input
                type="password"
                value={pay.secretKey}
                onChange={(e) => setPay({ ...pay, secretKey: e.target.value })}
                placeholder="test_sk_..."
                className="w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm mb-4 focus:border-[#b794f4] outline-none"
              />
              <button
                onClick={() => {
                  localStorage.setItem("jagaebit_pay", JSON.stringify(pay));
                  toast.success("저장됐습니다");
                }}
                className="bg-[#b794f4] text-black font-semibold px-5 py-2 rounded-lg hover:opacity-90 transition text-sm"
              >
                저장
              </button>
            </div>

            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-2xl p-5">
              <h3 className="font-bold mb-3">🏦 계좌이체</h3>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm">{BANK}</div>
                <button
                  onClick={() => copy(BANK, "계좌")}
                  className="text-xs border border-[#b794f4] text-[#b794f4] px-3 py-2 rounded-lg hover:bg-[#b794f4]/10"
                >
                  복사
                </button>
              </div>
            </div>

            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-2xl p-5 space-y-2">
              <h3 className="font-bold mb-3">🔗 링크</h3>
              {[
                { label: "자개빛.shop", url: SHOP_URL },
                { label: "카카오채널", url: KAKAO },
                { label: "크몽", url: KMONG },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-2">
                  <span className="text-xs text-[#888] w-20">{l.label}</span>
                  <div className="flex-1 bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-1.5 text-xs text-[#b794f4] truncate">
                    {l.url}
                  </div>
                  <button
                    onClick={() => copy(l.url, l.label)}
                    className="text-xs border border-[#2a2a2a] text-[#aaa] px-3 py-1.5 rounded-lg hover:border-[#b794f4] hover:text-[#b794f4]"
                  >
                    복사
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {admin && tab === "orders" && (
          <section>
            <div className="flex flex-wrap gap-2 mb-4">
              {(["all", "결제완료", "발송대기", "완료"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setOrderFilter(s)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition ${
                    orderFilter === s
                      ? "border-[#b794f4] text-[#b794f4] bg-[#b794f4]/10"
                      : "border-[#2a2a2a] text-[#888] hover:border-[#444]"
                  }`}
                >
                  {s === "all" ? "전체" : s}
                </button>
              ))}
            </div>
            {filteredOrders.length === 0 ? (
              <div className="text-center py-16 bg-[#13131a] border border-[#2a2a2a] rounded-2xl text-[#666]">
                📦 아직 주문이 없습니다
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((o) => (
                  <div key={o.id} className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-4 flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <div className="font-semibold">{o.productName}</div>
                      <div className="text-xs text-[#888] mt-1">
                        {o.customerName} · {new Date(o.date).toLocaleString("ko-KR")}
                      </div>
                    </div>
                    <div className="text-[#f6ad55] font-bold">{won(o.amount)}</div>
                    <span
                      className={`text-[10px] px-2 py-1 rounded-full border ${
                        o.status === "완료"
                          ? "border-green-500/40 text-green-400"
                          : o.status === "발송대기"
                          ? "border-[#f6ad55]/40 text-[#f6ad55]"
                          : "border-[#b794f4]/40 text-[#b794f4]"
                      }`}
                    >
                      {o.status}
                    </span>
                    {o.isPdf && (
                      <button
                        onClick={() => {
                          persistOrders(orders.map((x) => (x.id === o.id ? { ...x, status: "완료" } : x)));
                          toast.success(`${o.email ?? "고객"} 으로 다운로드 링크 발송 💌`);
                        }}
                        className="text-xs bg-[#b794f4] text-black px-3 py-1.5 rounded-lg font-semibold hover:opacity-90"
                      >
                        다운로드 링크 발송
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {buying && (
        <PurchaseModal
          product={buying}
          onClose={() => setBuying(null)}
          onComplete={(order, customer) => {
            persistOrders([order, ...orders]);
            setBuying(null);
            // 타로 PDF 리딩 → 즉시 결과 화면
            if (order.isPdf && buying.id === "tarot-pdf-reading") {
              const cards = drawCards(3);
              setReading({
                name: customer.name,
                date: new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }),
                cards,
                reading: generateReading(cards, customer.name),
              });
            } else if (order.isPdf) {
              toast.success("결제 완료! 카카오채널로 PDF 발송드립니다 💌");
            } else {
              toast.success("결제 완료! 곧 연락드리겠습니다 ✨");
            }
          }}
        />
      )}

      {reading && <ReadingResult data={reading} onClose={() => setReading(null)} />}
    </div>
  );
}

function PurchaseModal({
  product,
  onClose,
  onComplete,
}: {
  product: Product;
  onClose: () => void;
  onComplete: (o: Order, customer: { name: string; phone: string; email: string }) => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const submit = (method: "toss" | "bank") => {
    if (!name.trim() || !phone.trim()) {
      toast.error("이름과 연락처를 입력해주세요");
      return;
    }
    if (product.isPdf && !email.trim() && product.id !== "tarot-pdf-reading") {
      toast.error("PDF 발송용 이메일을 입력해주세요");
      return;
    }
    onComplete(
      {
        id: `o_${Date.now()}`,
        productName: product.name,
        customerName: name,
        amount: product.price,
        date: new Date().toISOString(),
        status: method === "bank" ? "발송대기" : "결제완료",
        isPdf: !!product.isPdf,
        email: email || undefined,
      },
      { name, phone, email }
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#13131a] border border-[#b794f4]/40 rounded-2xl p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">{product.name}</h3>
            <div className="text-[#f6ad55] font-bold text-xl mt-1">{won(product.price)}</div>
          </div>
          <button onClick={onClose} className="text-[#666] hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="구매자 이름"
            className="w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2.5 text-sm focus:border-[#b794f4] outline-none"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="연락처 (010-0000-0000)"
            className="w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2.5 text-sm focus:border-[#b794f4] outline-none"
          />
          {product.isPdf && (
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={product.id === "tarot-pdf-reading" ? "이메일 (선택)" : "이메일 (PDF 발송용)"}
              className="w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2.5 text-sm focus:border-[#b794f4] outline-none"
            />
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => submit("toss")}
            className="w-full bg-[#b794f4] text-black font-bold py-3 rounded-lg hover:opacity-90 transition"
          >
            💳 토스페이먼츠로 결제
          </button>
          <button
            onClick={() => submit("bank")}
            className="w-full border-2 border-[#f6ad55] text-[#f6ad55] font-bold py-3 rounded-lg hover:bg-[#f6ad55]/10 transition"
          >
            🏦 계좌이체로 구매
          </button>
        </div>

        <p className="text-[10px] text-[#666] text-center mt-3">{BANK}</p>
      </div>
    </div>
  );
}

// ─────────────────── 결제 후 리딩 결과 화면 ───────────────────
function ReadingResult({
  data,
  onClose,
}: {
  data: { name: string; date: string; cards: DrawnCard[]; reading: Reading };
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const downloadPDF = async () => {
    const el = ref.current;
    if (!el) return;
    setDownloading(true);
    try {
      const mod = await import("html2pdf.js");
      const html2pdf = (mod as { default: (() => unknown) }).default ?? (mod as unknown as () => unknown);
      const opt = {
        margin: [15, 12, 15, 12],
        filename: `자개빛_타로리딩_${data.name || "고객"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0, backgroundColor: "#ffffff" },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"], avoid: ".card-section" },
      };
      const isIOS = /iPhone|iPad/i.test(navigator.userAgent);
      const worker = (html2pdf as () => { set: (o: unknown) => { from: (e: HTMLElement) => { save: () => Promise<void>; outputPdf: (t: string) => Promise<string> } } })()
        .set(opt)
        .from(el);
      if (isIOS) {
        const url = await worker.outputPdf("bloburl");
        window.open(url, "_blank");
      } else {
        await worker.save();
      }
    } catch (e) {
      console.error(e);
      toast.error("PDF 저장 중 오류가 발생했습니다");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto p-4">
      <div className="max-w-3xl mx-auto my-6">
        <div className="flex justify-end mb-3">
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-sm bg-black/40 border border-white/20 px-3 py-1.5 rounded-lg"
          >
            ✕ 닫기
          </button>
        </div>

        {/* PDF 캡처 영역 — 인쇄용 흰 배경 */}
        <div
          id="reading-result"
          ref={ref}
          style={{
            background: "#ffffff",
            color: "#1a1a1a",
            fontFamily: "'Noto Sans KR', sans-serif",
            fontSize: "14px",
            lineHeight: 1.8,
            wordBreak: "keep-all",
            whiteSpace: "pre-wrap",
            overflow: "visible",
            borderRadius: "12px",
          }}
        >
          {/* 헤더 */}
          <div
            className="card-section"
            style={{
              padding: "28px 24px 20px",
              borderBottom: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#6b21a8" }}>
              🔮 자개빛 타로 리딩
            </div>
            <div style={{ marginTop: "8px", color: "#475569", fontSize: "13px" }}>
              {data.name ? `${data.name}님 · ` : ""}
              {data.date}
            </div>
          </div>

          {/* 카드별 섹션 */}
          {data.reading.sections.map((s, i) => (
            <div
              key={i}
              className="card-section"
              style={{
                padding: "20px",
                borderBottom: "1px solid #e2e8f0",
                minHeight: "120px",
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#6b21a8",
                  marginBottom: "10px",
                }}
              >
                CARD {i + 1} — {s.title}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#1a1a1a",
                  whiteSpace: "pre-wrap",
                  wordBreak: "keep-all",
                  overflow: "visible",
                }}
              >
                {s.body}
              </div>
            </div>
          ))}

          {/* 종합 메시지 */}
          <div
            className="card-section"
            style={{
              padding: "20px",
              borderBottom: "1px solid #e2e8f0",
              minHeight: "100px",
              background: "#faf5ff",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: 700,
                color: "#6b21a8",
                marginBottom: "10px",
              }}
            >
              💌 종합 메시지
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#1a1a1a",
                whiteSpace: "pre-wrap",
                wordBreak: "keep-all",
                overflow: "visible",
              }}
            >
              {data.reading.summary}
            </div>
          </div>

          {/* 푸터 */}
          <div
            style={{
              padding: "16px 20px",
              textAlign: "center",
              fontSize: "12px",
              color: "#94a3b8",
            }}
          >
            자개빛 · jagaebit.shop
          </div>
        </div>

        {/* 안내 + 다운로드 */}
        <div className="mt-5">
          <p className="text-xs text-white/70 text-center mb-2">
            📱 아이폰은 열린 PDF에서 공유 → 파일 저장 해주세요
          </p>
          <button
            onClick={downloadPDF}
            disabled={downloading}
            className="w-full bg-gradient-to-r from-[#b794f4] to-[#9f7be0] text-black font-bold rounded-xl hover:opacity-90 transition disabled:opacity-60"
            style={{ height: "52px" }}
          >
            {downloading ? "PDF 만드는 중..." : "📥 PDF로 저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
