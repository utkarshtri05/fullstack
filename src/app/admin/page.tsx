import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { getAdminMetrics } from "@/modules/analytics/service";
import { AdminScoreChart } from "@/modules/analytics/components/admin-score-chart";
import { AdminConsole } from "@/modules/admin/components/admin-console";
import { getCurrentUser } from "@/modules/auth/server";
import { listCharities } from "@/modules/charity/service";
import { listDraws } from "@/modules/draws/service";
import { listPendingProofs } from "@/modules/winners/service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Dashboard"
};

export default async function AdminDashboardPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  if (context.profile.role !== "admin") {
    redirect("/dashboard");
  }

  const [metrics, draws, charities, pendingProofs] = await Promise.all([
    getAdminMetrics(),
    listDraws(),
    listCharities(),
    listPendingProofs()
  ]);

  return (
    <AppShell context={context}>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-xl text-muted-foreground mt-2">Full system control center</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <MetricCard title="Total Users" value={metrics.userCount} trend="+12%" />
          <MetricCard title="Active Subs" value={metrics.activeSubscriptions} trend="+8%" />
          <MetricCard title="Revenue" value={formatCurrency(metrics.pendingPayoutCents)} />
          <MetricCard title="Pending Proofs" value={pendingProofs.length} />
          <MetricCard title="Published Draws" value={metrics.publishedDraws} />
        </div>
        <AdminScoreChart data={metrics.scoreSeries} />
        <AdminConsole draws={draws} charities={charities} pendingProofs={pendingProofs} />
      </div>
    </AppShell>
  );
}

