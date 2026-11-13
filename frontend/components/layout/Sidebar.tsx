
"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  KanbanSquare,
  Users,
  Bell,
  Menu,
  X,
  BriefcaseBusiness,
  LogOut,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Tasks", path: "/tasks", icon: CheckSquare },
  { name: "Board", path: "/board", icon: KanbanSquare },
  { name: "Calendar", path: "/calendar", icon: CalendarDays },
  { name: "Team", path: "/team", icon: Users },
  { name: "Notifications", path: "/notifications", icon: Bell },
];

const API =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api") +
  "/notifications";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    setMounted(true);

    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.name || "User");
      } catch {
        setUserName("User");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out successfully");
    router.replace("/login");
  };

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setUnreadCount(0);
        return;
      }

      const response = await fetch(API, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        setUnreadCount(0);
        return;
      }

      const result = await response.json();

      if (response.ok && result.success) {
        const unread = result.data.filter(
          (notification: { read: boolean }) => !notification.read
        );

        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error("Failed to fetch notification count:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 5000);

    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-white/[0.07] bg-[#0b0b0b]/95 text-white shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-black shadow-lg shadow-orange-500/20">
            <BriefcaseBusiness size={22} />
          </div>

          <div className="hidden sm:block">
            <h2 className="text-lg font-bold tracking-tight">
              Work<span className="text-orange-500">Space</span>
            </h2>
            <p className="text-[10px] tracking-[0.15em] text-zinc-500">
              PROJECT MANAGEMENT
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = mounted && pathname === item.path;
            const isNotification = item.path === "/notifications";

            return (
              <Link
                key={item.path}
                href={item.path}
                className={`relative flex items-center gap-2 rounded-full px-3 py-2.5 text-sm font-medium transition-all duration-200 xl:px-4 ${
                  active
                    ? "bg-orange-500 text-black shadow-lg shadow-orange-500/15"
                    : "text-zinc-400 hover:bg-white/[0.06] hover:text-orange-400"
                }`}
              >
                <span className="relative">
                  <Icon size={17} strokeWidth={active ? 2.5 : 1.8} />

                  {isNotification && unreadCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </span>

                <span>{item.name}</span>

                {isNotification && unreadCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                      active
                        ? "bg-black/15 text-black"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Profile and Logout */}
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <div className="flex items-center gap-3 rounded-full border border-white/[0.07] bg-[#171717] py-2 pl-2 pr-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-700 font-bold text-black">
              {userName.charAt(0).toUpperCase()}
            </div>

            <div>
              <p className="text-sm font-semibold text-white">{userName}</p>
              <p className="text-[10px] text-zinc-500">Workspace Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-white/10 bg-[#171717] px-4 py-3 text-sm font-medium text-zinc-400 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
          aria-expanded={mobileOpen}
          className="rounded-full border border-white/10 bg-[#171717] p-3 text-orange-400 transition hover:bg-orange-500 hover:text-black lg:hidden"
        >
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="border-t border-white/[0.07] bg-[#111111] p-4 lg:hidden">
          <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = mounted && pathname === item.path;
              const isNotification = item.path === "/notifications";

              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`relative flex items-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-orange-500 text-black"
                      : "bg-[#1c1c1c] text-zinc-400 hover:bg-white/10 hover:text-orange-400"
                  }`}
                >
                  <Icon size={17} />
                  <span>{item.name}</span>

                  {isNotification && unreadCount > 0 && (
                    <span className="ml-auto rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Mobile Profile */}
          <div className="mt-4 flex items-center justify-between border-t border-white/[0.07] pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 font-bold text-black">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-zinc-500">Workspace Admin</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
