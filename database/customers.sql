create extension if not exists pgcrypto;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  national_id text not null,
  city text not null,
  district text,
  income_type text not null default 'monthly',
  income_amount integer not null default 0,
  income_label text not null default '',
  collateral text not null,
  funding_need text not null,
  status text not null default 'pending',
  selfie_url text,
  id_card_front_url text,
  id_card_back_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_status_check check (status in ('pending', 'approved'))
);

create index if not exists customers_created_at_idx
on customers(created_at desc);
