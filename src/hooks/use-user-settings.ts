import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export interface UserSettings {
  gemini_api_key: string | null;
  kakao_channel_url: string | null;
}

export function useUserSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_settings")
      .select("gemini_api_key, kakao_channel_url")
      .eq("user_id", user.id)
      .maybeSingle();
    setSettings(data ?? { gemini_api_key: null, kakao_channel_url: null });
    setLoading(false);
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  return { settings, loading, reload };
}

export async function saveUserSettings(userId: string, patch: Partial<UserSettings>) {
  const { error } = await supabase
    .from("user_settings")
    .upsert({ user_id: userId, ...patch }, { onConflict: "user_id" });
  if (error) throw error;
}
