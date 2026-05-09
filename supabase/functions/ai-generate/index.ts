// Calls Google Gemini API directly with the user's own API key (from settings).
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Mode =
  | "saju-personal" | "saju-couple"
  | "tarot-personal" | "tarot-relation" | "tarot-free"
  | "saju-pdf" | "tarot-pdf"
  | "video-tarot" | "video-saju"
  | "tarot-mz";

function buildPrompt(mode: Mode, data: Record<string, unknown>): { system: string; user: string } {
  const sajuExpert = "당신은 20년 경력의 한국 사주명리 전문가입니다. 카카오톡 채팅 상담에 그대로 복붙할 수 있는 자연스러운 한국어 답변을 친근하면서도 전문적인 톤으로 500~800자 분량으로 작성하세요. 인사·서론은 짧게, 분석과 조언은 구체적으로.";
  const tarotExpert = "당신은 20년 경력의 타로 마스터입니다. 카카오톡 채팅 상담에 그대로 복붙할 수 있는 자연스러운 한국어 답변을 신비롭지만 실용적인 톤으로 작성하세요.";
  const videoExpert = "당신은 유튜브 운세 채널 전문 작가입니다. 시청자가 끝까지 보게 만드는 후킹 강한 대본을 한국어로 씁니다.";

  switch (mode) {
    case "saju-personal":
      return {
        system: sajuExpert,
        user: `이름: ${data.name}\n생년월일: ${data.birth} (${data.calendar})\n성별: ${data.gender}\n시간: ${data.time ?? "모름"}\n질문: ${data.question}\n\n사주원국 → 대운 흐름 → 질문 답변 → 조언 순으로 600자 이상 분석해주세요.`,
      };
    case "saju-couple":
      return {
        system: sajuExpert,
        user: `[나] ${data.myName} / ${data.myBirth}\n[상대] ${data.partnerName} / ${data.partnerBirth}\n질문: ${data.question}\n\n두 사람 사주 궁합을 점수, 잘 맞는 점, 주의점, 관계 조언 순으로 600자 이상 분석해주세요.`,
      };
    case "tarot-personal":
      return {
        system: tarotExpert,
        user: `질문: ${data.question}\n뽑힌 카드: ${(data.cards as string[]).join(", ")}\n\n각 카드 의미 → 종합 해석 → 실천 조언 순으로 답변해주세요.`,
      };
    case "tarot-relation":
      return {
        system: tarotExpert,
        user: `[나의 카드] ${(data.myCards as string[]).join(", ")}\n[상대 카드] ${(data.partnerCards as string[]).join(", ")}\n나의 상황: ${data.mySituation ?? ""}\n질문: ${data.question}\n\n나의 마음 → 상대의 마음 → 관계 흐름 → 조언 순으로 답변해주세요.`,
      };
    case "tarot-free":
      return {
        system: tarotExpert,
        user: `질문: ${data.question}\n뽑힌 카드: ${data.card}\n\n핵심 메시지를 따뜻하게 300자 이내로 답변해주세요.`,
      };
    case "saju-pdf":
      return {
        system: sajuExpert,
        user: `이름: ${data.name} / 생년월일: ${data.birth}(${data.calendar}) / 성별: ${data.gender} / 시간: ${data.time ?? "모름"}\n특별 요청: ${data.request ?? "없음"}\n약 ${data.pages}페이지 분량의 종합 사주 리포트를 만들어주세요.\n\n반드시 아래 섹션을 "## 제목" 형식의 마크다운 헤더로 구분:\n## 1. 사주 원국\n## 2. 대운 흐름\n## 3. 올해 운세\n## 4. 연애·결혼운\n## 5. 재물운\n## 6. 직업운\n## 7. 건강운\n## 8. 총평 및 조언\n각 섹션을 충분히 길고 자세하게 작성.`,
      };
    case "tarot-pdf":
      return {
        system: tarotExpert,
        user: `이름: ${data.name ?? ""}\n질문/주제: ${data.question}\n뽑힌 ${data.cardCount}장: ${(data.cards as string[]).join(", ")}\n스타일: ${data.style ?? "전문적"}\n\n상세한 종합 타로 리포트를 마크다운으로 작성:\n## 1. 질문 개요\n## 2. 카드별 상세 해석 (각 카드마다)\n## 3. 카드 조합 의미\n## 4. 종합 메시지\n## 5. 앞으로의 조언`,
      };
    case "video-tarot": {
      const groups = data.groups as { name: string; cards: string[] }[];
      const groupLines = groups.map((g, i) => `그룹${i + 1}: ${g.cards.join(", ")}`).join("\n");
      return {
        system: "당신은 유튜브 타로 크리에이터입니다. Pick a Card 영상 스크립트를 작성합니다.",
        user: `채널명: ${data.channel}\n영상 제목: ${data.title}\n주제: ${data.topic ?? "일반 타로"}\n\n카드 구성:\n${groupLines}\n\n다음 구조로 영상 스크립트를 작성해주세요. 각 섹션은 정확히 "---" 줄로 구분하세요.\n\n[인트로]\n인사 + 영상 소개 + 4그룹 중 직감으로 끌리는 카드 선택 안내. 끝에 "이번 영상이 도움 되셨다면 고정댓글의 개인 상담 링크도 확인해보세요" 멘트 포함. (250~350자)\n\n---\n\n[그룹 1]\n그룹 1을 선택한 분에게. 카드 3장 각 의미 + 종합 메시지. (300~400자) 끝에 "구독·좋아요·알람 설정 부탁드려요" 포함.\n\n---\n\n[그룹 2]\n동일 구조 (300~400자) 끝에 "구독·좋아요·알람 설정 부탁드려요" 포함.\n\n---\n\n[그룹 3]\n동일 구조 (300~400자) 끝에 "구독·좋아요·알람 설정 부탁드려요" 포함.\n\n---\n\n[그룹 4]\n동일 구조 (300~400자) 끝에 "구독·좋아요·알람 설정 부탁드려요" 포함.\n\n섹션 제목([인트로], [그룹 1] 등)은 그대로 유지하고 그 아래 본문만 작성하세요.`,
      };
    }
    case "video-saju": {
      const ilgan = ["甲(갑)","乙(을)","丙(병)","丁(정)","戊(무)","己(기)","庚(경)","辛(신)","壬(임)","癸(계)"];
      const sections = ilgan.map(i => `\n---\n\n[${i} 일간]\n${i} 일간 운세 (200~300자). 끝에 "구독·좋아요·알람 설정 부탁드려요" 포함.`).join("");
      return {
        system: "당신은 사주명리학 전문 유튜버입니다. 일간별 운세 영상 스크립트를 작성합니다.",
        user: `채널명: ${data.channel}\n주제: ${data.topic}\n\n다음 11개 섹션으로 스크립트를 작성해주세요. 각 섹션은 정확히 "---" 줄로 구분하세요.\n\n[인트로]\n인사 + 오늘 영상 소개 + 10개 일간 안내 + 본인 일간 모를 경우 만세력 검색 안내. 끝에 "고정댓글에 타임라인과 개인 사주 상담 링크가 있어요" 멘트 포함. (250~350자)\n${sections}\n\n섹션 제목은 그대로 유지하고 그 아래 본문만 작성하세요.`,
      };
    }
    case "tarot-mz":
      return {
        system: "당신은 MZ세대(20-30대)가 좋아하는 친근한 타로 리더입니다. 공감 가는 한국어 반말 섞인 친근체로, 너무 점쟁이같지 않고 친한 언니/오빠 톤으로 작성하세요. 이모지 적당히, 솔직하고 따뜻하게.",
        user: `고객 닉네임: ${data.nickname || "고객"}\n질문: ${data.question}\n뽑힌 카드 3장: ${(data.cards as string[]).join(", ")}\n\n이 카드 조합으로 MZ톤 타로 리딩을 작성해주세요.\n\n[작성 지침]\n- 각 카드별로 최소 150자 이상 상세하게 해설해줘.\n- 절대 중간에 끊지 말고 완성된 문장으로 마무리해.\n- 전체 분량은 최소 600자 이상.\n- 마지막은 따뜻한 응원으로 마무리.`,
      };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { mode, data, apiKey } = await req.json() as { mode: Mode; data: Record<string, unknown>; apiKey?: string };
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "설정에서 Gemini API 키를 먼저 등록해주세요." }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { system, user } = buildPrompt(mode, data);
    const isLong = mode === "saju-pdf" || mode === "tarot-pdf";
    const model = isLong ? "gemini-2.5-pro" : "gemini-2.5-flash";

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: isLong ? 8192 : 2048 },
      }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      let msg = "Gemini API 호출 실패";
      if (response.status === 400) msg = "API 키가 유효하지 않거나 요청이 잘못되었습니다.";
      if (response.status === 403) msg = "API 키 권한 문제입니다. Google AI Studio에서 키를 확인해주세요.";
      if (response.status === 429) msg = "Gemini 무료 한도를 초과했습니다. 잠시 후 다시 시도해주세요.";
      return new Response(JSON.stringify({ error: msg, detail: t }), {
        status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const content = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? "").join("") ?? "";
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
