// Streaming ebook generator using Lovable AI Gateway
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { subject, pages = 30, category = "타로" } = await req.json();
    if (!subject) {
      return new Response(JSON.stringify({ error: "subject is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const blockCount = Math.max(6, Math.min(40, Math.round(pages / 2.5)));

    const systemPrompt = `당신은 20년 경력의 한국 ${category} 명리 전문가 "타로냥"입니다.
독자가 끝까지 읽고 싶어지는 신비롭고 감성적인 전자책을 한국어로 작성합니다.
출력은 반드시 마크다운 형식이며, 각 챕터/소제목은 # 또는 ## 로 시작하고 본문은 충분히 풍부하게 작성합니다.`;

    const userPrompt = `다음 주제로 약 ${pages}페이지 분량 (${blockCount}개 블록)의 전자책을 작성해주세요.

분야: ${category}
주제: ${subject}

구조:
1. # 제목 (한 줄)
2. ## 서문
3. ## 챕터 1, 2, 3 ... (각 챕터 안에 ### 소제목 포함 가능)
4. ## 마무리

각 ## 블록은 3~6문단의 충실한 본문을 포함하세요. 코드 블록이나 표는 사용하지 마세요.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "요청이 많습니다. 잠시 후 다시 시도해주세요." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI 크레딧이 부족합니다. 워크스페이스에 크레딧을 추가해주세요." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 게이트웨이 오류" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ebook-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
