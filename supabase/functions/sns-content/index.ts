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
    return `질문: "${question}"\n\n위 질문으로 ${length ?? "60초"} 분량의 숏츠 영상 대본을 만들어주세요.\n톤: ${tone ?? "신비로운"}\n\n형식:\n[씬 1] (0~5초)\n자막: ...\n나레이션: ...\n\n[씬 2] ...\n\n총 4~6개의 씬으로 구성하고, 마지막 씬에는 구독/팔로우 유도 CTA를 넣어주세요.`;
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
