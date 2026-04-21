import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentUser } from "@/modules/auth/server";
import { listPublishedDraws } from "@/modules/draws/service";
import { WinnerProofForm } from "@/modules/winners/components/winner-proof-form";
import { listWinnerCenter } from "@/modules/winners/service";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Winners"
};

export default async function WinnersPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  const [center, draws] = await Promise.all([
    listWinnerCenter(context.user.id),
    listPublishedDraws()
  ]);

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Winners</h1>
          <p className="mt-2 text-muted-foreground">Submit proof, follow review status, and track payouts.</p>
        </div>
        <div className="grid gap-5 xl:grid-cols-[420px_1fr]">
          <WinnerProofForm userId={context.user.id} draws={draws} />
          <Card>
            <CardHeader>
              <CardTitle>Proof History</CardTitle>
              <CardDescription>Pending proofs move to approved or rejected after admin review.</CardDescription>
            </CardHeader>
            <CardContent>
              {center.proofs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No proofs submitted yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Draw</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Note</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {center.proofs.map((proof) => (
                      <TableRow key={proof.id}>
                        <TableCell>{proof.drawId}</TableCell>
                        <TableCell><Badge variant={proof.status === "approved" ? "success" : proof.status === "rejected" ? "destructive" : "warning"}>{proof.status}</Badge></TableCell>
                        <TableCell>{proof.adminNote ?? ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {center.payouts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payouts yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {center.payouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>{formatCurrency(payout.amount)}</TableCell>
                      <TableCell><Badge variant={payout.status === "paid" ? "success" : "warning"}>{payout.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
