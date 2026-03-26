import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

type RequireAuthProps = {
  children: ReactNode;
  allowedRoles?: string[];
};

export default function RequireAuth({ children, allowedRoles }: RequireAuthProps) {
  const [status, setStatus] = useState<"loading" | "authed" | "unauth">("loading");

  useEffect(() => {
    let isMounted = true;

    fetch("http://localhost:8000/api/check-auth/", {
      credentials: "include",
    })
      .then(async (res) => {
        if (!isMounted) return;

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        const hasIdentity = Boolean(data && (data.username || data.role));
        const hasError =
          Boolean(data && (data.error || data.detail || data.non_field_errors));

        const isAuthed = res.ok && data && hasIdentity && !hasError;

        // ✅ ROLE CHECK
        if (isAuthed && allowedRoles && !allowedRoles.includes(data.role)) {
          setStatus("unauth");
          return;
        }

        setStatus(isAuthed ? "authed" : "unauth");
      })
      .catch(() => {
        if (!isMounted) return;
        setStatus("unauth");
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (status === "loading") {
    return <div className="container mt-4">Checking authentication...</div>;
  }

  if (status === "unauth") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}