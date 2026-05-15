create extension if not exists "uuid-ossp";

create table rts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  rw text,
  area_name text,
  kelurahan text,
  kecamatan text,
  city text not null default 'Surabaya',
  address text,
  chairman_name text,
  secretary_name text,
  treasurer_name text,
  security_contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table users (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text unique,
  role text not null check (role in ('super_admin', 'rt_admin', 'warga')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table rt_members (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  address text,
  block_number text,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table faqs (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  question text not null,
  answer text not null,
  category text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table letter_templates (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  letter_type text not null,
  required_fields jsonb not null default '[]',
  template_body text not null,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table letter_requests (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  letter_type text not null,
  status text not null default 'collecting_data'
    check (status in ('collecting_data', 'waiting_admin_review', 'approved', 'rejected', 'completed')),
  form_data jsonb not null default '{}',
  draft_text text,
  admin_notes text,
  approved_by uuid references users(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table complaint_reports (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  category text not null default 'lainnya',
  description text not null,
  location text,
  urgency text default 'sedang',
  status text not null default 'new'
    check (status in ('new', 'in_review', 'in_progress', 'resolved', 'rejected')),
  assigned_to uuid references users(id) on delete set null,
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chat_sessions (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid not null references rts(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  channel text not null default 'web',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table chat_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references chat_sessions(id) on delete cascade,
  sender_type text not null check (sender_type in ('user', 'assistant', 'system')),
  message_text text not null,
  intent text,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

create table ai_audit_logs (
  id uuid primary key default uuid_generate_v4(),
  rt_id uuid references rts(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  input_text text not null,
  detected_intent text,
  ai_response text,
  sources_used jsonb default '[]',
  confidence_score numeric,
  created_at timestamptz default now()
);