import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
  allowedRoles?: string[];
};

export default function RequireAuth({ children, allowedRoles }: Props) {

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Wrong role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Allowed
  return <>{children}</>;
}