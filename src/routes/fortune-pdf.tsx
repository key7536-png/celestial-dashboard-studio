import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useRef } from "react";
import { FileText, Loader2, Download, Save, Trash2, Plus, Square } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useUserSettings } from "@/hooks/use-user-settings";
import { callAI } from "@/lib/call-ai";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/fortune-pdf")({
  head: () => ({ meta: [{ title: "종합 사주 100p 리포트 — 자개빛" }] }),
  component: FortunePdfPage,
});

// 100페이지 리포트 파트 정의 — theme: PDF 챕터 표지 배경 이미지 키
const PARTS: { key: string; title: string; subtitle: string; theme: string; spec: string }[] = [
  {
    key: "part0",
    title: "PART 0. 오프닝",
    subtitle: "이 분의 핵심 · 한 줄 총평",
    theme: "marble-pink",
    spec: `## p.1 — 표지
이름·생년월일·성별·"종합 사주 100p 리포트" 제목과 한두 문장의 부제(이 분만의 인생 키워드 한 줄). 표지 페이지답게 상징적이고 시적인 한 단락.

## p.2 — 이 리포트를 보는 법
이 리포트의 8개 PART 구성과 활용 방법, 어떻게 읽으면 좋은지 가이드.

## p.3 — 사주 원국 도표
시주/일주/월주/년주의 천간·지지를 한눈에 정리하고 각 기둥의 의미를 짧게 해설.

## p.4 — 한 줄 총평 + 인생 키워드 5가지
강한 한 문장 총평, 그리고 이 분의 인생을 관통하는 키워드 5개를 각각 한 단락씩 풀이. 첫 페이지부터 "소름" 유발하도록 구체적으로.

## p.5 — 한 줄 총평 (확장)
p.4 키워드 5개를 종합한 인생 메시지 한 페이지. 진심 어린 톤.`,
  },
  {
    key: "part1",
    title: "PART 1. 인생 총운",
    subtitle: "타고난 그릇 · 오행 · 대운 흐름",
    theme: "galaxy-purple",
    spec: `## p.6 — 타고난 그릇: 격국
## p.7 — 타고난 그릇: 용신
## p.8 — 오행 에너지 분석 (강한 기운)
## p.9 — 오행 에너지 분석 (부족한 기운과 보완책)
## p.10 — 일간의 특성: 어떤 삶을 살도록 설계됐나
## p.11 — 일간의 특성: 강점과 약점
## p.12 — 대운 10년 전체 흐름 (유년·청년기)
## p.13 — 대운 10년 전체 흐름 (중년·노년기)
## p.14 — 인생에서 가장 빛나는 시기 (1)
## p.15 — 인생에서 가장 빛나는 시기 (2)
## p.16 — 인생에서 가장 조심해야 할 시기 (1)
## p.17 — 인생에서 가장 조심해야 할 시기 (2)
## p.18 — 숨겨진 운명 코드: 신살 (주요 신살)
## p.19 — 숨겨진 운명 코드: 신살 (실생활 의미)`,
  },
  {
    key: "part2",
    title: "PART 2. 성격과 재능",
    subtitle: "겉과 속 · 천직의 방향",
    theme: "forest-fog",
    spec: `## p.20 — 겉으로 보이는 나
## p.21 — 속에 숨겨진 나
## p.22 — 타고난 재능
## p.23 — 천직의 방향
## p.24 — 사람을 대하는 방식
## p.25 — 친해지는 결과 거리감
## p.26 — 반복적으로 빠지는 함정
## p.27 — 함정에서 벗어나는 해결책`,
  },
  {
    key: "part3",
    title: "PART 3. 결혼·연애운",
    subtitle: "끌리는 사람 · 인연이 오는 시기",
    theme: "heart-moon",
    spec: `## p.28 — 이 분의 연애 패턴 (1)
## p.29 — 이 분의 연애 패턴 (2)
## p.30 — 끌리는 사람 유형
## p.31 — 실제 잘 맞는 사람 유형
## p.32 — 배우자 사주 유형 (이런 사람이 맞다)
## p.33 — 배우자와의 궁합 포인트
## p.34 — 결혼 시기: 인연이 오는 대운
## p.35 — 결혼 시기: 세운 디테일
## p.36 — 결혼 후 관계 패턴
## p.37 — 함께 성장하는 방법
## p.38 — 관계가 무너지는 순간
## p.39 — 갈등의 골을 메우는 법
## p.40 — 함께 있으면 편한 사람의 특징
## p.41 — 함께 있으면 힘든 사람의 특징`,
  },
  {
    key: "part4",
    title: "PART 4. 재물·직업운",
    subtitle: "재물의 결 · 일과 사업",
    theme: "gold-dust",
    spec: `## p.42 — 돈이 들어오는 방식 (재성 분석 1)
## p.43 — 돈이 들어오는 방식 (재성 분석 2)
## p.44 — 재물이 쌓이는 시기
## p.45 — 재물이 새는 시기와 주의점
## p.46 — 맞는 수익 구조: 직장 vs 사업 vs 투자
## p.47 — 추천 수익 모델 디테일
## p.48 — 피해야 할 돈 문제
## p.49 — 사기·손재 패턴과 예방
## p.50 — 일 스타일: 강점
## p.51 — 일 스타일: 망가지는 조건
## p.52 — 잘 맞는 직업군
## p.53 — 잘 맞는 환경·조직 형태
## p.54 — 명예·사회적 위치 (1)
## p.55 — 명예·사회적 위치 (2)`,
  },
  {
    key: "part5",
    title: "PART 5. 건강·가족운",
    subtitle: "몸의 결 · 가족과 귀인",
    theme: "forest-fog",
    spec: `## p.56 — 건강운: 오행으로 보는 약한 부분
## p.57 — 건강운: 평생 관리 포인트
## p.58 — 스트레스 신호
## p.59 — 회복 루틴 추천
## p.60 — 부모운: 받는 기운
## p.61 — 가족운: 주는 기운
## p.62 — 자녀운: 인연
## p.63 — 자녀운: 관계 양상
## p.64 — 귀인운: 인생 바꿀 사람의 유형
## p.65 — 귀인을 만나는 시기와 방법`,
  },
  {
    key: "part6",
    title: "PART 6. 현재와 미래",
    subtitle: "지금의 흐름과 12개월 방향",
    theme: "galaxy-purple2",
    spec: `## p.66 — 지금 이 순간의 상태 진단 (1)
## p.67 — 지금 이 순간의 상태 진단 (2)
## p.68 — 앞으로 3개월 흐름
## p.69 — 앞으로 3개월 우선순위
## p.70 — 3~6개월: 변화가 시작되는 구간 (1)
## p.71 — 3~6개월: 변화가 시작되는 구간 (2)
## p.72 — 6~12개월: 큰 흐름
## p.73 — 6~12개월: 방향성과 결단
## p.74 — 이동·이사·해외운 (방향)
## p.75 — 이동·이사·해외운 (시기)`,
  },
  {
    key: "part7a",
    title: "PART 7-A. 월별 가이드 1~6월",
    subtitle: "달마다 풀어보는 흐름",
    theme: "mountain-sunset",
    spec: `각 달마다 2페이지. 페이지마다 [이달의 에너지(위험/보통/좋음)] / [주요 사건 예측] / [해야 할 것·피해야 할 것] / [이달의 행운 키워드]를 빠짐없이 포함하세요.

## p.76 — 1월 가이드 (전반부)
## p.77 — 1월 가이드 (후반부)
## p.78 — 2월 가이드 (전반부)
## p.79 — 2월 가이드 (후반부)
## p.80 — 3월 가이드 (전반부)
## p.81 — 3월 가이드 (후반부)
## p.82 — 4월 가이드 (전반부)
## p.83 — 4월 가이드 (후반부)
## p.84 — 5월 가이드 (전반부)
## p.85 — 5월 가이드 (후반부)
## p.86 — 6월 가이드 (전반부)
## p.87 — 6월 가이드 (후반부)`,
  },
  {
    key: "part7b",
    title: "PART 7-B. 월별 가이드 7~12월",
    subtitle: "하반기의 결과 행운 포인트",
    theme: "mountain-sunset",
    spec: `각 달마다 2페이지. 페이지마다 [이달의 에너지] / [주요 사건 예측] / [해야 할 것·피해야 할 것] / [이달의 행운 키워드]를 빠짐없이 포함하세요.

## p.88 — 7월 가이드 (전반부)
## p.89 — 7월 가이드 (후반부)
## p.90 — 8월 가이드 (전반부)
## p.91 — 8월 가이드 (후반부)
## p.92 — 9월 가이드 (전반부)
## p.93 — 9월 가이드 (후반부)
## p.94 — 10월 가이드 (전반부)
## p.95 — 10월 가이드 (후반부)
## p.96 — 11월 가이드 (전반부)
## p.97 — 11월 가이드 (후반부)
## p.98 — 12월 가이드 (전반부)
## p.99 — 12월 가이드 (후반부)`,
  },
  {
    key: "part8",
    title: "PART 8. 마무리",
    subtitle: "소름 포인트와 따뜻한 마무리",
    theme: "marble-pink",
    spec: `## p.100 — 마무리: 소름 포인트 3가지 + 실전 조언 3개 + 자개빛 상담 안내
이 리포트 전체에서 가장 핵심적인 "소름 포인트" 3가지를 짚어주고, 당장 실천할 수 있는 실전 조언 3개, 그리고 추가 상담을 원할 때 자개빛 카카오 채널로 문의하라는 따뜻한 마무리를 작성하세요.`,
  },
];

function mdToInner(md: string): string {
  // ## 헤더로 페이지 분리. 결과는 첫 페이지 시작 <section>이 없는 형태.
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const lines = escaped.split("\n");
  const out: string[] = [];
  let buf: string[] = [];
  let opened = false;
  const flush = () => {
    if (buf.length) {
      out.push(`<p>${buf.join("<br/>")}</p>`);
      buf = [];
    }
  };
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^##\s+/.test(line)) {
      flush();
      if (opened) out.push(`</section>`);
      out.push(`<section class="page"><h2>${line.replace(/^##\s+/, "")}</h2>`);
      opened = true;
    } else if (line === "") {
      flush();
    } else {
      buf.push(line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"));
    }
  }
  flush();
  if (opened) out.push(`</section>`);
  return out.join("\n");
}

function buildHtmlDoc(
  name: string,
  birth: string,
  parts: { title: string; subtitle: string; theme: string; html: string }[],
  origin: string,
): string {
  const dividerOf = (p: { title: string; subtitle: string; theme: string }) => `
  <section class="divider" style="background-image:url('${origin}/fortune-bg/${p.theme}.jpg')">
    <div class="divider-veil"></div>
    <div class="divider-box">
      <div class="divider-eyebrow">CHAPTER</div>
      <h2 class="divider-title">${p.title}</h2>
      <div class="divider-sub">${p.subtitle}</div>
    </div>
  </section>`;

  const partsHtml = parts.map((p) => `${dividerOf(p)}${p.html}`).join("\n");

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"/>
<title>${name}님의 종합 사주 100p 리포트</title>
<style>
  @page { size: A4; margin: 0; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: "Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif; color:#1a1a2e; line-height:1.75; font-size:11pt; }

  /* 표지 */
  .cover {
    position:relative; width:210mm; height:297mm;
    background-image:url('${origin}/fortune-bg/cover-tarot.jpg');
    background-size:cover; background-position:center;
    color:#f5e8c8; page-break-after: always;
    display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;
  }
  .cover::before { content:""; position:absolute; inset:0; background:rgba(0,0,0,0.35); }
  .cover-inner { position:relative; z-index:1; padding:0 24mm; }
  .cover .brand-top { font-size:9pt; letter-spacing:0.4em; opacity:0.85; margin-bottom:18mm; }
  .cover h1 { font-size:34pt; margin:0 0 14mm; letter-spacing:-0.02em; line-height:1.25; text-shadow:0 2px 12px rgba(0,0,0,0.5); }
  .cover .meta { font-size:13pt; opacity:0.92; }
  .cover .brand { margin-top:30mm; font-size:10pt; letter-spacing:0.5em; opacity:0.85; }

  /* 챕터 표지 (PART별 테마 배경) */
  .divider {
    position:relative; width:210mm; height:297mm;
    background-size:cover; background-position:center;
    page-break-after: always;
    display:flex; align-items:center; justify-content:center;
  }
  .divider-veil { position:absolute; inset:0; background:linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.18) 100%); }
  .divider-box {
    position:relative; z-index:1;
    background:rgba(255,255,255,0.78); backdrop-filter: blur(2px);
    border-radius:8px;
    padding:14mm 18mm; min-width:120mm; max-width:160mm; text-align:center;
    box-shadow:0 8px 28px rgba(0,0,0,0.18);
  }
  .divider-eyebrow { font-size:9pt; letter-spacing:0.45em; color:#7a2d4a; margin-bottom:6mm; }
  .divider-title { font-size:24pt; margin:0 0 6mm; color:#1a1a2e; letter-spacing:-0.02em; line-height:1.3; }
  .divider-sub { font-size:11pt; color:#5a4a52; letter-spacing:0.05em; }

  /* 본문 페이지 */
  section.page { page-break-after: always; padding:18mm 16mm; min-height:297mm; }
  section.page:last-child { page-break-after: auto; }
  h1 { font-size:18pt; border-bottom:2px solid #c93; padding-bottom:4mm; margin:0 0 6mm; }
  h2 { font-size:15pt; color:#7a2d4a; border-left:4px solid #c93; padding-left:8px; margin:0 0 6mm; }
  p { margin:0 0 4mm; text-align: justify; }
  strong { color:#7a2d4a; }

  @media print { .no-print { display:none !important; } }
  .toolbar { position:sticky; top:0; background:#fff; padding:10px; border-bottom:1px solid #eee; text-align:center; z-index:10; }
  .toolbar button { padding:10px 24px; font-size:14px; background:#7a2d4a; color:#fff; border:0; border-radius:6px; cursor:pointer; }
</style></head>
<body>
  <div class="toolbar no-print">
    <button onclick="window.print()">📥 PDF로 저장 (인쇄 → PDF로 저장 선택)</button>
  </div>
  <div class="cover">
    <div class="cover-inner">
      <div class="brand-top">VIBEELLA · 실 패 턴 리 포 트</div>
      <h1>${name}님의<br/>운명 분석 보고서</h1>
      <div class="meta">${birth}</div>
      <div class="brand">자 개 빛</div>
    </div>
  </div>
  ${partsHtml}
  <script>
    // 이미지 로딩 완료 후 인쇄
    const imgs = Array.from(document.images);
    Promise.all(imgs.map(i => i.complete ? Promise.resolve() : new Promise(r => { i.onload = i.onerror = r; })))
      .then(() => setTimeout(() => window.print(), 600));
  </script>
</body></html>`;
}

type FortuneRow = {
  id: string;
  name: string;
  birth: string;
  calendar: string;
  gender: string;
  birth_time: string | null;
  request: string | null;
  part_results: Record<string, string>;
  updated_at: string;
};

function FortunePdfPage() {
  const { settings } = useUserSettings();
  const { user } = useAuth();
  const apiKey = settings?.gemini_api_key;
  const [reportId, setReportId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [calendar, setCalendar] = useState("양력");
  const [gender, setGender] = useState("여성");
  const [time, setTime] = useState("");
  const [request, setRequest] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [partResults, setPartResults] = useState<Record<string, string>>({});
  const [savedList, setSavedList] = useState<FortuneRow[]>([]);
  const stopRef = useRef(false);

  const completedCount = Object.keys(partResults).length;
  const hasPartial = completedCount > 0 && completedCount < PARTS.length;

  const loadList = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("fortune_reports")
      .select("*")
      .order("updated_at", { ascending: false });
    setSavedList((data ?? []) as FortuneRow[]);
  }, [user]);

  useEffect(() => { void loadList(); }, [loadList]);

  function newCustomer() {
    setReportId(null);
    setName(""); setBirth(""); setCalendar("양력"); setGender("여성");
    setTime(""); setRequest(""); setPartResults({}); setProgress(0);
  }

  function loadCustomer(row: FortuneRow) {
    setReportId(row.id);
    setName(row.name);
    setBirth(row.birth);
    setCalendar(row.calendar);
    setGender(row.gender);
    setTime(row.birth_time ?? "");
    setRequest(row.request ?? "");
    setPartResults(row.part_results ?? {});
    const c = Object.keys(row.part_results ?? {}).length;
    setProgress(Math.round((c / PARTS.length) * 100));
    toast.success(`${row.name} 고객 정보를 불러왔어요.`);
  }

  async function saveCustomer(nextResults?: Record<string, string>) {
    if (!user) return null;
    if (!name || !birth) return null;
    const payload = {
      user_id: user.id,
      name, birth, calendar, gender,
      birth_time: time || null,
      request: request || null,
      part_results: nextResults ?? partResults,
    };
    if (reportId) {
      const { error } = await supabase.from("fortune_reports").update(payload).eq("id", reportId);
      if (error) { toast.error(error.message); return null; }
      void loadList();
      return reportId;
    } else {
      const { data, error } = await supabase.from("fortune_reports").insert(payload).select("id").single();
      if (error) { toast.error(error.message); return null; }
      setReportId(data.id);
      void loadList();
      return data.id as string;
    }
  }

  async function handleSaveOnly() {
    if (!name || !birth) return toast.error("이름과 생년월일을 입력해주세요.");
    const id = await saveCustomer();
    if (id) toast.success("고객 정보를 저장했어요.");
  }

  async function handleDelete(id: string) {
    if (!confirm("이 고객 리포트를 삭제할까요?")) return;
    const { error } = await supabase.from("fortune_reports").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (reportId === id) newCustomer();
    void loadList();
    toast.success("삭제했어요.");
  }

  function resetAll() {
    setPartResults({});
    setProgress(0);
    setStatusMsg("");
  }

  function openPdfWindow(results: Record<string, string>) {
    const partsForHtml = PARTS
      .filter((p) => results[p.key])
      .map((p) => ({
        title: p.title,
        subtitle: p.subtitle,
        theme: p.theme,
        html: mdToInner(results[p.key]),
      }));
    const html = buildHtmlDoc(
      name,
      `${birth} (${calendar}) · ${gender}${time ? ` · ${time}` : ""}`,
      partsForHtml,
      window.location.origin,
    );
    const win = window.open("", "_blank");
    if (!win) {
      toast.error("팝업이 차단되었습니다. 브라우저 팝업 허용을 해주세요.");
      return false;
    }
    win.document.open();
    win.document.write(html);
    win.document.close();
    return true;
  }

  async function handleGenerate() {
    if (!apiKey) return toast.error("설정에서 Gemini API 키를 먼저 등록해주세요.");
    if (!name || !birth) return toast.error("이름과 생년월일을 입력해주세요.");

    stopRef.current = false;
    setLoading(true);
    const results = { ...partResults };
    setProgress(Math.round((Object.keys(results).length / PARTS.length) * 100));

    // 시작 전 고객 정보 자동 저장
    await saveCustomer(results);

    try {
      for (let i = 0; i < PARTS.length; i++) {
        if (stopRef.current) {
          await saveCustomer(results);
          toast.info(`멈춤. ${Object.keys(results).length}/${PARTS.length} 파트 저장됨. '이어서 생성'으로 계속할 수 있어요.`);
          return;
        }
        const p = PARTS[i];
        if (results[p.key]) continue;
        setStatusMsg(`(${i + 1}/${PARTS.length}) ${p.title} 작성 중...`);
        const text = await callAI(
          "saju-100-part",
          { name, birth, calendar, gender, time, request, partTitle: p.title, partSpec: p.spec },
          apiKey,
        );
        results[p.key] = text;
        setPartResults({ ...results });
        setProgress(Math.round((Object.keys(results).length / PARTS.length) * 100));
        // 파트별로 DB에 자동 저장 → 중간 실패해도 안전
        await saveCustomer(results);
      }

      setStatusMsg("PDF 문서 생성 중...");
      if (openPdfWindow(results)) {
        toast.success("리포트가 새 창에서 열렸습니다. '인쇄 → PDF로 저장'을 눌러주세요.");
      }
    } catch (e) {
      const msg = (e as Error).message ?? "생성 실패";
      await saveCustomer(results);
      toast.error(`${msg}\n(${Object.keys(results).length}/${PARTS.length} 파트 저장됨. '이어서 생성'으로 계속하세요.)`);
    } finally {
      setLoading(false);
      setStatusMsg("");
      stopRef.current = false;
    }
  }

  function handleStop() {
    stopRef.current = true;
    setStatusMsg("멈추는 중... 현재 파트 완료 후 중단됩니다.");
  }

  function handleDownloadPartial() {
    if (!completedCount) return;
    if (openPdfWindow(partResults)) {
      toast.success(`현재까지 생성된 ${completedCount}/${PARTS.length} 파트로 PDF를 열었어요.`);
    }
  }

  return (
    <PageShell icon={FileText} title="종합 사주 100p 리포트" description="고객에게 이메일로 전달할 프리미엄 사주 PDF (1인 1리포트 · 약 100페이지)">
      <div className="max-w-2xl mx-auto space-y-4">
        {savedList.length > 0 && (
          <Card className="p-4 bg-card/60">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">저장된 고객 ({savedList.length})</p>
              <Button onClick={newCustomer} size="sm" variant="outline" className="h-7 text-xs">
                <Plus className="h-3 w-3 mr-1" />새 고객
              </Button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {savedList.map((row) => {
                const c = Object.keys(row.part_results ?? {}).length;
                const isActive = row.id === reportId;
                return (
                  <div key={row.id} className={`flex items-center gap-2 rounded-md border p-2 text-xs ${isActive ? "border-primary/60 bg-primary/10" : "border-border/40 hover:bg-muted/30"}`}>
                    <button onClick={() => loadCustomer(row)} className="flex-1 text-left">
                      <div className="font-medium">{row.name} <span className="text-muted-foreground font-normal">({row.birth})</span></div>
                      <div className="text-[10px] text-muted-foreground">
                        {c}/{PARTS.length} 파트 · {new Date(row.updated_at).toLocaleDateString("ko-KR")}
                      </div>
                    </button>
                    <button onClick={() => handleDelete(row.id)} className="text-muted-foreground hover:text-destructive p-1" title="삭제">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

      <Card className="p-6 space-y-5 bg-card/60">
        {!apiKey && (
          <Link to="/settings" className="block">
            <div className="rounded-lg border border-yellow-500/40 bg-yellow-500/5 p-3 text-xs text-yellow-300 hover:bg-yellow-500/10">
              ⚠️ 설정에서 Gemini API 키를 먼저 등록해주세요 →
            </div>
          </Link>
        )}

        <div className="rounded-md border border-primary/20 bg-primary/5 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-primary mb-1">📖 리포트 구성 (총 100페이지 · 8개 파트)</p>
          <ul className="space-y-0.5 list-disc list-inside">
            <li>PART 0. 오프닝 (5p) — 표지·총평·인생 키워드 5</li>
            <li>PART 1. 인생 총운 (14p) — 격국·용신·오행·대운</li>
            <li>PART 2. 성격과 재능 (8p)</li>
            <li>PART 3. 결혼·연애운 (14p)</li>
            <li>PART 4. 재물·직업운 (14p)</li>
            <li>PART 5. 건강·가족운 (10p)</li>
            <li>PART 6. 현재와 미래 (10p)</li>
            <li>PART 7. 12달 월별 가이드 (24p)</li>
            <li>PART 8. 마무리 (1p)</li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="이름"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="고객 이름" /></Field>
          <Field label="생년월일"><Input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} /></Field>
          <Field label="출생 시간 (모르면 비움)"><Input type="time" value={time} onChange={(e) => setTime(e.target.value)} /></Field>
          <Field label="달력">
            <RadioGroup value={calendar} onValueChange={setCalendar} className="flex gap-3 pt-2">
              {["양력", "음력"].map((v) => (
                <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
              ))}
            </RadioGroup>
          </Field>
          <Field label="성별">
            <RadioGroup value={gender} onValueChange={setGender} className="flex gap-3 pt-2">
              {["여성", "남성"].map((v) => (
                <label key={v} className="flex items-center gap-1.5 text-sm"><RadioGroupItem value={v} />{v}</label>
              ))}
            </RadioGroup>
          </Field>
        </div>

        <Field label="특별 요청사항 (선택)">
          <Textarea
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="예: 이직 시기를 자세히 봐주세요 / 재혼 가능성 위주로"
            className="min-h-[60px]"
          />
        </Field>

        <div className="flex gap-2">
          <Button
            onClick={handleGenerate}
            disabled={loading || !apiKey}
            className="flex-1 bg-gradient-to-r from-primary to-pink-500 text-primary-foreground"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />생성 중... ({progress}%)</>
            ) : hasPartial ? (
              <><Download className="h-4 w-4 mr-2" />이어서 생성 ({completedCount}/{PARTS.length})</>
            ) : (
              <><Download className="h-4 w-4 mr-2" />100p 리포트 생성</>
            )}
          </Button>
          {loading ? (
            <Button onClick={handleStop} variant="destructive" size="lg" title="멈춤 (현재 파트 완료 후)">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSaveOnly} variant="outline" size="lg" title="고객 정보만 저장">
              <Save className="h-4 w-4" />
            </Button>
          )}
        </div>

        {hasPartial && !loading && (
          <div className="flex gap-2">
            <Button onClick={handleDownloadPartial} variant="outline" size="sm" className="flex-1">
              현재까지 ({completedCount}p) PDF 받기
            </Button>
            <Button onClick={resetAll} variant="ghost" size="sm" className="flex-1">
              처음부터 다시
            </Button>
          </div>
        )}

        {loading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-xs text-muted-foreground text-center">{statusMsg}</p>
            <p className="text-[11px] text-muted-foreground text-center">
              ⏱ 약 5~10분 소요됩니다. 창을 닫지 마세요.
            </p>
          </div>
        )}

        <div className="text-[11px] text-muted-foreground border-t border-border/40 pt-3">
          💡 생성 완료 시 새 창이 열리며 자동으로 인쇄 다이얼로그가 뜹니다.
          "대상"을 <b>"PDF로 저장"</b>으로 선택해 다운로드하세요. 다운받은 PDF를 고객 이메일로 전달하시면 됩니다.
        </div>
      </Card>
      </div>
    </PageShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs">{label}</Label>{children}</div>;
}
