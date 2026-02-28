import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { auctions as auctionsApi, chitGroups as chitGroupsApi, escrow } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Loader2, Users, Calendar, IndianRupee, Gavel, Clock3, Trophy, XCircle } from "lucide-react";
import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";
import { GroupRiskCard } from "@/components/GroupRiskCard";
import ChitPayoutCalculator from "@/components/ChitPayoutCalculator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { T } from "@/context/LanguageContext";

const statusClassMap = {
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-yellow-100 text-yellow-700",
  WON: "bg-blue-100 text-blue-700",
};

export default function ChitGroupDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [calcSnapshot, setCalcSnapshot] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const [auctions, setAuctions] = useState([]);
  const [auctionsLoading, setAuctionsLoading] = useState(false);
  const [showCreateAuctionModal, setShowCreateAuctionModal] = useState(false);
  const [createAuctionLoading, setCreateAuctionLoading] = useState(false);
  const [createAuctionForm, setCreateAuctionForm] = useState({
    bidAmount: "",
    reason: "",
    roundNumber: "",
  });
  const [bidInputs, setBidInputs] = useState({});
  const [bidLoadingId, setBidLoadingId] = useState(null);
  const [organizerActionLoadingId, setOrganizerActionLoadingId] = useState(null);
  const [winnerPaymentLoadingId, setWinnerPaymentLoadingId] = useState(null);

  useEffect(() => {
    fetchGroupDetails();
  }, [id, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || (!isMember && !isOrganizer)) {
      setAuctions([]);
      return;
    }

    fetchAuctions();
    const interval = setInterval(() => {
      fetchAuctions({ silent: true });
    }, 15000);

    return () => clearInterval(interval);
  }, [id, isAuthenticated, isMember, isOrganizer]);

  const fetchGroupDetails = async () => {
    setLoading(true);
    try {
      const res = await chitGroupsApi.getById(id);
      if (res.data.success) {
        const payload = res.data.data;
        setGroup(payload);
        setJoinRequestStatus(payload.joinRequestStatus || null);
        setIsMember(Boolean(payload.isMember));
        setIsOrganizer(Boolean(payload.isOrganizer));
      } else {
        toast.error(res.data.message || "Group not found");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load group details");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuctions = async ({ silent = false } = {}) => {
    if (!silent) {
      setAuctionsLoading(true);
    }
    try {
      const res = await auctionsApi.list(id);
      if (res.data.success) {
        setAuctions(res.data.data || []);
      }
    } catch (error) {
      if (!silent) {
        toast.error(error.response?.data?.message || "Failed to load auctions");
      }
    } finally {
      if (!silent) {
        setAuctionsLoading(false);
      }
    }
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (!user?.isKycVerified) {
      toast.error("KYC verification required to join group.");
      return;
    }

    setApplyLoading(true);
    try {
      const payload = { userId: user.id };
      if (calcSnapshot && calcSnapshot.discountPercent != null) {
        payload.discountPercent = calcSnapshot.discountPercent;
      }

      const res = await chitGroupsApi.applyToJoin(id, payload);
      if (res.data.success) {
        setJoinRequestStatus("pending");
        toast.success("Request sent successfully");
      } else {
        toast.error(res.data.message || "Failed to apply");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to apply";
      if (message.toLowerCase().includes("pending")) {
        setJoinRequestStatus("pending");
      }
      toast.error(message);
    } finally {
      setApplyLoading(false);
    }
  };

  const handleMonthlyPayment = async () => {
    if (!user?.id || !group?.group) return;

    setPaymentLoading(true);
    try {
      if (!window.Razorpay) {
        toast.error("Payment gateway is not available right now.");
        return;
      }

      const monthlyAmount = Number(group.group.rules?.monthly_amount || 0) > 0
        ? Number(group.group.rules.monthly_amount)
        : Number(group.group.chit_value) / Math.max(Number(group.group.duration_months), 1);

      const res = await escrow.contribute({
        chit_group_id: group.group.id,
        user_id: user.id,
        amount: monthlyAmount,
      });

      if (!res.data.success) {
        throw new Error("Failed to initialize payment");
      }

      const { razorpay_order_id, transaction_id, amount } = res.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SKVpiqvO8UAmrn",
        amount: amount * 100,
        currency: "INR",
        name: "Nivesh Nidhi",
        description: `Monthly payment for ${group.group.name}`,
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            const verifyRes = await escrow.verifyWebhook({
              transaction_id,
              payload: {
                payment: {
                  entity: {
                    id: response.razorpay_payment_id,
                    notes: { transaction_id },
                  },
                },
              },
            });

            if (verifyRes.data.success) {
              toast.success("Payment successful! Funds secured in Escrow & Blockchain.");
              await fetchGroupDetails();
            }
          } catch (err) {
            toast.error("Sorry something went wrong. If money has been deducted it will be refunded to your account in 2-3 days.");
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: user?.name || "User",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: {
          color: "#1d4ed8",
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          ondismiss: function () {
            setPaymentLoading(false);
            toast.info("Payment cancelled.");
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        setPaymentLoading(false);
        toast.error(`Payment Failed: ${response.error.description}. If money has been deducted it will be refunded to your account in 2-3 days.`);
        try {
          await escrow.webhookFailed({
            transaction_id,
            error_description: response.error.description,
          });
        } catch (err) {
          // no-op
        }
      });
      rzp.open();
    } catch (error) {
      setPaymentLoading(false);
      toast.error(error.response?.data?.message || "Could not initiate payment. Please try again later.");
    }
  };

  const handleCreateAuction = async () => {
    if (!isMember) {
      toast.error("Only approved members can create auctions.");
      return;
    }

    const bidAmount = Number(createAuctionForm.bidAmount);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      toast.error("Enter a valid bid amount.");
      return;
    }

    setCreateAuctionLoading(true);
    try {
      const res = await auctionsApi.create(id, {
        bidAmount,
        reason: createAuctionForm.reason || undefined,
        roundNumber: createAuctionForm.roundNumber ? Number(createAuctionForm.roundNumber) : undefined,
      });

      if (res.data.success) {
        toast.success("Auction created successfully");
        setShowCreateAuctionModal(false);
        setCreateAuctionForm({ bidAmount: "", reason: "", roundNumber: "" });
        await fetchAuctions();
      } else {
        toast.error(res.data.message || "Failed to create auction");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create auction");
    } finally {
      setCreateAuctionLoading(false);
    }
  };

  const handlePlaceBid = async (auctionId) => {
    const bidAmount = Number(bidInputs[auctionId]);
    if (!Number.isFinite(bidAmount) || bidAmount <= 0) {
      toast.error("Enter a valid bid amount.");
      return;
    }

    setBidLoadingId(auctionId);
    try {
      const res = await auctionsApi.placeBid(id, auctionId, { bidAmount });
      if (res.data.success) {
        toast.success("Bid placed successfully");
        setBidInputs((prev) => ({ ...prev, [auctionId]: "" }));
        await fetchAuctions({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to place bid");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place bid");
    } finally {
      setBidLoadingId(null);
    }
  };

  const handleCloseAuction = async (auctionId) => {
    setOrganizerActionLoadingId(auctionId);
    try {
      const res = await auctionsApi.close(id, auctionId);
      if (res.data.success) {
        toast.success(res.data.message || "Auction closed");
        await fetchAuctions({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to close auction");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to close auction");
    } finally {
      setOrganizerActionLoadingId(null);
    }
  };

  const handleDeclareWinner = async (auctionId) => {
    setOrganizerActionLoadingId(auctionId);
    try {
      const res = await auctionsApi.declareWinner(id, auctionId, {});
      if (res.data.success) {
        toast.success("Winner declared successfully");
        await fetchAuctions({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to declare winner");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to declare winner");
    } finally {
      setOrganizerActionLoadingId(null);
    }
  };

  const handleReopenAuction = async (auctionId) => {
    setOrganizerActionLoadingId(auctionId);
    try {
      const res = await auctionsApi.reopen(id, auctionId);
      if (res.data.success) {
        toast.success("Auction reopened");
        await fetchAuctions({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to reopen auction");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reopen auction");
    } finally {
      setOrganizerActionLoadingId(null);
    }
  };

  const handleWinnerPayout = async (auction) => {
    setWinnerPaymentLoadingId(auction.id);
    try {
      const res = await auctionsApi.proceedPayment(id, auction.id);
      if (res.data.success) {
        const amount = res.data.payout_amount ?? res.data.data?.payout_amount;
        toast.success(
          amount
            ? `Payout of ₹${Number(amount).toLocaleString("en-IN")} released to you. Funds are from the group escrow.`
            : "Payout released successfully. You have received your winning amount from the escrow."
        );
        await fetchAuctions({ silent: true });
      } else {
        toast.error(res.data.message || "Failed to release payout");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Could not release payout");
    } finally {
      setWinnerPaymentLoadingId(null);
    }
  };

  const actionButton = useMemo(() => {
    if (!group) return null;

    const isFull = group.memberStats?.total >= group.memberStats?.capacity;

    if (!isAuthenticated) {
      return {
        label: "Login to Apply",
        disabled: false,
        action: () => setShowAuthModal(true),
      };
    }

    if (user?.role === "ADMIN") {
      return {
        label: "Admins cannot join groups",
        disabled: true,
        action: undefined,
      };
    }

    if (user?.role === "ORGANIZER") {
      return {
        label: "Organizers cannot join groups",
        disabled: true,
        action: undefined,
      };
    }

    if (isMember || joinRequestStatus === "approved") {
      if (group.hasPaidCurrentMonth) {
        return {
          label: "Paid for Current Month",
          disabled: true,
          action: undefined,
        };
      }
      return {
        label: paymentLoading ? "Processing Payment..." : "Make Monthly Payment",
        disabled: paymentLoading,
        action: handleMonthlyPayment,
      };
    }

    if (joinRequestStatus === "pending") {
      return {
        label: "Request Sent (Awaiting Approval)",
        disabled: true,
        action: undefined,
      };
    }

    return {
      label: applyLoading ? "Applying..." : "Apply to Join",
      disabled: applyLoading || Boolean(isFull),
      action: handleApply,
    };
  }, [group, isAuthenticated, isMember, joinRequestStatus, applyLoading, paymentLoading]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 right-40 w-[550px] h-[550px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 py-12 pt-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground"><T>Loading group details...</T></span>
          </div>
        ) : !group ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-xl mx-auto">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground"><T>Group Not Found</T></h3>
            <p className="text-muted-foreground mt-1"><T>This chit group does not exist or has been deleted.</T></p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground">{group.group.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${group.group.status === "OPEN" ? "bg-green-100 text-green-700" : group.group.status === "IN_PROGRESS" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                  {group.group.status}
                </span>
              </div>
              <p className="text-muted-foreground">Organized by {group.organizerDetails?.name}</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl p-6 border border-border">
                  <h2 className="font-heading font-bold text-xl mb-4"><T>Group Details</T></h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground"><T>Chit Value</T></p>
                        <p className="font-semibold text-foreground">₹{Number(group.group.chit_value).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground"><T>Duration</T></p>
                        <p className="font-semibold text-foreground">{group.group.duration_months} months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground"><T>Members</T></p>
                        <p className="font-semibold text-foreground">{group.memberStats.total} / {group.memberStats.capacity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground"><T>Start Date</T></p>
                        <p className="font-semibold text-foreground">{group.group.created_at ? new Date(group.group.created_at).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {group.calcInputs && (
                  <div className="bg-white rounded-xl p-6 border border-border">
                    <h2 className="font-heading font-bold text-xl mb-4"><T>Payout Calculator</T></h2>
                    <ChitPayoutCalculator
                      groupId={group.group.id}
                      onCalculate={(r) => setCalcSnapshot(r)}
                    />
                  </div>
                )}

                {(isMember || isOrganizer) && (
                  <div className="bg-white rounded-xl p-6 border border-border space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="font-heading font-bold text-xl flex items-center gap-2">
                        <Gavel className="w-5 h-5 text-primary" />
                        <T>Live Auctions</T>
                      </h2>
                      {isMember && (
                        <button
                          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
                          onClick={() => setShowCreateAuctionModal(true)}
                        >
                          <T>Create Auction</T>
                        </button>
                      )}
                    </div>

                    {auctionsLoading ? (
                      <div className="flex items-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground"><T>Loading auctions...</T></span>
                      </div>
                    ) : auctions.length === 0 ? (
                      <p className="text-sm text-muted-foreground"><T>No auctions in this group yet.</T></p>
                    ) : (
                      <div className="space-y-3">
                        {auctions.map((auction) => {
                          const isCreator = user?.id && auction.createdBy === user.id;
                          const canBid = isMember && !isOrganizer && !isCreator && auction.status === "ACTIVE";
                          const canOrganizerAct = isOrganizer;
                          const dueText = auction.winnerPaymentDueAt
                            ? new Date(auction.winnerPaymentDueAt).toLocaleString()
                            : null;

                          return (
                            <div key={auction.id} className="border border-border rounded-lg p-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                  <p className="font-semibold text-foreground">Highest Bid: ₹{Number(auction.highestBid).toLocaleString("en-IN")}</p>
                                  <p className="text-xs text-muted-foreground">Bidder: {auction.winnerName || auction.bids?.[0]?.bidderName || auction.createdByName}</p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClassMap[auction.status] || "bg-muted text-muted-foreground"}`}>
                                  {auction.status}
                                </span>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
                                <p className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" /> Created: {auction.createdAt ? new Date(auction.createdAt).toLocaleString() : "N/A"}</p>
                                <p className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Total bids: {auction.totalBids}</p>
                                {auction.winnerName && <p className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5" /> Winner: {auction.winnerName}</p>}
                                {dueText && <p>Payout available until: {dueText}</p>}
                              </div>

                              {canBid && (
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <input
                                    type="number"
                                    min="1"
                                    placeholder="Place higher bid"
                                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm"
                                    value={bidInputs[auction.id] || ""}
                                    onChange={(e) => setBidInputs((prev) => ({ ...prev, [auction.id]: e.target.value }))}
                                  />
                                  <button
                                    className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground"
                                    disabled={bidLoadingId === auction.id}
                                    onClick={() => handlePlaceBid(auction.id)}
                                  >
                                    {bidLoadingId === auction.id ? <T>Placing...</T> : <T>Place Higher Bid</T>}
                                  </button>
                                </div>
                              )}

                              {canOrganizerAct && (
                                <div className="flex flex-wrap gap-2">
                                  {auction.status === "ACTIVE" && (
                                    <>
                                      <button
                                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-60"
                                        disabled={organizerActionLoadingId === auction.id}
                                        onClick={() => handleCloseAuction(auction.id)}
                                      >
                                        <T>Close Auction</T>
                                      </button>
                                      <button
                                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
                                        disabled={organizerActionLoadingId === auction.id}
                                        onClick={() => handleDeclareWinner(auction.id)}
                                      >
                                        <T>Declare Winner</T>
                                      </button>
                                    </>
                                  )}

                                  {auction.status === "WON" && !auction.winnerPaidAt && auction.winnerPaymentDueAt && new Date(auction.winnerPaymentDueAt).getTime() < Date.now() && (
                                    <button
                                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 disabled:opacity-60"
                                      disabled={organizerActionLoadingId === auction.id}
                                      onClick={() => handleReopenAuction(auction.id)}
                                    >
                                      <T>Reopen Auction</T>
                                    </button>
                                  )}
                                </div>
                              )}

                              {auction.canCurrentUserProceedPayment && (
                                <button
                                  className="px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
                                  disabled={winnerPaymentLoadingId === auction.id}
                                  onClick={() => handleWinnerPayout(auction)}
                                >
                                  {winnerPaymentLoadingId === auction.id ? <T>Releasing...</T> : <T>Receive Payout</T>}
                                </button>
                              )}

                              {auction.winnerPaidAt && (
                                <p className="text-xs text-green-700 font-medium">Payout received on {new Date(auction.winnerPaidAt).toLocaleString()}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 border border-border">
                  <button
                    className="w-full py-3 rounded-lg bg-secondary text-secondary-foreground font-semibold text-lg hover:bg-secondary/90 disabled:bg-muted disabled:text-muted-foreground transition-colors"
                    disabled={actionButton?.disabled}
                    onClick={actionButton?.action}
                  >
                    {actionButton?.label}
                  </button>
                </div>

                {group.group?.aiRiskReport ? (
                  <GroupRiskCard report={group.group.aiRiskReport} />
                ) : (
                  <p className="text-xs text-muted-foreground"><T>No AI risk report available.</T></p>
                )}

                {group.organizerDetails?.risk_profile && (
                  <div className="bg-white rounded-xl p-6 border border-border">
                    <h2 className="font-heading font-bold text-lg mb-4"><T>Risk Assessment</T></h2>
                    <RiskAssessmentCard riskProfile={group.organizerDetails.risk_profile} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {showCreateAuctionModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-border shadow-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-lg"><T>Create Auction</T></h3>
              <button
                className="p-1 rounded-md hover:bg-muted"
                onClick={() => setShowCreateAuctionModal(false)}
                disabled={createAuctionLoading}
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground"><T>Bid Amount</T></label>
                <input
                  type="number"
                  min="1"
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2"
                  value={createAuctionForm.bidAmount}
                  onChange={(e) => setCreateAuctionForm((prev) => ({ ...prev, bidAmount: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground"><T>Reason (optional)</T></label>
                <textarea
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2 min-h-[90px]"
                  value={createAuctionForm.reason}
                  onChange={(e) => setCreateAuctionForm((prev) => ({ ...prev, reason: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground"><T>Round Number (optional)</T></label>
                <input
                  type="number"
                  min="1"
                  className="w-full mt-1 border border-border rounded-lg px-3 py-2"
                  value={createAuctionForm.roundNumber}
                  onChange={(e) => setCreateAuctionForm((prev) => ({ ...prev, roundNumber: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  className="px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted"
                  onClick={() => setShowCreateAuctionModal(false)}
                  disabled={createAuctionLoading}
                >
                  <T>Cancel</T>
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
                  onClick={handleCreateAuction}
                  disabled={createAuctionLoading}
                >
                  {createAuctionLoading ? <T>Creating...</T> : <T>Create Auction</T>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <AuthModal />
    </div>
  );
}
