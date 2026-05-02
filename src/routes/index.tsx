import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "자개빛 — 타로/사주 전문가 대시보드" },
      { name: "description", content: "20년 명리 전문가의 운영 도구. 상담, 콘텐츠, SNS 홍보를 한 곳에서." },
    ],
  }),
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    navigate({ to: user ? "/dashboard" : "/auth", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
