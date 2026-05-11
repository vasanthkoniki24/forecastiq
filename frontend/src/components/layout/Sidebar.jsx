import {
  LayoutDashboard,
  Upload,
  BrainCircuit,
  FileText,
  LogOut
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const navItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard"
  },
  {
    label: "Upload",
    icon: Upload,
    path: "/upload"
  },
  {
    label: "Forecast",
    icon: BrainCircuit,
    path: "/forecast"
  },
  {
    label: "Reports",
    icon: FileText,
    path: "/reports"
  }
];

export default function Sidebar() {
  const navigate = useNavigate();

  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className="
        w-72
        border-r
        border-borderSubtle
        bg-secondaryBg/70
        backdrop-blur-2xl
        p-6
        flex
        flex-col
      "
    >
      <div className="mb-10">
        <h1 className="text-3xl font-display text-cyan">
          ForecastIQ
        </h1>

        <p className="text-textMuted text-sm mt-2">
          Real-time forecasting with SSE, Excel uploads, and advanced model workflows
        </p>
      </div>

      <nav className="space-y-3 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                
                  `flex items-center gap-3
                  px-4 py-3
                  rounded-2xl
                  transition-all duration-300
                  ${
                    isActive
                      ? "bg-cyan/10 border border-cyan/20 text-cyan"
                      : "hover:bg-white/5 text-textMuted"
                  }
                `
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <button
        onClick={handleLogout}
        className="
          flex items-center gap-3
          px-4 py-3
          rounded-2xl
          text-danger
          hover:bg-danger/10
          transition-all duration-300
        "
      >
        <LogOut size={20} />
        Logout
      </button>
    </aside>
  );
}