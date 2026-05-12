import { supabase } from "@/integrations/supabase/client";

export type AiMode =
  | "saju-personal" | "saju-couple"
  | "tarot-personal" | "tarot-relation" | "tarot-free"
  | "saju-pdf" | "tarot-pdf"
  | "video-tarot" | "video-saju"
  | "tarot-mz"
  | "saju-100-part";

export async function callAI(mode: AiMode, data: Record<string, unknown>, apiKey: string | null | undefined): Promise<string> {
  if (!apiKey) {
    throw new Error("설정에서 Gemini API 키를 먼저 등록해주세요.");
  }
  const { data: res, error } = await supabase.functions.invoke("ai-generate", {
    body: { mode, data, apiKey },
  });
  if (error) {
    // try to surface server error message
    const serverMsg = (res as { error?: string } | null)?.error;
    throw new Error(serverMsg || error.message || "AI 호출 실패");
  }
  return (res as { content: string }).content ?? "";
}
