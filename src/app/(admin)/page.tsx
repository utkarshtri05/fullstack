import { AppShell } from "@/components/app-shell";
import { MetricCard } from "@/components/metric-card";
import { getAdminMetrics } from "@/modules/analytics/service";
import { AdminScoreChart } from "@/modules/analytics/components/admin-score-chart";
import { AdminConsole } from "@/modules/admin/components/admin-console";
import { requireAdmin } from "@/modules/auth/server";
import { listCharities } from "@/modules/charity/service";
import { listDraws } from "@/modules/draws/service";
import { listPendingProofs } from "@/modules/winners/service";
import { formatCurrency } from "@/lib/utils";
import { Suspense } from "react";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Dashboard"
};

export default async function AdminDashboardPage() {
  const context = await requireAdmin();

  return (
    <AppShell context={context}>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
            <p className="mt-1 text-muted-foreground text-lg">
              Welcome back, {context.profile.name}. Manage your platform.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              Admin Mode Active
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          <Suspense fallback={<MetricCard.Skeleton />}>
            <MetricCard title="Total Users" value="$2,340" change="+12%" changeType="positive" />
          </Suspense>
          <Suspense fallback={<MetricCard.Skeleton />}>
            <MetricCard title="Active Subs" value="127" change="-2%" changeType="negative" />
          </Suspense>
          <Suspense fallback={<MetricCard.Skeleton />}>
            <MetricCard title="Revenue" value="$12.5k" change="+20%" changeType="positive" />
          </Suspense>
          <Suspense fallback={<MetricCard.Skeleton />}>
            <MetricCard title="Charity" value="$3.2k" change="+8%" changeType="positive" />
          </Suspense>
          <Suspense fallback={<MetricCard.Skeleton />}>
            <MetricCard title="Pending" value="14" change="+3" changeType="negative" />
          </Suspense>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Suspense fallback={<div className="h-64 bg-muted rounded-xl animate-pulse" />}>
              <AdminScoreChart />
            </Suspense>
          </div>
          <div className="space-y-6">
            <AdminConsole draws={[]} charities={[]} pendingProofs={[]} />
          </div>
        </div>
      </div>
    </AppShell>
  );
}

