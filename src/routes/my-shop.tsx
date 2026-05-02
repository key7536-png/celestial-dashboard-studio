import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";

export const Route = createFileRoute("/my-shop")({
  component: MyShop,
});

const CONSULT_TYPES = [
  { value: "tarot", label: "🔮 타로" },
  { value: "saju", label: "🔴 사주" },
  { value: "goonghap", label: "💗 궁합" },
  { value: "gaemyeong", label: "✏️ 개명" },
  { value: "seongmyeong", label: "📛 성명" },
];
const TIMES = ["10분", "20분", "30분", "60분", "90분"];
const FONTS = ["기본", "귀여움✿", "둥글둥글", "손글씨", "우아한", "진지한", "모던", "레트로"];
const FONT_SIZES = ["작게", "보통", "크게", "매우 크게"];
const FREE_TIMES = ["1분", "2분", "3분", "5분"];
const PDF_TYPES = [
  "🔴 사주 종합풀이 (~30p, 10챕터)",
  "💗 궁합 분석서 (~27p, 9챕터)",
  "⭐ 종합운세 (~25p, 8챕터)",
];

const inp = "w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#b794f4] transition";
const chip = (active: boolean) =>
  `px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition select-none ${
    active ? "border-[#b794f4] text-[#b794f4] bg-[#1a0a2e]" : "border-[#2a2a2a] text-[#666] bg-[#13131a] hover:border-[#444]"
  }`;

interface ConsultProduct { id: number; type: string; name: string; time: string; price: string; link: string; }
interface SaleProduct { id: number; kind: "ebook" | "physical"; title: string; description: string; regularPrice: string; salePrice: string; pages: string; buyLink: string; open: boolean; }
interface PdfProduct { id: number; type: string; name: string; desc: string; price: string; link: string; active: boolean; }

function QRCodeBox({ url }: { url: string }) {
  const size = 80;
  const cells = 21;
  const cellSize = size / cells;
  const seed = url.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const pattern = Array.from({ length: cells }, (_, r) =>
    Array.from({ length: cells }, (_, c) => {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= cells - 7) return true;
      if (r >= cells - 7 && c < 7) return true;
      return (seed * (r + 1) * (c + 1)) % 3 === 0;
    })
  );
  return (
    <svg width={size} height={size} style={{ display: "block" }}>
      {pattern.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect key={`${r}-${c}`} x={c * cellSize} y={r * cellSize}
              width={cellSize} height={cellSize} fill="white" />
          ) : null
        )
      )}
    </svg>
  );
}

function MyShop() {
  const navigate = useNavigate();
  const shopUrl = "https://tarotsaas.com/shop/천운";
  const [copied, setCopied] = useState(false);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  const [font, setFont] = useState("기본");
  const [fontSize, setFontSize] = useState("보통");
  const [displayName, setDisplayName] = useState("퍼플문타로");
  const [bio, setBio] = useState("팩트 스타일로 리딩을 해줌");
  const [freeTime, setFreeTime] = useState("3분");
  const [bank, setBank] = useState("");
  const [account, setAccount] = useState("");
  const [depositor, setDepositor] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [toast, setToast] = useState(false);

  const [consultProducts, setConsultProducts] = useState<ConsultProduct[]>([
    { id: 1, type: "tarot", name: "", time: "10분", price: "10000", link: "https://app.litt.ly/page" },
    { id: 2, type: "tarot", name: "", time: "20분", price: "19000", link: "" },
    { id: 3, type: "tarot", name: "", time: "30분", price: "25000", link: "" },
    { id: 4, type: "saju", name: "", time: "10분", price: "10000", link: "" },
    { id: 5, type: "saju", name: "", time: "20분", price: "19000", link: "" },
    { id: 6, type: "saju", name: "", time: "30분", price: "25000", link: "" },
    { id: 7, type: "goonghap", name: "", time: "30분", price: "35000", link: "" },
    { id: 8, type: "gaemyeong", name: "", time: "30분", price: "35800", link: "" },
  ]);

  const [saleProducts, setSaleProducts] = useState<SaleProduct[]>([
    { id: 1, kind: "ebook", title: "", description: "", regularPrice: "30000", salePrice: "19900", pages: "0", buyLink: "", open: false },
    { id: 2, kind: "physical", title: "", description: "", regularPrice: "30000", salePrice: "19900", pages: "0", buyLink: "", open: false },
  ]);

  const [pdfProducts, setPdfProducts] = useState<PdfProduct[]>([
    { id: 1, type: PDF_TYPES[0], name: "종합 사주풀이", desc: "약 30~32페이지 분량의 AI 사주 종합 분석서 (10챕터)", price: "19000", link: "", active: true },
    { id: 2, type: PDF_TYPES[1], name: "종합 사주풀이", desc: "약 30~32페이지 분량의 AI 사주 종합 분석서 (10챕터)", price: "35000", link: "", active: true },
    { id: 3, type: PDF_TYPES[0], name: "종합 사주풀이 더상세하게 PDF 50장", desc: "약 30~32페이지 분량의 AI 사주 종합 분석서 (10챕터)", price: "30000", link: "", active: true },
  ]);

  const handleCopy = () => {
    navigator.clipboard.writeText(shopUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBgImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const addConsult = () => setConsultProducts((p) => [...p, { id: Date.now(), type: "tarot", name: "", time: "10분", price: "", link: "" }]);
  const removeConsult = (id: number) => setConsultProducts((p) => p.filter((x) => x.id !== id));
  const updateConsult = (id: number, key: keyof ConsultProduct, val: string) =>
    setConsultProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const addSale = (kind: "ebook" | "physical") =>
    setSaleProducts((p) => [...p, { id: Date.now(), kind, title: "", description: "", regularPrice: "", salePrice: "", pages: "0", buyLink: "", open: true }]);
  const toggleSale = (id: number) => setSaleProducts((p) => p.map((x) => (x.id === id ? { ...x, open: !x.open } : x)));
  const updateSale = (id: number, key: keyof SaleProduct, val: string) =>
    setSaleProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));
  const removeSale = (id: number) => setSaleProducts((p) => p.filter((x) => x.id !== id));

  const addPdf = () => setPdfProducts((p) => [...p, { id: Date.now(), type: PDF_TYPES[0], name: "", desc: "", price: "", link: "", active: true }]);
  const removePdf = (id: number) => setPdfProducts((p) => p.filter((x) => x.id !== id));
  const updatePdf = (id: number, key: keyof PdfProduct, val: string | boolean) =>
    setPdfProducts((p) => p.map((x) => (x.id === id ? { ...x, [key]: val } : x)));

  const discount = (reg: string, sale: string) => {
    const r = parseFloat(reg), s = parseFloat(sale);
    if (!r || !s || r <= 0) return "-";
    return Math.round(((r - s) / r) * 100) + "%";
  };

  const handleSave = () => { setToast(true); setTimeout(() => setToast(false), 2500); };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pb-24" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* NAV */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-[#1e1e1e] bg-[#0a0a0f] sticky top-0 z-50">
        <span className="text-[#b794f4] font-bold text-[15px]">자개빛</span>
        <button onClick={() => navigate({ to: "/" })} className="text-sm text-[#888] hover:text-white transition">← 대시보드</button>
      </div>

      <div className="max-w-[600px] mx-auto px-4 pt-6">

        {/* ── 상점 제목 ── */}
        <div className="mb-5">
          <h1 className="text-xl font-bold flex items-center gap-2">🏪 내 상점 설정</h1>
          <p className="text-sm text-[#666] mt-1">고객에게 보여질 상점 페이지를 설정하세요</p>
        </div>

        {/* ── 상점 URL + QR ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          {/* URL 복사 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[#555] text-sm">🔗</span>
            <div className="flex-1 bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm text-[#b794f4] truncate">
              {shopUrl}
            </div>
            <button onClick={handleCopy}
              className={`px-3 py-2 rounded-lg text-xs border transition whitespace-nowrap ${
                copied ? "border-green-500 text-green-400" : "border-[#b794f4] text-[#b794f4] hover:bg-[#1a0a2e]"
              }`}>
              {copied ? "✓ 복사됨" : "복사"}
            </button>
          </div>

          {/* QR 코드 */}
          <div className="flex items-start gap-4">
            <div className="bg-[#0e0e0e] border border-[#2a2a2a] rounded-xl p-3 flex-shrink-0">
              <QRCodeBox url={shopUrl} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">QR 코드</p>
              <p className="text-xs text-[#666] mb-3">스크린샷하여 고객에게 공유하세요</p>
              <button onClick={() => window.open(shopUrl, "_blank")}
                className="flex items-center gap-1.5 text-xs border border-[#2a2a2a] px-3 py-1.5 rounded-lg text-[#888] hover:border-[#b794f4] hover:text-[#b794f4] transition">
                👁 미리보기
              </button>
            </div>
          </div>
        </div>

        {/* ── 배경 이미지 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-[#bbb] mb-3">🖼 배경 이미지</p>
          <div className="flex items-start gap-4">
            {bgImage ? (
              <div className="relative w-24 flex-shrink-0">
                <img src={bgImage} alt="배경" className="w-24 rounded-xl object-cover" style={{ aspectRatio: "9/16" }} />
                <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white bg-black/50 py-0.5 rounded-b-xl">
                  모바일 최적화 (9:16)
                </span>
                <button onClick={() => setBgImage(null)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-500/80 transition">
                  ✕
                </button>
              </div>
            ) : (
              <div
                onClick={() => bgInputRef.current?.click()}
                className="w-24 flex-shrink-0 border border-dashed border-[#333] rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#b794f4]/50 transition"
                style={{ aspectRatio: "9/16" }}
              >
                <span className="text-2xl text-[#333]">🖼</span>
                <span className="text-[9px] text-[#555] text-center px-1">이미지 업로드</span>
              </div>
            )}
            <div className="flex-1">
              <p className="text-xs text-[#666] mb-3">모바일 상점 배경으로 사용됩니다<br/>9:16 비율 권장</p>
              <input ref={bgInputRef} type="file" accept="image/*" className="hidden" onChange={handleBgChange} />
              <button onClick={() => bgInputRef.current?.click()}
                className="w-full border border-[#2a2a2a] text-[#888] text-xs py-2 rounded-lg hover:border-[#b794f4] hover:text-[#b794f4] transition">
                {bgImage ? "이미지 변경" : "이미지 선택"}
              </button>
            </div>
          </div>
        </div>

        {/* ── 폰트 스타일 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-[#bbb] mb-4">T  폰트 스타일</p>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {FONTS.map((f) => <button key={f} onClick={() => setFont(f)} className={chip(font === f)}>{f}</button>)}
          </div>
          <p className="text-xs text-[#888] mb-2">📎 글자 크기</p>
          <div className="flex gap-2 mb-4">
            {FONT_SIZES.map((s) => <button key={s} onClick={() => setFontSize(s)} className={chip(fontSize === s)}>{s}</button>)}
          </div>
          <div className="bg-[#0e0e0e] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-[#ccc]">
            안녕하세요, 타로 상담에 오신 것을 환영합니다 ✨
          </div>
        </div>

        {/* ── 프로필 정보 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-[#bbb] mb-4">프로필 정보</p>
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs text-[#666] mb-1 block">표시 이름</label>
              <input className={inp} value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="퍼플문타로" />
            </div>
            <div>
              <label className="text-xs text-[#666] mb-1 block">소개글</label>
              <textarea className={inp + " resize-none"} rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>
          </div>
          <p className="text-xs text-[#888] mb-2">무료 상담 시간</p>
          <div className="flex gap-2 mb-1">
            {FREE_TIMES.map((t) => <button key={t} onClick={() => setFreeTime(t)} className={chip(freeTime === t)}>{t}</button>)}
          </div>
          <p className="text-xs text-[#555] mb-4">무료 시간 후 유료 전환 안내가 표시됩니다</p>
          <div className="bg-[#0e0e0e] border border-[#1e1e1e] rounded-lg p-4 mb-4">
            <p className="text-xs font-semibold text-[#888] mb-3">🏦 계좌 정보 (무통장입금 안내용)</p>
            <div className="space-y-2">
              <input className={inp} value={bank} onChange={(e) => setBank(e.target.value)} placeholder="은행명 (예: 카카오뱅크)" />
              <input className={inp} value={account} onChange={(e) => setAccount(e.target.value)} placeholder="계좌번호 (예: 3333-12-1234567)" />
              <input className={inp} value={depositor} onChange={(e) => setDepositor(e.target.value)} placeholder="예금주 (예: 홍길동)" />
            </div>
            <p className="text-xs text-[#555] mt-2">입력하면 고객 결제 안내에 계좌 정보가 표시됩니다</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#aaa]">상점 공개</span>
            <button onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors relative ${isPublic ? "bg-[#b794f4]" : "bg-[#333]"}`}>
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>
        </div>

        {/* ── 상담 상품 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-[#bbb]">상담 상품</span>
            <button onClick={addConsult} className="text-xs border border-[#b794f4] text-[#b794f4] px-3 py-1 rounded-lg hover:bg-[#1a0a2e] transition">+ 추가</button>
          </div>
          <div className="space-y-4">
            {consultProducts.map((p, i) => (
              <div key={p.id} className="bg-[#0e0e0e] border border-[#222] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-[#666]">상품 {i + 1}</span>
                  <button onClick={() => removeConsult(p.id)} className="text-xs text-red-500 hover:text-red-400">삭제</button>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-[#555] mb-1 block">상담 유형</label>
                  <select className={inp} value={p.type} onChange={(e) => updateConsult(p.id, "type", e.target.value)}>
                    {CONSULT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <input className={inp + " mb-3"} value={p.name} onChange={(e) => updateConsult(p.id, "name", e.target.value)} placeholder="상품 이름 (예: 기본 타로 상담)" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[#555] mb-1 block">시간</label>
                    <select className={inp} value={p.time} onChange={(e) => updateConsult(p.id, "time", e.target.value)}>
                      {TIMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[#555] mb-1 block">가격 (원)</label>
                    <input className={inp} type="number" value={p.price} onChange={(e) => updateConsult(p.id, "price", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#555] mb-1 block">결제 링크</label>
                  <input className={inp} value={p.link} onChange={(e) => updateConsult(p.id, "link", e.target.value)} placeholder="https://litt.ly/..." />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 상품 판매 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <p className="text-sm font-semibold text-[#bbb] mb-4">🛍️ 상품 판매</p>
          <div className="flex gap-3 mb-4">
            <button onClick={() => addSale("ebook")} className="flex-1 border border-[#2a2a2a] text-[#888] text-sm py-2 rounded-lg hover:border-[#b794f4] hover:text-[#b794f4] transition">
              📖 전자책 추가
            </button>
            <button onClick={() => addSale("physical")} className="flex-1 border border-[#2a2a2a] text-[#888] text-sm py-2 rounded-lg hover:border-[#b794f4] hover:text-[#b794f4] transition">
              🎁 실물상품 추가
            </button>
          </div>
          <div className="space-y-2">
            {saleProducts.map((p) => (
              <div key={p.id} className="bg-[#0e0e0e] border border-[#222] rounded-xl overflow-hidden">
                <button onClick={() => toggleSale(p.id)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#111] transition">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#1a0a2e] text-[#b794f4] border border-[#b794f4]/30 px-2 py-0.5 rounded">
                      {p.kind === "ebook" ? "📘 전자책" : "📦 실물"}
                    </span>
                    <span className="text-sm text-[#888]">{p.title || "제목 없음"}</span>
                  </div>
                  <span className="text-[#555]">{p.open ? "∧" : "∨"}</span>
                </button>
                {p.open && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[#222]">
                    <div className="mt-3">
                      <label className="text-xs text-[#555] mb-1 block">상품 이름 *</label>
                      <input className={inp} value={p.title} onChange={(e) => updateSale(p.id, "title", e.target.value)}
                        placeholder={p.kind === "ebook" ? "예: 타로 입문 전자책" : "예: 프리미엄 타로 카드 세트"} />
                    </div>
                    <button className="w-full border border-dashed border-[#b794f4]/40 text-[#b794f4] text-xs py-2 rounded-lg hover:bg-[#1a0a2e]/50 transition">
                      ✨ 표지로 목업 만들기 (30층)
                    </button>
                    <div>
                      <label className="text-xs text-[#555] mb-1 block">상품 설명</label>
                      <textarea className={inp + " resize-none"} rows={3} value={p.description}
                        onChange={(e) => updateSale(p.id, "description", e.target.value)}
                        placeholder={p.kind === "ebook" ? "전자책에 대한 설명을 입력하세요" : "실물상품에 대한 설명을 입력하세요 (구성품, 재질, 사이즈 등)"} />
                    </div>
                    <div>
                      <label className="text-xs text-[#555] mb-1 block">썸네일 이미지</label>
                      <div className="border border-dashed border-[#333] rounded-lg h-32 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#b794f4]/50 transition">
                        <span className="text-2xl text-[#333]">🖼</span>
                        <span className="text-xs text-[#555]">썸네일 업로드 (자동 맞춤)</span>
                      </div>
                    </div>
                    <button className="w-full border border-[#2a2a2a] text-[#666] text-xs py-2 rounded-lg hover:border-[#444] transition">
                      + 상세 이미지 추가
                    </button>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-[#555] mb-1 block">정가 (원)</label>
                        <input className={inp} type="number" value={p.regularPrice} onChange={(e) => updateSale(p.id, "regularPrice", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-[#555] mb-1 block">판매가 (원)</label>
                        <input className={inp} type="number" value={p.salePrice} onChange={(e) => updateSale(p.id, "salePrice", e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-[#555] mb-1 block">할인율</label>
                        <div className={inp + " text-center text-[#f6ad55]"}>{discount(p.regularPrice, p.salePrice)}</div>
                      </div>
                    </div>
                    {p.kind === "ebook" && (
                      <div>
                        <label className="text-xs text-[#555] mb-1 block">해설서 페이지 수</label>
                        <input className={inp} type="number" value={p.pages} onChange={(e) => updateSale(p.id, "pages", e.target.value)} />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-[#555] mb-1 block">구매 링크 (리틀리 등)</label>
                      <input className={inp} value={p.buyLink} onChange={(e) => updateSale(p.id, "buyLink", e.target.value)} placeholder="https://litt.ly/..." />
                      <p className="text-xs text-[#555] mt-1">고객이 '구매하기' 클릭 시 이 링크로 이동합니다</p>
                    </div>
                    <button onClick={() => removeSale(p.id)} className="text-xs text-red-500/70 hover:text-red-400 transition">🗑 상품 삭제</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── PDF 분석서 상품 ── */}
        <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[#bbb]">📄 PDF 분석서 상품</span>
            <button onClick={addPdf} className="text-xs border border-[#b794f4] text-[#b794f4] px-3 py-1 rounded-lg hover:bg-[#1a0a2e] transition">+ 추가</button>
          </div>
          <p className="text-xs text-[#555] mb-4">상담 종료 시 고객에게 자동 제안되는 AI 사주/궁합 분석 PDF 상품입니다</p>
          <div className="space-y-4">
            {pdfProducts.map((p, i) => (
              <div key={p.id} className="bg-[#0e0e0e] border border-[#222] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-[#666]">PDF 상품 {i + 1}</span>
                  <button onClick={() => removePdf(p.id)} className="text-xs text-red-500 hover:text-red-400">삭제</button>
                </div>
                <div className="mb-3">
                  <label className="text-xs text-[#555] mb-1 block">유형</label>
                  <select className={inp} value={p.type} onChange={(e) => updatePdf(p.id, "type", e.target.value)}>
                    {PDF_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <input className={inp + " mb-3"} value={p.name} onChange={(e) => updatePdf(p.id, "name", e.target.value)} placeholder="종합 사주풀이" />
                <input className={inp + " mb-3"} value={p.desc} onChange={(e) => updatePdf(p.id, "desc", e.target.value)} placeholder="약 30~32페이지 분량의 AI 사주 종합 분석서 (10챕터)" />
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-[#555] mb-1 block">가격 (원)</label>
                    <input className={inp} type="number" value={p.price} onChange={(e) => updatePdf(p.id, "price", e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-[#555] mb-1 block">결제 링크</label>
                    <input className={inp} value={p.link} onChange={(e) => updatePdf(p.id, "link", e.target.value)} placeholder="https://..." />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => updatePdf(p.id, "active", !p.active)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${p.active ? "bg-[#b794f4]" : "bg-[#333]"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${p.active ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                  <span className="text-xs text-[#888]">활성</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 저장 버튼 ── */}
        <button onClick={handleSave} className="w-full py-4 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition"
          style={{ background: "linear-gradient(to right, #9333ea, #ec4899)" }}>
          💾 저장하기
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a2e] border border-[#b794f4]/40 text-[#b794f4] text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          ✅ 저장 완료!
        </div>
      )}
    </div>
  );
}