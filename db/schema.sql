-- ============================================================
-- Paisa — Money Management  |  Fresh Schema  (run on Supabase)
-- ============================================================
-- Drop old tables if they exist
drop table if exists transactions cascade;
drop table if exists budgets cascade;
drop table if exists goals cascade;

-- ── Profiles ─────────────────────────────────────────────────
-- Auto-created when a user signs up via auth trigger below.
create table if not exists profiles (
  id                uuid        primary key references auth.users(id) on delete cascade,
  display_name      text,
  currency          text        not null default 'INR',
  avatar_url        text,
  starting_balance  numeric(14,2) not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Accounts ─────────────────────────────────────────────────
-- Cash wallet, bank account, credit card, savings, etc.
create table if not exists accounts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null,
  type        text        not null check (type in ('cash', 'bank', 'credit', 'savings', 'investment', 'other')),
  balance     numeric(14,2) not null default 0,
  color       text,
  is_default  boolean     not null default false,
  created_at  timestamptz not null default now()
);

-- ── Recurring Transaction Templates ──────────────────────────
-- Salary, rent, subscriptions — entries the user wants repeated.
create table if not exists recurring_transactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  account_id  uuid        references accounts(id) on delete set null,
  type        text        not null check (type in ('income', 'expense')),
  amount      numeric(14,2) not null check (amount > 0),
  description text        not null,
  category    text        not null,
  frequency   text        not null check (frequency in ('daily', 'weekly', 'monthly', 'yearly')),
  next_due    date        not null,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ── Transactions ──────────────────────────────────────────────
create table if not exists transactions (
  id             uuid          primary key default gen_random_uuid(),
  user_id        uuid          not null references auth.users(id) on delete cascade,
  account_id     uuid          references accounts(id) on delete set null,
  recurring_id   uuid          references recurring_transactions(id) on delete set null,
  type           text          not null check (type in ('income', 'expense', 'transfer')),
  amount         numeric(14,2) not null check (amount > 0),
  description    text          not null,
  category       text          not null,
  tags           text[]        not null default '{}',
  date           date          not null,
  note           text,
  created_at     timestamptz   not null default now()
);

-- ── Budgets ───────────────────────────────────────────────────
create table if not exists budgets (
  id            uuid          primary key default gen_random_uuid(),
  user_id       uuid          not null references auth.users(id) on delete cascade,
  category      text          not null,
  monthly_limit numeric(14,2) not null check (monthly_limit > 0),
  rollover      boolean       not null default false,
  created_at    timestamptz   not null default now(),
  unique(user_id, category)
);

-- ── Goals ─────────────────────────────────────────────────────
create table if not exists goals (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid          not null references auth.users(id) on delete cascade,
  account_id  uuid          references accounts(id) on delete set null,
  name        text          not null,
  target      numeric(14,2) not null check (target > 0),
  saved       numeric(14,2) not null default 0 check (saved >= 0),
  deadline    date,
  color       text,
  icon        text,
  created_at  timestamptz   not null default now()
);

-- ============================================================
-- Row-Level Security
-- ============================================================
alter table profiles              enable row level security;
alter table accounts              enable row level security;
alter table recurring_transactions enable row level security;
alter table transactions          enable row level security;
alter table budgets               enable row level security;
alter table goals                 enable row level security;

-- profiles
create policy "own profile select" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- accounts
create policy "own accounts select" on accounts for select using (auth.uid() = user_id);
create policy "own accounts insert" on accounts for insert with check (auth.uid() = user_id);
create policy "own accounts update" on accounts for update using (auth.uid() = user_id);
create policy "own accounts delete" on accounts for delete using (auth.uid() = user_id);

-- recurring_transactions
create policy "own recurring select" on recurring_transactions for select using (auth.uid() = user_id);
create policy "own recurring insert" on recurring_transactions for insert with check (auth.uid() = user_id);
create policy "own recurring update" on recurring_transactions for update using (auth.uid() = user_id);
create policy "own recurring delete" on recurring_transactions for delete using (auth.uid() = user_id);

-- transactions
create policy "own tx select" on transactions for select using (auth.uid() = user_id);
create policy "own tx insert" on transactions for insert with check (auth.uid() = user_id);
create policy "own tx update" on transactions for update using (auth.uid() = user_id);
create policy "own tx delete" on transactions for delete using (auth.uid() = user_id);

-- budgets
create policy "own budgets select" on budgets for select using (auth.uid() = user_id);
create policy "own budgets insert" on budgets for insert with check (auth.uid() = user_id);
create policy "own budgets update" on budgets for update using (auth.uid() = user_id);
create policy "own budgets delete" on budgets for delete using (auth.uid() = user_id);

-- goals
create policy "own goals select" on goals for select using (auth.uid() = user_id);
create policy "own goals insert" on goals for insert with check (auth.uid() = user_id);
create policy "own goals update" on goals for update using (auth.uid() = user_id);
create policy "own goals delete" on goals for delete using (auth.uid() = user_id);

-- ============================================================
-- Performance Indexes
-- ============================================================
create index if not exists idx_accounts_user           on accounts(user_id);
create index if not exists idx_recurring_user          on recurring_transactions(user_id);
create index if not exists idx_recurring_due           on recurring_transactions(next_due) where is_active = true;
create index if not exists idx_tx_user_date            on transactions(user_id, date desc);
create index if not exists idx_tx_user_category        on transactions(user_id, category);
create index if not exists idx_tx_user_type            on transactions(user_id, type);
create index if not exists idx_tx_account              on transactions(account_id);
create index if not exists idx_budgets_user            on budgets(user_id);
create index if not exists idx_goals_user              on goals(user_id);

-- ============================================================
-- Trigger: auto-create profile on signup
-- ============================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
