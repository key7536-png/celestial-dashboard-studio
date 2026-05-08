// Unified AI generator for chat readings, fortune PDFs, video scripts.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Mode =
  | "saju-personal" | "saju-couple"
  | "tarot-personal" | "tarot-relation" | "tarot-free"
  | "saju-pdf" | "tarot-pdf"
  | "video-tarot" | "video-saju";

function buildPrompt(mode: Mode, data: Record<string, unknown>): { system: string; user: string } {
  const sajuExpert = "당신은 20년 경력의 한국 사주명리 전문가입니다. 따뜻하고 통찰력 있게, 구체적인 조언으로 한국어로 답하세요.";
  const tarotExpert = "당신은 20년 경력의 타로 마스터입니다. 신비롭지만 실용적인 조언으로 한국어 답변하세요.";
  const videoExpert = "당신은 유튜브 운세 채널 전문 작가입니다. 시청자가 끝까지 보게 만드는 후킹 강한 대본을 한국어로 씁니다.";

  switch (mode) {
    case "saju-personal":
      return {
        system: sajuExpert,
        user: `이름: ${data.name}\n생년월일: ${data.birth} (${data.calendar})\n성별: ${data.gender}\n시간: ${data.time ?? "모름"}\n질문: ${data.question}\n\n사주 원국 → 현재 운 → 질문 답변 → 조언 순으로 600자 이상 분석해주세요.`,
      };
    case "saju-couple":
      return {
        system: sajuExpert,
        user: `[나] ${data.myName} / ${data.myBirth}\n[상대] ${data.partnerName} / ${data.partnerBirth}\n질문: ${data.question}\n\n두 사람 사주 궁합을 오행·일주·대운 흐름으로 비교해 600자 이상 분석해주세요.`,
      };
    case "tarot-personal":
      return {
        system: tarotExpert,
        user: `질문: ${data.question}\n뽑힌 카드: ${(data.cards as string[]).join(", ")}\n\n각 카드별 의미 → 종합 해석 → 실천 조언 순으로 답변해주세요.`,
      };
    case "tarot-relation":
      return {
        system: tarotExpert,
        user: `[나의 카드] ${(data.myCards as string[]).join(", ")}\n[상대 카드] ${(data.partnerCards as string[]).join(", ")}\n관계 질문: ${data.question}\n\n양쪽 마음 → 관계 흐름 → 조언 순으로 답변해주세요.`,
      };
    case "tarot-free":
      return {
        system: tarotExpert,
        user: `질문: ${data.question}\n뽑힌 카드: ${data.card}\n\n핵심 메시지를 따뜻하게 200~300자로 답변해주세요.`,
      };
    case "saju-pdf":
      return {
        system: sajuExpert,
        user: `이름: ${data.name} / 생년월일: ${data.birth}(${data.calendar}) / 성별: ${data.gender} / 시간: ${data.time ?? "모름"}\n약 ${data.pages}페이지 분량의 종합 사주 리포트를 만들어주세요.\n\n반드시 아래 섹션을 "## 제목" 형식의 마크다운 헤더로 구분:\n## 1. 사주 원국\n## 2. 대운 흐름\n## 3. 올해 운세\n## 4. 연애·결혼운\n## 5. 재물운\n## 6. 직업운\n## 7. 건강운\n## 8. 총평 및 조언\n각 섹션 충분히 길게 작성.`,
      };
    case "tarot-pdf":
      return {
        system: tarotExpert,
        user: `질문/주제: ${data.question}\n뽑힌 ${data.cardCount}장: ${(data.cards as string[]).join(", ")}\n\n종합 타로 리포트를 마크다운으로 작성:\n## 1. 질문 개요\n## 2. 카드별 상세 해석 (각 카드마다)\n## 3. 종합 메시지\n## 4. 실천 조언\n## 5. 마무리`,
      };
    case "video-tarot":
    case "video-saju": {
      const kind = mode === "video-tarot" ? "타로" : "사주";
      return {
        system: videoExpert,
        user: `주제: ${data.topic}\n영상 길이: ${data.duration}\n톤: ${data.tone}\n\n${kind} 유튜브 영상 대본을 씬별로 작성. 각 씬은 다음 형식:\n\n[씬 1 / 00:00-00:05] 인트로\n나레이션: ...\n자막: ...\n\n인트로 → 본문(여러 씬) → 아웃트로(구독 유도) 구조로 만들어주세요.`,
      };
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { mode, data } = await req.json() as { mode: Mode; data: Record<string, unknown> };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { system, user } = buildPrompt(mode, data);
    const isLong = mode === "saju-pdf" || mode === "tarot-pdf";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: isLong ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash",
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
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
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI 응답 생성 실패" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const content = json?.choices?.[0]?.message?.content ?? "";
    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-generate error:", e);
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
