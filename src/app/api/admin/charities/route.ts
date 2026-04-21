import { requireAdmin } from "@/modules/auth/server";
import { charityUpsertSchema } from "@/modules/charity/schemas";
import { createCharity, listCharities } from "@/modules/charity/service";
import { created, ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function GET() {
  return route(async () => {
    await requireAdmin();
    const charities = await listCharities();
    return ok({ charities });
  });
}

export async function POST(request: Request) {
  return route(async () => {
    const { user } = await requireAdmin();
    const input = await parseJson(request, charityUpsertSchema);
    const charity = await createCharity(user.id, input);
    return created({ charity });
  });
}
