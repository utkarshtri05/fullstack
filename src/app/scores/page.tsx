import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser, hasActiveSubscription } from "@/modules/auth/server";
import { ScoreManager } from "@/modules/scores/components/score-manager";
import { listScores } from "@/modules/scores/service";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Scores"
};

export default async function ScoresPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  const scores = await listScores(context.user.id);

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Scores</h1>
          <p className="mt-2 text-muted-foreground">Submit daily scores between 1 and 45. Duplicate dates are rejected server-side.</p>
        </div>
        <ScoreManager initialScores={scores} activeSubscription={hasActiveSubscription(context.subscription)} />
      </div>
    </AppShell>
  );
}
