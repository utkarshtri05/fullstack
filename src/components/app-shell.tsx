import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthContext } from "@/modules/auth/server";
import { BarChart3, Gift, HeartHandshake, LayoutDashboard, Shield, Trophy } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/scores", label: "Scores", icon: BarChart3 },
  { href: "/draws", label: "Draws", icon: Gift },
  { href: "/charity", label: "Charity", icon: HeartHandshake },
  { href: "/winners", label: "Winners", icon: Trophy }
];

export function AppShell({ context, children }: { context: AuthContext; children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-background/90 backdrop-blur lg:block">
        <div className="flex h-full flex-col p-4">
          <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <div className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Gift className="size-5" />
            </div>
            <span className="text-lg font-semibold">DrawCare</span>
          </Link>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Button key={item.href} asChild variant="ghost" className="w-full justify-start">
                <Link href={item.href}>
                  <item.icon />
                  {item.label}
                </Link>
              </Button>
            ))}
            <Button asChild variant="ghost" className="w-full justify-start">
                <Link href="/admin/login">
                  <Shield />
                  Admin Panel
                </Link>
              </Button>
          </nav>
          <div className="mt-auto rounded-lg border bg-card p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                {context.profile.avatarUrl ? <AvatarImage src={context.profile.avatarUrl} alt={context.profile.name} /> : null}
                <AvatarFallback>{context.profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{context.profile.name}</p>
                <p className="truncate text-xs text-muted-foreground">{context.user.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge variant={context.subscription?.status === "active" ? "success" : "outline"}>
                {context.subscription?.status ?? "inactive"}
              </Badge>
              <SignOutButton />
            </div>
          </div>
        </div>
      </aside>
      <main className="lg:pl-64">
        <div className="mx-auto min-h-screen w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <header className="mb-6 flex items-center justify-between rounded-lg border bg-card/80 p-3 lg:hidden">
            <Link href="/dashboard" className="font-semibold">
              DrawCare
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant={context.profile.role === "admin" ? "secondary" : "outline"}>{context.profile.role}</Badge>
              <SignOutButton />
            </div>
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
