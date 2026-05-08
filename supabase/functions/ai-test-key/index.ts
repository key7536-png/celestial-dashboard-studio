// Pings Gemini with the user's API key to verify it works.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { apiKey } = await req.json() as { apiKey?: string };
    if (!apiKey) {
      return new Response(JSON.stringify({ ok: false, error: "키가 비어있어요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "ping" }] }],
        generationConfig: { maxOutputTokens: 8 },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      let msg = `Gemini 응답 오류 (${resp.status})`;
      if (resp.status === 400) msg = "키 형식이 잘못되었거나 거부되었어요.";
      if (resp.status === 403) msg = "키 권한 문제예요. Google AI Studio에서 키를 확인해주세요.";
      if (resp.status === 429) msg = "분당 호출 한도를 잠깐 초과했어요. 잠시 후 다시 시도하세요.";
      return new Response(JSON.stringify({ ok: false, error: msg, detail: t.slice(0, 300) }), {
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const json = await resp.json();
    const tier = json?.usageMetadata ? "응답 정상" : "응답 정상";
    return new Response(JSON.stringify({ ok: true, message: `✓ 키가 정상 작동합니다 (${tier})` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
