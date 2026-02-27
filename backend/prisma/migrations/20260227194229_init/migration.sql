-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ORGANIZER', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrganizerType" AS ENUM ('NEW', 'EXISTING', 'MIGRATING');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_RISK_ASSESSMENT', 'APPROVED_LIMITED', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ApprovalTier" AS ENUM ('TIER_1', 'TIER_2', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'CLOSED', 'WON');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "is_kyc_verified" BOOLEAN NOT NULL DEFAULT false,
    "aadhaar_number" VARCHAR(255),
    "age" INTEGER,
    "aadhaar_address" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'USER',
    "reputation_score" DOUBLE PRECISION DEFAULT 50.0,
    "risk_score" DOUBLE PRECISION DEFAULT 50.0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "license_info" JSONB,
    "gst_info" JSONB,
    "experience_years" INTEGER DEFAULT 0,
    "approval_status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "security_deposit_status" VARCHAR(50),
    "escrow_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organizer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizer_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "type" "OrganizerType" NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "company_name" VARCHAR(255),
    "legal_structure" VARCHAR(100),
    "gst_number" VARCHAR(50),
    "business_reg_number" VARCHAR(100),
    "chit_license_number" VARCHAR(100),
    "license_issuing_auth" VARCHAR(255),
    "license_valid_till" TIMESTAMP(3),
    "years_of_operation" INTEGER DEFAULT 0,
    "office_address" TEXT,
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(20),
    "bank_account_name" VARCHAR(255),
    "bank_name" VARCHAR(255),
    "ifsc_code" VARCHAR(20),
    "escrow_agreed" BOOLEAN DEFAULT false,
    "security_deposit_paid" BOOLEAN DEFAULT false,
    "proposed_chit_size" DECIMAL(12,2),
    "proposed_duration_months" INTEGER,
    "target_area" VARCHAR(255),
    "capital_proof_url" VARCHAR(255),
    "existing_group_count" INTEGER,
    "total_active_members" INTEGER,
    "past_3_yr_turnover" DECIMAL(15,2),
    "ledger_upload_url" VARCHAR(255),
    "personal_info" JSONB,
    "professional_info" JSONB,
    "income_info" JSONB,
    "purpose_info" JSONB,
    "application_risk_score" DOUBLE PRECISION,
    "risk_profile" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organizer_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organizer_profile_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "license_number" VARCHAR(100),
    "gst_number" VARCHAR(50),
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "pincode" VARCHAR(20) NOT NULL,
    "geo_lat" DOUBLE PRECISION,
    "geo_long" DOUBLE PRECISION,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "risk_rating" DOUBLE PRECISION DEFAULT 50.0,
    "trust_tier" "ApprovalTier" NOT NULL DEFAULT 'RESTRICTED',
    "reputation_score" DOUBLE PRECISION DEFAULT 50.0,
    "default_rate" DOUBLE PRECISION DEFAULT 0.0,
    "total_groups_managed" INTEGER NOT NULL DEFAULT 0,
    "migration_priority_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_groups" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organization_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "chit_value" DECIMAL(12,2) NOT NULL,
    "duration_months" INTEGER NOT NULL,
    "member_capacity" INTEGER NOT NULL,
    "current_members" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chit_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "join_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "join_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_group_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "organizer_id" UUID NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "applied_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(6),
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chit_group_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_group_rules" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "monthly_amount" DECIMAL(12,2),
    "duration_months" INTEGER,
    "late_penalty_pct" DOUBLE PRECISION DEFAULT 2.0,
    "commission_pct" DOUBLE PRECISION DEFAULT 5.0,
    "min_bid_pct" DOUBLE PRECISION DEFAULT 5.0,
    "max_bid_pct" DOUBLE PRECISION DEFAULT 40.0,
    "bidding_day" INTEGER DEFAULT 1,
    "payment_due_day" INTEGER DEFAULT 5,
    "grace_period_days" INTEGER DEFAULT 5,
    "custom_rules" JSONB,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chit_group_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chit_group_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "joined_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "chit_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "user_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'DUE_REMINDER',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_actions_log" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_id" UUID NOT NULL,
    "action_type" VARCHAR(50) NOT NULL,
    "organization_id" UUID,
    "details" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_actions_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "chit_group_id" UUID NOT NULL,
    "total_collected" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "total_released" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "locked_amount" DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "escrow_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escrow_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_account_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "payment_gateway_txn_id" VARCHAR(255),
    "blockchain_hash" VARCHAR(255),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_queue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "escrow_account_id" UUID NOT NULL,
    "chit_group_id" UUID NOT NULL,
    "winner_user_id" UUID NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING_RELEASE',
    "risk_flag" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payout_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blockchain_audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "timestamp" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "block_number" INTEGER,

    CONSTRAINT "blockchain_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "created_by" UUID NOT NULL,
    "highest_bid" DECIMAL(12,2) NOT NULL,
    "winner_id" UUID,
    "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE',
    "reason" TEXT,
    "round_number" INTEGER,
    "winner_declared_at" TIMESTAMP(6),
    "winner_payment_due_at" TIMESTAMP(6),
    "winner_paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "auction_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_bids" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "auction_id" UUID NOT NULL,
    "bidder_id" UUID NOT NULL,
    "bid_amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_aadhaar_number_key" ON "users"("aadhaar_number");

-- CreateIndex
CREATE UNIQUE INDEX "organizer_profiles_user_id_key" ON "organizer_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_group_applications_chit_group_id_user_id_key" ON "chit_group_applications"("chit_group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_group_rules_chit_group_id_key" ON "chit_group_rules"("chit_group_id");

-- CreateIndex
CREATE UNIQUE INDEX "chit_group_members_chit_group_id_user_id_key" ON "chit_group_members"("chit_group_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "escrow_accounts_chit_group_id_key" ON "escrow_accounts"("chit_group_id");

-- CreateIndex
CREATE INDEX "auction_requests_group_id_status_idx" ON "auction_requests"("group_id", "status");

-- CreateIndex
CREATE INDEX "auction_requests_created_by_idx" ON "auction_requests"("created_by");

-- CreateIndex
CREATE INDEX "auction_bids_auction_id_created_at_idx" ON "auction_bids"("auction_id", "created_at");

-- CreateIndex
CREATE INDEX "auction_bids_bidder_id_idx" ON "auction_bids"("bidder_id");

-- AddForeignKey
ALTER TABLE "organizer_profiles" ADD CONSTRAINT "organizer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizer_applications" ADD CONSTRAINT "organizer_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_organizer_profile_id_fkey" FOREIGN KEY ("organizer_profile_id") REFERENCES "organizer_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_groups" ADD CONSTRAINT "chit_groups_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "join_requests" ADD CONSTRAINT "join_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_group_applications" ADD CONSTRAINT "chit_group_applications_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_group_rules" ADD CONSTRAINT "chit_group_rules_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chit_group_members" ADD CONSTRAINT "chit_group_members_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_notifications" ADD CONSTRAINT "member_notifications_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions_log" ADD CONSTRAINT "admin_actions_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_actions_log" ADD CONSTRAINT "admin_actions_log_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_accounts" ADD CONSTRAINT "escrow_accounts_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_escrow_account_id_fkey" FOREIGN KEY ("escrow_account_id") REFERENCES "escrow_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escrow_transactions" ADD CONSTRAINT "escrow_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_queue" ADD CONSTRAINT "payout_queue_escrow_account_id_fkey" FOREIGN KEY ("escrow_account_id") REFERENCES "escrow_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_queue" ADD CONSTRAINT "payout_queue_chit_group_id_fkey" FOREIGN KEY ("chit_group_id") REFERENCES "chit_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_queue" ADD CONSTRAINT "payout_queue_winner_user_id_fkey" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_requests" ADD CONSTRAINT "auction_requests_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "chit_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_requests" ADD CONSTRAINT "auction_requests_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_requests" ADD CONSTRAINT "auction_requests_winner_id_fkey" FOREIGN KEY ("winner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auction_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
