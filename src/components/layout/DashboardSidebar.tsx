"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  Dumbbell,
  Users,
  CalendarDays,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const navItems = [
  { href: "/", label: "首页", icon: LayoutDashboard },
  { href: "/athletes", label: "运动员管理", icon: Users },
  { href: "/exercises", label: "动作库", icon: Dumbbell },
  { href: "/programs", label: "训练计划", icon: BookOpen },
  { href: "/calendar", label: "训练日历", icon: CalendarDays },
  { href: "/settings", label: "设置", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "flex flex-col border-r bg-white transition-all duration-200",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        {!collapsed && (
          <Link href="/" className="text-lg font-bold text-indigo-600">
            体能训练平台
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto", collapsed && "mx-auto")}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                ? "bg-indigo-50 text-indigo-600"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {!collapsed && item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t p-2">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-red-50 hover:text-red-600"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed && "退出登录"}
        </button>
      </div>
    </aside>
  )
}
