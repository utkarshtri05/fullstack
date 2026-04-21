"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CheckCircle, DollarSign, FileText, Gamepad2, HeartHandshake, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin", icon: Gamepad2, label: "Draws" },
  { href: "/admin", icon: HeartHandshake, label: "Charities" },
  { href: "/admin", icon: CheckCircle, label: "Proofs" },
  { href: "/admin", icon: DollarSign, label: "Payouts" },
  { href: "/admin", icon: BarChart3, label: "Analytics" },
  { href: "/admin", icon: FileText, label: "Audit" }
];

export function AdminSidebar({ user }: { user: { name: string; avatarUrl?: string } }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 border-r bg-background lg:block">
      <div className="flex h-full flex-col p-4">
        <div className="mb-6 rounded-lg border bg-card p-3">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">Administrator</p>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
