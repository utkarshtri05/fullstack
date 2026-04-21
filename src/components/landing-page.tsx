"use client";

import { motion } from "motion/react";
import { ArrowRight, BarChart3, Check, Gift, HeartHandshake, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminPanelLink } from "@/components/admin-panel-link";

const features = [
  "Stripe subscription gating",
  "Audited draw publishing",
  "Winner verification workflow",
  "Charity contribution tracking"
];

export function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden">
      <section className="mesh-bg relative flex min-h-screen items-center px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }} className="max-w-2xl">
            <Badge variant="secondary" className="mb-5">
              <Sparkles className="mr-1 size-3" />
              Production draw operations
            </Badge>
            <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl lg:text-7xl">DrawCare</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              Subscription-backed score entry, monthly draw simulation, prize distribution, charity allocation, and winner payout controls in one secure SaaS workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Start now
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <AdminPanelLink />
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="size-4 text-primary" />
                  {feature}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="rounded-lg border bg-card shadow-glow">
              <div className="flex items-center justify-between border-b p-4">
                <div>
                  <p className="text-sm font-semibold">Operations Console</p>
                  <p className="text-xs text-muted-foreground">Live production controls</p>
                </div>
                <Badge variant="success">secured</Badge>
              </div>
              <div className="grid gap-4 p-4 md:grid-cols-2">
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <BarChart3 className="size-4 text-primary" />
                    Score intake
                  </div>
                  <div className="mt-4 flex items-end gap-2">
                    {[38, 66, 44, 88, 72, 96].map((height, index) => (
                      <div key={index} className="w-full rounded-t bg-primary/80" style={{ height }} />
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gift className="size-4 text-secondary" />
                    Winning numbers
                  </div>
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {[7, 14, 22, 31, 44].map((number) => (
                      <div key={number} className="grid aspect-square place-items-center rounded-md bg-muted text-sm font-semibold">
                        {number}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HeartHandshake className="size-4 text-accent" />
                    Charity mix
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-2 rounded bg-primary" style={{ width: "72%" }} />
                    <div className="h-2 rounded bg-secondary" style={{ width: "54%" }} />
                    <div className="h-2 rounded bg-accent" style={{ width: "38%" }} />
                  </div>
                </div>
                <div className="rounded-lg border bg-background p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Trophy className="size-4 text-warning" />
                    Winner flow
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs">
                    <Badge variant="warning">Pending</Badge>
                    <ArrowRight className="size-3" />
                    <Badge variant="success">Approved</Badge>
                    <ArrowRight className="size-3" />
                    <Badge>Paid</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-sm text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Auth, RLS, webhook verification, and role checks are enforced server-side.
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
