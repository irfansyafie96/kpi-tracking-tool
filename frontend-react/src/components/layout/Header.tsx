import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, User, LogOut, LayoutDashboard, Settings } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "PM": return "/pm";
      case "PD": return "/pd";
      case "BA":
      case "QA": return `/employee/${user.id}`;
      default: return "/";
    }
  };

  const getRoleDisplay = () => {
    if (!user) return "";
    switch (user.role) {
      case "PM": return "Project Manager";
      case "PD": return "Project Director";
      case "BA": return "Business Analyst";
      case "QA": return "Quality Assurance";
      default: return user.role;
    }
  };

  return (
    <nav className="bg-teal-600 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="font-semibold text-lg">KPI Tool</Link>

          {user ? (
            <>
              <div className="hidden md:flex items-center gap-4">
                <Link to={getDashboardLink()} className="text-sm hover:text-teal-200 transition">
                  Dashboard
                </Link>
                {user.role === "PD" && (
                  <>
                    <Link to="/pd/kpi-setup" className="text-sm hover:text-teal-200 transition">
                      KPI Setup
                    </Link>
                    <Link to="/admin/users" className="text-sm hover:text-teal-200 transition">
                      User Management
                    </Link>
                  </>
                )}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 text-sm hover:text-teal-200 transition"
                  >
                    <User size={16} />
                    {user.name}
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                      >
                        <LogOut size={14} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              {menuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-teal-700 border-t border-teal-800 p-4 flex flex-col gap-3">
                  <Link to={getDashboardLink()} className="text-sm hover:text-teal-200" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  {user.role === "PD" && (
                    <>
                      <Link to="/pd/kpi-setup" className="text-sm hover:text-teal-200" onClick={() => setMenuOpen(false)}>
                        KPI Setup
                      </Link>
                      <Link to="/admin/users" className="text-sm hover:text-teal-200" onClick={() => setMenuOpen(false)}>
                        User Management
                      </Link>
                    </>
                  )}
                  <button onClick={handleLogout} className="text-left text-sm text-red-300 hover:text-red-200">
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className="text-sm hover:text-teal-200 transition">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
