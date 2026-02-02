-- Create table for support requests (forgot password, etc)
create table if not exists support_requests (
  id uuid default gen_random_uuid() primary key,
  phone text not null,
  problem_type text default 'forgot_password',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table support_requests enable row level security;

-- Policy: Allow anon (unauthenticated) users to INSERT (create tickets)
create policy "Allow public insert"
  on support_requests
  for insert
  to anon, authenticated
  with check (true);

-- Policy: Allow only service_role (backend/admin) to SELECT/VIEW
-- We do NOT create a select policy for anon/authenticated, effectively denying read access.
-- Apps admins will use Supabase Dashboard or a custom admin panel with service_role key to view these.
