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

CREATE TABLE partner_organization (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partner(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(partner_id, organization_id)
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
  partner_id UUID REFERENCES partner(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pathway (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  description VARCHAR(255),
  status ENUM('active', 'draft', 'deleted') DEFAULT 'active',
  pathway_name VARCHAR(255) NOT NULL
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

CREATE TABLE opportunity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES partner(id) ON DELETE SET NULL, -- Partner who posted it (if applicable)
  created_by_user_id UUID REFERENCES user(id) ON DELETE SET NULL, -- User who created it
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('job', 'internship', 'grant', 'scholarship') NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip VARCHAR(20),
  country VARCHAR(100),
  post_start_date TIMESTAMP,
  post_end_date TIMESTAMP,
  application_deadline TIMESTAMP, -- Common deadline field
  link TEXT,
  status ENUM('draft', 'published', 'closed') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Job specific details
CREATE TABLE job (
  opportunity_id UUID PRIMARY KEY REFERENCES opportunity(id) ON DELETE CASCADE,
  employment_type ENUM('full_time', 'part_time', 'contract', 'temporary', 'freelance', 'other') NOT NULL,
  work_location_type ENUM('on_site', 'remote', 'hybrid', 'flexible') NOT NULL,
  salary_min DECIMAL(10,2),
  salary_max DECIMAL(10,2),
  salary_currency VARCHAR(10) DEFAULT 'USD',
  required_experience VARCHAR(255),
  required_education VARCHAR(255),
  CONSTRAINT check_salary CHECK (
  (salary_min IS NULL AND salary_max IS NULL) OR
  (salary_min IS NOT NULL AND salary_max IS NOT NULL AND salary_min <= salary_max)
  )
);

-- Internship specific details
CREATE TABLE internship (
  opportunity_id UUID PRIMARY KEY REFERENCES opportunity(id) ON DELETE CASCADE,
  duration_weeks INT,
  is_paid BOOLEAN,
  academic_credit BOOLEAN,
  required_major VARCHAR(255),
  CONSTRAINT check_duration CHECK (duration_weeks IS NULL OR duration_weeks > 0)
);

-- Grant specific details
CREATE TABLE grant (
  opportunity_id UUID PRIMARY KEY REFERENCES opportunity(id) ON DELETE CASCADE,
  funding_amount DECIMAL(10,2),
  eligibility_criteria TEXT,
  required_documents TEXT,
  renewable BOOLEAN,
  CONSTRAINT check_funding CHECK (funding_amount IS NULL OR funding_amount > 0)
);

-- Scholarship specific details
CREATE TABLE scholarship (
  opportunity_id UUID PRIMARY KEY REFERENCES opportunity(id) ON DELETE CASCADE,
  scholarship_amount DECIMAL(10,2),
  eligibility_criteria TEXT,
  required_documents TEXT,
  renewable BOOLEAN,
  gpa_requirement DECIMAL(3,2),
  CONSTRAINT check_scholarship_amount CHECK (scholarship_amount IS NULL OR scholarship_amount > 0),
  CONSTRAINT check_gpa CHECK (gpa_requirement IS NULL OR (gpa_requirement >= 0.0 AND gpa_requirement <= 4.0))
);

CREATE TABLE opportunity_location (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunity(id) ON DELETE CASCADE,
  location_id UUID REFERENCES location(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(opportunity_id, location_id)
);

CREATE TABLE opportunity_question (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES opportunity(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  is_required BOOLEAN DEFAULT TRUE,
  order_index INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Application tracking
CREATE TABLE opportunity_application (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunity(id) ON DELETE CASCADE,
  status ENUM('draft', 'applied', 'in_review', 'withdrawn', 'rejected', 'accepted') DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  submitted_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, opportunity_id) -- Prevent duplicate applications
);

-- Tracking application status changes
CREATE TABLE opportunity_application_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_application_id UUID REFERENCES opportunity_application(id) ON DELETE CASCADE,
  status ENUM('draft', 'applied', 'in_review', 'withdrawn', 'rejected', 'accepted') NOT NULL,
  changed_at TIMESTAMP DEFAULT NOW(),
  changed_by UUID REFERENCES user(id) ON DELETE SET NULL,
  notes TEXT
);

-- Application answers to questions
CREATE TABLE opportunity_answer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_application_id UUID REFERENCES opportunity_application(id) ON DELETE CASCADE,
  opportunity_question_id UUID REFERENCES opportunity_question(id) ON DELETE CASCADE,
  answer TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(opportunity_application_id, opportunity_question_id) -- One answer per question per application
);

CREATE TABLE pbp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  ai_suggested BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pbp_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  status ENUM('not_started', 'in_progress', 'completed') DEFAULT 'not_started',
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

-- AI-generated career opportunity recommendations
CREATE TABLE pbp_opportunity_recommendation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pbp_id UUID REFERENCES pbp(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  industry VARCHAR(255),
  salary_min INT,
  salary_max INT,
  salary_median INT,
  growth_rate FLOAT,
  education_level_required VARCHAR(255),
  experience_required INT,
  skills_required TEXT,
  remote_friendly BOOLEAN DEFAULT FALSE,
  certification_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT check_salary_pbp CHECK (
  (salary_min IS NULL AND salary_max IS NULL) OR
  (salary_min <= salary_max)
  )
);

CREATE TABLE pbp_monkey_wrench (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID REFERENCES participant(id) ON DELETE CASCADE,
  career_goal TEXT NOT NULL,
  name VARCHAR(100) NOT NULL,
  ai_suggested BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matrix_user (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user(id) ON DELETE CASCADE,
  matrix_user_id VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE schedule (
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

CREATE TYPE courseStatusMeta_enum AS ENUM ('draft', 'published', 'archived');
CREATE TYPE courseLevelMeta_enum AS ENUM ('beginner', 'intermediate', 'advanced', 'professional');
CREATE TYPE courseOriginMeta_enum AS ENUM ('organization', 'location');
CREATE TYPE courseAttachmentTypeMeta_enum AS ENUM ('pdf', 'image', 'link');

CREATE TABLE course (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organization(id),
  location_id UUID REFERENCES location(id),
  origin courseOriginMeta_enum,
  created_by UUID REFERENCES user(id),
  name TEXT NOT NULL,
  description TEXT,
  level courseLevelMeta_enum,
  status courseStatusMeta_enum,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT course_created_by_foreign FOREIGN KEY (created_by) REFERENCES user(id),
  CONSTRAINT course_location_id_foreign FOREIGN KEY (location_id) REFERENCES location(id),
  CONSTRAINT course_organization_id_foreign FOREIGN KEY (organization_id) REFERENCES organization(id)
);

CREATE TABLE course_assignment (
  id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES course(id),
  due_date DATE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES user(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT course_assignment_course_id_foreign FOREIGN KEY (course_id) REFERENCES course(id),
  CONSTRAINT course_assignment_created_by_foreign FOREIGN KEY (created_by) REFERENCES user(id)
);

CREATE TABLE course_location (
  id UUID PRIMARY KEY,
  location_id UUID REFERENCES location(id),
  course_id UUID REFERENCES course(id),
  enabled BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  deleted_at TIMESTAMP,

  CONSTRAINT course_location_course_id_foreign FOREIGN KEY (course_id) REFERENCES course(id),
  CONSTRAINT course_location_location_id_foreign FOREIGN KEY (location_id) REFERENCES location(id)
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
  scholarships_applied INT DEFAULT 0,
  grants_applied INT DEFAULT 0,
  internships_applied INT DEFAULT 0,
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

-- Metrics table for opportunities
CREATE TABLE opportunity_metric (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organization(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunity(id) ON DELETE CASCADE,
  total_views INT DEFAULT 0,
  total_applications INT DEFAULT 0,
  accepted_count INT DEFAULT 0,
  rejected_count INT DEFAULT 0,
  withdrawn_count INT DEFAULT 0,
  application_to_hire_ratio DECIMAL(5,2) GENERATED ALWAYS AS (
  CASE WHEN total_applications > 0
  THEN (accepted_count::FLOAT / total_applications) * 100
  ELSE 0 END
  ) STORED,
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(opportunity_id)
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

-- User table
CREATE INDEX idx_user_email ON user(email);
CREATE INDEX idx_user_username ON user(username);
CREATE INDEX idx_user_phone ON user(phone);

-- Participant table
CREATE INDEX idx_participant_user ON participant(user_id);
CREATE INDEX idx_participant_is_mentor ON participant(is_mentor);
CREATE INDEX idx_participant_expertise ON participant(expertise_area);

-- Partner table
CREATE INDEX idx_partner_user ON partner(user_id);
CREATE INDEX idx_partner_entity_type ON partner(entity_type);
CREATE INDEX idx_partner_company ON partner(company_name);

-- Matrix user
CREATE INDEX idx_matrix_user_user ON matrix_user(user_id);

-- Organization table
CREATE INDEX idx_organization_industry ON organization(industry_type);
CREATE INDEX idx_organization_code ON organization(code);

-- Location table
CREATE INDEX idx_location_organization ON location(organization_id);
CREATE INDEX idx_location_name ON location(name);

-- Partner organization junction
CREATE INDEX idx_partner_organization_partner ON partner_organization(partner_id);
CREATE INDEX idx_partner_organization_org ON partner_organization(organization_id);

-- User organization
CREATE INDEX idx_user_organization_user ON user_organization(user_id);
CREATE INDEX idx_user_organization_org ON user_organization(organization_id);
CREATE INDEX idx_user_organization_role ON user_organization(user_role_id);
CREATE INDEX idx_user_organization_status ON user_organization(status);

-- Participant connections
CREATE INDEX idx_participant_connections_p1 ON participant_connections(participant_1_id);
CREATE INDEX idx_participant_connections_p2 ON participant_connections(participant_2_id);
CREATE INDEX idx_participant_connections_org ON participant_connections(organization_id);
CREATE INDEX idx_participant_connections_type ON participant_connections(connection_type);
CREATE INDEX idx_participant_connections_status ON participant_connections(status);

-- Participant follows
CREATE INDEX idx_participant_follows_participant ON participant_follows(participant_id);
CREATE INDEX idx_participant_follows_partner ON participant_follows(partner_id);

-- Pathway table
CREATE INDEX idx_pathway_status ON pathway(status);
CREATE INDEX idx_pathway_name ON pathway(pathway_name);

-- Pathway item
CREATE INDEX idx_pathway_item_pathway ON pathway_item(pathway_id);
CREATE INDEX idx_pathway_item_order ON pathway_item(order_index);

-- Pathway attachments
CREATE INDEX idx_pathway_attachments_item ON pathway_attachments(item_id);

-- Pathway user
CREATE INDEX idx_pathway_user_participant ON pathway_user(participant_id);
CREATE INDEX idx_pathway_user_pathway ON pathway_user(pathway_id);
CREATE INDEX idx_pathway_user_status ON pathway_user(status);

-- Opportunity table
CREATE INDEX idx_opportunity_organization ON opportunity(organization_id);
CREATE INDEX idx_opportunity_partner ON opportunity(partner_id);
CREATE INDEX idx_opportunity_creator ON opportunity(created_by_user_id);
CREATE INDEX idx_opportunity_type ON opportunity(type);
CREATE INDEX idx_opportunity_status ON opportunity(status);
CREATE INDEX idx_opportunity_location ON opportunity(city, state, country);
CREATE INDEX idx_opportunity_deadline ON opportunity(application_deadline);
CREATE INDEX idx_opportunity_post_dates ON opportunity(post_start_date, post_end_date);

-- Opportunity location junction
CREATE INDEX idx_opportunity_location_opportunity ON opportunity_location(opportunity_id);
CREATE INDEX idx_opportunity_location_location ON opportunity_location(location_id);

-- Job details
CREATE INDEX idx_job_employment_type ON job(employment_type);
CREATE INDEX idx_job_location_type ON job(work_location_type);
CREATE INDEX idx_job_salary ON job(salary_min, salary_max);

-- Internship details
CREATE INDEX idx_internship_paid ON internship(is_paid);
CREATE INDEX idx_internship_academic ON internship(academic_credit);
CREATE INDEX idx_internship_major ON internship(required_major);

-- Grant details
CREATE INDEX idx_grant_funding ON grant(funding_amount);
CREATE INDEX idx_grant_renewable ON grant(renewable);

-- Scholarship details
CREATE INDEX idx_scholarship_amount ON scholarship(scholarship_amount);
CREATE INDEX idx_scholarship_gpa ON scholarship(gpa_requirement);
CREATE INDEX idx_scholarship_renewable ON scholarship(renewable);

-- Opportunity questions
CREATE INDEX idx_opportunity_question_opportunity ON opportunity_question(opportunity_id);
CREATE INDEX idx_opportunity_question_required ON opportunity_question(is_required);
CREATE INDEX idx_opportunity_question_order ON opportunity_question(order_index);

-- Opportunity applications
CREATE INDEX idx_opportunity_application_participant ON opportunity_application(participant_id);
CREATE INDEX idx_opportunity_application_opportunity ON opportunity_application(opportunity_id);
CREATE INDEX idx_opportunity_application_status ON opportunity_application(status);
CREATE INDEX idx_opportunity_application_dates ON opportunity_application(created_at, submitted_at);

-- Application logs
CREATE INDEX idx_opportunity_application_log_app ON opportunity_application_log(opportunity_application_id);
CREATE INDEX idx_opportunity_application_log_status ON opportunity_application_log(status);
CREATE INDEX idx_opportunity_application_log_changed_by ON opportunity_application_log(changed_by);

-- Application answers
CREATE INDEX idx_opportunity_answer_application ON opportunity_answer(opportunity_application_id);
CREATE INDEX idx_opportunity_answer_question ON opportunity_answer(opportunity_question_id);

-- PBP table
CREATE INDEX idx_pbp_participant ON pbp(participant_id);
CREATE INDEX idx_pbp_ai_suggested ON pbp(ai_suggested);

-- PBP progress
CREATE INDEX idx_pbp_progress_participant ON pbp_progress(participant_id);
CREATE INDEX idx_pbp_progress_status ON pbp_progress(status);

-- PBP steps
CREATE INDEX idx_pbp_step_pbp ON pbp_step(pbp_id);
CREATE INDEX idx_pbp_step_progress ON pbp_step(progress_id);
CREATE INDEX idx_pbp_step_order ON pbp_step(order_index);

-- PBP sub-steps
CREATE INDEX idx_pbp_sub_step_step ON pbp_sub_step(pbp_step_id);
CREATE INDEX idx_pbp_sub_step_progress ON pbp_sub_step(progress_id);
CREATE INDEX idx_pbp_sub_step_order ON pbp_sub_step(order_index);

-- PBP opportunity recommendations
CREATE INDEX idx_pbp_opportunity_recommendation_pbp ON pbp_opportunity_recommendation(pbp_id);
CREATE INDEX idx_pbp_opportunity_recommendation_industry ON pbp_opportunity_recommendation(industry);
CREATE INDEX idx_pbp_opportunity_recommendation_salary ON pbp_opportunity_recommendation(salary_min, salary_max);
CREATE INDEX idx_pbp_opportunity_recommendation_education ON pbp_opportunity_recommendation(education_level_required);
CREATE INDEX idx_pbp_opportunity_recommendation_experience ON pbp_opportunity_recommendation(experience_required);

-- PBP monkey wrench
CREATE INDEX idx_pbp_monkey_wrench_participant ON pbp_monkey_wrench(participant_id);

-- Schedule
CREATE INDEX idx_schedule_mentor ON schedule(mentor_id);
CREATE INDEX idx_schedule_day ON schedule(day_of_week);
CREATE INDEX idx_schedule_active ON schedule(is_active);

-- Mentor time off
CREATE INDEX idx_mentor_time_off_mentor ON mentor_time_off(mentor_id);
CREATE INDEX idx_mentor_time_off_dates ON mentor_time_off(start_date, end_date);

-- Availability slot
CREATE INDEX idx_availability_slot_mentor ON availability_slot(mentor_id);
CREATE INDEX idx_availability_slot_organization ON availability_slot(organization_id);
CREATE INDEX idx_availability_slot_day ON availability_slot(day_of_week);
CREATE INDEX idx_availability_slot_time ON availability_slot(start_time, end_time);
CREATE INDEX idx_availability_slot_recurring ON availability_slot(is_recurring);

-- Office hours
CREATE INDEX idx_office_hours_mentor ON office_hours(mentor_id);
CREATE INDEX idx_office_hours_participant ON office_hours(participant_id);
CREATE INDEX idx_office_hours_slot ON office_hours(slot_id);
CREATE INDEX idx_office_hours_time ON office_hours(scheduled_time);
CREATE INDEX idx_office_hours_status ON office_hours(status);

-- Notifications
CREATE INDEX idx_notification_user ON notification(user_id);
CREATE INDEX idx_notification_type ON notification(type);
CREATE INDEX idx_notification_read ON notification(is_read);
CREATE INDEX idx_notification_created ON notification(created_at);

-- AI interactions
CREATE INDEX idx_ai_interaction_user ON ai_interaction(user_id);
CREATE INDEX idx_ai_interaction_type ON ai_interaction(interaction_type);
CREATE INDEX idx_ai_interaction_created ON ai_interaction(created_at);

-- User activity log
CREATE INDEX idx_user_activity_log_user ON user_activity_log(user_id);
CREATE INDEX idx_user_activity_log_type ON user_activity_log(activity_type);
CREATE INDEX idx_user_activity_log_created ON user_activity_log(created_at);

-- Organization user metrics
CREATE INDEX idx_organization_user_metric_org ON organization_user_metric(organization_id);
CREATE INDEX idx_organization_user_metric_user ON organization_user_metric(user_id);
CREATE INDEX idx_organization_user_metric_login ON organization_user_metric(last_login);

-- Path metrics
CREATE INDEX idx_path_metric_org ON path_metric(organization_id);
CREATE INDEX idx_path_metric_participant ON path_metric(participant_id);
CREATE INDEX idx_path_metric_pathway ON path_metric(pathway_id);
CREATE INDEX idx_path_metric_completion ON path_metric(completion_rate);

-- Opportunity metrics
CREATE INDEX idx_opportunity_metric_org ON opportunity_metric(organization_id);
CREATE INDEX idx_opportunity_metric_opportunity ON opportunity_metric(opportunity_id);
CREATE INDEX idx_opportunity_metric_ratio ON opportunity_metric(application_to_hire_ratio);

-- AI metrics
CREATE INDEX idx_ai_metric_org ON ai_metric(organization_id);
CREATE INDEX idx_ai_metric_user ON ai_metric(user_id);
CREATE INDEX idx_ai_metric_type ON ai_metric(interaction_type);
CREATE INDEX idx_ai_metric_last_used ON ai_metric(last_used);

-- Chat metrics
CREATE INDEX idx_chat_metric_org ON chat_metric(organization_id);
CREATE INDEX idx_chat_metric_user ON chat_metric(user_id);
CREATE INDEX idx_chat_metric_last_active ON chat_metric(last_active);

-- Course
CREATE INDEX course_location_id_index ON course_location(id);
CREATE INDEX course_assignment_id_index ON course_assignment(id);
CREATE INDEX course_assignment_id_index ON course_assignment(id);
CREATE INDEX course_id_index ON course(id);
