"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Target, 
  Gamepad2, 
  Award, 
  HeartHandshake, 
  CheckCircle, 
  DollarSign, 
  Bell, 
  BarChart3, 
  FileText 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/admin/scores", icon: Target, label: "Scores" },
  { href: "/admin/draws", icon: Gamepad2, label: "Draws" },
  { href: "/admin/prizes", icon: Award, label: "Prizes" },
  { href: "/admin/charities", icon: HeartHandshake, label: "Charities" },
  { href: "/admin/proofs", icon: CheckCircle, label: "Winner Proofs" },
  { href: "/admin/payouts", icon: DollarSign, label: "Payouts" },
  { href: "/admin/notifications", icon: Bell, label: "Notifications" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/admin/audit", icon: FileText, label: "Audit Logs" },
];

export function AdminSidebar({ user }: { user: { name: string; avatarUrl?: string } }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 border-r bg-background h-screen sticky top-0">
        <ScrollArea className="h-full py-6">
          <div className="px-4 space-y-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DC</span>
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                Admin
              </span>
            </div>

            {/* Profile */}
            <div className="p-3 bg-muted rounded-xl border">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatarUrl} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <p className="font-semibold text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Administrator</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center px-3 py-2 rounded-lg transition-all duration-200 w-full
                      ${isActive 
                        ? "bg-orange-50 border-orange-200 text-orange-700 border-l-4 border-orange-500" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-l-4 border-transparent"
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 mr-3 group-hover:scale-110 transition-transform ${isActive ? 'text-orange-500' : ''}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </ScrollArea>
      </aside>

      {/* Mobile Menu */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="sm" className="md:hidden">
            <LayoutDashboard className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <ScrollArea className="h-full">
            {/* Same nav content for mobile */}
            <div className="p-4 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">DC</span>
                </div>
                <span className="font-bold text-xl bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                  Admin
                </span>
              </div>
              
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      group flex items-center px-4 py-3 rounded-xl transition-all duration-200 w-full
                      ${isActive 
                        ? "bg-orange-50 text-orange-700 border-2 border-orange-200" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-2 border-transparent"
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 mr-4 group-hover:scale-110 transition-transform ${isActive ? 'text-orange-500' : ''}`} />
                    <span className="font-semibold">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}

