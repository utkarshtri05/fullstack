"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Score } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { scoreCreateSchema, type ScoreCreateInput } from "../schemas";

type ScoreManagerProps = {
  initialScores: Score[];
  activeSubscription: boolean;
};

type ScoreFormInput = z.input<typeof scoreCreateSchema>;

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function ScoreManager({ initialScores, activeSubscription }: ScoreManagerProps) {
  const [scores, setScores] = useState(initialScores);
  const [loading, setLoading] = useState(false);
  const form = useForm<ScoreFormInput, unknown, ScoreCreateInput>({
    resolver: zodResolver(scoreCreateSchema),
    defaultValues: {
      score: 1,
      date: today()
    }
  });
  const remaining = useMemo(() => Math.max(0, 5 - scores.length), [scores.length]);

  async function onSubmit(values: ScoreCreateInput) {
    setLoading(true);
    const response = await fetch("/api/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = (await response.json()) as { scores?: Score[]; error?: { message: string } };
    setLoading(false);

    if (!response.ok || !data.scores) {
      toast.error(data.error?.message ?? "Unable to save score");
      return;
    }

    setScores(data.scores);
    toast.success("Score saved");
  }

  async function removeScore(scoreId: string) {
    const response = await fetch(`/api/scores/${scoreId}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: { message: string } };

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to delete score");
      return;
    }

    setScores((current) => current.filter((score) => score.id !== scoreId));
    toast.success("Score removed");
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Score Entry</CardTitle>
          <CardDescription>Keep up to five active scores. New entries automatically prune the oldest score.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="score">Score</Label>
              <Input id="score" type="number" min={1} max={45} disabled={!activeSubscription} {...form.register("score")} />
              {form.formState.errors.score ? <p className="text-sm text-destructive">{form.formState.errors.score.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" disabled={!activeSubscription} {...form.register("date")} />
              {form.formState.errors.date ? <p className="text-sm text-destructive">{form.formState.errors.date.message}</p> : null}
            </div>
            <Button className="w-full" disabled={loading || !activeSubscription}>
              {loading ? <Loader2 className="animate-spin" /> : <Plus />}
              Add score
            </Button>
            {!activeSubscription ? <p className="text-sm text-warning">An active subscription is required to enter scores.</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>Active Scores</CardTitle>
            <CardDescription>Latest scores are used for draw participation and winner verification.</CardDescription>
          </div>
          <Badge variant={remaining > 0 ? "outline" : "secondary"}>{remaining} slots</Badge>
        </CardHeader>
        <CardContent>
          {scores.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No scores submitted yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Score</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-16"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scores.map((score) => (
                  <TableRow key={score.id}>
                    <TableCell className="text-lg font-semibold">{score.score}</TableCell>
                    <TableCell>{formatDate(score.date)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => removeScore(score.id)} aria-label="Delete score">
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
