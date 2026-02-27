import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { chitGroups as chitGroupsApi, escrow } from "@/lib/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2, Users, Calendar, IndianRupee } from "lucide-react";
import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";
import { GroupRiskCard } from "@/components/GroupRiskCard";
import ChitPayoutCalculator from "@/components/ChitPayoutCalculator";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ChitGroupDetails() {
  const { id } = useParams();
  const { user, isAuthenticated, setShowAuthModal } = useAuth();
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState(null);
  const [joinRequestStatus, setJoinRequestStatus] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [calcSnapshot, setCalcSnapshot] = useState(null);
  const [applyLoading, setApplyLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchGroupDetails();
    }
  }, [id, isAuthenticated]);

  const fetchGroupDetails = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await chitGroupsApi.getById(id);
      if (res.data.success) {
        const payload = res.data.data;
        setGroup(payload);
        setJoinRequestStatus(payload.joinRequestStatus || null);
        setIsMember(Boolean(payload.isMember));
      } else {
        toast.error(res.data.message || "Group not found");
      }
    } catch (error) {
      console.error('Error fetching group details:', error);
      toast.error(error.response?.data?.message || "Failed to load group details");
    } finally {
      setLoading(false);
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
            }
          } catch (err) {
            toast.error("Payment verification failed. If deducted, it will be refunded.");
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
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        toast.error(`Payment Failed: ${response.error.description}`);
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
      toast.error(error.response?.data?.message || "Could not initiate payment. Please try again later.");
    } finally {
      setPaymentLoading(false);
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

    if (isMember || joinRequestStatus === "approved") {
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
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 right-40 w-[550px] h-[550px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 py-12 pt-24">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading group details...</span>
          </div>
        ) : !group ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-xl mx-auto">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">Group Not Found</h3>
            <p className="text-muted-foreground mt-1">This chit group does not exist or has been deleted.</p>
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
                  <h2 className="font-heading font-bold text-xl mb-4">Group Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IndianRupee className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Chit Value</p>
                        <p className="font-semibold text-foreground">₹{Number(group.group.chit_value).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">{group.group.duration_months} months</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Members</p>
                        <p className="font-semibold text-foreground">{group.memberStats.total} / {group.memberStats.capacity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Start Date</p>
                        <p className="font-semibold text-foreground">{group.group.created_at ? new Date(group.group.created_at).toLocaleDateString() : "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {group.calcInputs && (
                  <div className="bg-white rounded-xl p-6 border border-border">
                    <h2 className="font-heading font-bold text-xl mb-4">Payout Calculator</h2>
                    <ChitPayoutCalculator
                      totalMembers={group.calcInputs.totalMembers}
                      monthlyContribution={group.calcInputs.monthlyContribution}
                      durationMonths={group.calcInputs.durationMonths}
                      foremanCommissionPercent={group.calcInputs.foremanCommissionPercent}
                      minDiscount={group.calcInputs.minimumBidDiscountPercent}
                      maxDiscount={group.calcInputs.maximumBidDiscountPercent}
                      onCalculate={(r) => setCalcSnapshot(r)}
                    />
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
                  <p className="text-xs text-muted-foreground">No AI risk report available.</p>
                )}

                {group.organizerDetails?.risk_profile && (
                  <div className="bg-white rounded-xl p-6 border border-border">
                    <h2 className="font-heading font-bold text-lg mb-4">Risk Assessment</h2>
                    <RiskAssessmentCard riskProfile={group.organizerDetails.risk_profile} />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
