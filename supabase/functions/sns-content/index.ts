// SNS content generator using Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT =
  "당신은 20년 경력의 타로/사주 전문가 타로냥입니다. 한국의 MZ세대가 즐겨보는 신비롭고 감각적인 SNS 콘텐츠를 만드는 전문가입니다. 질문에 맞는 타로/사주 콘텐츠를 한국어로 생성하세요.";

function buildUserPrompt(payload: any): string {
  const { contentType, question, options } = payload;
  if (contentType === "shorts") {
    const { length, tone } = options ?? {};
    return `질문: "${question}"\n\n위 질문으로 ${length ?? "60초"} 분량의 타로냥 쇼츠 영상 대본을 만들어주세요.\n톤: ${tone ?? "신비롭고 다정한"}\n\n[브랜드 비주얼 가이드 — 모든 씬에 일관 적용]\n- 배경: 신비롭고 아늑한 타로 공간 (보라색·남색 조명, 반짝이는 소품, 캔들, 몽환적 안개)\n- 의상: 벨벳·레이스·보석 디테일의 세련된 타로냥 룩\n- BGM: 잔잔하면서도 신비로운 앰비언트\n- 효과음: 타로 카드 펼치는 소리, 별 반짝임, 마법봉 휘두르는 소리\n- 자막: MZ 감성 폰트, 이모지 적극 활용 (✨🔮🌙💫🃏)\n- 화면 전환: 부드러운 페이드/디졸브, 핵심 메시지에서 클로즈업\n- 표정/제스처: 친근하고 다정, 결정적 순간엔 카리스마\n\n[출력 형식 — 반드시 아래 구조로]\n[씬 1] (0~5초) 🎬 훅\n- 배경: ...\n- 의상/소품: ...\n- 카메라: (와이드/클로즈업/탑샷 등)\n- 표정·제스처: ...\n- 자막(이모지 포함): ...\n- 나레이션: ...\n- BGM: ...\n- 효과음: ...\n\n[씬 2] (5~15초) ...\n[씬 3] ...\n[씬 4] ...\n[씬 5 — CTA] 구독·팔로우 유도\n\n총 4~6개의 씬으로 구성. 첫 3초 내 강력한 훅 필수. 별표(*) 같은 마크다운 강조 기호는 사용하지 마세요.`;
  }
  if (contentType === "thread") {
    const { count, hashtags } = options ?? {};
    return `질문: "${question}"\n\n위 질문으로 쓰레드(스레드) ${count ?? 5}개를 작성해주세요.\n각 게시물은 280자 이내로 자연스럽게 이어지도록 작성합니다.\n\n형식:\n1/${count ?? 5}\n(본문)\n\n2/${count ?? 5}\n(본문)\n...\n\n${hashtags ? "마지막에 적절한 해시태그 5~8개를 한 줄로 추천해주세요." : "해시태그는 포함하지 마세요."}`;
  }
  if (contentType === "caption") {
    const { mood, emoji } = options ?? {};
    return `질문: "${question}"\n\n위 질문으로 인스타그램 캡션 3가지를 작성해주세요.\n분위기: ${mood ?? "신비로운"}\n${emoji ? "이모지를 자연스럽게 포함" : "이모지는 최소화"}\n\n형식:\n[제안 1]\n(캡션)\n\n[제안 2]\n(캡션)\n\n[제안 3]\n(캡션)\n\n각 캡션은 100~200자 사이.`;
  }
  return `질문: ${question}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const payload = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    if (!payload?.question) {
      return new Response(JSON.stringify({ error: "질문이 필요합니다." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserPrompt(payload) },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status, await response.text());
      return new Response(JSON.stringify({ error: "AI 응답 생성 실패" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? "";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("sns-content error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
