-- Adds an editable starting balance to profiles, used to compute the
-- running "Balance" shown on the dashboard:
--   balance = starting_balance + sum(income) - sum(expense)  (all transactions)
alter table profiles
  add column if not exists starting_balance numeric(14,2) not null default 0;
