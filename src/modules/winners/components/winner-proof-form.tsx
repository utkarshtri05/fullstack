"use client";

import { UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Draw, DrawResult } from "@/db/schema";

type DrawWithResult = Draw & {
  result: DrawResult | null;
};

export function WinnerProofForm({ userId, draws }: { userId: string; draws: DrawWithResult[] }) {
  const [drawId, setDrawId] = useState(draws[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!file || !drawId) {
      toast.error("Choose a draw and an image proof");
      return;
    }

    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      toast.error("Proof must be an image under 5MB");
      return;
    }

    setLoading(true);
    const supabase = createSupabaseBrowserClient();
    const bucket = process.env.NEXT_PUBLIC_WINNER_PROOF_BUCKET ?? "winner-proofs";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false
    });

    if (error) {
      setLoading(false);
      toast.error(error.message);
      return;
    }

    const imageUrl = `${bucket}/${path}`;
    const response = await fetch("/api/winners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drawId, imageUrl })
    });
    const data = (await response.json()) as { error?: { message: string } };
    setLoading(false);

    if (!response.ok) {
      toast.error(data.error?.message ?? "Unable to submit proof");
      return;
    }

    toast.success("Proof submitted for review");
    setFile(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Winner Proof</CardTitle>
        <CardDescription>Upload proof for a published draw after matching three or more winning numbers.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="draw">Draw</Label>
          <select
            id="draw"
            value={drawId}
            onChange={(event) => setDrawId(event.target.value)}
            className="focus-ring h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            {draws.map((draw) => (
              <option key={draw.id} value={draw.id}>
                {draw.month}/{draw.year}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="proof">Proof image</Label>
          <Input id="proof" type="file" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
        </div>
        <Button onClick={submit} disabled={loading || draws.length === 0}>
          {loading ? <Loader2 className="animate-spin" /> : <UploadCloud />}
          Submit proof
        </Button>
      </CardContent>
    </Card>
  );
}
