import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BillingPanel } from "@/modules/billing/components/billing-panel";
import { isStripeConfigured } from "@/modules/billing/service";
import { getCurrentUser } from "@/modules/auth/server";
import { getUserAnalytics } from "@/modules/analytics/service";
import { listPublishedDraws } from "@/modules/draws/service";
import { listScores } from "@/modules/scores/service";

import { formatCurrency, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Dashboard"
};

export default async function DashboardPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  const [analytics, scores, draws] = await Promise.all([
    getUserAnalytics(context.user.id),
    listScores(context.user.id),
    listPublishedDraws()
  ]);

  const latestDraw = draws[0];

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">Your subscription, score window, draw status, and payout activity.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <MetricCard title="Active scores" value={analytics.scoreCount} detail="Maximum of five retained" />
          <MetricCard title="Charity allocation" value={`${analytics.charityPercentage}%`} detail="Tracked from paid invoices" />
          <MetricCard title="Pending payouts" value={formatCurrency(analytics.pendingPayoutCents)} detail="Approved and awaiting payment" />
        </div>
        <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <BillingPanel subscription={context.subscription} configured={isStripeConfigured()} />
          <Card>
            <CardHeader>
              <CardTitle>Latest Draw</CardTitle>
              <CardDescription>Published result visible to eligible participants.</CardDescription>
            </CardHeader>
            <CardContent>
              {latestDraw?.result ? (
                <div>
                  <div className="mb-4 text-sm text-muted-foreground">{latestDraw.month}/{latestDraw.year}</div>
                  <div className="flex flex-wrap gap-2">
                    {latestDraw.result.winningNumbers.map((number) => (
                      <div key={number} className="grid size-11 place-items-center rounded-md bg-muted font-semibold">{number}</div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No draw has been published yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Recent Scores</CardTitle>
          </CardHeader>
          <CardContent>
            {scores.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scores submitted yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {scores.map((score) => (
                  <div key={score.id} className="rounded-md border bg-card px-3 py-2 text-sm">
                    <span className="font-semibold">{score.score}</span>
                    <span className="ml-2 text-muted-foreground">{formatDate(score.date)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
