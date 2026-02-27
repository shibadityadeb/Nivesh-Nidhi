-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "aadhaar_number" VARCHAR(12),
    "aadhaar_name" VARCHAR(100),
    "aadhaar_dob" VARCHAR(20),
    "aadhaar_address" TEXT,
    "is_kyc_verified" BOOLEAN DEFAULT false,
    "role" VARCHAR(20) DEFAULT 'user',
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
