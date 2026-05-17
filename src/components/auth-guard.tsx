import { useEffect, useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { isAuthed } from "@/lib/dashboard-auth";

// Routes accessible without password
const PUBLIC_ROUTES = ["/login", "/shop", "/taronyang"];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const isPublic = PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + "/"));
    if (!isPublic && !isAuthed()) {
      navigate({ to: "/login", replace: true });
      return;
    }
    setReady(true);
  }, [pathname, navigate]);

  if (!ready) return null;
  return <>{children}</>;
}
