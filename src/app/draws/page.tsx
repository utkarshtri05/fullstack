import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/modules/auth/server";
import { DrawResults } from "@/modules/draws/components/draw-results";
import { listPublishedDraws } from "@/modules/draws/service";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Draw Results"
};

export default async function DrawsPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  const draws = await listPublishedDraws();

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Draw Results</h1>
          <p className="mt-2 text-muted-foreground">Published monthly results and winning number sets.</p>
        </div>
        <DrawResults draws={draws} />
      </div>
    </AppShell>
  );
}
