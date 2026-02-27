import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { user as userApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { IndianRupee, ShieldCheck, Link2, ExternalLink, Calendar, Loader2, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function JoinedGroups() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    const fetchJoinedGroups = async () => {
      setLoading(true);
      try {
        const res = await userApi.getChits();
        if (res.data.success) {
          setTransactions(res.data.data || []);
        }
      } catch (error) {
        toast.error("Failed to load joined groups");
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedGroups();
  }, [isAuthenticated, navigate]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background relative flex flex-col overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 py-24 pb-12 flex-grow">
        <div className="mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-2">
            Member Dashboard
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            My Chit Funds
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your Chit Fund investments, view your Escrow locks, and verify blockchain transactions.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading your portfolio...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border">
            <ShieldCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Investments Found</h3>
            <p className="text-muted-foreground mt-1 mb-6">
              You haven't joined any Chit Groups yet.
            </p>
            <Link to="/chit-groups" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
              Browse Chit Groups <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {transactions.map((tx) => {
              const group = tx.escrow_account?.chit_group;
              const org = group?.organization;
              return (
                <div key={tx.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-heading font-bold text-xl text-foreground">
                          {group?.name || "Unknown Group"}
                        </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active Contribution
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">Organized by: <span className="font-semibold text-foreground">{org?.name}</span></p>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Paid on {formatDate(tx.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">₹{Number(tx.amount).toLocaleString('en-IN')} Secured</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Tech details */}
                    <div className="bg-gray-50/50 flex-1 md:max-w-md rounded-xl p-4 border border-gray-100 space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">Escrow Status</p>
                        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100 w-fit">
                          <ShieldCheck className="w-4 h-4" />
                          Funds Locked Safely
                        </div>
                      </div>

                      {tx.blockchain_hash ? (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1"><Link2 className="w-3 h-3" /> Blockchain Ledger Entry</p>
                          <a
                            href={`https://amoy.polygonscan.com/tx/${tx.blockchain_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-mono text-primary flex items-center gap-1 hover:underline break-all bg-primary/5 p-2 rounded border border-primary/10"
                          >
                            {tx.blockchain_hash}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-muted-foreground font-medium mb-1">Blockchain Sync</p>
                          <p className="text-xs text-amber-600">Pending Block Confirmation...</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
}
