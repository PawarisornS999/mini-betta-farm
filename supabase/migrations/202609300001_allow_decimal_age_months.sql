-- Age can be recorded in partial months (for example, 3.5 months).
alter table public.products
  alter column age_months type numeric(5,2)
  using age_months::numeric;
