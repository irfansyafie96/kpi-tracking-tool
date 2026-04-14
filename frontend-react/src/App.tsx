import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { PmEvaluationPage } from "@/pages/PmEvaluationPage";
import { KpiSetupPage } from "@/pages/KpiSetupPage";
import { AdminUsersPage } from "@/pages/AdminUsersPage";
import { EmployeeProfilePage } from "@/pages/EmployeeProfilePage";

function HomeRedirect() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");
  if (!token || !user) return <Navigate to="/login" replace />;
  const u = JSON.parse(user);
  const map: Record<string, string> = { PM: "/pm", PD: "/pd", BA: "/employee", QA: "/employee" };
  return <Navigate to={map[u.role] || "/"} replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <div className="min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/pm" element={<ProtectedRoute roles={["PM"]}><PmEvaluationPage /></ProtectedRoute>} />
            <Route path="/pd" element={<ProtectedRoute roles={["PD"]}><DashboardPage /></ProtectedRoute>} />
            <Route path="/pd/kpi-setup" element={<ProtectedRoute roles={["PD"]}><KpiSetupPage /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute roles={["PD"]}><AdminUsersPage /></ProtectedRoute>} />
            <Route path="/employee/:id" element={<ProtectedRoute><EmployeeProfilePage /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
