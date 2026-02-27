-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'CLOSED', 'WON');

-- CreateTable
CREATE TABLE "auction_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "group_id" UUID NOT NULL,
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
CREATE INDEX "auction_requests_group_id_status_idx" ON "auction_requests"("group_id", "status");

-- CreateIndex
CREATE INDEX "auction_requests_created_by_idx" ON "auction_requests"("created_by");

-- CreateIndex
CREATE INDEX "auction_bids_auction_id_created_at_idx" ON "auction_bids"("auction_id", "created_at");

-- CreateIndex
CREATE INDEX "auction_bids_bidder_id_idx" ON "auction_bids"("bidder_id");

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
