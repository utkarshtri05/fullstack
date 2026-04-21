#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_ADMIN_EMAIL = "utkarsh@gmail.com";
const DEFAULT_ADMIN_PASSWORD = "utkarsh@12345";

function loadLocalEnvFile() {
  const envPath = join(process.cwd(), ".env.local");

  if (!existsSync(envPath)) {
    return;
  }

  const content = readFileSync(envPath, "utf8");

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

async function findExistingUserIdByEmail(adminClient, email) {
  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 200
    });

    if (error) {
      throw error;
    }

    const existing = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (existing) {
      return existing.id;
    }

    if (data.users.length < 200) {
      return null;
    }

    page += 1;
  }
}

async function seedAdmin() {
  loadLocalEnvFile();

  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const email = process.env.ADMIN_EMAIL ?? DEFAULT_ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD;

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log(`Seeding admin user ${email}...`);

  const created = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name: "Admin User"
    }
  });

  let userId = created.data.user?.id ?? null;

  if (created.error) {
    const message = created.error.message.toLowerCase();
    const alreadyExists = message.includes("already") || message.includes("registered");

    if (!alreadyExists) {
      throw created.error;
    }

    userId = await findExistingUserIdByEmail(supabase, email);

    if (!userId) {
      throw new Error(`Could not resolve existing user for ${email}`);
    }

    const updated = await supabase.auth.admin.updateUserById(userId, {
      password,
      email_confirm: true,
      user_metadata: {
        name: "Admin User"
      }
    });

    if (updated.error) {
      throw updated.error;
    }

    console.log("Existing auth user found. Password and metadata refreshed.");
  } else {
    console.log(`Auth user created: ${userId}`);
  }

  if (!userId) {
    throw new Error("Admin user id was not returned");
  }

  const { error: usersError } = await supabase.from("users").upsert(
    {
      id: userId,
      email
    },
    { onConflict: "id" }
  );

  if (usersError) {
    throw usersError;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      name: "Admin User",
      role: "admin"
    },
    { onConflict: "user_id" }
  );

  if (profileError) {
    throw profileError;
  }

  console.log("Admin profile is set to role=admin.");
  console.log(`Admin email: ${email}`);
  console.log(`Admin password: ${password}`);
}

seedAdmin().catch((error) => {
  console.error("Failed to seed admin:", error instanceof Error ? error.message : error);
  process.exit(1);
});
