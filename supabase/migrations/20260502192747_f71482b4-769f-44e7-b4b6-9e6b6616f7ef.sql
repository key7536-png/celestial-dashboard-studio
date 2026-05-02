-- updated_at 자동 갱신 함수 (없으면 생성)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- consultations 테이블
CREATE TABLE public.consultations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '무료상담중',
  ai_response TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 활성화
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 본인 상담만 조회
CREATE POLICY "Users can view their own consultations"
ON public.consultations FOR SELECT
USING (auth.uid() = user_id);

-- 본인 상담만 생성
CREATE POLICY "Users can create their own consultations"
ON public.consultations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 본인 상담만 수정
CREATE POLICY "Users can update their own consultations"
ON public.consultations FOR UPDATE
USING (auth.uid() = user_id);

-- 본인 상담만 삭제
CREATE POLICY "Users can delete their own consultations"
ON public.consultations FOR DELETE
USING (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거
CREATE TRIGGER update_consultations_updated_at
BEFORE UPDATE ON public.consultations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 인덱스
CREATE INDEX idx_consultations_user_id_created_at
ON public.consultations(user_id, created_at DESC);

-- Realtime 활성화
ALTER TABLE public.consultations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultations;