"use client";

import { Gift, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Draw, DrawResult } from "@/db/schema";

type DrawWithResult = Draw & {
  result: DrawResult | null;
};

export function DrawResults({ draws }: { draws: DrawWithResult[] }) {
  if (draws.length === 0) {
    return <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">No published draws yet.</div>;
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {draws.map((draw) => (
        <Card key={draw.id}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Gift className="size-5 text-primary" />
                {draw.month}/{draw.year}
              </CardTitle>
              <Badge variant="success">{draw.status}</Badge>
            </div>
            <CardDescription>{draw.mode} draw mode</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {draw.result?.winningNumbers.map((number) => (
                <div key={number} className="grid size-12 place-items-center rounded-md border bg-muted text-lg font-semibold">
                  {number}
                </div>
              )) ?? <span className="text-sm text-muted-foreground">Result unavailable</span>}
            </div>
            <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4 text-secondary" />
              Match three or more numbers to start winner verification.
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
