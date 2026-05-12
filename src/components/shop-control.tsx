import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";

// ─────────────────── 공용 타입 / 키 ───────────────────
type JagaeProduct = {
  id: string;
  name: string;
  price: number;
  regular?: number;
  badge?: string | null;
  isPdf?: boolean;
  description?: string;
  active?: boolean;
};

type TaroProduct = {
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

type Order = {
  id: string;
  productName: string;
  customerName: string;
  amount: number;
  date: string;
  status: string;
};

const JAGAE_KEY = "jagaebit_products";
const TARO_KEY = "taronyang_products";
const TOSS_KEY = "toss_client_key";
const PAY_KEY = "jagaebit_pay";
const BANK_KEY = "jagaebit_bank";
const ORDERS_KEY = "jagaebit_orders";

const DEFAULT_BANK = "국민은행 570202-01-019049 박선진";

const JAGAE_DEFAULTS: JagaeProduct[] = [
  { id: "tarot-pdf-reading", name: "🔮 나만을 위한 타로 리딩 PDF", price: 15000, badge: "즉시확인 + 다운로드", isPdf: true, description: "카드 3장이 전하는 당신만의 메시지", active: true },
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

const TARO_DEFAULTS: TaroProduct[] = [
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

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ─────────────────── 메인 컴포넌트 ───────────────────
type Tab = "products" | "payment" | "orders";

export function ShopControl() {
  const [tab, setTab] = useState<Tab>("products");
  const [jagae, setJagae] = useState<JagaeProduct[]>(JAGAE_DEFAULTS);
  const [taro, setTaro] = useState<TaroProduct[]>(TARO_DEFAULTS);
  const [tossKey, setTossKey] = useState("");
  const [bank, setBank] = useState(DEFAULT_BANK);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setJagae(loadJSON<JagaeProduct[]>(JAGAE_KEY, JAGAE_DEFAULTS));
    setTaro(loadJSON<TaroProduct[]>(TARO_KEY, TARO_DEFAULTS));
    setTossKey(localStorage.getItem(TOSS_KEY) || "");
    setBank(localStorage.getItem(BANK_KEY) || DEFAULT_BANK);
    setOrders(loadJSON<Order[]>(ORDERS_KEY, []));
  }, []);

  const saveJagae = (next: JagaeProduct[]) => {
    setJagae(next);
    localStorage.setItem(JAGAE_KEY, JSON.stringify(next));
  };
  const saveTaro = (next: TaroProduct[]) => {
    setTaro(next);
    localStorage.setItem(TARO_KEY, JSON.stringify(next));
  };

  const stats = useMemo(() => ({
    jagaeActive: jagae.filter((p) => p.active !== false).length,
    taroActive: taro.filter((p) => p.active !== false).length,
    totalOrders: orders.length,
    revenue: orders.reduce((s, o) => s + (o.amount || 0), 0),
  }), [jagae, taro, orders]);

  return (
    <section className="mt-12 rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-6 md:p-8">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
        <div>
          <h2 className="font-display text-2xl font-semibold flex items-center gap-2">
            🎛️ <span className="text-gradient-mystic">통합 상점 관리</span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            자개빛 · 타로냥 두 상점을 이 화면에서 한 번에 조정하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/shop" className="text-xs px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition">
            🛍️ 자개빛 보기
          </Link>
          <Link to="/taronyang" className="text-xs px-3 py-2 rounded-lg border border-primary/40 text-primary hover:bg-primary/10 transition">
            🐱 타로냥 보기
          </Link>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="자개빛 노출" value={`${stats.jagaeActive}개`} />
        <Stat label="타로냥 노출" value={`${stats.taroActive}개`} />
        <Stat label="누적 주문" value={`${stats.totalOrders}건`} />
        <Stat label="누적 매출" value={won(stats.revenue)} accent />
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b border-border/60 mb-5">
        {[
          { id: "products" as const, label: "🛍️ 상품" },
          { id: "payment" as const, label: "💳 결제 정보" },
          { id: "orders" as const, label: "📦 주문" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm transition border-b-2 -mb-px ${
              tab === t.id
                ? "text-primary border-primary font-semibold"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="space-y-8">
          <ProductGroup
            title="🛍️ 자개빛 상점"
            hint="active=true인 상품만 고객 화면에 노출됩니다."
            rows={jagae.map((p) => ({
              key: p.id,
              name: p.name,
              price: p.price,
              active: p.active !== false,
              onName: (v) => saveJagae(jagae.map((x) => (x.id === p.id ? { ...x, name: v } : x))),
              onPrice: (v) => saveJagae(jagae.map((x) => (x.id === p.id ? { ...x, price: v } : x))),
              onToggle: () => saveJagae(jagae.map((x) => (x.id === p.id ? { ...x, active: !(x.active !== false) } : x))),
              onDelete: () => {
                if (confirm(`"${p.name}" 삭제할까요?`)) saveJagae(jagae.filter((x) => x.id !== p.id));
              },
            }))}
          />
          <ProductGroup
            title="🐱 타로냥 상점"
            hint="ON/OFF로 캐러셀 노출을 즉시 제어합니다."
            rows={taro.map((p) => ({
              key: String(p.id),
              name: p.name,
              price: p.price,
              active: p.active !== false,
              emoji: p.emoji,
              onName: (v) => saveTaro(taro.map((x) => (x.id === p.id ? { ...x, name: v } : x))),
              onPrice: (v) => saveTaro(taro.map((x) => (x.id === p.id ? { ...x, price: v } : x))),
              onToggle: () => saveTaro(taro.map((x) => (x.id === p.id ? { ...x, active: !(x.active !== false) } : x))),
              onDelete: () => {
                if (confirm(`"${p.name}" 삭제할까요?`)) saveTaro(taro.filter((x) => x.id !== p.id));
              },
            }))}
          />
        </div>
      )}

      {tab === "payment" && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-xl border border-border/60 bg-background/40 p-5">
            <h3 className="font-semibold mb-3">💳 토스페이먼츠 클라이언트 키</h3>
            <input
              value={tossKey}
              onChange={(e) => setTossKey(e.target.value)}
              placeholder="test_ck_... 또는 live_ck_..."
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-3 font-mono"
            />
            <button
              onClick={() => {
                localStorage.setItem(TOSS_KEY, tossKey.trim());
                toast.success("토스 키 저장됨");
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              저장
            </button>
            <p className="text-xs text-muted-foreground mt-3">
              키를 비우면 두 상점 모두 토스 데모 테스트 키로 동작합니다.
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-background/40 p-5">
            <h3 className="font-semibold mb-3">🏦 계좌 정보 (계좌이체용)</h3>
            <input
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm mb-3"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  localStorage.setItem(BANK_KEY, bank.trim());
                  toast.success("계좌 정보 저장됨");
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
              >
                저장
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(bank);
                  toast.success("계좌 복사됨");
                }}
                className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted/40"
              >
                복사
              </button>
            </div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground rounded-xl border border-border/60 bg-background/40">
              📦 아직 주문이 없습니다
            </div>
          ) : (
            orders.slice(0, 20).map((o) => (
              <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 bg-background/40">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{o.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.customerName} · {new Date(o.date).toLocaleString("ko-KR")}
                  </div>
                </div>
                <div className="text-amber-400 font-semibold whitespace-nowrap">{won(o.amount)}</div>
                <span className="text-[10px] px-2 py-1 rounded-full border border-primary/40 text-primary whitespace-nowrap">
                  {o.status}
                </span>
              </div>
            ))
          )}
          {orders.length > 20 && (
            <p className="text-xs text-center text-muted-foreground pt-2">최근 20건만 표시됩니다.</p>
          )}
        </div>
      )}
    </section>
  );
}

// ─────────────────── 보조 컴포넌트 ───────────────────
function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-bold ${accent ? "text-amber-400" : "text-foreground"}`}>{value}</div>
    </div>
  );
}

type Row = {
  key: string;
  name: string;
  price: number;
  active: boolean;
  emoji?: string;
  onName: (v: string) => void;
  onPrice: (v: number) => void;
  onToggle: () => void;
  onDelete: () => void;
};

function ProductGroup({ title, hint, rows }: { title: string; hint: string; rows: Row[] }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
        <h3 className="font-semibold">{title}</h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-background/40"
          >
            {r.emoji && <span className="text-xl w-7 text-center flex-shrink-0">{r.emoji}</span>}
            <input
              value={r.name}
              onChange={(e) => r.onName(e.target.value)}
              className="flex-1 min-w-[180px] bg-background border border-border rounded px-2.5 py-1.5 text-sm"
            />
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={r.price}
                onChange={(e) => r.onPrice(Number(e.target.value) || 0)}
                className="w-28 bg-background border border-border rounded px-2.5 py-1.5 text-sm text-right"
              />
              <span className="text-xs text-muted-foreground">원</span>
            </div>
            <button
              onClick={r.onToggle}
              className={`text-xs px-3 py-1.5 rounded border transition ${
                r.active
                  ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                  : "border-border text-muted-foreground"
              }`}
            >
              {r.active ? "노출" : "숨김"}
            </button>
            <button
              onClick={r.onDelete}
              className="text-xs px-3 py-1.5 rounded border border-destructive/40 text-destructive hover:bg-destructive/10 transition"
            >
              삭제
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
