ALTER TABLE "users"
ADD COLUMN "city" VARCHAR(100),
ADD COLUMN "state" VARCHAR(100);

-- Backfill city/state from existing aadhaar_address when format is "city, state"
UPDATE "users"
SET
  "city" = NULLIF(TRIM(SPLIT_PART("aadhaar_address", ',', 1)), ''),
  "state" = NULLIF(TRIM(SPLIT_PART("aadhaar_address", ',', 2)), '')
WHERE "aadhaar_address" IS NOT NULL
  AND ("city" IS NULL OR "state" IS NULL);
