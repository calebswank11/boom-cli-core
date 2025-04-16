CREATE TABLE user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE,
  password_hash TEXT NOT NULL,
  image varchar(255),
  last_login timestamp
);

CREATE TABLE participant (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  name VARCHAR(255),
  career_goals TEXT,
  education_level VARCHAR(255),
  expertise_area VARCHAR(255),
  years_experience INT,
  is_mentor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255) UNIQUE,
  code VARCHAR(50) UNIQUE,
  industry_type ENUM('school', 'non_profit', 'business', 'other') NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid references organization(id) on delete cascade,
  name VARCHAR(255) NOT NULL,
  address varchar(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE partner (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  entity_type ENUM('employer', 'scholarship_provider', 'grant_provider') NOT NULL,
  company_name VARCHAR(255),
  company_size INT,
  industry VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

-- ENUM('owner', 'admin', 'editor', 'contributor', 'viewer', 'mentor', 'participant', 'partner') NOT NULL,

CREATE TABLE user_role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) not null,
  description VARCHAR(255) not null,
  permissions JSONB,
  scope_level ENUM('global', 'organization', 'location')
);

CREATE TABLE user_organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE NOT NULL,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE NOT NULL,
  user_role_id UUId references user_role(id) on DELETE cascade NOT NULL,
  joined_at timestamp,
  invited_by UUID references user(id),
  status ENUM('active', 'pending', 'removed')
);

CREATE TABLE user_organizations (
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  role ENUM('admin', 'mentor', 'participant', 'employer') NOT NULL
);

CREATE TABLE participant_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  participant_2_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  connection_type ENUM('peer', 'mentor') NOT NULL,
  status ENUM('pending', 'accepted', 'declined') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE participant_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES employer(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pathway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(255),
  status ENUM('active', 'draft', 'deleted') DEFAULT 'active',
  pathway_name VARCHAR(255) NOT NULL,
);

CREATE TABLE pathway_item (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pathway_id UUID REFERENCES pathway(id) ON DELETE CASCADE,
  item_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pathway_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID REFERENCES pathway_item(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pathway_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  pathway_id UUID REFERENCES pathway(id) NOT NULL,
  current_level INT DEFAULT 1,
  status ENUM('active', 'on_hold', 'completed') DEFAULT 'active',
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('job', 'internship', 'grant', 'scholarship') NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(100),
  post_start_date TIMESTAMP,
  post_end_date TIMESTAMP,
  link TEXT,
  status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE internship (
  job_id UUID PRIMARY KEY REFERENCES job(id) ON DELETE CASCADE,
  duration INT,
  is_paid BOOLEAN,
  academic_credit BOOLEAN,
  required_major VARCHAR(255)
);

CREATE TABLE grant (
  job_id UUID PRIMARY KEY REFERENCES job(id) ON DELETE CASCADE,
  funding_amount DECIMAL(10,2),
  eligibility_criteria TEXT,
  required_documents TEXT,
  application_deadline TIMESTAMP,
  renewable BOOLEAN
);

CREATE TABLE scholarship (
  job_id UUID PRIMARY KEY REFERENCES job(id) ON DELETE CASCADE,
  scholarship_amount DECIMAL(10,2),
  eligibility_criteria TEXT,
  required_documents TEXT,
  application_deadline TIMESTAMP,
  renewable BOOLEAN,
  gpa_requirement DECIMAL(3,2)
);


CREATE TABLE job_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  question TEXT NOT NULL
);

CREATE TABLE job_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  status ENUM('applied', 'withdrawn', 'rejected', 'accepted') DEFAULT 'applied',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_application_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_application_id UUID REFERENCES job_application(id) ON DELETE CASCADE,
  status ENUM('applied', 'withdrawn', 'rejected', 'accepted') NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by UUID REFERENCES user(id) ON DELETE SET NULL
);

CREATE TABLE job_answer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  job_question_id UUID REFERENCES job_question(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL,
  name
  ai_suggested BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbp_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not started',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbp_step (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbp_id UUID REFERENCES pbp(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES pbp_progress(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbp_sub_step (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbp_step_id UUID REFERENCES pbp_step(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES pbp_progress(id) ON DELETE CASCADE,
  step_name VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

create table pbp_job_recommendation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbp_id UUID REFERENCES pbp(id) ON DELETE CASCADE,
  job_title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  salary_min INT,
  salary_max INT,
  salary_median INT,
  job_growth_rate FLOAT,
  education_level_required VARCHAR(255),
  experience_required INT,
  skills_required TEXT,
  remote_friendly BOOLEAN DEFAULT FALSE,
  certification_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
)

CREATE TABLE pbp_monkey_wrench (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL,
  name TEXT NOT NULL,
  ai_suggested BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_recommendation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  match_score DECIMAL(5,2),
  viewed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matrix_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  matrix_user_id VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  recurrence_type ENUM('weekly', 'biweekly', 'monthly') DEFAULT 'weekly',
  is_active BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE mentor_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  reason TEXT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE availability_slot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_recurring BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE office_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES availability_slot(id) ON DELETE CASCADE,
  scheduled_time TIMESTAMP NOT NULL,
  status ENUM('scheduled', 'cancelled', 'completed') DEFAULT 'scheduled',
  cancelled_by ENUM('mentor', 'participant') DEFAULT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_interaction (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  activity_type VARCHAR(255) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE organization_user_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  last_login TIMESTAMP DEFAULT NOW(),
  total_logins INT DEFAULT 0,
  messages_sent INT DEFAULT 0,
  jobs_applied INT DEFAULT 0,
  pbp_items_completed INT DEFAULT 0,
  pathway_items_completed INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE path_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  pathway_id UUID REFERENCES pathway(id) ON DELETE CASCADE,
  total_items INT NOT NULL,
  completed_items INT DEFAULT 0,
  completion_rate DECIMAL(5,2) GENERATED ALWAYS AS ((completed_items\::FLOAT / total_items) * 100) STORED,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  job_id UUID REFERENCES job(id) ON DELETE CASCADE,
  total_applications INT DEFAULT 0,
  accepted_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  withdrawn_count INT DEFAULT 0,
  application_to_hire_ratio DECIMAL(5,2) GENERATED ALWAYS AS (CASE WHEN total_applications > 0 THEN (accepted_count::FLOAT / total_applications) * 100 ELSE 0 END) STORED,
  last_updated TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  interaction_type VARCHAR(50) NOT NULL,
  interaction_count INT DEFAULT 0,
  last_used TIMESTAMP DEFAULT NOW()
);


CREATE TABLE chat_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  messages_sent INT DEFAULT 0,
  last_active TIMESTAMP DEFAULT NOW()
);

