import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useMemo } from "react";
import { Video, Loader2, Mic, Square, RotateCcw, Copy, Download, Shuffle, Wand2 } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";
import { drawCards, type DrawnCard } from "@/lib/tarot-deck";

export const Route = createFileRoute("/video-maker")({
  head: () => ({ meta: [{ title: "영상 메이커 — 자개빛" }] }),
  component: VideoMakerPage,
});

const PALETTE = [
  { name: "노랑", hex: "#f5e642" },
  { name: "핑크", hex: "#f5a0b8" },
  { name: "민트", hex: "#a0e8c8" },
  { name: "보라", hex: "#c8a0f5" },
  { name: "빨강", hex: "#f58080" },
  { name: "하늘", hex: "#a0c8f5" },
  { name: "황금", hex: "#f5d080" },
];
const NUM_FONTS = ["Georgia, serif","'Nanum Myeongjo', serif","'Malgun Gothic', sans-serif","system-ui"];
const NUM_FONT_LABELS = ["Georgia(세리프)","나눔명조","맑은고딕","시스템기본"];
const BODY_FONTS = ["system-ui, -apple-system, sans-serif","'Nanum Gothic', sans-serif","'Nanum Myeongjo', serif"];
const BODY_FONT_LABELS = ["시스템 산세리프","나눔고딕","나눔명조"];

function VideoMakerPage() {
  return (
    <PageShell icon={Video} title="영상 메이커" description="타로·사주 유튜브 영상 제작">
      <Tabs defaultValue="tarot" className="max-w-6xl mx-auto">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="tarot">🃏 타로 영상</TabsTrigger>
          <TabsTrigger value="saju">🔮 사주 영상</TabsTrigger>
        </TabsList>
        <TabsContent value="tarot" className="mt-6"><TarotTab /></TabsContent>
        <TabsContent value="saju" className="mt-6"><SajuTab /></TabsContent>
      </Tabs>
    </PageShell>
  );
}

interface SectionData {
  title: string;
  text: string;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number;
}

function parseSections(script: string): { title: string; text: string }[] {
  return script.split(/\n---+\n/).map(part => {
    const trimmed = part.trim();
    const m = trimmed.match(/^\[(.+?)\]\s*\n?([\s\S]*)$/);
    if (m) return { title: m[1].trim(), text: m[2].trim() };
    return { title: "섹션", text: trimmed };
  }).filter(s => s.text.length > 0);
}

function fmtTime(s: number): string {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

// ============ TAROT TAB ============
function TarotTab() {
  const { settings } = useUserSettings();
  const [channel, setChannel] = useState("My Tarot Channel");
  const [title, setTitle] = useState("Pick a Card · 일반 타로 리딩");
  const [topic, setTopic] = useState("");
  const [color, setColor] = useState(PALETTE[0].hex);
  const [numFont, setNumFont] = useState(NUM_FONTS[0]);
  const [bodyFont, setBodyFont] = useState(BODY_FONTS[0]);
  const [fontScale, setFontScale] = useState(100);

  const [groups, setGroups] = useState<DrawnCard[][]>([]);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [ctaLabel, setCtaLabel] = useState("개인 리딩 문의");
  const [ctaLink, setCtaLink] = useState("");

  function handleDraw() {
    const all = drawCards(12);
    setGroups([all.slice(0,3), all.slice(3,6), all.slice(6,9), all.slice(9,12)]);
  }
  function reroll(gi: number, ci: number) {
    const used = new Set(groups.flat().map(c => c.name));
    const fresh = drawCards(13).find(c => !used.has(c.name));
    if (!fresh) return;
    const next = groups.map(g => [...g]);
    next[gi][ci] = fresh;
    setGroups(next);
  }

  async function genScript() {
    if (groups.length !== 4) return toast.error("먼저 카드 12장을 뽑아주세요.");
    if (!settings?.gemini_api_key) return toast.error("설정에서 Gemini API 키를 등록해주세요.");
    setLoading(true);
    try {
      const content = await callAI("video-tarot", {
        channel, title, topic,
        groups: groups.map((g, i) => ({ name: `그룹${i+1}`, cards: g.map(c => `${c.name}${c.reversed ? "(역)" : ""}`) })),
      }, settings.gemini_api_key);
      const parsed = parseSections(content);
      setSections(parsed.map(p => ({ ...p, audioBlob: null, audioUrl: null, duration: 0 })));
      toast.success(`${parsed.length}개 섹션 생성 완료`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card className="p-5 bg-card/60 space-y-1">
          <h2 className="font-display text-xl font-semibold">본인 목소리 ASMR 가로 타로 영상</h2>
          <p className="text-xs text-muted-foreground">카드 자동 추천 → Gemini 스크립트 → 본인 목소리 녹음 → 16:9 WebM + 고정댓글까지 한 번에.</p>
        </Card>

        <Section title="1. 영상 정보">
          <Field label="채널명 (좌상단)"><Input value={channel} onChange={e=>setChannel(e.target.value)} /></Field>
          <Field label="영상 제목 (우상단 + 자막)"><Input value={title} onChange={e=>setTitle(e.target.value)} /></Field>
          <Field label="주제·테마 (선택)"><Textarea rows={2} value={topic} onChange={e=>setTopic(e.target.value)} placeholder="예: 11월 사랑운 / 직장 변화 / 자기 성장" /></Field>
        </Section>

        <StyleSection {...{ color, setColor, numFont, setNumFont, bodyFont, setBodyFont, fontScale, setFontScale }} />

        <Section title="✦ 2. 카드 추천 — 4 그룹 × 3장" right={
          <Button size="sm" onClick={handleDraw} className="gap-1"><Shuffle className="h-3.5 w-3.5"/>카드 12장 뽑기</Button>
        }>
          {groups.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">위 버튼을 눌러 78장 덱에서 12장(4그룹 × 3장)을 무작위로 뽑아보세요.</p>
          ) : (
            <div className="space-y-3">
              {groups.map((g, gi) => (
                <div key={gi}>
                  <div className="text-xs font-semibold mb-1.5" style={{ color }}>그룹 {gi+1}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {g.map((c, ci) => (
                      <button key={ci} onClick={()=>reroll(gi,ci)} className="text-left p-2 rounded-md border border-border bg-background/30 hover:border-primary text-[11px] leading-tight">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-muted-foreground">{c.reversed ? "역방향" : "정방향"}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground">카드 클릭 → 다른 카드로 교체</p>
            </div>
          )}
        </Section>

        <Section title="✦ 3. Gemini 스크립트" right={
          <Button size="sm" onClick={genScript} disabled={loading || groups.length===0} className="bg-gradient-to-r from-primary to-pink-500 gap-1">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Wand2 className="h-3.5 w-3.5"/>} 스크립트 만들기
          </Button>
        }>
          {sections.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3">카드를 뽑은 뒤 스크립트를 생성하세요.</p>
          ) : (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={i}>
                  <div className="text-xs font-semibold mb-1">[{s.title}]</div>
                  <Textarea rows={4} value={s.text} onChange={e=>{
                    const next = [...sections]; next[i] = { ...s, text: e.target.value }; setSections(next);
                  }} className="text-xs"/>
                </div>
              ))}
            </div>
          )}
        </Section>

        <RecordingSection sections={sections} setSections={setSections} />

        <ComposeSection sections={sections} renderFrame={(ctx, w, h, sectionIdx) => drawTarotFrame(ctx, w, h, { channel, title, color, numFont, bodyFont, fontScale, sectionIdx, sections, groups })} fileBase={title || "tarot"} />

        <PinnedComment kind="tarot" titleText={title} sections={sections} ctaLabel={ctaLabel} setCtaLabel={setCtaLabel} ctaLink={ctaLink} setCtaLink={setCtaLink} sectionLabels={["인트로","그룹 1 리딩","그룹 2 리딩","그룹 3 리딩","그룹 4 리딩"]} defaultLabel="개인 리딩 문의" />

        {!settings?.gemini_api_key && (
          <Link to="/settings" className="block">
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
              ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
            </div>
          </Link>
        )}
      </div>

      <div className="lg:sticky lg:top-6 self-start">
        <Card className="p-4 bg-card/60 space-y-2">
          <div className="text-xs text-muted-foreground">실시간 미리보기 (16:9)</div>
          <TarotPreview channel={channel} title={title} color={color} numFont={numFont} bodyFont={bodyFont} fontScale={fontScale} />
          <p className="text-[10px] text-muted-foreground text-center">미리보기 — 실제 영상에서는 카드 뒷면이 번호 아래 표시됩니다</p>
        </Card>
      </div>
    </div>
  );
}

function TarotPreview({ channel, title, color, numFont, bodyFont, fontScale }: { channel: string; title: string; color: string; numFont: string; bodyFont: string; fontScale: number }) {
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden relative" style={{ background: "linear-gradient(135deg,#1a1028 0%,#2a1845 50%,#1a1028 100%)", fontFamily: bodyFont }}>
      <div className="absolute top-2 left-3 text-[11px]" style={{ color: "#f5a0b8" }}>{channel}</div>
      <div className="absolute top-2 right-3 text-[11px] text-white max-w-[60%] truncate">{title}</div>
      <div className="absolute inset-0 flex items-center justify-center gap-6" style={{ color, fontFamily: numFont, fontSize: `${fontScale * 0.6}px`, fontWeight: 700, letterSpacing: "0.1em" }}>
        <span>1</span><span>2</span><span>3</span><span>4</span>
      </div>
    </div>
  );
}

// ============ SAJU TAB ============
const ILGAN = [
  { hanja: "甲", kor: "갑", grad: ["#1f5c3d","#3a8c5e"] },
  { hanja: "乙", kor: "을", grad: ["#2a6b48","#4ea072"] },
  { hanja: "丙", kor: "병", grad: ["#7a1d1d","#c44545"] },
  { hanja: "丁", kor: "정", grad: ["#8a2828","#d05858"] },
  { hanja: "戊", kor: "무", grad: ["#6b4a1d","#b88240"] },
  { hanja: "己", kor: "기", grad: ["#7d5828","#c79555"] },
  { hanja: "庚", kor: "경", grad: ["#3d3d3d","#7a7a7a"] },
  { hanja: "辛", kor: "신", grad: ["#4a4a4a","#888888"] },
  { hanja: "壬", kor: "임", grad: ["#1a2c5e","#3d5aa8"] },
  { hanja: "癸", kor: "계", grad: ["#22366b","#4869b8"] },
];
const SAJU_TOPICS = [
  "이번주 일간별 운세 / 이번 한 주(월~일)의 흐름",
  "다음주 일간별 운세 / 다음 한 주의 흐름",
  "이번달 일간별 운세 / 이번 한 달의 큰 흐름",
];

function SajuTab() {
  const { settings } = useUserSettings();
  const [channel, setChannel] = useState("My Saju Channel");
  const [topic, setTopic] = useState(SAJU_TOPICS[0]);
  const [color, setColor] = useState(PALETTE[0].hex);
  const [hanjaFont, setHanjaFont] = useState(NUM_FONTS[0]);
  const [bodyFont, setBodyFont] = useState(BODY_FONTS[0]);
  const [fontScale, setFontScale] = useState(100);
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SectionData[]>([]);
  const [ctaLabel, setCtaLabel] = useState("개인 사주 상담");
  const [ctaLink, setCtaLink] = useState("");

  async function genScript() {
    if (!settings?.gemini_api_key) return toast.error("설정에서 Gemini API 키를 등록해주세요.");
    setLoading(true);
    try {
      const content = await callAI("video-saju", { channel, topic }, settings.gemini_api_key);
      const parsed = parseSections(content);
      setSections(parsed.map(p => ({ ...p, audioBlob: null, audioUrl: null, duration: 0 })));
      toast.success(`${parsed.length}개 섹션 생성 완료`);
    } catch (e) { toast.error((e as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-5">
        <Card className="p-5 bg-card/60 space-y-1">
          <h2 className="font-display text-xl font-semibold">본인 목소리 ASMR 가로 사주 영상</h2>
          <p className="text-xs text-muted-foreground">주제 선택 → Gemini가 甲·乙·丙·丁·戊·己·庚·辛·壬·癸 10일간 운세 자동 생성 → 본인 목소리 녹음 → 16:9 WebM + 고정댓글까지 한 번에.</p>
        </Card>

        <Section title="1. 영상 정보">
          <Field label="채널명"><Input value={channel} onChange={e=>setChannel(e.target.value)} /></Field>
        </Section>

        <Section title="2. 주제 선택">
          <div className="grid grid-cols-1 gap-2">
            {SAJU_TOPICS.map(t => (
              <button key={t} onClick={()=>setTopic(t)} className={`text-left p-3 rounded-lg border text-xs transition-colors ${topic===t ? "border-primary bg-primary/10" : "border-border bg-background/30"}`}>
                {topic===t && <span className="text-primary mr-1">✓ 선택됨 ·</span>}{t}
              </button>
            ))}
          </div>
        </Section>

        <StyleSection color={color} setColor={setColor} numFont={hanjaFont} setNumFont={setHanjaFont} bodyFont={bodyFont} setBodyFont={setBodyFont} fontScale={fontScale} setFontScale={setFontScale} numFontLabel="한자(甲乙丙...) 폰트" />

        <Section title="✦ 4. Gemini 스크립트" right={
          <Button size="sm" onClick={genScript} disabled={loading} className="bg-gradient-to-r from-primary to-pink-500 gap-1">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Wand2 className="h-3.5 w-3.5"/>} 스크립트 만들기
          </Button>
        }>
          <p className="text-[11px] text-muted-foreground mb-2">인트로 + 갑/을/병/정/무/기/경/신/임/계 10일간 = 총 11개 섹션을 만듭니다. 각 일간 끝에 '구독·좋아요·알람 설정' 멘트, 인트로 끝엔 고정댓글 안내가 자동으로 들어갑니다.</p>
          {sections.length > 0 && (
            <div className="space-y-2">
              {sections.map((s, i) => (
                <div key={i}>
                  <div className="text-xs font-semibold mb-1">[{s.title}]</div>
                  <Textarea rows={3} value={s.text} onChange={e=>{
                    const next = [...sections]; next[i] = { ...s, text: e.target.value }; setSections(next);
                  }} className="text-xs"/>
                </div>
              ))}
            </div>
          )}
        </Section>

        <RecordingSection sections={sections} setSections={setSections} />

        <ComposeSection sections={sections} renderFrame={(ctx, w, h, idx) => drawSajuFrame(ctx, w, h, { channel, color, hanjaFont, bodyFont, fontScale, idx, sections })} fileBase="saju" />

        <PinnedComment kind="saju" titleText={topic} sections={sections} ctaLabel={ctaLabel} setCtaLabel={setCtaLabel} ctaLink={ctaLink} setCtaLink={setCtaLink} sectionLabels={["인트로", ...ILGAN.map(i=>`${i.hanja}(${i.kor}) 일간`)]} defaultLabel="개인 사주 상담" />

        {!settings?.gemini_api_key && (
          <Link to="/settings" className="block">
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
              ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
            </div>
          </Link>
        )}
      </div>

      <div className="lg:sticky lg:top-6 self-start space-y-2">
        <Card className="p-4 bg-card/60 space-y-2">
          <div className="text-xs text-muted-foreground">실시간 미리보기 — 인트로 화면</div>
          <SajuPreview color={color} hanjaFont={hanjaFont} bodyFont={bodyFont} fontScale={fontScale} channel={channel} />
          <p className="text-[10px] text-muted-foreground text-center">각 일간 섹션은 큰 한자 1개로 표시됩니다</p>
        </Card>
      </div>
    </div>
  );
}

function SajuPreview({ channel, color, hanjaFont, bodyFont, fontScale }: { channel: string; color: string; hanjaFont: string; bodyFont: string; fontScale: number }) {
  return (
    <div className="aspect-video w-full rounded-lg overflow-hidden relative p-3" style={{ background: "linear-gradient(135deg,#1a1028 0%,#2a1845 50%,#1a1028 100%)", fontFamily: bodyFont }}>
      <div className="absolute top-2 left-3 text-[10px]" style={{ color: "#f5a0b8" }}>{channel}</div>
      <div className="grid grid-cols-5 grid-rows-2 gap-1.5 h-full pt-4">
        {ILGAN.map((il, i) => (
          <div key={i} className="rounded-md flex flex-col items-center justify-center relative overflow-hidden" style={{ background: `linear-gradient(135deg,${il.grad[0]},${il.grad[1]})` }}>
            <div className="absolute top-0.5 left-1 text-[8px]" style={{ color }}>{i+1}</div>
            <div style={{ fontFamily: hanjaFont, fontSize: `${fontScale * 0.22}px`, color: "#fff", fontWeight: 700, lineHeight: 1 }}>{il.hanja}</div>
            <div className="text-[8px] text-white/80 mt-0.5">{il.kor}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ SHARED COMPONENTS ============
function Section({ title, right, children }: { title: string; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card className="p-5 bg-card/60 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {right}
      </div>
      {children}
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}

interface StyleSectionProps {
  color: string; setColor: (v: string) => void;
  numFont: string; setNumFont: (v: string) => void;
  bodyFont: string; setBodyFont: (v: string) => void;
  fontScale: number; setFontScale: (v: number) => void;
  numFontLabel?: string;
}
function StyleSection({ color, setColor, numFont, setNumFont, bodyFont, setBodyFont, fontScale, setFontScale, numFontLabel = "인트로 번호 폰트" }: StyleSectionProps) {
  return (
    <Section title="✦ 스타일 커스텀">
      <Field label="인덱스/번호 색상">
        <div className="flex gap-2 flex-wrap">
          {PALETTE.map(p => (
            <button key={p.hex} onClick={()=>setColor(p.hex)} className={`h-7 w-7 rounded-full border-2 transition-all ${color===p.hex ? "border-foreground scale-110" : "border-border"}`} style={{ background: p.hex }} title={p.name} />
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={numFontLabel}>
          <select value={numFont} onChange={e=>setNumFont(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-xs">
            {NUM_FONTS.map((f,i) => <option key={f} value={f} className="bg-background">{NUM_FONT_LABELS[i]}</option>)}
          </select>
        </Field>
        <Field label="본문·자막 폰트">
          <select value={bodyFont} onChange={e=>setBodyFont(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-2 text-xs">
            {BODY_FONTS.map((f,i) => <option key={f} value={f} className="bg-background">{BODY_FONT_LABELS[i]}</option>)}
          </select>
        </Field>
      </div>
      <Field label={`전체 폰트 크기 (${fontScale}%)`}>
        <Slider min={80} max={150} step={5} value={[fontScale]} onValueChange={v=>setFontScale(v[0])} />
      </Field>
    </Section>
  );
}

// ============ RECORDING ============
function RecordingSection({ sections, setSections }: { sections: SectionData[]; setSections: (s: SectionData[]) => void }) {
  const [recordingIdx, setRecordingIdx] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const recRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startedRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  async function startRec(i: number) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      recRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        // measure duration
        const audio = new Audio(url);
        await new Promise<void>(res => {
          audio.addEventListener("loadedmetadata", () => res(), { once: true });
          audio.addEventListener("error", () => res(), { once: true });
        });
        let dur = audio.duration;
        if (!isFinite(dur) || dur === 0) dur = (Date.now() - startedRef.current) / 1000;
        const next = [...sections];
        if (next[i].audioUrl) URL.revokeObjectURL(next[i].audioUrl!);
        next[i] = { ...next[i], audioBlob: blob, audioUrl: url, duration: dur };
        setSections(next);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      startedRef.current = Date.now();
      setRecordingIdx(i);
      setElapsed(0);
      timerRef.current = window.setInterval(() => setElapsed(e => e + 1), 1000);
    } catch (e) {
      toast.error("마이크 권한이 필요합니다.");
    }
  }

  function stopRec() {
    recRef.current?.stop();
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setRecordingIdx(null);
  }

  if (sections.length === 0) {
    return <Section title="🎙 4. 본인 목소리로 녹음"><p className="text-xs text-muted-foreground py-2">먼저 스크립트를 생성해주세요.</p></Section>;
  }

  return (
    <Section title="🎙 본인 목소리로 녹음">
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="rounded-lg border border-border p-3 bg-background/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold">[{s.title}]</div>
              {s.duration > 0 && <span className="text-[10px] text-muted-foreground">{fmtTime(s.duration)}</span>}
            </div>
            <div className="text-[11px] text-muted-foreground whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto">{s.text}</div>
            <div className="flex items-center gap-2 flex-wrap">
              {recordingIdx === i ? (
                <Button size="sm" variant="destructive" onClick={stopRec}><Square className="h-3 w-3 mr-1"/>중지 ({elapsed}s)</Button>
              ) : (
                <Button size="sm" onClick={()=>startRec(i)} disabled={recordingIdx !== null}>
                  {s.audioUrl ? <RotateCcw className="h-3 w-3 mr-1"/> : <Mic className="h-3 w-3 mr-1"/>}
                  {s.audioUrl ? "다시 녹음" : "녹음 시작"}
                </Button>
              )}
              {s.audioUrl && <audio controls src={s.audioUrl} className="h-8 flex-1 min-w-[200px]" />}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ============ CANVAS FRAME RENDERERS ============
interface TarotFrameOpts {
  channel: string; title: string; color: string;
  numFont: string; bodyFont: string; fontScale: number;
  sectionIdx: number; sections: SectionData[]; groups: DrawnCard[][];
}
function drawTarotFrame(ctx: CanvasRenderingContext2D, w: number, h: number, o: TarotFrameOpts) {
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,"#1a1028"); grad.addColorStop(0.5,"#2a1845"); grad.addColorStop(1,"#1a1028");
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
  ctx.fillStyle = "#f5a0b8"; ctx.font = `400 ${18 * o.fontScale/100}px ${o.bodyFont}`;
  ctx.textAlign = "left"; ctx.fillText(o.channel, 30, 38);
  ctx.fillStyle = "#fff"; ctx.textAlign = "right"; ctx.fillText(o.title, w - 30, 38);

  const sec = o.sections[o.sectionIdx];
  const isIntro = sec && /인트로|intro/i.test(sec.title);
  ctx.textAlign = "center";
  if (isIntro || !sec) {
    ctx.fillStyle = o.color; ctx.font = `700 ${260 * o.fontScale/100}px ${o.numFont}`;
    const labels = ["1","2","3","4"]; const startX = w/2 - (labels.length-1) * 180 / 2;
    labels.forEach((l, i) => ctx.fillText(l, startX + i*180, h/2 + 90));
  } else {
    const m = sec.title.match(/그룹\s*(\d)/); const idx = m ? m[1] : String(o.sectionIdx);
    ctx.fillStyle = o.color; ctx.font = `700 ${360 * o.fontScale/100}px ${o.numFont}`;
    ctx.fillText(idx, w/2, h/2 + 100);
    ctx.fillStyle = "#fff"; ctx.font = `400 ${28 * o.fontScale/100}px ${o.bodyFont}`;
    ctx.fillText(`그룹 ${idx} 리딩`, w/2, h - 60);
  }
}

interface SajuFrameOpts {
  channel: string; color: string; hanjaFont: string; bodyFont: string; fontScale: number;
  idx: number; sections: SectionData[];
}
function drawSajuFrame(ctx: CanvasRenderingContext2D, w: number, h: number, o: SajuFrameOpts) {
  const grad = ctx.createLinearGradient(0,0,w,h);
  grad.addColorStop(0,"#1a1028"); grad.addColorStop(0.5,"#2a1845"); grad.addColorStop(1,"#1a1028");
  ctx.fillStyle = grad; ctx.fillRect(0,0,w,h);
  ctx.fillStyle = "#f5a0b8"; ctx.font = `400 ${18 * o.fontScale/100}px ${o.bodyFont}`;
  ctx.textAlign = "left"; ctx.fillText(o.channel, 30, 38);

  const sec = o.sections[o.idx]; const isIntro = sec && /인트로|intro/i.test(sec.title);
  if (isIntro || !sec) {
    // 10 cards grid
    const cw = (w - 80) / 5, ch = (h - 100) / 2;
    ILGAN.forEach((il, i) => {
      const r = Math.floor(i/5), c = i%5;
      const x = 40 + c*cw, y = 70 + r*ch;
      const g = ctx.createLinearGradient(x,y,x+cw,y+ch);
      g.addColorStop(0, il.grad[0]); g.addColorStop(1, il.grad[1]);
      ctx.fillStyle = g; ctx.fillRect(x+8, y+8, cw-16, ch-16);
      ctx.fillStyle = o.color; ctx.font = `400 ${16 * o.fontScale/100}px ${o.bodyFont}`;
      ctx.textAlign = "left"; ctx.fillText(String(i+1), x+18, y+30);
      ctx.fillStyle = "#fff"; ctx.font = `700 ${100 * o.fontScale/100}px ${o.hanjaFont}`;
      ctx.textAlign = "center"; ctx.fillText(il.hanja, x+cw/2, y+ch/2 + 20);
      ctx.font = `400 ${18 * o.fontScale/100}px ${o.bodyFont}`;
      ctx.fillText(il.kor, x+cw/2, y+ch - 30);
    });
  } else {
    const il = ILGAN[o.idx - 1] ?? ILGAN[0];
    const g = ctx.createLinearGradient(0,0,w,h);
    g.addColorStop(0, il.grad[0] + "88"); g.addColorStop(1, il.grad[1] + "88");
    ctx.fillStyle = g; ctx.fillRect(0,0,w,h);
    ctx.fillStyle = o.color; ctx.font = `400 ${28 * o.fontScale/100}px ${o.bodyFont}`;
    ctx.textAlign = "center"; ctx.fillText(`${o.idx} / 10`, w/2, 80);
    ctx.fillStyle = "#fff"; ctx.font = `700 ${440 * o.fontScale/100}px ${o.hanjaFont}`;
    ctx.fillText(il.hanja, w/2, h/2 + 130);
    ctx.font = `400 ${42 * o.fontScale/100}px ${o.bodyFont}`;
    ctx.fillText(`${il.hanja}(${il.kor}) 일간`, w/2, h - 70);
  }
}

// ============ COMPOSE ============
function ComposeSection({ sections, renderFrame, fileBase }: {
  sections: SectionData[];
  renderFrame: (ctx: CanvasRenderingContext2D, w: number, h: number, sectionIdx: number) => void;
  fileBase: string;
}) {
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const allRecorded = sections.length > 0 && sections.every(s => s.audioBlob);

  async function compose() {
    if (!allRecorded) return toast.error("모든 섹션을 녹음해주세요.");
    setBusy(true); setOutUrl(null);
    try {
      const W = 1280, H = 720;
      const canvas = document.createElement("canvas"); canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext("2d")!;
      const canvasStream = canvas.captureStream(30);

      const audioCtx = new AudioContext();
      const dest = audioCtx.createMediaStreamDestination();
      const mixed = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus") ? "video/webm;codecs=vp9,opus" : "video/webm";
      const recorder = new MediaRecorder(mixed, { mimeType: mime, videoBitsPerSecond: 2_500_000 });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = e => { if (e.data.size>0) chunks.push(e.data); };
      const finished = new Promise<Blob>(res => { recorder.onstop = () => res(new Blob(chunks, { type: "video/webm" })); });
      recorder.start();

      let curIdx = 0;
      let raf = 0;
      const drawLoop = () => { renderFrame(ctx, W, H, curIdx); raf = requestAnimationFrame(drawLoop); };
      drawLoop();

      for (let i = 0; i < sections.length; i++) {
        curIdx = i;
        setProgress(`${i+1} / ${sections.length} 섹션 합성 중...`);
        const blob = sections[i].audioBlob!;
        const arr = await blob.arrayBuffer();
        const buf = await audioCtx.decodeAudioData(arr.slice(0));
        const src = audioCtx.createBufferSource();
        src.buffer = buf; src.connect(dest);
        await new Promise<void>(res => { src.onended = () => res(); src.start(); });
      }

      cancelAnimationFrame(raf);
      // small tail
      await new Promise(r => setTimeout(r, 300));
      recorder.stop();
      const out = await finished;
      audioCtx.close();
      const url = URL.createObjectURL(out);
      setOutUrl(url);
      toast.success("영상 합성 완료!");
    } catch (e) {
      toast.error("합성 실패: " + (e as Error).message);
    } finally {
      setBusy(false); setProgress("");
    }
  }

  return (
    <Section title="📹 5. MP4 합성 (16:9 720p)" right={
      <Button size="sm" onClick={compose} disabled={busy || !allRecorded} className="bg-gradient-to-r from-primary to-pink-500 gap-1">
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin"/> : <Video className="h-3.5 w-3.5"/>}영상 만들기
      </Button>
    }>
      {progress && <p className="text-xs text-primary">{progress}</p>}
      <p className="text-[11px] text-muted-foreground">브라우저에서 직접 합성되며 WebM 형식으로 저장됩니다. MP4 변환은 별도 도구를 사용하세요.</p>
      {outUrl && (
        <div className="space-y-2">
          <video src={outUrl} controls className="w-full rounded-lg border border-border" />
          <a href={outUrl} download={`${fileBase}_자개빛.webm`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
            <Download className="h-3.5 w-3.5"/>다운로드 (.webm)
          </a>
        </div>
      )}
    </Section>
  );
}

// ============ PINNED COMMENT ============
interface PinnedProps {
  kind: "tarot" | "saju";
  titleText: string;
  sections: SectionData[];
  ctaLabel: string; setCtaLabel: (v: string) => void;
  ctaLink: string; setCtaLink: (v: string) => void;
  sectionLabels: string[];
  defaultLabel: string;
}
function PinnedComment({ titleText, sections, ctaLabel, setCtaLabel, ctaLink, setCtaLink, sectionLabels }: PinnedProps) {
  const comment = useMemo(() => {
    if (sections.length === 0 || sections.some(s => !s.audioBlob)) return "스크립트 생성 + 모든 섹션 녹음을 끝내면 정확한 타임라인으로 고정댓글이 만들어져요.";
    let t = 0;
    const lines: string[] = [];
    sections.forEach((s, i) => {
      lines.push(`${fmtTime(t)} ${sectionLabels[i] ?? s.title}`);
      t += s.duration;
    });
    return `📌 ${titleText}\n━━━━━━━━━━━━━━━━━\n⏰ 타임라인\n${lines.join("\n")}\n━━━━━━━━━━━━━━━━━\n💌 ${ctaLabel}\n${ctaLink || "(링크를 입력해주세요)"}`;
  }, [sections, sectionLabels, titleText, ctaLabel, ctaLink]);

  return (
    <Section title="💬 6. 유튜브 고정댓글 (타임라인 + 개인 CTA)">
      <div className="grid grid-cols-2 gap-3">
        <Field label="개인 문의 라벨"><Input value={ctaLabel} onChange={e=>setCtaLabel(e.target.value)} /></Field>
        <Field label="개인 CTA 링크"><Input value={ctaLink} onChange={e=>setCtaLink(e.target.value)} placeholder="https://your-link.com 또는 카카오 오픈채팅" /></Field>
      </div>
      <pre className="text-[11px] whitespace-pre-wrap p-3 rounded-md bg-background/40 border border-border leading-relaxed">{comment}</pre>
      <Button size="sm" variant="outline" onClick={()=>{ navigator.clipboard.writeText(comment); toast.success("고정댓글 복사 완료"); }}>
        <Copy className="h-3.5 w-3.5 mr-1"/>고정댓글 복사
      </Button>
    </Section>
  );
}

