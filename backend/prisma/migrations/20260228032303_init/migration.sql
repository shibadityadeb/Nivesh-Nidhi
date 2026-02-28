/*
  Warnings:

  - A unique constraint covering the columns `[google_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Made the column `default_rate` on table `chit_groups` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "chit_groups" ALTER COLUMN "min_amount" SET DEFAULT 1.00,
ALTER COLUMN "max_amount" SET DEFAULT 100000.00,
ALTER COLUMN "default_rate" SET NOT NULL,
ALTER COLUMN "allowed_time_period_max" SET DEFAULT 12;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_provider" VARCHAR(20) NOT NULL DEFAULT 'local',
ADD COLUMN     "google_id" VARCHAR(255),
ALTER COLUMN "password" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");
