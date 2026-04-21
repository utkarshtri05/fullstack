import type { Profile } from "@/db/schema";

export function isAdmin(profile: Pick<Profile, "role"> | null | undefined) {
  return profile?.role === "admin";
}

export function canAccessAdmin(profile: Pick<Profile, "role"> | null | undefined) {
  return isAdmin(profile);
}

export function canAccessOwnResource(profile: Pick<Profile, "userId" | "role">, ownerId: string) {
  return profile.userId === ownerId || profile.role === "admin";
}
