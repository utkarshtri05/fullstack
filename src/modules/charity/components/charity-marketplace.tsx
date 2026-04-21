"use client";

import { HeartHandshake, Loader2, Save } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Charity, UserCharity } from "@/db/schema";

type CharityMarketplaceProps = {
  charities: Charity[];
  allocations: UserCharity[];
};

export function CharityMarketplace({ charities, allocations }: CharityMarketplaceProps) {
  const [percentages, setPercentages] = useState<Record<string, number>>(
    Object.fromEntries(allocations.map((allocation) => [allocation.charityId, allocation.percentage]))
  );
  const [loading, setLoading] = useState(false);
  const total = useMemo(() => Object.values(percentages).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0), [percentages]);

  function update(charityId: string, percentage: number) {
    setPercentages((current) => {
      const next = { ...current };
      if (percentage <= 0) {
        delete next[charityId];
      } else {
        next[charityId] = percentage;
      }

      return next;
    });
  }

  async function save() {
    setLoading(true);
    const response = await fetch("/api/charity/allocations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        allocations: Object.entries(percentages).map(([charityId, percentage]) => ({
          charityId,
          percentage
        }))
      })
    });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(false);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to save allocations");
      return;
    }

    toast.success("Charity allocations saved");
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="size-5 text-primary" />
              Charity Marketplace
            </CardTitle>
            <CardDescription>Allocate at least 10% to each selected charity. Contributions are tracked from paid invoices.</CardDescription>
          </div>
          <Badge variant={total <= 100 ? "outline" : "destructive"}>{total}% allocated</Badge>
        </CardHeader>
        <CardContent>
          <Button onClick={save} disabled={loading || total > 100}>
            {loading ? <Loader2 className="animate-spin" /> : <Save />}
            Save allocations
          </Button>
        </CardContent>
      </Card>

      {charities.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No charities have been published yet.</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {charities.map((charity) => (
            <Card key={charity.id} className="overflow-hidden">
              <div className="relative aspect-[16/9] bg-muted">
                <img src={charity.imageUrl} alt={charity.name} className="h-full w-full object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle>{charity.name}</CardTitle>
                  {charity.isFeatured ? <Badge variant="secondary">Featured</Badge> : null}
                </div>
                <CardDescription>{charity.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={percentages[charity.id] ?? 0}
                    onChange={(event) => update(charity.id, Number(event.target.value))}
                    aria-label={`${charity.name} allocation percentage`}
                  />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
