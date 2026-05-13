import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "자개빛 천운 — 타로·사주 전문 상담" },
      {
        name: "description",
        content:
          "명리상담사 1급 · 타로상담사 1급 · 타로마스터 1급. 진심으로 읽어드리는 타로/사주 상담과 PDF 리포트.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/store", replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center grid-bg">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
    </div>
  );
}
