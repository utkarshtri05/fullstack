import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getCurrentUser } from "@/modules/auth/server";
import { CharityMarketplace } from "@/modules/charity/components/charity-marketplace";
import { listCharities, listUserCharityAllocations } from "@/modules/charity/service";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Charity"
};

export default async function CharityPage() {
  const context = await getCurrentUser();

  if (!context) {
    redirect("/sign-in");
  }

  const [charities, allocations] = await Promise.all([
    listCharities(),
    listUserCharityAllocations(context.user.id)
  ]);

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Charity</h1>
          <p className="mt-2 text-muted-foreground">Choose how invoice-backed contributions are distributed.</p>
        </div>
        <CharityMarketplace charities={charities} allocations={allocations} />
      </div>
    </AppShell>
  );
}
