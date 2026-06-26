-- Transactions
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null,
  description text not null,
  category text not null,
  date date not null,
  note text,
  created_at timestamptz not null default now()
);

-- Budgets (one per category)
create table if not exists budgets (
  id uuid primary key default gen_random_uuid(),
  category text not null unique,
  monthly_limit numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

-- Goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  target numeric(12, 2) not null,
  saved numeric(12, 2) not null default 0,
  deadline date,
  created_at timestamptz not null default now()
);

-- Performance indexes
create index if not exists idx_transactions_date on transactions(date);
create index if not exists idx_transactions_type on transactions(type);
create index if not exists idx_transactions_category on transactions(category);
