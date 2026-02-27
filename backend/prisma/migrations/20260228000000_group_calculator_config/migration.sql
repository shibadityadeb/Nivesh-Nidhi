ALTER TABLE "chit_groups"
ADD COLUMN "min_amount" DECIMAL(12,2),
ADD COLUMN "max_amount" DECIMAL(12,2),
ADD COLUMN "default_rate" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN "calculation_type" VARCHAR(20) NOT NULL DEFAULT 'simple',
ADD COLUMN "allowed_time_period_min" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "allowed_time_period_max" INTEGER,
ADD COLUMN "calculator_custom_rules" JSONB;

UPDATE "chit_groups"
SET
  "min_amount" = COALESCE("chit_value", 1),
  "max_amount" = COALESCE("chit_value", 1) * 1000,
  "allowed_time_period_max" = GREATEST(COALESCE("duration_months", 1), 1)
WHERE "min_amount" IS NULL
   OR "max_amount" IS NULL
   OR "allowed_time_period_max" IS NULL;

ALTER TABLE "chit_groups"
ALTER COLUMN "min_amount" SET NOT NULL,
ALTER COLUMN "max_amount" SET NOT NULL,
ALTER COLUMN "allowed_time_period_max" SET NOT NULL;
