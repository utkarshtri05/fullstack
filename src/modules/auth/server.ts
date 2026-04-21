import { getDb } from "@/db";
import { profiles, subscriptions, users, type Profile, type Subscription, type User } from "@/db/schema";
import { createServerClient } from "@supabase/ssr";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { profileUpdateSchema } from "./schemas";
import { forbidden, unauthorized } from "../shared/errors";

export type AuthContext = {
  user: User;
  profile: Profile;
  subscription: Subscription | null;
};

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error("Supabase public environment variables are required");
  }

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot set cookies; middleware and route handlers can.
        }
      }
    }
  });
}

async function upsertAuthUser(authUser: SupabaseUser) {
  const db = getDb();
  const email = authUser.email;

  if (!email) {
    throw unauthorized();
  }

  const metadata = authUser.user_metadata as Record<string, unknown>;
  const fallbackName = email.split("@")[0] ?? "Member";
  const name = typeof metadata.name === "string" && metadata.name.trim().length > 0 ? metadata.name.trim() : fallbackName;
  const avatarUrl = typeof metadata.avatar_url === "string" ? metadata.avatar_url : null;

  await db
    .insert(users)
    .values({
      id: authUser.id,
      email
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email
      }
    });

  await db
    .insert(profiles)
    .values({
      userId: authUser.id,
      name,
      avatarUrl
    })
    .onConflictDoNothing({
      target: profiles.userId
    });

  const [user] = await db.select().from(users).where(eq(users.id, authUser.id)).limit(1);
  const [profile] = await db.select().from(profiles).where(eq(profiles.userId, authUser.id)).limit(1);
  const [subscription] = await db.select().from(subscriptions).where(eq(subscriptions.userId, authUser.id)).limit(1);

  if (!user || !profile) {
    throw unauthorized();
  }

  return { user, profile, subscription: subscription ?? null };
}

export const getCurrentUser = cache(async (): Promise<AuthContext | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return upsertAuthUser(data.user);
});

export async function requireUser() {
  const context = await getCurrentUser();

  if (!context) {
    throw unauthorized();
  }

  return context;
}

export async function requireAdmin() {
  const context = await requireUser();

  if (context.profile.role !== "admin") {
    throw forbidden();
  }

  return context;
}

export async function updateProfile(userId: string, input: unknown) {
  const values = profileUpdateSchema.parse(input);

  const [profile] = await getDb()
    .update(profiles)
    .set({
      name: values.name,
      avatarUrl: values.avatarUrl ?? null
    })
    .where(eq(profiles.userId, userId))
    .returning();

  return profile;
}

export function hasActiveSubscription(subscription: Subscription | null) {
  return (
    subscription?.status === "active" &&
    subscription.currentPeriodEnd.getTime() > Date.now()
  );
}

export async function signInWithPassword({ email, password }: { email: string; password: string }) {
  const supabase = await createSupabaseServerClient();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error || !data.session) {
    throw unauthorized('Invalid credentials');
  }
}

export async function requireActiveSubscription() {
  const context = await requireUser();

  if (!hasActiveSubscription(context.subscription)) {
    throw forbidden();
  }

  return context;
}
