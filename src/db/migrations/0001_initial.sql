create type "profile_role" as enum ('user', 'admin');
create type "plan_type" as enum ('monthly', 'yearly');
create type "subscription_status" as enum ('active', 'past_due', 'canceled', 'incomplete');
create type "draw_mode" as enum ('random', 'weighted', 'hybrid');
create type "draw_status" as enum ('draft', 'simulated', 'published');
create type "proof_status" as enum ('pending', 'approved', 'rejected');
create type "payout_status" as enum ('pending', 'paid');

create table "users" (
  "id" uuid primary key,
  "email" text not null unique,
  "created_at" timestamp with time zone not null default now()
);

create table "profiles" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "name" text not null,
  "role" "profile_role" not null default 'user',
  "avatar_url" text,
  constraint "profiles_user_id_unique" unique ("user_id")
);

create table "subscriptions" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "stripe_customer_id" text not null unique,
  "stripe_subscription_id" text not null unique,
  "plan_type" "plan_type" not null,
  "status" "subscription_status" not null,
  "current_period_end" timestamp with time zone not null,
  constraint "subscriptions_user_id_unique" unique ("user_id")
);

create table "scores" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "score" integer not null,
  "date" date not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "scores_score_range" check ("score" between 1 and 45),
  constraint "scores_user_date_unique" unique ("user_id", "date")
);

create table "draws" (
  "id" uuid primary key default gen_random_uuid(),
  "month" integer not null,
  "year" integer not null,
  "mode" "draw_mode" not null,
  "status" "draw_status" not null default 'draft',
  "created_at" timestamp with time zone not null default now()
);

create table "draw_results" (
  "id" uuid primary key default gen_random_uuid(),
  "draw_id" uuid not null references "draws"("id") on delete cascade,
  "winning_numbers" integer[] not null,
  "created_at" timestamp with time zone not null default now(),
  constraint "draw_results_draw_id_unique" unique ("draw_id")
);

create table "participants" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "draw_id" uuid not null references "draws"("id") on delete cascade,
  constraint "participants_user_draw_unique" unique ("user_id", "draw_id")
);

create table "prizes" (
  "id" uuid primary key default gen_random_uuid(),
  "draw_id" uuid not null references "draws"("id") on delete cascade,
  "tier" integer not null,
  "total_pool" integer not null,
  "per_winner_amount" integer not null,
  constraint "prizes_tier_range" check ("tier" in (3, 4, 5)),
  constraint "prizes_total_pool_non_negative" check ("total_pool" >= 0),
  constraint "prizes_per_winner_non_negative" check ("per_winner_amount" >= 0),
  constraint "prizes_draw_tier_unique" unique ("draw_id", "tier")
);

create table "charities" (
  "id" uuid primary key default gen_random_uuid(),
  "name" text not null,
  "description" text not null,
  "image_url" text not null,
  "is_featured" boolean not null default false
);

create table "user_charity" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "charity_id" uuid not null references "charities"("id") on delete cascade,
  "percentage" integer not null,
  constraint "user_charity_percentage_minimum" check ("percentage" >= 10),
  constraint "user_charity_percentage_maximum" check ("percentage" <= 100),
  constraint "user_charity_user_charity_unique" unique ("user_id", "charity_id")
);

create table "winner_proofs" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "draw_id" uuid not null references "draws"("id") on delete cascade,
  "image_url" text not null,
  "status" "proof_status" not null default 'pending',
  "admin_note" text
);

create table "payouts" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "amount" integer not null,
  "status" "payout_status" not null default 'pending',
  "created_at" timestamp with time zone not null default now()
);

create table "notifications" (
  "id" uuid primary key default gen_random_uuid(),
  "user_id" uuid not null references "users"("id") on delete cascade,
  "type" text not null,
  "message" text not null,
  "read" boolean not null default false
);

create table "audit_logs" (
  "id" uuid primary key default gen_random_uuid(),
  "action" text not null,
  "actor_id" uuid references "users"("id") on delete set null,
  "metadata" jsonb not null default '{}'::jsonb,
  "created_at" timestamp with time zone not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;

  insert into public.profiles (user_id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table "users" enable row level security;
alter table "profiles" enable row level security;
alter table "subscriptions" enable row level security;
alter table "scores" enable row level security;
alter table "draws" enable row level security;
alter table "draw_results" enable row level security;
alter table "participants" enable row level security;
alter table "prizes" enable row level security;
alter table "charities" enable row level security;
alter table "user_charity" enable row level security;
alter table "winner_proofs" enable row level security;
alter table "payouts" enable row level security;
alter table "notifications" enable row level security;
alter table "audit_logs" enable row level security;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where user_id = auth.uid() and role = 'admin'
  );
$$;

create policy "users_read_self" on "users" for select using (id = auth.uid() or public.is_admin());
create policy "profiles_read_self" on "profiles" for select using (user_id = auth.uid() or public.is_admin());
create policy "profiles_update_self" on "profiles" for update using (user_id = auth.uid()) with check (user_id = auth.uid() and role = 'user');
create policy "subscriptions_read_self" on "subscriptions" for select using (user_id = auth.uid() or public.is_admin());
create policy "scores_crud_self" on "scores" for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "draws_read_authenticated" on "draws" for select to authenticated using (true);
create policy "draw_results_read_authenticated" on "draw_results" for select to authenticated using (true);
create policy "participants_read_self" on "participants" for select using (user_id = auth.uid() or public.is_admin());
create policy "prizes_read_authenticated" on "prizes" for select to authenticated using (true);
create policy "charities_read_authenticated" on "charities" for select to authenticated using (true);
create policy "user_charity_crud_self" on "user_charity" for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "winner_proofs_crud_self" on "winner_proofs" for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "payouts_read_self" on "payouts" for select using (user_id = auth.uid() or public.is_admin());
create policy "notifications_crud_self" on "notifications" for all using (user_id = auth.uid() or public.is_admin()) with check (user_id = auth.uid() or public.is_admin());
create policy "audit_logs_admin_read" on "audit_logs" for select using (public.is_admin());
