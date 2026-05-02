import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/card-designer")({
  component: CardDesigner,
});

type Step = 1 | 2 | 3 | 4 | 5;

const CARDS_36 = [
  { id: 1, name: "The Fool" }, { id: 2, name: "The Magician" },
  { id: 3, name: "The High Priestess" }, { id: 4, name: "The Empress" },
  { id: 5, name: "The Emperor" }, { id: 6, name: "The Lovers" },
  { id: 7, name: "The Chariot" }, { id: 8, name: "Strength" },
  { id: 9, name: "The Hermit" }, { id: 10, name: "Wheel of Fortune" },
  { id: 11, name: "Justice" }, { id: 12, name: "The Hanged Man" },
  { id: 13, name: "Death" }, { id: 14, name: "Temperance" },
  { id: 15, name: "The Tower" }, { id: 16, name: "The Star" },
  { id: 17, name: "The Moon" }, { id: 18, name: "The Sun" },
  { id: 19, name: "Judgement" }, { id: 20, name: "The World" },
  { id: 21, name: "The Hierophant" }, { id: 22, name: "The Devil" },
  { id: 23, name: "Ace of Wands" }, { id: 24, name: "Ace of Cups" },
  { id: 25, name: "Ace of Swords" }, { id: 26, name: "Ace of Pentacles" },
  { id: 27, name: "Knight of Wands" }, { id: 28, name: "Knight of Cups" },
  { id: 29, name: "Knight of Swords" }, { id: 30, name: "Knight of Pentacles" },
  { id: 31, name: "Queen of Wands" }, { id: 32, name: "Queen of Cups" },
  { id: 33, name: "Queen of Swords" }, { id: 34, name: "Queen of Pentacles" },
  { id: 35, name: "King of Wands" }, { id: 36, name: "King of Cups" },
];

const STYLES = [
  { icon: "🎨", name: "애니메이션", desc: "귀여운 캐릭터 일러스트" },
  { icon: "🏛️", name: "클래식 아트", desc: "전통 타로 카드풍 아트워크" },
  { icon: "💧", name: "수채화", desc: "몽환적인 수채화 스타일" },
  { icon: "🏙️", name: "사이버펑크", desc: "네온 미래적 디지털 스타일" },
  { icon: "✏️", name: "미니멀", desc: "심플한 라인아트" },
  { icon: "🧙", name: "판타지", desc: "신비로운 판타지 일러스트" },
  { icon: "💀", name: "고딕", desc: "다크 고딕 스타일" },
  { icon: "🎪", name: "팝아트", desc: "화려한 팝아트 스타일" },
  { icon: "🏯", name: "동양화", desc: "먹과 붓의 동양화 스타일" },
  { icon: "👘", name: "한복풍", desc: "한국 전통 한복 궁중 스타일" },
  { icon: "🌊", name: "우키요에", desc: "일본 전통 목판화" },
  { icon: "🌸", name: "아르누보", desc: "뮤샤풍 우아한 장식 스타일" },
  { icon: "⛪", name: "스테인드글라스", desc: "성당 유리창 스타일" },
  { icon: "🖊️", name: "잉크 스케치", desc: "펜과 잉크 드로잉" },
  { icon: "🖼️", name: "유화", desc: "르네상스풍 클래식 유화" },
  { icon: "🐻", name: "치비", desc: "SD 귀여운 미니 캐릭터" },
  { icon: "⚔️", name: "다크 판타지", desc: "어둡고 웅장한 다크소울" },
  { icon: "🌸", name: "파스텔", desc: "부드러운 파스텔 일러스트" },
  { icon: "👾", name: "픽셀아트", desc: "레트로 도트 그래픽" },
  { icon: "🐲", name: "중국화", desc: "산수화 중국 전통 미술" },
];

const FORTUNE_ITEMS = [
  { icon: "💗", label: "솔로 연애운" }, { icon: "🔄", label: "재회 연애운" },
  { icon: "💑", label: "커플 연애운" }, { icon: "💰", label: "금전운" },
  { icon: "📋", label: "합격운" }, { icon: "💼", label: "적성운" },
  { icon: "⭐", label: "종합운" }, { icon: "✅", label: "Yes or No" },
  { icon: "🏥", label: "건강운" }, { icon: "✈️", label: "여행운" },
  { icon: "👨‍👩‍👧", label: "가족운" }, { icon: "💛", label: "우정운" },
  { icon: "👁️", label: "영적 메시지" }, { icon: "📚", label: "학업운" },
  { icon: "📈", label: "투자운" }, { icon: "🍀", label: "행운의 요소" },
];

const STEP_LABELS = [
  { icon: "👤", label: "캐릭터" },
  { icon: "📖", label: "스토리" },
  { icon: "🎴", label: "카드 수" },
  { icon: "✨", label: "생성" },
  { icon: "📥", label: "추출" },
];

const inp = "w-full bg-[#0e0e0e] border border-[#333] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555] focus:outline-none focus:border-[#b794f4] transition";

function CardDesigner() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [charName, setCharName] = useState("자개빛");
  const [selectedStyle, setSelectedStyle] = useState("수채화");
  const [customStyle, setCustomStyle] = useState("");
  const [story, setStory] = useState("조선시대의 아픔의 아이콘 단종");
  const [cardCount, setCardCount] = useState<18 | 36>(36);
  const [overlaySize, setOverlaySize] = useState(5.5);
  const [showNumber, setShowNumber] = useState(true);
  const [showName, setShowName] = useState(true);
  const [showGradient, setShowGradient] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [cards, setCards] = useState(CARDS_36.map((c) => ({ ...c, generated: false })));
  const [saved, setSaved] = useState(false);
  const [projectSaved, setProjectSaved] = useState(false);
  const [selectedFortune, setSelectedFortune] = useState<string[]>(
    FORTUNE_ITEMS.slice(0, 8).map((f) => f.label)
  );
  const [customFortune, setCustomFortune] = useState("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const generatedCount = cards.filter((c) => c.generated).length;
  const displayCards = cards.slice(0, cardCount);

  const simulateGenerate = () => {
    setGenerating(true);
    let count = 0;
    const interval = setInterval(() => {
      setCards((prev) =>
        prev.map((c, i) => (!c.generated && i === count ? { ...c, generated: true } : c))
      );
      count++;
      if (count >= cardCount) { clearInterval(interval); setGenerating(false); }
    }, 100);
  };

  const toggleFortune = (label: string) =>
    setSelectedFortune((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]
    );

  const addCustomFortune = () => {
    if (customFortune.trim()) {
      setSelectedFortune((prev) => [...prev, customFortune.trim()]);
      setCustomFortune("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* NAV */}
      <div className="flex items-center justify-between px-6 h-12 border-b border-[#1e1e1e] bg-[#0a0a0f] sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: "/" })} className="text-[#666] hover:text-white transition">←</button>
          <span className="text-sm font-semibold">🎴 타로 카드 디자이너</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#13131a] border border-[#2a2a2a] px-3 py-1.5 rounded-lg text-[#aaa]">자개빛의 타로 ∨</span>
          <span className="text-xs text-green-400">✓ 자동저장</span>
        </div>
      </div>

      {/* STEP BAR */}
      <div className="flex items-center justify-center gap-0 py-5 px-6">
        {STEP_LABELS.map((s, i) => {
          const stepNum = (i + 1) as Step;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <div key={i} className="flex items-center">
              <button
                onClick={() => setStep(stepNum)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm transition ${
                  isActive ? "bg-[#b794f4] text-white font-semibold"
                  : isDone ? "border border-[#b794f4] text-[#b794f4]"
                  : "bg-[#1a1a2e] text-[#555]"
                }`}
              >
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
              {i < 4 && <div className={`w-8 h-px mx-1 ${isDone ? "bg-[#b794f4]" : "bg-[#2a2a2a]"}`} />}
            </div>
          );
        })}
      </div>

      <div className="max-w-[860px] mx-auto px-6 pb-16">

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded flex items-center justify-center">1</span>
              캐릭터 설정
            </h2>
            <div className="mb-6">
              <label className="text-sm text-[#888] mb-2 block">캐릭터 이름</label>
              <input className={inp} value={charName} onChange={(e) => setCharName(e.target.value)} />
            </div>
            <p className="text-sm text-[#888] mb-3">디자인 스타일</p>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {STYLES.map((s) => (
                <button key={s.name} onClick={() => setSelectedStyle(s.name)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedStyle === s.name ? "border-[#b794f4] bg-[#1a0a2e]" : "border-[#2a2a2a] bg-[#13131a] hover:border-[#444]"
                  }`}
                >
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-[#666] mt-0.5">{s.desc}</div>
                </button>
              ))}
            </div>
            <textarea className={inp + " resize-none"} rows={2} value={customStyle}
              onChange={(e) => setCustomStyle(e.target.value)}
              placeholder="또는 직접 스타일을 입력하세요..." />
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded flex items-center justify-center">2</span>
              스토리텔링
            </h2>
            <p className="text-sm text-[#888] mb-2">스토리 컨셉 / 세계관</p>
            <textarea className={inp + " resize-none"} rows={6} value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="예: 조선시대의 아픔의 아이콘 단종" />
            <p className="text-xs text-[#f6ad55] mt-3">💡 세계관이 구체적일수록 카드 간 통일감이 높아집니다</p>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div>
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded flex items-center justify-center">3</span>
              카드 수 선택
            </h2>
            <div className="grid grid-cols-2 gap-6">
              {([18, 36] as const).map((n) => (
                <button key={n} onClick={() => setCardCount(n)}
                  className={`p-8 rounded-2xl border-2 text-center transition ${
                    cardCount === n ? "border-[#b794f4] bg-[#1a0a2e]" : "border-[#2a2a2a] bg-[#13131a] hover:border-[#444]"
                  }`}
                >
                  <div className="text-4xl mb-3">🃏</div>
                  <div className="text-3xl font-bold mb-2">{n}장</div>
                  <div className="text-sm text-[#888] mb-1">{n === 18 ? "메이저 아르카나" : "메이저 + 미니 아르카나"}</div>
                  <div className="text-xs text-[#555]">63.5 × 88.9mm · 인쇄 규격</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded flex items-center justify-center">4</span>
              카드 이미지 생성
            </h2>
            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-4 mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">🎴 카드 뒷면</p>
                <p className="text-xs text-[#555] mt-1">모든 카드의 공통 뒷면 디자인</p>
              </div>
              <button className="bg-[#b794f4] text-white text-xs px-4 py-2 rounded-lg hover:bg-[#a07ce0] transition">✨ AI 생성</button>
            </div>
            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-xl p-5 mb-4">
              <p className="text-sm font-semibold mb-1">✏️ 텍스트 오버레이 설정</p>
              <p className="text-xs text-[#555] mb-4">다운로드 시 Canvas로 합성됩니다</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-[#666] mb-1 block">폰트</label>
                  <select className={inp}>
                    <option>Georgia (세리프)</option>
                    <option>Noto Serif KR</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">크기: {overlaySize}%</label>
                  <input type="range" min={2} max={12} step={0.5} value={overlaySize}
                    onChange={(e) => setOverlaySize(parseFloat(e.target.value))}
                    className="w-full mt-3 accent-[#b794f4]" />
                </div>
                <div>
                  <label className="text-xs text-[#666] mb-1 block">글자 색상</label>
                  <input type="color" defaultValue="#ffffff" className="w-full h-9 rounded-lg border border-[#333] bg-[#0e0e0e] cursor-pointer" />
                </div>
              </div>
              <div className="flex items-center gap-6 mb-3 flex-wrap">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={showNumber} onChange={(e) => setShowNumber(e.target.checked)} className="accent-[#b794f4]" />
                  번호 표시
                </label>
                <select className={inp + " max-w-[130px]"}><option>번호: 상단</option><option>번호: 하단</option></select>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} className="accent-[#b794f4]" />
                  이름 표시
                </label>
                <select className={inp + " max-w-[130px]"}><option>이름: 하단</option><option>이름: 상단</option></select>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={showGradient} onChange={(e) => setShowGradient(e.target.checked)} className="accent-[#b794f4]" />
                반투명 그라디언트 배경바
              </label>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <button onClick={simulateGenerate} disabled={generating}
                className="flex items-center gap-2 bg-[#b794f4] text-white text-sm px-5 py-2.5 rounded-xl hover:bg-[#a07ce0] disabled:opacity-60 transition">
                {generating ? "⏳ 생성 중..." : "✨ 미생성 카드 전체 생성"}
              </button>
              <button onClick={() => setSaved(true)} className="bg-[#13131a] border border-[#2a2a2a] text-sm px-4 py-2.5 rounded-xl hover:border-[#444] transition">
                💾 저장
              </button>
              <span className="text-sm text-[#888]">{generatedCount}/{cardCount}장 완료</span>
            </div>
            <div className="grid grid-cols-6 gap-3">
              {displayCards.map((card) => (
                <div key={card.id}>
                  <div className={`aspect-[63/88] rounded-lg border flex items-center justify-center overflow-hidden ${
                    card.generated ? "border-[#b794f4]/40 bg-gradient-to-br from-[#2a1a3e] to-[#0a0a1e]" : "border-dashed border-[#2a2a2a] bg-[#13131a]"
                  }`}>
                    {card.generated ? <span className="text-2xl">🃏</span>
                      : generating ? <div className="w-4 h-4 border-2 border-[#b794f4] border-t-transparent rounded-full animate-spin" />
                      : <span className="text-xl text-[#2a2a2a]">🖼</span>}
                  </div>
                  <p className="text-center text-[9px] text-[#555] mt-1">{card.id}. {card.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div>
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <span className="bg-blue-600 text-white text-xs w-6 h-6 rounded flex items-center justify-center">5</span>
              PNG 추출
            </h2>
            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-2xl p-8 text-center mb-6">
              <div className="w-12 h-12 border-2 border-[#b794f4] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[#b794f4] text-xl">✓</span>
              </div>
              <h3 className="text-xl font-bold mb-2">카드 디자인 완료! 🎉</h3>
              <p className="text-sm text-[#888]">{generatedCount}/{cardCount}장 생성됨 · 63.5 × 88.9mm 인쇄 규격</p>
              <p className="text-xs text-[#555] mt-1">MakePlayingCards.com의 Traditional 사이즈와 호환됩니다</p>
            </div>
            <div className="flex gap-3 mb-6">
              <button className="flex-1 flex items-center justify-center gap-2 bg-[#b794f4] text-white text-sm py-3 rounded-xl hover:bg-[#a07ce0] transition">
                📥 전체 PNG 다운로드 ({generatedCount}장)
              </button>
              <button onClick={() => { setProjectSaved(true); setTimeout(() => setProjectSaved(false), 2500); }}
                className="flex-1 flex items-center justify-center gap-2 bg-[#13131a] border border-[#2a2a2a] text-sm py-3 rounded-xl hover:border-[#444] transition">
                💾 프로젝트 저장
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm py-3 rounded-xl hover:bg-cyan-500/30 transition">
                📄📖 카드 해설서 설정
              </button>
            </div>
            <div className="bg-[#13131a] border border-[#2a2a2a] rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">📖 해설서 운세 항목 선택</span>
                <span className="text-xs text-[#888]">{selectedFortune.length}개 선택됨</span>
              </div>
              <p className="text-xs text-[#555] mb-4">포함할 운세 항목을 선택하고, 원하는 항목을 직접 추가할 수도 있어요!</p>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {FORTUNE_ITEMS.map((f) => {
                  const active = selectedFortune.includes(f.label);
                  return (
                    <button key={f.label} onClick={() => toggleFortune(f.label)}
                      className={`px-3 py-2 rounded-lg text-xs border transition flex items-center gap-1.5 ${
                        active ? "border-[#b794f4] text-[#b794f4] bg-[#1a0a2e]" : "border-[#2a2a2a] text-[#666] hover:border-[#444]"
                      }`}>
                      {f.icon} {f.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 mb-4">
                <input className={inp} value={customFortune} onChange={(e) => setCustomFortune(e.target.value)}
                  placeholder="직접 추가할 운세 항목 (예: 이사운, 시험운...)"
                  onKeyDown={(e) => e.key === "Enter" && addCustomFortune()} />
                <button onClick={addCustomFortune} className="w-9 h-9 bg-[#b794f4] text-white rounded-lg flex items-center justify-center hover:bg-[#a07ce0] transition text-lg">+</button>
              </div>
              {generatingPdf ? (
                <button disabled className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm rounded-xl flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  AI가 해설 작성 중... (1/1 배치)
                </button>
              ) : (
                <button onClick={() => { setGeneratingPdf(true); setTimeout(() => setGeneratingPdf(false), 3000); }}
                  className="w-full py-3 bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm rounded-xl hover:bg-cyan-500/30 transition">
                  📄 해설서 PDF 생성 ({selectedFortune.length}개 항목)
                </button>
              )}
            </div>
            <div className="flex gap-3">
              {cards.filter((c) => c.generated).slice(0, 3).map((c) => (
                <div key={c.id} className="w-32 aspect-[63/88] bg-gradient-to-br from-[#2a1a3e] to-[#0a0a1e] rounded-xl border border-[#b794f4]/30 flex items-center justify-center">
                  <span className="text-3xl">🃏</span>
                </div>
              ))}
              {generatedCount === 0 && <p className="text-sm text-[#555]">4단계에서 카드를 생성하면 여기에 표시됩니다</p>}
            </div>
          </div>
        )}

        {/* 이전/다음 */}
        <div className="flex justify-between mt-10">
          <button onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
            className="px-6 py-2.5 border border-[#2a2a2a] text-[#888] rounded-xl hover:border-[#444] hover:text-white transition text-sm">
            ← 이전
          </button>
          {step < 5 && (
            <button onClick={() => setStep((s) => Math.min(5, s + 1) as Step)}
              className="px-8 py-2.5 bg-[#b794f4] text-white rounded-xl hover:bg-[#a07ce0] transition text-sm font-semibold">
              다음 →
            </button>
          )}
        </div>
      </div>

      {(saved || projectSaved) && (
        <div className="fixed bottom-6 right-6 bg-[#1a1a2e] border border-[#b794f4]/40 text-[#b794f4] text-sm px-4 py-2 rounded-xl shadow-lg z-50">
          ✅ {saved ? "저장 완료!" : "프로젝트 저장 완료!"}
        </div>
      )}
    </div>
  );
}