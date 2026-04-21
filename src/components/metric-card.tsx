import { TrendingUp } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: string;
}

export function MetricCard({ title, value, trend }: MetricCardProps) {
  return (
    <div className="group h-[110px] rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:shadow-orange-500/10 border-orange-50">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
          <TrendingUp className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className="mt-1 text-xs font-medium text-green-600">{trend}</p>
        )}
      </div>
    </div>
  );
}

