-- Add columns to chit_groups
ALTER TABLE "chit_groups"
ADD COLUMN "state" VARCHAR(100),
ADD COLUMN "city" VARCHAR(100);

-- Backfill chit_groups state/city from organizations
UPDATE "chit_groups" cg
SET
  "state" = o."state",
  "city" = o."city"
FROM "organizations" o
WHERE cg."organization_id" = o."id";

-- Ensure non-null after backfill
ALTER TABLE "chit_groups"
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- Add columns to auction_requests
ALTER TABLE "auction_requests"
ADD COLUMN "state" VARCHAR(100),
ADD COLUMN "city" VARCHAR(100);

-- Backfill auction_requests state/city from chit_groups
UPDATE "auction_requests" ar
SET
  "state" = cg."state",
  "city" = cg."city"
FROM "chit_groups" cg
WHERE ar."group_id" = cg."id";

-- Ensure non-null after backfill
ALTER TABLE "auction_requests"
ALTER COLUMN "state" SET NOT NULL,
ALTER COLUMN "city" SET NOT NULL;

-- Helpful index for locality filters
CREATE INDEX "chit_groups_state_city_idx" ON "chit_groups"("state", "city");
CREATE INDEX "auction_requests_state_city_idx" ON "auction_requests"("state", "city");
