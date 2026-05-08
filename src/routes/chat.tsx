import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/chat")({
  head: () => ({ meta: [{ title: "채팅 상담 — 자개빛" }] }),
  component: () => <Outlet />,
});
