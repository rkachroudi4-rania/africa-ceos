"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Newspaper,
  Search,
  Settings,
  Shield,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/search", label: "Search", icon: Search },
  { href: "/messages", label: "Messaging", icon: MessageSquare },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data } = useSession();
  const [open, setOpen] = useState(false);
  const isAdmin = data?.user?.role === "ADMIN";

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {links.map((link) => {
        const Icon = link.icon;
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
              active ? "bg-white/10 text-white" : "text-navy-100 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4" />
            {link.label}
          </Link>
        );
      })}
      {isAdmin ? (
        <Link
          href="/admin"
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
            pathname.startsWith("/admin") ? "bg-white/10 text-white" : "text-navy-100 hover:bg-white/5 hover:text-white",
          )}
        >
          <Shield className="h-4 w-4" />
          Administration
        </Link>
      ) : null}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#F4F7FB]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-navy p-4 text-white lg:flex">
        <Link href="/dashboard" className="mb-8 px-2 text-lg font-semibold tracking-tight">
          Africa CEOs
        </Link>
        {nav}
        <Button
          variant="ghost"
          className="mt-auto justify-start text-navy-100 hover:bg-white/10 hover:text-white"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="font-semibold text-navy">
          Africa CEOs
        </Link>
        <Button variant="outline" size="icon" onClick={() => setOpen((v) => !v)}>
          <Menu className="h-4 w-4" />
        </Button>
      </header>
      {open ? (
        <div className="fixed inset-0 z-40 bg-navy p-4 lg:hidden">
          <div className="mb-6 flex items-center justify-between text-white">
            <span className="font-semibold">Menu</span>
            <Button variant="ghost" className="text-white" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
          {nav}
        </div>
      ) : null}

      <div className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
