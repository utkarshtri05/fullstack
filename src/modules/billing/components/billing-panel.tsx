"use client";

import { CreditCard, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subscription } from "@/db/schema";
import { formatDate } from "@/lib/utils";

type BillingPanelProps = {
  subscription: Subscription | null;
  configured?: boolean;
};

export function BillingPanel({ subscription, configured = true }: BillingPanelProps) {
  const [loading, setLoading] = useState<"monthly" | "yearly" | "portal" | null>(null);
  const active = subscription?.status === "active" && subscription.currentPeriodEnd.getTime() > Date.now();

  async function startCheckout(plan: "monthly" | "yearly") {
    setLoading(plan);
    const response = await fetch("/api/subscription/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = (await response.json()) as { url?: string; error?: { message: string } };
    setLoading(null);

    if (!response.ok || !data.url) {
      toast.error(data.error?.message ?? "Unable to start checkout");
      return;
    }

    window.location.href = data.url;
  }

  async function openPortal() {
    setLoading("portal");
    const response = await fetch("/api/subscription/portal", { method: "POST" });
    const data = (await response.json()) as { url?: string; error?: { message: string } };
    setLoading(null);

    if (!response.ok || !data.url) {
      toast.error(data.error?.message ?? "Unable to open billing portal");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="size-5 text-primary" />
          Subscription
        </CardTitle>
        <CardDescription>Server-side billing gates keep score entry and draw participation tied to Stripe status.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={active ? "success" : "outline"}>{subscription?.status ?? "inactive"}</Badge>
          {subscription ? (
            <span className="text-sm text-muted-foreground">
              {subscription.planType} renews {formatDate(subscription.currentPeriodEnd)}
            </span>
          ) : !configured ? (
            <span className="text-sm text-muted-foreground">Stripe is not configured on this deployment yet.</span>
          ) : (
            <span className="text-sm text-muted-foreground">Choose a plan to unlock score entry.</span>
          )}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          <Button onClick={() => startCheckout("monthly")} disabled={loading !== null || active || !configured}>
            {loading === "monthly" ? <Loader2 className="animate-spin" /> : null}
            Monthly
          </Button>
          <Button variant="secondary" onClick={() => startCheckout("yearly")} disabled={loading !== null || active || !configured}>
            {loading === "yearly" ? <Loader2 className="animate-spin" /> : null}
            Yearly
          </Button>
          <Button variant="outline" onClick={openPortal} disabled={loading !== null || !subscription || !configured}>
            {loading === "portal" ? <Loader2 className="animate-spin" /> : null}
            Portal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
