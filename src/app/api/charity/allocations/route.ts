import { requireUser } from "@/modules/auth/server";
import { charityAllocationsUpdateSchema } from "@/modules/charity/schemas";
import { listUserCharityAllocations, updateUserCharityAllocations } from "@/modules/charity/service";
import { ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    const { user } = await requireUser();
    const allocations = await listUserCharityAllocations(user.id);
    return ok({ allocations });
  });
}

export async function PUT(request: Request) {
  return route(async () => {
    const { user } = await requireUser();
    const input = await parseJson(request, charityAllocationsUpdateSchema);
    const allocations = await updateUserCharityAllocations(user.id, input);
    return ok({ allocations });
  });
}
