import { useState, useEffect } from "react";
import { chitGroups as chitGroupsApi, escrow } from "@/lib/api";
import { toast } from "sonner";
import { IndianRupee, ShieldAlert, Lock, Unlock, PlayCircle, Loader2, CheckCircle } from "lucide-react";
import { T } from "@/context/LanguageContext";

export function EscrowPanel() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [balances, setBalances] = useState({});
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await chitGroupsApi.getAll();
            if (res.data.success) {
                setGroups(res.data.data);
                // Fetch Escrow Balances for all active groups
                const balanceMap = {};
                for (const group of res.data.data) {
                    try {
                        const balRes = await escrow.getBalance(group.id);
                        if (balRes.data.success) {
                            balanceMap[group.id] = balRes.data;
                        }
                    } catch (e) {
                        // ignore empty escrows
                    }
                }
                setBalances(balanceMap);
            }
        } catch (error) {
            toast.error("Failed to load active chit groups");
        } finally {
            setLoading(false);
        }
    };

    const handleReleasePayout = async (groupId) => {
        const winnerId = window.prompt("Enter Winner User ID (UUID) for payout evaluation:");
        if (!winnerId) return;

        setProcessingId(`payout-${groupId}`);
        toast.info("Triggering AI Risk Engine Evaluation...");

        try {
            // For testing, randomly generate a risk score (backend expects dummy_risk_score for hackathon simulation)
            const riskScore = Math.floor(Math.random() * 100);

            const res = await escrow.releasePayout({
                chit_group_id: groupId,
                winner_user_id: winnerId,
                dummy_risk_score: riskScore
            });

            if (res.data.success) {
                toast.success(`Payout Successful! Risk Score: ${riskScore}. Blockchain Ledger Updated.`);
                fetchData();
            }
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error(`AI Risk Blocked Payout. Escrow locked. View Admin Audit Logs.`);
            } else {
                toast.error(error.response?.data?.message || "Failed to process payout.");
            }
        } finally {
            setProcessingId(null);
        }
    };

    const handleFreeze = async (groupId) => {
        if (!window.confirm("Are you sure you want to freeze this Escrow account?")) return;
        setProcessingId(`freeze-${groupId}`);
        try {
            // we need the escrowAccount ID. We will pass it from backend or just use freeze endpoint adjusted. 
            // In backend: freeze endpoint expects escrow_account_id. 
            // Let's modify the backend call to freeze by chit_group_id if we don't have the escrow_account_id directly here.
            toast.error("Freeze functionality requires Escrow Account ID from API. Skipped for layout demo.");
        } catch (error) {
            toast.error("Failed to freeze escrow.");
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;
    }

    if (groups.length === 0) {
        return (
            <div className="text-center py-20 bg-card rounded-2xl border border-border">
                <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground"><T>No Active Groups Found</T></h3>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {groups.map((group) => {
                const bal = balances[group.id] || { total_collected: 0, locked_amount: 0, available_for_payout: 0 };

                return (
                    <div key={group.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-center">
                        <div className="flex-1">
                            <h3 className="text-xl font-bold flex items-center gap-2 mb-2">
                                {group.name}
                                <span className="px-2 py-0.5 rounded text-xs bg-accent/20 text-accent font-medium uppercase">{group.status}</span>
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mt-4">
                                <div className="bg-secondary/5 p-3 rounded-xl border border-secondary/10">
                                    <p className="text-xs text-muted-foreground font-medium mb-1"><T>Total Fund Size</T></p>
                                    <p className="font-bold flex items-center"><IndianRupee className="w-4 h-4 mr-1" />{Number(group.chit_value).toLocaleString()}</p>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl border border-green-100">
                                    <p className="text-xs text-muted-foreground font-medium mb-1"><T>Locked in Escrow</T></p>
                                    <p className="font-bold text-green-700 flex items-center"><Lock className="w-4 h-4 mr-1" />{Number(bal.locked_amount).toLocaleString()}</p>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                                    <p className="text-xs text-muted-foreground font-medium mb-1"><T>Total Collected</T></p>
                                    <p className="font-bold text-blue-700 flex items-center"><IndianRupee className="w-4 h-4 mr-1" />{Number(bal.total_collected).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <button
                                onClick={() => handleReleasePayout(group.id)}
                                disabled={!!processingId || Number(bal.locked_amount) === 0}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-medium rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {processingId === `payout-${group.id}` ? <Loader2 className="w-5 h-5 animate-spin" /> : <><PlayCircle className="w-5 h-5" /> <T>Release Payout</T></>}
                            </button>
                            <button
                                onClick={() => handleFreeze(group.id)}
                                disabled={!!processingId}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 font-medium rounded-xl border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                <ShieldAlert className="w-4 h-4" /> <T>Freeze Escrow</T>
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    );
}
