"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Play, Rocket, Save } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Charity, Draw, DrawResult, WinnerProof } from "@/db/schema";
import { charityUpsertSchema, type CharityUpsertInput } from "@/modules/charity/schemas";
import { drawSimulationSchema, type DrawSimulationInput } from "@/modules/draws/schemas";

type DrawWithResult = Draw & {
  result: DrawResult | null;
};

type AdminConsoleProps = {
  draws: DrawWithResult[];
  charities: Charity[];
  pendingProofs: WinnerProof[];
};

type DrawFormInput = z.input<typeof drawSimulationSchema>;
type CharityFormInput = z.input<typeof charityUpsertSchema>;

function currentMonthInput(): DrawSimulationInput {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear(),
    mode: "hybrid"
  };
}

export function AdminConsole({ draws, charities, pendingProofs }: AdminConsoleProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const drawForm = useForm<DrawFormInput, unknown, DrawSimulationInput>({
    resolver: zodResolver(drawSimulationSchema),
    defaultValues: currentMonthInput()
  });
  const charityForm = useForm<CharityFormInput, unknown, CharityUpsertInput>({
    resolver: zodResolver(charityUpsertSchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
      isFeatured: false
    }
  });

  async function simulate(values: DrawSimulationInput) {
    setLoading("simulate");
    const response = await fetch("/api/draws/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(null);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to simulate draw");
      return;
    }

    toast.success("Draw simulation created");
    window.location.reload();
  }

  async function publish(drawId: string) {
    setLoading(drawId);
    const response = await fetch(`/api/draws/${drawId}/publish`, { method: "POST" });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(null);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to publish draw");
      return;
    }

    toast.success("Draw published");
    window.location.reload();
  }

  async function createCharity(values: CharityUpsertInput) {
    setLoading("charity");
    const response = await fetch("/api/admin/charities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(null);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to create charity");
      return;
    }

    toast.success("Charity created");
    charityForm.reset();
    window.location.reload();
  }

  async function reviewProof(proofId: string, action: "approve" | "reject") {
    setLoading(proofId);
    const response = await fetch(`/api/admin/winner-proofs/${proofId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNote: action === "approve" ? "Approved" : "Rejected during admin review" })
    });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(null);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to review proof");
      return;
    }

    toast.success(`Proof ${action}d`);
    window.location.reload();
  }

  return (
    <Tabs defaultValue="draws">
      <TabsList>
        <TabsTrigger value="draws">Draws</TabsTrigger>
        <TabsTrigger value="charities">Charities</TabsTrigger>
        <TabsTrigger value="proofs">Proofs</TabsTrigger>
      </TabsList>
      <TabsContent value="draws" className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle>Simulate Draw</CardTitle>
            <CardDescription>Admins must simulate before publishing. Published periods cannot be published again.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-4" onSubmit={drawForm.handleSubmit(simulate)}>
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input id="month" type="number" min={1} max={12} {...drawForm.register("month")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input id="year" type="number" min={2024} {...drawForm.register("year")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <select id="mode" className="focus-ring h-10 w-full rounded-md border border-input bg-background px-3 text-sm" {...drawForm.register("mode")}>
                  <option value="random">Random</option>
                  <option value="weighted">Weighted</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button className="w-full" disabled={loading === "simulate"}>
                  {loading === "simulate" ? <Loader2 className="animate-spin" /> : <Play />}
                  Simulate
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draw Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Numbers</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {draws.map((draw) => (
                  <TableRow key={draw.id}>
                    <TableCell>{draw.month}/{draw.year}</TableCell>
                    <TableCell>{draw.mode}</TableCell>
                    <TableCell><Badge variant={draw.status === "published" ? "success" : "outline"}>{draw.status}</Badge></TableCell>
                    <TableCell>{draw.result?.winningNumbers.join(", ") ?? "Pending"}</TableCell>
                    <TableCell>
                      {draw.status === "simulated" ? (
                        <Button size="sm" onClick={() => publish(draw.id)} disabled={loading === draw.id}>
                          {loading === draw.id ? <Loader2 className="animate-spin" /> : <Rocket />}
                          Publish
                        </Button>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="charities" className="grid gap-5 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Create Charity</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={charityForm.handleSubmit(createCharity)}>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input {...charityForm.register("name")} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea {...charityForm.register("description")} />
              </div>
              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input {...charityForm.register("imageUrl")} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" {...charityForm.register("isFeatured")} />
                Featured
              </label>
              <Button disabled={loading === "charity"}>
                {loading === "charity" ? <Loader2 className="animate-spin" /> : <Save />}
                Save charity
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Charities</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Featured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charities.map((charity) => (
                  <TableRow key={charity.id}>
                    <TableCell>{charity.name}</TableCell>
                    <TableCell>{charity.isFeatured ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="proofs">
        <Card>
          <CardHeader>
            <CardTitle>Pending Winner Proofs</CardTitle>
            <CardDescription>Approval creates a pending payout. Payment marks the payout paid.</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingProofs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No pending proofs.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Draw</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProofs.map((proof) => (
                    <TableRow key={proof.id}>
                      <TableCell>{proof.userId}</TableCell>
                      <TableCell>{proof.drawId}</TableCell>
                      <TableCell><Badge variant="warning">{proof.status}</Badge></TableCell>
                      <TableCell className="flex gap-2">
                        <Button size="sm" onClick={() => reviewProof(proof.id, "approve")} disabled={loading === proof.id}>Approve</Button>
                        <Button size="sm" variant="destructive" onClick={() => reviewProof(proof.id, "reject")} disabled={loading === proof.id}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
