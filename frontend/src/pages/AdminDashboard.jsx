import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { admin as adminApi } from "@/lib/api";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { RiskAssessmentCard } from "@/components/RiskAssessmentCard";
import { EscrowPanel } from "@/components/EscrowPanel";
import { CheckCircle, XCircle, Clock, ShieldAlert, Building2, Lock } from "lucide-react";

export default function AdminDashboard() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("pending");
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/");
            toast.error("Please login to access the admin dashboard.");
            return;
        }
        if (user?.role !== "ADMIN") {
            navigate("/");
            toast.error("You do not have permission to access the admin dashboard.");
            return;
        }
        fetchApplications();
    }, [isAuthenticated, user, navigate, activeTab]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            let res;
            if (activeTab === "pending") {
                res = await adminApi.getPendingApplications();
            } else {
                res = await adminApi.getMigratingApplications();
            }
            if (res.data.success) {
                setApplications(res.data.data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch applications");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        if (!window.confirm("Are you sure you want to approve this application and create the organization?")) return;
        try {
            const res = await adminApi.approveApplication(id);
            if (res.data.success) {
                toast.success("Application approved successfully!");
                fetchApplications();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to approve application");
        }
    };

    const handleReject = async (id) => {
        const reason = window.prompt("Reason for rejection:");
        if (!reason) return;
        try {
            const res = await adminApi.rejectApplication(id, reason);
            if (res.data.success) {
                toast.success("Application rejected.");
                fetchApplications();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to reject application");
        }
    };

    if (!isAuthenticated || user?.role !== "ADMIN") return null;

    return (
        <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
          {/* Gradient Splashes */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
          </div>
            <Navbar />
            <main className="flex-grow container mx-auto px-4 py-24">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold">Admin Dashboard</h1>
                        <p className="text-muted-foreground mt-2">Manage organizer applications and platform integrity.</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-4 mb-8 border-b border-border">
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "pending" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        Pending Validations
                    </button>
                    <button
                        onClick={() => setActiveTab("migrating")}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "migrating" ? "border-amber-500 text-amber-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        Migration Queue
                    </button>
                    <button
                        onClick={() => setActiveTab("escrow")}
                        className={`pb-4 px-2 font-medium text-sm transition-colors border-b-2 flex items-center gap-1 ${activeTab === "escrow" ? "border-green-500 text-green-600" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                    >
                        <Lock className="w-4 h-4" /> Escrow Management
                    </button>
                </div>

                {/* Content */}
                {activeTab === "escrow" ? (
                    <EscrowPanel />
                ) : loading ? (
                    <div className="text-center py-20 text-muted-foreground">Loading applications...</div>
                ) : !applications || applications.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-2xl border border-border">
                        <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-medium text-foreground">No applications found</h3>
                        <p className="text-muted-foreground mt-1">The {activeTab} queue is currently empty.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                    {/* Left: Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                                                <Building2 className="w-5 h-5 text-primary" />
                                                {app.company_name}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${app.type === 'MIGRATING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {app.type}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Location</p>
                                                <p className="text-sm font-medium">{app.city}, {app.state}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Experience</p>
                                                <p className="text-sm font-medium">{app.years_of_operation} Years</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Proposed Size</p>
                                                <p className="text-sm font-medium">₹{app.proposed_chit_size?.toLocaleString() || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground font-medium">Risk Score</p>
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-sm font-bold ${app.application_risk_score > 70 ? 'text-green-600' :
                                                        app.application_risk_score > 40 ? 'text-amber-600' : 'text-red-600'
                                                        }`}>
                                                        {app.application_risk_score}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">/ 100</span>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Risk Assessment Card */}
                                        {app.risk_profile && <RiskAssessmentCard riskProfile={app.risk_profile} />}
                                    </div>

                                    {/* Right: Actions */}
                                    <div className="flex flex-row md:flex-col gap-3 justify-center min-w-[140px]">
                                        <button
                                            onClick={() => handleApprove(app.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(app.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
                                        >
                                            <XCircle className="w-4 h-4" /> Reject
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
