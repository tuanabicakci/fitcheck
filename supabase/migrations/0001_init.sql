-- Fit Check — initial schema
-- Run this once in your Supabase project's SQL Editor (or via `supabase db push`
-- if you're using the CLI and have linked this folder to your project).
--
-- Before running: create the project at https://supabase.com, then go to
-- Authentication → Sign In / Up → enable "Allow anonymous sign-ins".
-- That toggle can't be set via SQL, only from the dashboard.

-- ─────────────────────────────────────────────────────────────────────────
-- closet_items
-- ─────────────────────────────────────────────────────────────────────────
-- ids are text (not uuid) so the app's built-in sample data — which uses
-- readable ids like 'top-1' — can be seeded directly for first-time users,
-- and so outfit slots (a jsonb array) can reference item ids without a
-- formal foreign key. The primary key is (user_id, id), not id alone, since
-- every new anonymous user is seeded with the same sample ids — those only
-- need to be unique within one user's own rows, not globally.
create table if not exists public.closet_items (
  id text not null default gen_random_uuid()::text,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category text not null check (
    category in ('tops', 'bottoms', 'dresses', 'shoes', 'jackets', 'bags', 'jewelry', 'hats', 'belts', 'accessories')
  ),
  image_path text,
  swatch_color text,
  color text,
  brand text,
  style text,
  notes text,
  seasons text[] not null default '{}',
  background_simplified boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists closet_items_user_id_idx on public.closet_items (user_id);

alter table public.closet_items enable row level security;

create policy "select own closet items" on public.closet_items
  for select using (auth.uid() = user_id);

create policy "insert own closet items" on public.closet_items
  for insert with check (auth.uid() = user_id);

create policy "update own closet items" on public.closet_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own closet items" on public.closet_items
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- outfits
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.outfits (
  id text not null default gen_random_uuid()::text,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  mode text not null check (mode in ('top-bottom', 'full-body')),
  slots jsonb not null default '[]'::jsonb,
  occasion text check (occasion in ('casual', 'work', 'party', 'date-night', 'formal', 'travel')),
  season text check (season in ('spring', 'summer', 'fall', 'winter')),
  mood text,
  notes text,
  favorite boolean not null default false,
  wear_count integer not null default 0,
  last_worn_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists outfits_user_id_idx on public.outfits (user_id);

alter table public.outfits enable row level security;

create policy "select own outfits" on public.outfits
  for select using (auth.uid() = user_id);

create policy "insert own outfits" on public.outfits
  for insert with check (auth.uid() = user_id);

create policy "update own outfits" on public.outfits
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "delete own outfits" on public.outfits
  for delete using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- storage — closet photos
-- ─────────────────────────────────────────────────────────────────────────
-- Bucket is public-read (anyone with a photo's URL can view it — there's no
-- other sensitive data behind that URL) but writes are restricted to the
-- owning user's own folder, named after their user id.
insert into storage.buckets (id, name, public)
values ('closet-photos', 'closet-photos', true)
on conflict (id) do nothing;

create policy "closet photos are publicly readable" on storage.objects
  for select using (bucket_id = 'closet-photos');

create policy "users upload to their own closet photo folder" on storage.objects
  for insert with check (
    bucket_id = 'closet-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users update their own closet photos" on storage.objects
  for update using (
    bucket_id = 'closet-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "users delete their own closet photos" on storage.objects
  for delete using (
    bucket_id = 'closet-photos' and (storage.foldername(name))[1] = auth.uid()::text
  );
