create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  national_id text not null,
  birth_date text,
  phone text,
  line_id text,
  city text not null,
  area text not null default '',
  job_type text,
  work_years text,
  income_range text,
  income_type text not null default 'monthly' check (income_type in ('monthly', 'daily')),
  income_amount integer not null default 0 check (income_amount >= 0),
  daily_income_amount integer not null default 0 check (daily_income_amount >= 0),
  has_payroll_or_labor_insurance text,
  funding_amount_wan text,
  funding_need integer not null default 0 check (funding_need >= 0),
  funding_purpose text,
  pawn_item text,
  collateral text,
  emergency_name text,
  emergency_phone text,
  emergency_relation text,
  status text not null default 'pending' check (status in ('pending', 'approved')),
  selfie_url text,
  id_card_front_url text,
  id_card_back_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_created_at_desc_idx on customers (created_at desc);
create index if not exists customers_status_idx on customers (status);
create index if not exists customers_national_id_idx on customers (national_id);
