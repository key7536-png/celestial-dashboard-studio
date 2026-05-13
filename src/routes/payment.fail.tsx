import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/payment/fail")({
  head: () => ({ meta: [{ title: "결제 실패 — 자개빛 천운" }] }),
  component: FailPage,
});

function FailPage() {
  const navigate = useNavigate();
  const [info, setInfo] = useState({ code: "", message: "" });

  useEffect(() => {
    const url = new URL(window.location.href);
    setInfo({
      code: url.searchParams.get("code") || "",
      message: url.searchParams.get("message") || "결제가 취소되었거나 처리에 실패했습니다.",
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{
        background: "linear-gradient(135deg,#faf4ea 0%,#f0e4d4 50%,#ead9e2 100%)",
        fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif",
      }}>
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#e3d3bf] rounded-2xl p-8 shadow-xl text-center">
        <div className="w-14 h-14 mx-auto rounded-full bg-[#d4b8c4] flex items-center justify-center text-white text-2xl mb-4">
          ⚠
        </div>
        <h1 className="text-xl font-semibold text-[#4a3a2e] mb-2">결제가 완료되지 않았습니다</h1>
        <p className="text-sm text-[#7a6a58] mb-6">{info.message}</p>
        {info.code && <p className="text-[11px] text-[#a89888] mb-6">코드: {info.code}</p>}
        <button onClick={() => navigate({ to: "/store" })}
          className="w-full py-2.5 rounded-lg text-white font-medium"
          style={{ background: "linear-gradient(135deg,#c8a9c0,#b8c4d4)" }}>
          상점으로 돌아가기
        </button>
      </div>
    </div>
  );
}
