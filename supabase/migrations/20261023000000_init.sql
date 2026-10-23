-- ============================================================================
-- PHILO LAB | 생각실험실 — 초기 스키마
-- ----------------------------------------------------------------------------
-- 역할(role): student | teacher | admin  (profiles.role)
--   * role 은 클라이언트에서 변경할 수 없습니다 (profiles 에 사용자 UPDATE 정책 없음).
--   * 최초 관리자는 Supabase Dashboard 의 SQL Editor 에서만 부여합니다 (README 참고).
-- 공개 범위(visibility): public | students | class | admin
--   * public   : 게스트 포함 누구나
--   * students : 로그인한 (활성) 학생
--   * class    : class_ids 에 지정된 학급의 학생
--   * admin    : 관리자만
-- 모든 테이블에 Row Level Security 를 적용합니다.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. 공통 유틸
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- 1. 사용자 / 학생 / 학급
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  must_change_password boolean not null default false,
  created_at timestamptz not null default now()
);
comment on table public.profiles is '인증 사용자별 역할. 이메일·이름 등 개인정보는 저장하지 않습니다.';

create table public.academic_years (
  year int primary key check (year between 2000 and 2100),
  label text,
  is_current boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  academic_year int not null references public.academic_years (year) on update cascade,
  grade int not null check (grade between 1 and 3),
  class_number int not null check (class_number between 1 and 30),
  created_at timestamptz not null default now(),
  unique (academic_year, grade, class_number)
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users (id) on delete set null,
  -- 학번 9자리 = 학년도(4) + 학년(1) + 반(2) + 번호(2)  예) 202620101
  student_number text not null unique check (student_number ~ '^[0-9]{9}$'),
  name text not null check (char_length(btrim(name)) between 1 and 40),
  grade int not null check (grade between 1 and 3),
  class_number int not null check (class_number between 1 and 30),
  number int not null check (number between 1 and 60),
  academic_year int not null references public.academic_years (year) on update cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
comment on table public.students is '학생 명부. 필수 정보(학번·이름·학년·반·번호·학년도)만 저장합니다. 비밀번호는 Supabase Auth 가 해시로 관리합니다.';
create index students_year_class_idx on public.students (academic_year, grade, class_number, number);

create table public.student_classes (
  student_id uuid not null references public.students (id) on delete cascade,
  class_id uuid not null references public.classes (id) on delete cascade,
  primary key (student_id, class_id)
);

-- ---------------------------------------------------------------------------
-- 2. 권한 헬퍼 (security definer: RLS 를 우회해 현재 사용자 정보만 조회)
-- ---------------------------------------------------------------------------
create or replace function public.current_role_name()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.is_student()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.students where user_id = auth.uid() and active);
$$;

create or replace function public.my_class_ids()
returns uuid[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(array_agg(sc.class_id), '{}')
  from public.student_classes sc
  join public.students s on s.id = sc.student_id
  where s.user_id = auth.uid() and s.active;
$$;

create or replace function public.is_my_student(sid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.students where id = sid and user_id = auth.uid() and active);
$$;

create or replace function public.can_view(vis text, cls uuid[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case vis
    when 'public' then true
    when 'students' then public.is_student() or public.is_admin()
    when 'class' then public.is_admin() or (coalesce(cls, '{}') && public.my_class_ids())
    when 'admin' then public.is_admin()
    else false
  end;
$$;

-- 새 Auth 사용자 → profiles 자동 생성 (항상 student 로 시작)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, must_change_password)
  values (
    new.id,
    'student',
    coalesce((new.raw_app_meta_data ->> 'must_change_password')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 학생 본인이 비밀번호를 바꾼 뒤 "변경 필요" 표시만 해제 (role 등 다른 컬럼은 건드릴 수 없음)
create or replace function public.mark_password_changed()
returns void
language sql
security definer
set search_path = public
as $$
  update public.profiles set must_change_password = false where id = auth.uid();
$$;

-- 로그인 직후 필요한 내 정보 (역할 + 학생 정보) 한 번에 조회
create or replace function public.get_my_account()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'role', p.role,
    'must_change_password', p.must_change_password,
    'student', (
      select row_to_json(s) from (
        select id, student_number, name, grade, class_number, number, academic_year, active
        from public.students where user_id = auth.uid()
      ) s
    )
  )
  from public.profiles p
  where p.id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- 3. 콘텐츠 테이블 (모두 visibility + class_ids 공통 컬럼)
-- ---------------------------------------------------------------------------
create table public.philosophers (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  name text not null,
  name_en text,
  region text not null check (region in ('동양', '서양')),
  era text not null check (era in ('고대', '중세', '근대', '현대')),
  period text,
  school text,
  symbol text,
  quote text,
  keywords text[] not null default '{}',
  summary text,
  ideas text[] not null default '{}',
  stats jsonb not null default '[]',
  related text[] not null default '{}',
  games text[] not null default '{}',
  dilemmas text[] not null default '{}',
  image text,
  image_source text,
  image_creator text,
  image_license text,
  image_type text check (image_type in ('photo', 'portrait', 'bust', 'painting', 'illustration')),
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.games (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  title text not null,
  tagline text,
  description text,
  type text not null,
  status text not null default 'coming' check (status in ('live', 'external', 'coming', 'planned')),
  internal_route text check (internal_route is null or internal_route ~ '^/'),
  external_url text check (external_url is null or external_url ~ '^https://'),
  thumbnail text,
  icon text,
  accent text default 'gold',
  featured boolean not null default false,
  duration text,
  players text,
  how_to text[] not null default '{}',
  philosophers text[] not null default '{}',
  save_result boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.daily_questions (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  question text not null,
  hint text,
  related text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 수업 콘텐츠 (과목별 주제: 사상가·쟁점·통합사회 주제)
create table public.lessons (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  subject_id text not null check (subject_id in ('ethics-thought', 'modern-ethics', 'integrated-social')),
  group_title text not null,
  name text not null,
  summary text,
  philosopher_id text,
  questions text[] not null default '{}',
  tools jsonb not null default '[]',
  sections jsonb not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  title text not null,
  category text not null,
  subject text,
  period text,
  status text,
  icon text,
  description text,
  core_questions text[] not null default '{}',
  method text,
  steps jsonb not null default '[]',
  outputs jsonb not null default '[]',
  materials jsonb not null default '[]',
  philosophers text[] not null default '{}',
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.resources (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  title text not null,
  category text not null,
  subject text,
  date date,
  format text,
  description text,
  file_url text,
  philosophers text[] not null default '{}',
  visibility text not null default 'admin' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 동아리 (학년도별로 구성·이름이 달라질 수 있음 → 매년 새 행)
create table public.clubs (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  academic_year int not null references public.academic_years (year) on update cascade,
  name text not null,
  description text,
  motto text,
  thumbnail text,
  activity_types jsonb not null default '[]',
  annual_plan jsonb not null default '[]',
  related_projects text[] not null default '{}',
  active boolean not null default true,
  archived boolean not null default false,
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.club_activities (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,62}$'),
  -- 동아리를 지워도 활동 기록은 남도록 restrict (보관은 clubs.archived 사용)
  club_id text not null references public.clubs (id) on update cascade on delete restrict,
  date date not null,
  title text not null,
  type text,
  description text,
  images text[] not null default '{}',
  student_outputs jsonb not null default '[]',
  opinions text[] not null default '{}',
  result text,
  visibility text not null default 'public' check (visibility in ('public', 'students', 'class', 'admin')),
  class_ids uuid[] not null default '{}',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index club_activities_club_date_idx on public.club_activities (club_id, date desc);

do $$
declare t text;
begin
  foreach t in array array['philosophers', 'games', 'daily_questions', 'lessons', 'projects', 'resources', 'clubs', 'club_activities']
  loop
    execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- 4. 학생 기록 (최소 수집)
-- ---------------------------------------------------------------------------
create table public.test_results (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students (id) on delete cascade,
  test_id text not null check (char_length(test_id) <= 64),
  result_type text check (char_length(result_type) <= 64),
  philosopher text check (char_length(philosopher) <= 64),
  utilitarianism_score int check (utilitarianism_score between 0 and 100),
  deontology_score int check (deontology_score between 0 and 100),
  virtue_score int check (virtue_score between 0 and 100),
  existentialism_score int check (existentialism_score between 0 and 100),
  created_at timestamptz not null default now()
);
create index test_results_student_idx on public.test_results (student_id, created_at desc);

create table public.activity_logs (
  id bigint generated always as identity primary key,
  student_id uuid not null references public.students (id) on delete cascade,
  content_type text not null check (content_type in ('lesson', 'game', 'test', 'quiz', 'project', 'club')),
  content_id text not null check (char_length(content_id) <= 64),
  action text not null check (action in ('view', 'complete', 'play', 'submit')),
  result jsonb check (result is null or pg_column_size(result) <= 1024),
  created_at timestamptz not null default now()
);
comment on table public.activity_logs is '교육 목적의 최소 활동 기록 (무엇을 언제 했는지). IP·기기 정보 등은 저장하지 않습니다.';
create index activity_logs_student_idx on public.activity_logs (student_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 5. Row Level Security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.student_classes enable row level security;
alter table public.philosophers enable row level security;
alter table public.games enable row level security;
alter table public.daily_questions enable row level security;
alter table public.lessons enable row level security;
alter table public.projects enable row level security;
alter table public.resources enable row level security;
alter table public.clubs enable row level security;
alter table public.club_activities enable row level security;
alter table public.test_results enable row level security;
alter table public.activity_logs enable row level security;

-- profiles: 본인 또는 관리자만 조회, 수정은 관리자만 (역할 자가 변경 불가)
create policy profiles_select on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy profiles_admin_update on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- 학년도·학급: 구조 정보(개인정보 아님)는 누구나 조회, 변경은 관리자
create policy academic_years_select on public.academic_years for select using (true);
create policy academic_years_admin on public.academic_years for all using (public.is_admin()) with check (public.is_admin());
create policy classes_select on public.classes for select using (true);
create policy classes_admin on public.classes for all using (public.is_admin()) with check (public.is_admin());

-- 학생 명부: 본인 행만, 관리자는 전체
create policy students_select on public.students for select using (user_id = auth.uid() or public.is_admin());
create policy students_admin on public.students for all using (public.is_admin()) with check (public.is_admin());
create policy student_classes_select on public.student_classes for select using (public.is_my_student(student_id) or public.is_admin());
create policy student_classes_admin on public.student_classes for all using (public.is_admin()) with check (public.is_admin());

-- 콘텐츠: 공개 범위에 따라 조회, 변경은 관리자
do $$
declare t text;
begin
  foreach t in array array['philosophers', 'games', 'daily_questions', 'lessons', 'projects', 'resources', 'clubs', 'club_activities']
  loop
    execute format('create policy %I_select on public.%I for select using (public.can_view(visibility, class_ids))', t, t);
    execute format('create policy %I_admin on public.%I for all using (public.is_admin()) with check (public.is_admin())', t, t);
  end loop;
end;
$$;

-- 학생 기록: 본인(활성 학생)만 추가·조회, 관리자는 조회·삭제
create policy test_results_select on public.test_results for select using (public.is_my_student(student_id) or public.is_admin());
create policy test_results_insert on public.test_results for insert with check (public.is_my_student(student_id));
create policy test_results_admin_delete on public.test_results for delete using (public.is_admin());
create policy activity_logs_select on public.activity_logs for select using (public.is_my_student(student_id) or public.is_admin());
create policy activity_logs_insert on public.activity_logs for insert with check (public.is_my_student(student_id));
create policy activity_logs_admin_delete on public.activity_logs for delete using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. 권한(GRANT) — RLS 가 실제 접근을 제한합니다
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.mark_password_changed() to authenticated;
grant execute on function public.get_my_account() to authenticated;
grant execute on function public.can_view(text, uuid[]) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_student() to anon, authenticated;
grant execute on function public.my_class_ids() to anon, authenticated;
grant execute on function public.is_my_student(uuid) to anon, authenticated;
grant execute on function public.current_role_name() to anon, authenticated;
