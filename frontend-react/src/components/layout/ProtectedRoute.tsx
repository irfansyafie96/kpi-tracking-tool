import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const dashMap: Record<string, string> = {
      PM: "/pm",
      PD: "/pd",
      BA: "/employee",
      QA: "/employee",
    };
    return <Navigate to={dashMap[user.role] || "/"} replace />;
  }

  return <>{children}</>;
}
