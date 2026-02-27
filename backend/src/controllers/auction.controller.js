const { prisma } = require('../config/db');
const escrowService = require('../services/escrow.service');

const PAYMENT_WINDOW_HOURS = Number(process.env.AUCTION_PAYMENT_WINDOW_HOURS || 24);
const BID_SPAM_COOLDOWN_MS = 10 * 1000;
const AUCTION_SETUP_HINT = 'Auction feature is not initialized in the current DB/client. Run `npx prisma generate && npx prisma migrate dev --name auction_system` (or `npx prisma migrate deploy`) and restart backend.';

const isMissingTableError = (error, tableName) => {
  if (!error || error.code !== 'P2021') return false;
  const metaTable = String(error.meta?.table || '').toLowerCase();
  return metaTable.includes(tableName.toLowerCase());
};

const toNumber = (value) => Number(value || 0);

const serializeAuction = (auction, currentUserId) => {
  const bids = (auction.bids || []).map((bid) => ({
    id: bid.id,
    bidderId: bid.bidder_id,
    bidderName: bid.bidder?.name || 'Unknown',
    bidAmount: toNumber(bid.bid_amount),
    createdAt: bid.created_at,
  }));

  return {
    id: auction.id,
    groupId: auction.group_id,
    state: auction.state,
    city: auction.city,
    createdBy: auction.created_by,
    createdByName: auction.created_by_user?.name || 'Unknown',
    highestBid: toNumber(auction.highest_bid),
    winnerId: auction.winner_id,
    winnerName: auction.winner_user?.name || null,
    status: auction.status,
    reason: auction.reason,
    roundNumber: auction.round_number,
    winnerDeclaredAt: auction.winner_declared_at,
    winnerPaymentDueAt: auction.winner_payment_due_at,
    winnerPaidAt: auction.winner_paid_at,
    createdAt: auction.created_at,
    updatedAt: auction.updated_at,
    bids,
    totalBids: bids.length,
    canCurrentUserProceedPayment:
      currentUserId && auction.status === 'WON' && auction.winner_id === currentUserId && !auction.winner_paid_at,
  };
};

async function getGroupAccess(groupId, userId) {
  const group = await prisma.chitGroup.findUnique({
    where: { id: groupId },
    include: {
      organization: {
        include: {
          organizer_profile: {
            select: { user_id: true },
          },
        },
      },
    },
  });

  if (!group) {
    return {
      group: null,
      organizerId: null,
      isOrganizer: false,
      isApprovedMember: false,
      canAccessAuctions: false,
    };
  }

  const organizerId = group.organization?.organizer_profile?.user_id || null;
  const isOrganizer = organizerId === userId;

  const member = await prisma.chitGroupMember.findFirst({
    where: {
      chit_group_id: groupId,
      user_id: userId,
      status: 'ACTIVE',
    },
    select: { id: true },
  });

  const isApprovedMember = Boolean(member);

  return {
    group,
    organizerId,
    isOrganizer,
    isApprovedMember,
    canAccessAuctions: isOrganizer || isApprovedMember,
  };
}

const listAuctions = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;

    if (!prisma.auctionRequest?.findMany) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.canAccessAuctions) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view auctions for this group' });
    }

    const auctions = await prisma.auctionRequest.findMany({
      where: { group_id: groupId },
      include: {
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: auctions.map((auction) => serializeAuction(auction, userId)),
      access: {
        isOrganizer: access.isOrganizer,
        isApprovedMember: access.isApprovedMember,
      },
    });
  } catch (error) {
    if (isMissingTableError(error, 'auction_requests')) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }
    next(error);
  }
};

const createAuction = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id;
    const { bidAmount, reason, roundNumber } = req.body;

    if (!prisma.auctionRequest?.create) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.isApprovedMember) {
      return res.status(403).json({ success: false, message: 'Only approved group members can create auctions' });
    }

    const normalizedBid = Number(bidAmount);
    if (!Number.isFinite(normalizedBid) || normalizedBid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid bid amount is required' });
    }

    const auction = await prisma.$transaction(async (tx) => {
      const createdAuction = await tx.auctionRequest.create({
        data: {
          group_id: groupId,
          state: access.group.state,
          city: access.group.city,
          created_by: userId,
          highest_bid: normalizedBid,
          reason: reason?.trim() || null,
          round_number: Number.isInteger(Number(roundNumber)) ? Number(roundNumber) : null,
          status: 'ACTIVE',
        },
        include: {
          created_by_user: { select: { id: true, name: true } },
          winner_user: { select: { id: true, name: true } },
        },
      });

      await tx.auctionBid.create({
        data: {
          auction_id: createdAuction.id,
          bidder_id: userId,
          bid_amount: normalizedBid,
        },
      });

      return tx.auctionRequest.findUnique({
        where: { id: createdAuction.id },
        include: {
          created_by_user: { select: { id: true, name: true } },
          winner_user: { select: { id: true, name: true } },
          bids: {
            include: { bidder: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
          },
        },
      });
    });

    res.status(201).json({ success: true, data: serializeAuction(auction, userId) });
  } catch (error) {
    if (isMissingTableError(error, 'auction_requests')) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }
    next(error);
  }
};

const placeBid = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;
    const { bidAmount } = req.body;

    if (!prisma.auctionRequest?.findUnique) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.isApprovedMember) {
      return res.status(403).json({ success: false, message: 'Only approved group members can bid' });
    }
    if (access.isOrganizer) {
      return res.status(403).json({ success: false, message: 'Organizer cannot bid in this auction' });
    }

    const normalizedBid = Number(bidAmount);
    if (!Number.isFinite(normalizedBid) || normalizedBid <= 0) {
      return res.status(400).json({ success: false, message: 'Valid bid amount is required' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const auction = await tx.auctionRequest.findFirst({
        where: {
          id: auctionId,
          group_id: groupId,
        },
      });

      if (!auction) {
        return { status: 404, message: 'Auction not found' };
      }

      if (auction.status !== 'ACTIVE') {
        return { status: 400, message: 'Auction is not active' };
      }

      if (auction.created_by === userId) {
        return { status: 400, message: 'Auction creator cannot place additional bids' };
      }

      if (normalizedBid <= toNumber(auction.highest_bid)) {
        return { status: 400, message: 'Bid must be higher than the current highest bid' };
      }

      const latestUserBid = await tx.auctionBid.findFirst({
        where: {
          auction_id: auctionId,
          bidder_id: userId,
        },
        orderBy: { created_at: 'desc' },
      });

      if (latestUserBid?.created_at) {
        const elapsed = Date.now() - new Date(latestUserBid.created_at).getTime();
        if (elapsed < BID_SPAM_COOLDOWN_MS) {
          return { status: 429, message: 'Please wait a few seconds before placing another bid' };
        }
      }

      await tx.auctionBid.create({
        data: {
          auction_id: auctionId,
          bidder_id: userId,
          bid_amount: normalizedBid,
        },
      });

      await tx.auctionRequest.update({
        where: { id: auctionId },
        data: {
          highest_bid: normalizedBid,
          updated_at: new Date(),
        },
      });

      const updated = await tx.auctionRequest.findUnique({
        where: { id: auctionId },
        include: {
          created_by_user: { select: { id: true, name: true } },
          winner_user: { select: { id: true, name: true } },
          bids: {
            include: { bidder: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
          },
        },
      });

      return { status: 200, data: updated };
    });

    if (result.status !== 200) {
      return res.status(result.status).json({ success: false, message: result.message });
    }

    res.status(200).json({ success: true, data: serializeAuction(result.data, userId) });
  } catch (error) {
    if (isMissingTableError(error, 'auction_requests')) {
      return res.status(503).json({
        success: false,
        message: AUCTION_SETUP_HINT,
      });
    }
    next(error);
  }
};

const closeAuction = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only organizer can close auctions' });
    }

    const auction = await prisma.auctionRequest.findFirst({
      where: { id: auctionId, group_id: groupId },
      include: {
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: [{ bid_amount: 'desc' }, { created_at: 'asc' }],
        },
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
      },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status === 'WON') {
      return res.status(400).json({ success: false, message: 'Auction winner already declared' });
    }

    if ((auction.bids || []).length === 1 && !auction.winner_id) {
      const dueAt = new Date(Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000);
      const autoWon = await prisma.auctionRequest.update({
        where: { id: auctionId },
        data: {
          status: 'WON',
          winner_id: auction.created_by,
          winner_declared_at: new Date(),
          winner_payment_due_at: dueAt,
        },
        include: {
          created_by_user: { select: { id: true, name: true } },
          winner_user: { select: { id: true, name: true } },
          bids: {
            include: { bidder: { select: { id: true, name: true } } },
            orderBy: { created_at: 'desc' },
          },
        },
      });

      return res.status(200).json({
        success: true,
        message: 'Auction auto-won by single bidder and closed',
        data: serializeAuction(autoWon, userId),
      });
    }

    const updated = await prisma.auctionRequest.update({
      where: { id: auctionId },
      data: {
        status: 'CLOSED',
      },
      include: {
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    return res.status(200).json({ success: true, data: serializeAuction(updated, userId) });
  } catch (error) {
    next(error);
  }
};

const declareWinner = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;
    const { winnerId } = req.body;

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only organizer can declare winner' });
    }

    const auction = await prisma.auctionRequest.findFirst({
      where: { id: auctionId, group_id: groupId },
      include: {
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: [{ bid_amount: 'desc' }, { created_at: 'asc' }],
        },
      },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if ((auction.bids || []).length === 0) {
      return res.status(400).json({ success: false, message: 'Cannot declare winner without bids' });
    }

    let resolvedWinnerId = winnerId;
    if (!resolvedWinnerId) {
      resolvedWinnerId = auction.bids[0].bidder_id;
    }

    const winnerBid = auction.bids.find((b) => b.bidder_id === resolvedWinnerId);
    if (!winnerBid) {
      return res.status(400).json({ success: false, message: 'Winner must be a bidder in this auction' });
    }

    const dueAt = new Date(Date.now() + PAYMENT_WINDOW_HOURS * 60 * 60 * 1000);

    const updated = await prisma.auctionRequest.update({
      where: { id: auctionId },
      data: {
        status: 'WON',
        winner_id: resolvedWinnerId,
        highest_bid: winnerBid.bid_amount,
        winner_declared_at: new Date(),
        winner_payment_due_at: dueAt,
        winner_paid_at: null,
      },
      include: {
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    res.status(200).json({ success: true, data: serializeAuction(updated, userId) });
  } catch (error) {
    next(error);
  }
};

const reopenAuction = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only organizer can reopen auction' });
    }

    const auction = await prisma.auctionRequest.findFirst({
      where: { id: auctionId, group_id: groupId },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status !== 'WON') {
      return res.status(400).json({ success: false, message: 'Only won auctions can be reopened' });
    }

    if (auction.winner_paid_at) {
      return res.status(400).json({ success: false, message: 'Cannot reopen a paid winner auction' });
    }

    if (!auction.winner_payment_due_at || new Date(auction.winner_payment_due_at).getTime() > Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Winner payment window is still active; cannot reopen yet',
      });
    }

    const updated = await prisma.auctionRequest.update({
      where: { id: auctionId },
      data: {
        status: 'ACTIVE',
        winner_id: null,
        winner_declared_at: null,
        winner_payment_due_at: null,
        winner_paid_at: null,
      },
      include: {
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    res.status(200).json({ success: true, data: serializeAuction(updated, userId) });
  } catch (error) {
    next(error);
  }
};

const proceedWinnerPayment = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;

    const access = await getGroupAccess(groupId, userId);
    if (!access.group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }
    if (!access.canAccessAuctions) {
      return res.status(403).json({ success: false, message: 'Unauthorized to access this auction' });
    }

    const auction = await prisma.auctionRequest.findFirst({
      where: { id: auctionId, group_id: groupId },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status !== 'WON' || auction.winner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only declared winner can proceed to payment' });
    }

    if (auction.winner_paid_at) {
      return res.status(400).json({ success: false, message: 'Winner payment already completed' });
    }

    if (auction.winner_payment_due_at && new Date(auction.winner_payment_due_at).getTime() < Date.now()) {
      return res.status(400).json({ success: false, message: 'Payment window expired. Organizer can reopen auction.' });
    }

    let account = await prisma.escrowAccount.findUnique({ where: { chit_group_id: groupId } });
    if (!account) {
      account = await prisma.escrowAccount.create({
        data: { chit_group_id: groupId },
      });
    }

    const amount = Math.max(1, Math.round(toNumber(auction.highest_bid)));

    const transaction = await prisma.escrowTransaction.create({
      data: {
        escrow_account_id: account.id,
        user_id: userId,
        type: 'CONTRIBUTION',
        amount,
        status: 'PENDING',
      },
    });

    const order = await escrowService.createOrder(amount, transaction.id);

    res.status(200).json({
      success: true,
      transaction_id: transaction.id,
      razorpay_order_id: order.id,
      amount: order.amount / 100,
      currency: order.currency,
      auction_id: auctionId,
    });
  } catch (error) {
    next(error);
  }
};

const confirmWinnerPayment = async (req, res, next) => {
  try {
    const { groupId, auctionId } = req.params;
    const userId = req.user.id;
    const { transaction_id } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ success: false, message: 'transaction_id is required' });
    }

    const auction = await prisma.auctionRequest.findFirst({
      where: {
        id: auctionId,
        group_id: groupId,
      },
    });

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status !== 'WON' || auction.winner_id !== userId) {
      return res.status(403).json({ success: false, message: 'Only winner can confirm payment' });
    }

    const tx = await prisma.escrowTransaction.findUnique({
      where: { id: transaction_id },
      include: {
        escrow_account: true,
      },
    });

    if (!tx) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (tx.user_id !== userId) {
      return res.status(403).json({ success: false, message: 'Transaction does not belong to winner' });
    }

    if (tx.escrow_account?.chit_group_id !== groupId) {
      return res.status(400).json({ success: false, message: 'Transaction does not belong to this group' });
    }

    if (tx.status !== 'CONFIRMED') {
      return res.status(400).json({ success: false, message: 'Payment is not confirmed yet' });
    }

    if (toNumber(tx.amount) < toNumber(auction.highest_bid)) {
      return res.status(400).json({ success: false, message: 'Confirmed payment is less than winning amount' });
    }

    const updated = await prisma.auctionRequest.update({
      where: { id: auctionId },
      data: {
        winner_paid_at: new Date(),
      },
      include: {
        created_by_user: { select: { id: true, name: true } },
        winner_user: { select: { id: true, name: true } },
        bids: {
          include: { bidder: { select: { id: true, name: true } } },
          orderBy: { created_at: 'desc' },
        },
      },
    });

    res.status(200).json({ success: true, data: serializeAuction(updated, userId) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAuctions,
  createAuction,
  placeBid,
  closeAuction,
  declareWinner,
  reopenAuction,
  proceedWinnerPayment,
  confirmWinnerPayment,
};
