-- Supabase PostgreSQL Schema for Gokul Vivaham Matrimony Platform

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- 1. USERS TABLE
create table users (
    id uuid primary key default gen_random_uuid(),
    auth_user_id uuid unique not null,
    
    email text unique,
    mobile_number varchar(15) unique,

    role varchar(20) default 'user',
    status varchar(20) default 'active',

    email_verified boolean default false,
    mobile_verified boolean default false,

    last_login_at timestamptz,
    
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    deleted_at timestamptz
);

-- 2. PROFILES TABLE
create table profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references users(id) on delete cascade,

    profile_id varchar(20) unique not null,

    first_name varchar(100),
    last_name varchar(100),

    gender varchar(20),
    date_of_birth date,
    age integer,

    height_cm integer,
    weight_kg integer,

    marital_status varchar(50),

    religion varchar(100),
    caste varchar(100),
    sub_caste varchar(100),

    mother_tongue varchar(100),

    rasi varchar(100),
    nakshatra varchar(100),
    gothram varchar(100),

    education varchar(255),
    occupation varchar(255),
    company_name varchar(255),

    annual_income numeric,

    country varchar(100),
    state varchar(100),
    city varchar(100),

    native_place varchar(255),

    father_name varchar(255),
    father_occupation varchar(255),

    mother_name varchar(255),
    mother_occupation varchar(255),

    siblings text,

    family_type varchar(100),

    physical_status varchar(100),

    about_me text,
    partner_expectations text,

    is_verified boolean default false,
    is_premium boolean default false,

    profile_completion integer default 0,

    visibility varchar(20) default 'public',

    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    deleted_at timestamptz
);

-- 3. PARTNER PREFERENCES
create table partner_preferences (
    id uuid primary key default gen_random_uuid(),
    
    user_id uuid references users(id) on delete cascade,

    min_age integer,
    max_age integer,

    min_height integer,
    max_height integer,

    religion varchar(100),
    caste varchar(100),

    mother_tongue varchar(100),

    education text,
    occupation text,

    country varchar(100),
    state varchar(100),

    marital_status varchar(100),

    rasi varchar(100),
    nakshatra varchar(100),

    annual_income_min numeric,

    created_at timestamptz default now()
);

-- 4. HOROSCOPE UPLOADS
create table horoscope_uploads (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id) on delete cascade,

    file_url text not null,
    file_name text,

    file_type varchar(50),

    uploaded_at timestamptz default now()
);

-- 5. GALLERY IMAGES
create table gallery_images (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id) on delete cascade,

    image_url text not null,

    is_profile_picture boolean default false,
    is_private boolean default false,

    uploaded_at timestamptz default now()
);

-- 6. MATCH REQUESTS
create table match_requests (
    id uuid primary key default gen_random_uuid(),

    sender_user_id uuid references users(id) on delete cascade,
    receiver_user_id uuid references users(id) on delete cascade,

    status varchar(20) default 'pending',

    message text,

    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 7. SUBSCRIPTION PLANS
create table subscription_plans (
    id uuid primary key default gen_random_uuid(),

    name varchar(100),
    price numeric,

    duration_days integer,

    features jsonb,

    created_at timestamptz default now()
);

-- 8. USER SUBSCRIPTIONS
create table subscriptions (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id) on delete cascade,

    plan_id uuid references subscription_plans(id),

    payment_status varchar(50),

    start_date timestamptz,
    end_date timestamptz,

    razorpay_payment_id text,

    created_at timestamptz default now()
);

-- 9. ADMIN USERS
create table admin_users (
    id uuid primary key default gen_random_uuid(),

    auth_user_id uuid unique not null,

    full_name varchar(255),

    email varchar(255) unique,

    role varchar(50) default 'admin',

    is_super_admin boolean default false,

    last_login_at timestamptz,

    created_at timestamptz default now()
);

-- 10. NOTIFICATIONS
create table notifications (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id) on delete cascade,

    title varchar(255),
    message text,

    type varchar(100),

    is_read boolean default false,

    created_at timestamptz default now()
);

-- 11. CHATS
create table chats (
    id uuid primary key default gen_random_uuid(),

    user_one uuid references users(id),
    user_two uuid references users(id),

    created_at timestamptz default now()
);

-- 12. CHAT MESSAGES
create table chat_messages (
    id uuid primary key default gen_random_uuid(),

    chat_id uuid references chats(id) on delete cascade,

    sender_id uuid references users(id),

    message text,

    image_url text,

    is_seen boolean default false,

    created_at timestamptz default now()
);

-- 13. FAVORITES / SHORTLIST
create table favorites (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),
    favorite_user_id uuid references users(id),

    created_at timestamptz default now()
);

-- 14. BLOCKED USERS
create table blocked_users (
    id uuid primary key default gen_random_uuid(),

    blocker_user_id uuid references users(id),
    blocked_user_id uuid references users(id),

    reason text,

    created_at timestamptz default now()
);

-- 15. REPORTS TABLE
create table reports (
    id uuid primary key default gen_random_uuid(),

    reporter_user_id uuid references users(id),
    reported_user_id uuid references users(id),

    reason text,
    status varchar(20) default 'pending',

    created_at timestamptz default now()
);

-- 16. SUCCESS STORIES
create table success_stories (
    id uuid primary key default gen_random_uuid(),

    husband_user_id uuid references users(id),
    wife_user_id uuid references users(id),

    story text,

    wedding_date date,

    image_url text,

    created_at timestamptz default now()
);

-- 17. PROFILE VIEWS
create table profile_views (
    id uuid primary key default gen_random_uuid(),

    viewer_user_id uuid references users(id),
    viewed_user_id uuid references users(id),

    viewed_at timestamptz default now()
);

-- 18. VERIFICATION REQUESTS
create table verification_requests (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    document_url text,

    status varchar(20) default 'pending',

    reviewed_by uuid references admin_users(id),

    reviewed_at timestamptz,

    created_at timestamptz default now()
);

-- 19. COMPATIBILITY SCORES
create table compatibility_scores (
    id uuid primary key default gen_random_uuid(),

    user_one uuid references users(id),
    user_two uuid references users(id),

    astrology_score integer,
    ai_score integer,
    total_score integer,

    notes text,

    calculated_at timestamptz default now()
);

-- 20. ACTIVITY LOGS
create table activity_logs (
    id uuid primary key default gen_random_uuid(),

    user_id uuid references users(id),

    action varchar(255),

    metadata jsonb,

    ip_address text,

    created_at timestamptz default now()
);


-- ROW LEVEL SECURITY (RLS)
alter table users enable row level security;
alter table profiles enable row level security;
alter table partner_preferences enable row level security;
alter table horoscope_uploads enable row level security;
alter table gallery_images enable row level security;
alter table match_requests enable row level security;
alter table subscription_plans enable row level security;
alter table subscriptions enable row level security;
alter table admin_users enable row level security;
alter table notifications enable row level security;
alter table chats enable row level security;
alter table chat_messages enable row level security;
alter table favorites enable row level security;
alter table blocked_users enable row level security;
alter table reports enable row level security;
alter table success_stories enable row level security;
alter table profile_views enable row level security;
alter table verification_requests enable row level security;
alter table compatibility_scores enable row level security;
alter table activity_logs enable row level security;


-- SAMPLE RLS POLICIES

-- Users can view own profile
create policy "Users can view own profile"
on profiles
for select
using (
    auth.uid() = user_id
);

-- Admins can manage all profiles
create policy "Admins can manage all profiles"
on profiles
for all
using (
    exists (
        select 1 from admin_users
        where auth.uid() = admin_users.auth_user_id
    )
);

-- General read permission on profiles for authenticated users (public visibility)
create policy "Authenticated users can select public profiles"
on profiles
for select
using (
    auth.role() = 'authenticated' and visibility = 'public'
);

-- Users can insert own profile
create policy "Users can insert own profile"
on profiles
for insert
with check (
    auth.uid() = user_id
);

-- Users can update own profile
create policy "Users can update own profile"
on profiles
for update
using (
    auth.uid() = user_id
);


-- RLS POLICIES FOR OTHER TABLES
create policy "Users can view own user row" on users for select using (auth.uid() = auth_user_id);
create policy "Users can insert own user row" on users for insert with check (auth.uid() = auth_user_id);
create policy "Users can update own user row" on users for update using (auth.uid() = auth_user_id);

create policy "Users can view own preferences" on partner_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on partner_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on partner_preferences for update using (auth.uid() = user_id);

create policy "Users can view own horoscope" on horoscope_uploads for select using (auth.uid() = user_id);
create policy "Users can insert own horoscope" on horoscope_uploads for insert with check (auth.uid() = user_id);

create policy "Users can view own gallery" on gallery_images for select using (auth.uid() = user_id);
create policy "Users can insert own gallery" on gallery_images for insert with check (auth.uid() = user_id);

create policy "Users can view own match requests" on match_requests for select using (auth.uid() = sender_user_id or auth.uid() = receiver_user_id);
create policy "Users can insert own match requests" on match_requests for insert with check (auth.uid() = sender_user_id);
create policy "Users can update own match requests" on match_requests for update using (auth.uid() = sender_user_id or auth.uid() = receiver_user_id);

create policy "Users can view own chats" on chats for select using (auth.uid() = user_one or auth.uid() = user_two);
create policy "Users can insert own chats" on chats for insert with check (auth.uid() = user_one or auth.uid() = user_two);

create policy "Users can view messages in own chats" on chat_messages for select using (exists (select 1 from chats where chats.id = chat_id and (chats.user_one = auth.uid() or chats.user_two = auth.uid())));
create policy "Users can insert messages in own chats" on chat_messages for insert with check (sender_id = auth.uid() and exists (select 1 from chats where chats.id = chat_id and (chats.user_one = auth.uid() or chats.user_two = auth.uid())));

create policy "Users can view own notifications" on notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on notifications for update using (auth.uid() = user_id);


-- INDEXING STRATEGY
create index idx_profiles_gender on profiles(gender);
create index idx_profiles_rasi on profiles(rasi);
create index idx_profiles_nakshatra on profiles(nakshatra);
create index idx_profiles_city on profiles(city);
create index idx_profiles_premium on profiles(is_premium);


-- TRIGGER FOR UPDATING TIMESTAMPS
create or replace function handle_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger trigger_users_updated_at before update on users for each row execute procedure handle_updated_at();
create trigger trigger_profiles_updated_at before update on profiles for each row execute procedure handle_updated_at();
create trigger trigger_match_requests_updated_at before update on match_requests for each row execute procedure handle_updated_at();
