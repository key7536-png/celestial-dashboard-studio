import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/payment/success")({
  head: () => ({ meta: [{ title: "결제 완료 — 자개빛 천운" }] }),
  component: SuccessPage,
});

type Order = {
  orderId: string;
  productId: string;
  name: string;
  kind: "consult" | "pdf";
  amount: number;
};

function SuccessPage() {
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentKey, setPaymentKey] = useState<string>("");
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    birth: "",
    time: "",
    gender: "여",
    contact: "",
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    setPaymentKey(url.searchParams.get("paymentKey") || "");
    const raw = sessionStorage.getItem("pending_order");
    if (raw) setOrder(JSON.parse(raw));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 시크릿키 등록 후 서버 함수에서 토스 결제 confirm + 정보 저장
    setSubmitted(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-5 py-12"
      style={{
        background:
          "linear-gradient(135deg,#faf4ea 0%,#f0e4d4 50%,#ead9e2 100%)",
        fontFamily: "'Noto Serif KR', 'Nanum Myeongjo', serif",
      }}
    >
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#e3d3bf] rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-6">
          <div
            className="w-14 h-14 mx-auto rounded-full flex items-center justify-center text-white text-2xl mb-4"
            style={{ background: "linear-gradient(135deg,#c8a9c0,#b8c4d4)" }}
          >
            ✓
          </div>
          <h1 className="text-xl font-semibold text-[#4a3a2e]">결제가 완료되었습니다</h1>
          {order && (
            <p className="text-sm text-[#7a6a58] mt-2">
              {order.name} · {order.amount.toLocaleString("ko-KR")}원
            </p>
          )}
        </div>

        {order?.kind === "pdf" ? (
          submitted ? (
            <div className="text-center text-sm text-[#5a4636] leading-relaxed">
              <p>정보가 접수되었습니다.</p>
              <p className="mt-2">
                담당 상담사가 검토 후 <strong>맞춤 PDF 리포트</strong>를 제작하여
                <br />
                기재하신 연락처로 발송드립니다.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <p className="text-[12px] text-[#8a6d5a] mb-2">
                정확한 분석을 위해 아래 정보를 입력해주세요.
              </p>
              <input required placeholder="성함"
                className="w-full border border-[#e3d3bf] rounded-lg px-3 py-2 bg-white"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input required type="date" placeholder="생년월일"
                className="w-full border border-[#e3d3bf] rounded-lg px-3 py-2 bg-white"
                value={form.birth} onChange={(e) => setForm({ ...form, birth: e.target.value })} />
              <input required type="time" placeholder="태어난 시간"
                className="w-full border border-[#e3d3bf] rounded-lg px-3 py-2 bg-white"
                value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
              <div className="flex gap-2">
                {["여", "남"].map((g) => (
                  <button type="button" key={g} onClick={() => setForm({ ...form, gender: g })}
                    className={`flex-1 py-2 rounded-lg border ${
                      form.gender === g
                        ? "bg-[#c8a9c0] text-white border-[#c8a9c0]"
                        : "bg-white border-[#e3d3bf] text-[#6b5a48]"
                    }`}>
                    {g}성
                  </button>
                ))}
              </div>
              <input required placeholder="연락 받으실 카카오톡 ID 또는 이메일"
                className="w-full border border-[#e3d3bf] rounded-lg px-3 py-2 bg-white"
                value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <button type="submit"
                className="w-full mt-2 py-2.5 rounded-lg text-white font-medium"
                style={{ background: "linear-gradient(135deg,#c8a9c0,#b8c4d4)" }}>
                정보 제출하기
              </button>
            </form>
          )
        ) : (
          <div className="space-y-4 text-center">
            <p className="text-sm text-[#5a4636] leading-relaxed">
              상담 예약을 위해 카카오톡 채널로<br />문의 부탁드립니다.
            </p>
            <a href="https://pf.kakao.com/" target="_blank" rel="noreferrer"
              className="block w-full py-3 rounded-lg text-[#3a2e26] font-semibold"
              style={{ background: "#FEE500" }}>
              💬 카카오톡으로 예약하기
            </a>
            {order && (
              <p className="text-[11px] text-[#a89888]">주문번호: {order.orderId}</p>
            )}
          </div>
        )}

        {paymentKey && (
          <p className="mt-6 text-[10px] text-[#b0a090] text-center break-all">
            결제 키: {paymentKey.slice(0, 24)}…
          </p>
        )}
        <button onClick={() => navigate({ to: "/store" })}
          className="mt-6 w-full text-xs text-[#8a6d5a] hover:underline">
          ← 상점으로 돌아가기
        </button>
      </div>
    </div>
  );
}
