import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "환불규정 — 자개빛 천운" },
      { name: "description", content: "자개빛 천운 상담 및 PDF 리포트 환불 규정 안내." },
    ],
  }),
  component: RefundPolicy,
});

function RefundPolicy() {
  return (
    <div className="min-h-screen px-5 py-14"
      style={{
        background: "linear-gradient(135deg,#faf4ea 0%,#f0e4d4 60%,#ead9e2 100%)",
        fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif",
        color: "#3a2e26",
      }}>
      <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border border-[#e3d3bf] rounded-2xl p-8 md:p-10 shadow-lg">
        <Link to="/store" className="text-xs text-[#8a6d5a] hover:underline">← 상점으로</Link>
        <h1 className="text-2xl font-semibold mt-4 mb-2">환불 규정</h1>
        <p className="text-sm text-[#7a6a58] mb-8">자개빛 천운 (JAGAEBIT)</p>

        <ol className="space-y-6 text-[15px] leading-relaxed">
          <li>
            <h2 className="font-semibold text-[#5a4636] mb-1">1. 상담 시작 전</h2>
            <p className="text-[#5a4636]">결제 후 상담이 시작되기 전이라면 <strong>100% 전액 환불</strong>이 가능합니다. 카카오톡 채널로 환불 요청을 남겨주세요.</p>
          </li>
          <li>
            <h2 className="font-semibold text-[#5a4636] mb-1">2. 상담 시작 후</h2>
            <p className="text-[#5a4636]">상담이 1분이라도 시작된 이후에는 <strong>환불이 불가</strong>합니다. 시간 내 충분히 질문해주세요.</p>
          </li>
          <li>
            <h2 className="font-semibold text-[#5a4636] mb-1">3. PDF 리포트</h2>
            <p className="text-[#5a4636]">생년월일시 등 정보를 제출하여 <strong>리포트 제작이 시작된 이후</strong>에는 환불이 불가합니다. 정보 제출 전에는 100% 환불이 가능합니다.</p>
          </li>
          <li>
            <h2 className="font-semibold text-[#5a4636] mb-1">4. 문의</h2>
            <p className="text-[#5a4636]">
              환불 및 기타 문의는 <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer" className="text-[#a98ba8] underline">카카오톡 채널</a>로 연락 부탁드립니다.
            </p>
          </li>
        </ol>

        <p className="mt-10 text-[12px] text-[#a89888]">
          본 환불 규정은 「전자상거래 등에서의 소비자보호에 관한 법률」 및 관련 약관을 준수합니다.
        </p>
      </div>
    </div>
  );
}
