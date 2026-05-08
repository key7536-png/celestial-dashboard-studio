// Proofread ebook: check typos, awkward phrasing, layout issues
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { title, subtitle, blocks } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const text = [
      `제목: ${title || ""}`,
      subtitle ? `부제: ${subtitle}` : "",
      "---",
      ...(blocks || []).map((b: any, i: number) => `[${i}] (${b.type}${b.level ? "/h" + b.level : ""}) ${b.content || ""}`),
    ].filter(Boolean).join("\n");

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "당신은 한국어 전자책 교정 편집자입니다. 오타, 비문, 어색한 표현, 제목과 본문의 일관성, 챕터 순서/구조 문제를 짚어주세요. 간결하고 실용적인 한국어로." },
          { role: "user", content: `다음 전자책 원고를 점검해주세요. 발견된 문제를 항목별로 나열하고, 각 항목은 1~2줄로 짧게.\n\n${text}` },
        ],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: t }), { status: resp.status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const data = await resp.json();
    const report = data?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
