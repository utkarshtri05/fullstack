import { requireUser, updateProfile } from "@/modules/auth/server";
import { profileUpdateSchema } from "@/modules/auth/schemas";
import { ok, parseJson, route } from "@/modules/shared/api";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  return route(async () => {
    const { user } = await requireUser();
    const input = await parseJson(request, profileUpdateSchema);
    const profile = await updateProfile(user.id, input);
    return ok({ profile });
  });
}
