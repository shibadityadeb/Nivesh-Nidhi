ALTER TABLE "auction_bids"
ADD COLUMN "interest_per_auction" DECIMAL(5,2) NOT NULL DEFAULT 0.0;
