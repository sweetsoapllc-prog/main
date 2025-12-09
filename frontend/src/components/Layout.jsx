import { Link, useLocation } from "react-router-dom";
import { Home, MessageCircle, CheckSquare, Calendar, DollarSign, CalendarDays, Brain } from "lucide-react";

export default function Layout({ children }) {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/chat", icon: MessageCircle, label: "Chat" },
    { path: "/tasks", icon: CheckSquare, label: "Tasks" },
    { path: "/brain-offload", icon: Brain, label: "Offload" },
    { path: "/routines", icon: Calendar, label: "Routines" },
    { path: "/bills", icon: DollarSign, label: "Bills" },
    { path: "/weekly", icon: CalendarDays, label: "Weekly" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-[#F0EFEA]">
      {/* App Title */}
      <div className="fixed top-6 left-6 z-50 flex items-center gap-2">
        <div className="text-stone-700">
          <h1 className="text-xl font-fraunces font-light">The Attic Mind</h1>
          <p className="text-xs text-stone-500">Declutter your mind. Keep your peace.</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-sm px-4 py-3">
        <ul className="flex gap-2" data-testid="main-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-white shadow-sm"
                      : "text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  <Icon strokeWidth={1.5} size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Content */}
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">{children}</main>
    </div>
  );
}