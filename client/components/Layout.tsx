import { Link, useLocation } from "react-router-dom";
import {
  Eye,
  Glasses,
  Users,
  Plus,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: Users },
    { path: "/patients", label: "All Patients", icon: Users },
    { path: "/new-patient", label: "New Patient", icon: Plus },
    { path: "/appointments", label: "Appointments", icon: Calendar },
    { path: "/reports", label: "Reports", icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-background md:flex-row flex-col">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col hidden md:flex`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-sidebar-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-lg text-primary-foreground">
                <Eye size={20} />
              </div>
              <div>
                <h1 className="font-bold text-sm text-sidebar-foreground">
                  OptiCare
                </h1>
                <p className="text-xs text-sidebar-accent-foreground opacity-60">
                  Pro
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-2">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive(path)
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Icon size={20} />
              {sidebarOpen && (
                <span className="text-sm font-medium">{label}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-6 border-t border-sidebar-border">
          <button
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors`}
          >
            <Settings size={20} />
            {sidebarOpen && (
              <span className="text-sm font-medium">Settings</span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="h-16 border-b border-border bg-background px-4 md:px-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground hidden md:block">
              Welcome back
            </p>
            <h2 className="text-base md:text-lg font-semibold text-foreground">
              Practice Management
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs md:text-sm font-semibold text-primary">
                DR
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
};
