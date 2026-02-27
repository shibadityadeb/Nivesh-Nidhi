import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { orgManage, organizerRequests, user as userApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import {
  Building2,
  Users,
  ScrollText,
  Megaphone,
  Bell,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldCheck,
  MapPin,
  IndianRupee,
  Calendar,
  Loader2,
  Plus,
  Trash2,
  Send,
  Settings,
  X,
  ChevronRight,
  UserPlus,
  UserMinus,
  Gavel,
  CircleDollarSign,
  Timer,
  Percent,
} from "lucide-react";

const ORG_STATUS = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  UNDER_RISK_ASSESSMENT: { label: "Under Assessment", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  APPROVED_LIMITED: { label: "Approved (Limited)", color: "bg-teal-100 text-teal-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-700", icon: XCircle },
};

const NOTIF_TYPES = [
  { value: "DUE_REMINDER", label: "Due Reminder", icon: CircleDollarSign },
  { value: "BIDDING_ALERT", label: "Bidding Alert", icon: Gavel },
  { value: "PENALTY_WARNING", label: "Penalty Warning", icon: AlertTriangle },
  { value: "CUSTOM", label: "Custom", icon: Bell },
];

const ANNOUNCE_TYPES = [
  { value: "GENERAL", label: "General" },
  { value: "URGENT", label: "Urgent" },
  { value: "BIDDING", label: "Bidding" },
  { value: "PAYMENT", label: "Payment" },
];

const TABS = [
  { key: "overview", label: "Organization Status", icon: Building2 },
  { key: "requests", label: "Join Requests", icon: ClipboardList },
  { key: "members", label: "Manage Members", icon: Users },
  { key: "rules", label: "Set Rules", icon: ScrollText },
  { key: "updates", label: "Announcements & Notifications", icon: Bell },
];

const MyChitGroup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [organizations, setOrganizations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [profileData, setProfileData] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  // Sub-data states
  const [members, setMembers] = useState([]);
  const [joinRequests, setJoinRequests] = useState([]);
  const [rules, setRules] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [subLoading, setSubLoading] = useState(false);

  // Form states
  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "" });
  const [ruleForm, setRuleForm] = useState({
    monthly_amount: "",
    duration_months: "",
    late_penalty_pct: "2",
    commission_pct: "5",
    min_bid_pct: "5",
    max_bid_pct: "40",
    bidding_day: "1",
    payment_due_day: "5",
    grace_period_days: "5",
  });
  const [announceForm, setAnnounceForm] = useState({ title: "", message: "", type: "GENERAL" });
  const [notifForm, setNotifForm] = useState({ title: "", message: "", type: "DUE_REMINDER", target_user_id: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Always fetch latest user profile to sync role (admin may have promoted to ORGANIZER)
    const initPage = async () => {
      try {
        const { data } = await userApi.getMe();
        const latestUser = data?.data?.user;
        if (latestUser) {
          updateUser(latestUser);
          if (latestUser.role !== "ORGANIZER" && latestUser.role !== "ADMIN") {
            navigate("/");
            toast.error("Only organizers can access this page");
            return;
          }
        }
      } catch {
        // Use cached role as fallback
        if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
          navigate("/");
          toast.error("Only organizers can access this page");
          return;
        }
      }
      fetchOrganizations();
    };

    initPage();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const res = await orgManage.getMyOrganizations();
      if (res.data.success) {
        setOrganizations(res.data.data.organizations || []);
        setApplications(res.data.data.applications || []);
        setProfileData(res.data.data.profile);

        // Auto-select first approved org
        const approvedOrg = (res.data.data.organizations || []).find((o) => o.is_verified);
        if (approvedOrg) {
          setSelectedOrg(approvedOrg);
          if (approvedOrg.chit_groups?.length > 0) {
            setSelectedGroup(approvedOrg.chit_groups[0]);
          }
        } else if (res.data.data.organizations?.length > 0) {
          setSelectedOrg(res.data.data.organizations[0]);
        }
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No profile yet
      } else {
        toast.error("Failed to load organization data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch tab data when group/tab changes
  useEffect(() => {
    if (activeTab === "requests") {
      fetchJoinRequests();
      return;
    }
    if (!selectedGroup) return;
    if (activeTab === "members") fetchMembers();
    if (activeTab === "rules") fetchRules();
    if (activeTab === "updates") {
      fetchAnnouncements();
      fetchNotifications();
    }
  }, [selectedGroup, activeTab]);

  const fetchJoinRequests = async () => {
    setSubLoading(true);
    try {
      const res = await organizerRequests.getPending(selectedGroup?.id);
      setJoinRequests(res.data.data || []);
    } catch {
      setJoinRequests([]);
    } finally {
      setSubLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!selectedGroup) return;
    setSubLoading(true);
    try {
      const res = await orgManage.getMembers(selectedGroup.id);
      setMembers(res.data.data || []);
    } catch { setMembers([]); }
    finally { setSubLoading(false); }
  };

  const fetchRules = async () => {
    if (!selectedGroup) return;
    setSubLoading(true);
    try {
      const res = await orgManage.getRules(selectedGroup.id);
      const r = res.data.data;
      if (r) {
        setRules(r);
        setRuleForm({
          monthly_amount: r.monthly_amount || "",
          duration_months: r.duration_months || "",
          late_penalty_pct: r.late_penalty_pct ?? "2",
          commission_pct: r.commission_pct ?? "5",
          min_bid_pct: r.min_bid_pct ?? "5",
          max_bid_pct: r.max_bid_pct ?? "40",
          bidding_day: r.bidding_day ?? "1",
          payment_due_day: r.payment_due_day ?? "5",
          grace_period_days: r.grace_period_days ?? "5",
        });
      } else {
        setRules(null);
        setRuleForm({
          monthly_amount: selectedGroup.chit_value || "",
          duration_months: selectedGroup.duration_months || "",
          late_penalty_pct: "2", commission_pct: "5", min_bid_pct: "5",
          max_bid_pct: "40", bidding_day: "1", payment_due_day: "5", grace_period_days: "5",
        });
      }
    } catch { setRules(null); }
    finally { setSubLoading(false); }
  };

  const fetchAnnouncements = async () => {
    if (!selectedGroup) return;
    setSubLoading(true);
    try {
      const res = await orgManage.getAnnouncements(selectedGroup.id);
      setAnnouncements(res.data.data || []);
    } catch { setAnnouncements([]); }
    finally { setSubLoading(false); }
  };

  const fetchNotifications = async () => {
    if (!selectedGroup) return;
    setSubLoading(true);
    try {
      const res = await orgManage.getNotifications(selectedGroup.id);
      setNotifications(res.data.data || []);
    } catch { setNotifications([]); }
    finally { setSubLoading(false); }
  };

  // --- Action handlers ---
  const handleAddMember = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orgManage.addMember(selectedGroup.id, memberForm);
      toast.success("Member added successfully!");
      setMemberForm({ name: "", email: "", phone: "" });
      fetchMembers();
      fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add member");
    } finally { setSubmitting(false); }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await orgManage.removeMember(selectedGroup.id, memberId);
      toast.success("Member removed");
      fetchMembers();
      fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orgManage.saveRules(selectedGroup.id, ruleForm);
      toast.success("Rules saved successfully!");
      fetchRules();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save rules");
    } finally { setSubmitting(false); }
  };

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orgManage.createAnnouncement(selectedGroup.id, announceForm);
      toast.success("Announcement created!");
      setAnnounceForm({ title: "", message: "", type: "GENERAL" });
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create announcement");
    } finally { setSubmitting(false); }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    try {
      await orgManage.deleteAnnouncement(selectedGroup.id, announcementId);
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete announcement");
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await orgManage.sendNotification(selectedGroup.id, notifForm);
      toast.success("Notification sent!");
      setNotifForm({ title: "", message: "", type: "DUE_REMINDER", target_user_id: "" });
      fetchNotifications();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send notification");
    } finally { setSubmitting(false); }
  };

  const handleRequestAction = async (requestId, status) => {
    setSubmitting(true);
    try {
      await organizerRequests.updateStatus(requestId, status);
      toast.success(status === "APPROVED" ? "Request approved" : "Request rejected");
      fetchJoinRequests();
      fetchOrganizations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update request");
    } finally {
      setSubmitting(false);
    }
  };

  const isApproved = selectedOrg?.is_verified;

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 right-40 w-[600px] h-[600px] bg-gradient-to-br from-primary/8 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-40 w-[500px] h-[500px] bg-gradient-to-tr from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      <main className="container mx-auto px-4 py-24 pb-12 relative z-10">
        {/* Modern Page Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-navy flex items-center justify-center shadow-lg">
                <Building2 className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-4xl text-foreground bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Organization Hub
                </h1>
                <p className="text-muted-foreground text-sm mt-1">Complete control over your chit fund operations</p>
              </div>
            </div>
            {selectedOrg && isApproved && (
              <a
                href="/apply-organizer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-saffron text-saffron-foreground font-semibold text-sm shadow-lg hover:shadow-xl transition-all hover:scale-105"
              >
                <Plus className="w-5 h-5" />
                Create New Group
              </a>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading...</span>
          </div>
        ) : organizations.length === 0 && applications.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-2xl border border-border max-w-xl mx-auto">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Organization Yet</h3>
            <p className="text-muted-foreground mt-1 mb-4">
              You haven't applied as an organizer yet.
            </p>
            <a
              href="/apply-organizer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-navy text-primary-foreground font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              Apply as Organizer
            </a>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Modern Sidebar */}
            <aside className="w-full lg:w-96 shrink-0 space-y-6">
              {/* Quick Actions - Moved to Top */}
              {selectedOrg && (
                <div className="bg-white/80 backdrop-blur-sm border-2 border-accent/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Quick Actions</h3>
                  </div>
                  <nav className="space-y-2">
                    {TABS.map((tab) => {
                      const Icon = tab.icon;
                      const disabled = tab.key !== "overview" && !isApproved;
                      return (
                        <button
                          key={tab.key}
                          onClick={() => !disabled && setActiveTab(tab.key)}
                          disabled={disabled}
                          className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                            activeTab === tab.key
                              ? "bg-gradient-to-r from-primary via-primary/90 to-secondary text-white shadow-lg scale-105"
                              : disabled
                              ? "text-muted-foreground/30 cursor-not-allowed bg-muted/20"
                              : "text-foreground hover:bg-gradient-to-r hover:from-muted hover:to-muted/50 hover:scale-102 hover:shadow-md"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            activeTab === tab.key ? "bg-white/20" : "bg-primary/10"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="flex-1 text-left">{tab.label}</span>
                          {!disabled && activeTab === tab.key && <ChevronRight className="w-5 h-5" />}
                        </button>
                      );
                    })}
                  </nav>
                </div>
              )}

              {/* Org Selector with Cards */}
              <div className="bg-white/80 backdrop-blur-sm border-2 border-primary/10 rounded-3xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Organizations</h3>
                </div>
                <div className="space-y-3">
                  {organizations.map((org) => {
                    const isActive = selectedOrg?.id === org.id;
                    return (
                      <button
                        key={org.id}
                        onClick={() => {
                          setSelectedOrg(org);
                          setSelectedGroup(org.chit_groups?.[0] || null);
                          setActiveTab("overview");
                        }}
                        className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                          isActive
                            ? "bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary shadow-lg scale-105"
                            : "bg-muted/30 border-2 border-transparent hover:border-primary/20 hover:shadow-md hover:scale-102"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="font-bold text-base text-foreground truncate pr-2">{org.name}</span>
                          {org.is_verified ? (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-100">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-100">
                              <Clock className="w-4 h-4 text-yellow-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{org.city}, {org.state}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Group Selector (if org is approved) */}
              {selectedOrg && isApproved && selectedOrg.chit_groups?.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm border-2 border-secondary/10 rounded-3xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-base font-bold text-foreground">Active Groups</h3>
                  </div>
                  <div className="space-y-3">
                    {selectedOrg.chit_groups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => setSelectedGroup(group)}
                        className={`w-full text-left p-5 rounded-2xl transition-all duration-300 ${
                          selectedGroup?.id === group.id
                            ? "bg-gradient-to-r from-secondary/10 to-accent/10 border-2 border-secondary shadow-lg scale-105"
                            : "bg-muted/30 border-2 border-transparent hover:border-secondary/20 hover:shadow-md hover:scale-102"
                        }`}
                      >
                        <span className="font-bold text-base text-foreground block truncate mb-3">{group.name}</span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-xs bg-white/50 rounded-lg px-2 py-1.5">
                            <Users className="w-3.5 h-3.5 text-primary" />
                            <span className="font-semibold">{group.current_members}/{group.member_capacity}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs bg-white/50 rounded-lg px-2 py-1.5">
                            <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-semibold">₹{(Number(group.chit_value)/1000).toFixed(0)}K</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedGroup && (
                    <button
                      type="button"
                      onClick={() => navigate(`/chit-groups/${selectedGroup.id}`)}
                      className="w-full mt-4 px-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 flex items-center justify-center gap-2"
                    >
                      <Gavel className="w-4 h-4" />
                      Open Auction Desk
                    </button>
                  )}
                </div>
              )}
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0">
              {/* OVERVIEW TAB */}
              {activeTab === "overview" && selectedOrg && (
                <div className="space-y-6">
                  {/* Applications Status */}
                  {applications.length > 0 && (
                    <section>
                      <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                        <ScrollText className="w-5 h-5 text-secondary" />
                        Application Status
                      </h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {applications.map((app) => {
                          const st = ORG_STATUS[app.status] || ORG_STATUS.PENDING;
                          const StIcon = st.icon;
                          return (
                            <div key={app.id} className="bg-card border border-border rounded-2xl p-5">
                              <div className="flex items-start justify-between mb-3">
                                <h3 className="font-semibold text-card-foreground text-sm">
                                  {app.company_name || "Application"}
                                </h3>
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${st.color}`}>
                                  <StIcon className="w-3 h-3" />
                                  {st.label}
                                </span>
                              </div>
                              <div className="space-y-1.5 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Building2 className="w-3.5 h-3.5" />
                                  Type: <span className="font-medium text-foreground">{app.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Applied: {new Date(app.created_at).toLocaleDateString("en-IN")}
                                </div>
                              </div>
                              {(app.status === "APPROVED" || app.status === "APPROVED_LIMITED") && (
                                <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                                  <p className="text-xs text-emerald-700 font-medium">
                                    ✅ Approved! You can now manage your organization below.
                                  </p>
                                </div>
                              )}
                              {app.status === "REJECTED" && (
                                <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                                  <p className="text-xs text-red-600 font-medium">
                                    Your application was rejected. You may re-apply with updated details.
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Organization Details */}
                  <section>
                    <div className="bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 mb-8 border-2 border-primary/20 shadow-xl">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                          <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="font-heading font-bold text-2xl text-foreground">
                          Organization Overview
                        </h2>
                      </div>
                      
                      <div className="bg-white/80 backdrop-blur-sm border-2 border-white/50 rounded-2xl p-8 shadow-lg">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                          <div>
                            <h3 className="font-heading font-bold text-3xl text-foreground mb-2">{selectedOrg.name}</h3>
                            <div className="flex items-center gap-2 text-base text-muted-foreground">
                              <MapPin className="w-5 h-5" />
                              <span>{selectedOrg.city}, {selectedOrg.state} — {selectedOrg.pincode}</span>
                            </div>
                          </div>
                          {selectedOrg.is_verified ? (
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 border-2 border-emerald-300 shadow-md">
                              <ShieldCheck className="w-6 h-6" />
                              <span>Verified</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl text-base font-bold bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-2 border-yellow-300 shadow-md">
                              <Clock className="w-6 h-6" />
                              <span>Pending</span>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                          <StatCard label="Trust Tier" value={selectedOrg.trust_tier?.replace("_", " ")} icon={ShieldCheck} />
                          <StatCard label="Reputation" value={`${selectedOrg.reputation_score?.toFixed(0) || 50}/100`} icon={CheckCircle2} />
                          <StatCard label="Risk Rating" value={`${selectedOrg.risk_rating?.toFixed(0) || 50}/100`} icon={AlertTriangle} />
                          <StatCard label="Total Groups" value={selectedOrg.total_groups_managed || 0} icon={Users} />
                        </div>

                        {!isApproved && (
                          <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-2xl shadow-md">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-yellow-200 flex items-center justify-center shrink-0">
                                <Clock className="w-6 h-6 text-yellow-700" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-yellow-900 mb-2">Awaiting Admin Approval</h4>
                                <p className="text-sm text-yellow-800">
                                  Your organization is under review. Once approved, you'll unlock full access to manage
                                  members, configure rules, send announcements, and notify members.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {isApproved && (
                          <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 rounded-2xl shadow-md">
                            <div className="flex items-start gap-4">
                              <div className="w-12 h-12 rounded-xl bg-emerald-200 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                              </div>
                              <div>
                                <h4 className="text-base font-bold text-emerald-900 mb-2">Organization Approved!</h4>
                                <p className="text-sm text-emerald-800">
                                  You now have full access to all management features. Use the Quick Actions menu to
                                  manage members, set rules, create announcements, and send notifications.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </section>

                  {/* Chit Groups Overview */}
                  {isApproved && selectedOrg.chit_groups?.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between gap-3 mb-4">
                        <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                          <Users className="w-5 h-5 text-accent" />
                          Chit Groups ({selectedOrg.chit_groups.length})
                        </h2>
                        {selectedGroup && (
                          <button
                            type="button"
                            onClick={() => navigate(`/chit-groups/${selectedGroup.id}`)}
                            className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground text-sm font-semibold hover:bg-secondary/90 flex items-center gap-2"
                          >
                            <Gavel className="w-4 h-4" />
                            Approve Auctions
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedOrg.chit_groups.map((group) => (
                          <div
                            key={group.id}
                            onClick={() => { setSelectedGroup(group); setActiveTab("members"); }}
                            className="bg-card border border-border rounded-2xl p-5 cursor-pointer hover:shadow-md hover:border-primary/30 transition-all group"
                          >
                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{group.name}</h4>
                            <div className="space-y-2 mt-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Users className="w-3.5 h-3.5" />
                                {group.current_members}/{group.member_capacity} members
                              </div>
                              <div className="flex items-center gap-2">
                                <IndianRupee className="w-3.5 h-3.5" />
                                ₹{Number(group.chit_value).toLocaleString("en-IN")}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" />
                                {group.duration_months} months
                              </div>
                            </div>
                            <div className="mt-3 flex items-center gap-1 text-xs text-primary font-medium">
                              Manage <ChevronRight className="w-3 h-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* MEMBERS TAB */}
              {activeTab === "requests" && isApproved && (
                <div className="space-y-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Join Requests
                  </h2>

                  {subLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-primary" />
                    </div>
                  ) : joinRequests.length === 0 ? (
                    <div className="text-center py-14 bg-card rounded-2xl border border-border">
                      <ClipboardList className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <p className="text-sm text-muted-foreground">No pending join requests.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {joinRequests.map((request) => (
                        <div key={request.id} className="bg-card border border-border rounded-2xl p-5">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{request.user?.name || "Unknown User"}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {request.group?.name || "Unknown Group"} · Applied {new Date(request.appliedAt).toLocaleString("en-IN")}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {request.user?.email || "No email"} · Contribution ₹{Number(request.contributionAmount || 0).toLocaleString("en-IN")}
                              </p>
                              <div className="mt-2">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  request.user?.isKycVerified ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700"
                                }`}>
                                  {request.user?.isKycVerified ? "KYC Verified" : "KYC Pending"}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRequestAction(request.id, "APPROVED")}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestAction(request.id, "REJECTED")}
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MEMBERS TAB */}
              {activeTab === "members" && isApproved && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Manage Members
                      {selectedGroup && (
                        <span className="text-sm font-normal text-muted-foreground ml-2">— {selectedGroup.name}</span>
                      )}
                    </h2>
                  </div>

                  {!selectedGroup ? (
                    <EmptyState icon={Users} message="Select a chit group from the sidebar to manage members." />
                  ) : (
                    <>
                      {/* Add Member Form */}
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-medium text-sm text-foreground mb-4 flex items-center gap-2">
                          <UserPlus className="w-4 h-4 text-emerald-500" />
                          Add New Member
                        </h3>
                        <form onSubmit={handleAddMember} className="flex flex-col md:flex-row gap-3">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={memberForm.name}
                            onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                            required
                            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={memberForm.email}
                            onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                            required
                            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <input
                            type="tel"
                            placeholder="Phone (optional)"
                            value={memberForm.phone}
                            onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                          <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                          >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add
                          </button>
                        </form>
                      </div>

                      {/* Members List */}
                      <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                          <h3 className="font-medium text-sm text-foreground">
                            Active Members ({members.filter((m) => m.status === "ACTIVE").length} / {selectedGroup.member_capacity})
                          </h3>
                        </div>
                        {subLoading ? (
                          <div className="flex justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                          </div>
                        ) : members.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground text-sm">
                            No members yet. Add members using the form above.
                          </div>
                        ) : (
                          <div className="divide-y divide-border">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/30 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">{member.name?.[0]?.toUpperCase()}</span>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}{member.phone ? ` · ${member.phone}` : ""}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    member.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                  }`}>
                                    {member.status}
                                  </span>
                                  {member.status === "ACTIVE" && (
                                    <button
                                      onClick={() => handleRemoveMember(member.id)}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                                      title="Remove member"
                                    >
                                      <UserMinus className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* RULES TAB */}
              {activeTab === "rules" && isApproved && (
                <div className="space-y-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                    <ScrollText className="w-5 h-5 text-primary" />
                    Set Rules
                    {selectedGroup && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">— {selectedGroup.name}</span>
                    )}
                  </h2>

                  {!selectedGroup ? (
                    <EmptyState icon={ScrollText} message="Select a chit group from the sidebar to configure rules." />
                  ) : subLoading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                  ) : (
                    <form onSubmit={handleSaveRules} className="bg-card border border-border rounded-2xl p-6 space-y-6">
                      {/* Amount & Duration */}
                      <div>
                        <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
                          <CircleDollarSign className="w-4 h-4 text-emerald-500" />
                          Amount & Duration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            label="Monthly Contribution (₹)"
                            type="number"
                            value={ruleForm.monthly_amount}
                            onChange={(v) => setRuleForm({ ...ruleForm, monthly_amount: v })}
                            placeholder="e.g. 25000"
                            min="100"
                          />
                          <InputField
                            label="Duration (months)"
                            type="number"
                            value={ruleForm.duration_months}
                            onChange={(v) => setRuleForm({ ...ruleForm, duration_months: v })}
                            placeholder="e.g. 20"
                            min="1"
                            max="60"
                          />
                        </div>
                      </div>

                      {/* Penalties & Commission */}
                      <div>
                        <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
                          <Percent className="w-4 h-4 text-orange-500" />
                          Penalties & Commission
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InputField
                            label="Late Penalty (%)"
                            type="number"
                            value={ruleForm.late_penalty_pct}
                            onChange={(v) => setRuleForm({ ...ruleForm, late_penalty_pct: v })}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <InputField
                            label="Commission (%)"
                            type="number"
                            value={ruleForm.commission_pct}
                            onChange={(v) => setRuleForm({ ...ruleForm, commission_pct: v })}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <InputField
                            label="Grace Period (days)"
                            type="number"
                            value={ruleForm.grace_period_days}
                            onChange={(v) => setRuleForm({ ...ruleForm, grace_period_days: v })}
                            min="0"
                            max="30"
                          />
                        </div>
                      </div>

                      {/* Bidding Rules */}
                      <div>
                        <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
                          <Gavel className="w-4 h-4 text-indigo-500" />
                          Bidding Rules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <InputField
                            label="Min Bid (%)"
                            type="number"
                            value={ruleForm.min_bid_pct}
                            onChange={(v) => setRuleForm({ ...ruleForm, min_bid_pct: v })}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <InputField
                            label="Max Bid (%)"
                            type="number"
                            value={ruleForm.max_bid_pct}
                            onChange={(v) => setRuleForm({ ...ruleForm, max_bid_pct: v })}
                            step="0.1"
                            min="0"
                            max="100"
                          />
                          <InputField
                            label="Bidding Day (of month)"
                            type="number"
                            value={ruleForm.bidding_day}
                            onChange={(v) => setRuleForm({ ...ruleForm, bidding_day: v })}
                            min="1"
                            max="28"
                          />
                        </div>
                      </div>

                      {/* Payment Schedule */}
                      <div>
                        <h3 className="font-medium text-sm text-foreground mb-3 flex items-center gap-2">
                          <Timer className="w-4 h-4 text-blue-500" />
                          Payment Schedule
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <InputField
                            label="Payment Due Day (of month)"
                            type="number"
                            value={ruleForm.payment_due_day}
                            onChange={(v) => setRuleForm({ ...ruleForm, payment_due_day: v })}
                            min="1"
                            max="28"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                        >
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                          {rules ? "Update Rules" : "Save Rules"}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* UPDATES TAB */}
              {activeTab === "updates" && isApproved && (
                <div className="space-y-6">
                  <h2 className="font-heading font-semibold text-lg text-foreground flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Announcements & Notifications
                    {selectedGroup && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">— {selectedGroup.name}</span>
                    )}
                  </h2>

                  {!selectedGroup ? (
                    <EmptyState icon={Megaphone} message="Select a chit group from the sidebar to manage announcements and notifications." />
                  ) : (
                    <>
                      {/* Create Announcement */}
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-medium text-sm text-foreground mb-4 flex items-center gap-2">
                          <Plus className="w-4 h-4 text-emerald-500" />
                          New Announcement
                        </h3>
                        <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                          <div className="flex gap-3">
                            <input
                              type="text"
                              placeholder="Announcement title"
                              value={announceForm.title}
                              onChange={(e) => setAnnounceForm({ ...announceForm, title: e.target.value })}
                              required
                              className="flex-1 px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <select
                              value={announceForm.type}
                              onChange={(e) => setAnnounceForm({ ...announceForm, type: e.target.value })}
                              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {ANNOUNCE_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            placeholder="Write your announcement..."
                            value={announceForm.message}
                            onChange={(e) => setAnnounceForm({ ...announceForm, message: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          />
                          <div className="flex justify-end">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                              Post Announcement
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Announcements List */}
                      <div className="space-y-3">
                        {subLoading ? (
                          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : announcements.length === 0 ? (
                          <div className="text-center py-10 bg-card border border-border rounded-2xl text-muted-foreground text-sm">
                            No announcements yet. Create your first announcement above.
                          </div>
                        ) : (
                          announcements.map((ann) => (
                            <div key={ann.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-sm transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-semibold text-sm text-foreground">{ann.title}</h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      ann.type === "URGENT" ? "bg-red-100 text-red-700"
                                      : ann.type === "BIDDING" ? "bg-indigo-100 text-indigo-700"
                                      : ann.type === "PAYMENT" ? "bg-amber-100 text-amber-700"
                                      : "bg-gray-100 text-gray-600"
                                    }`}>
                                      {ann.type}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{ann.message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {new Date(ann.created_at).toLocaleString("en-IN")}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleDeleteAnnouncement(ann.id)}
                                  className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      <h3 className="font-medium text-sm text-foreground flex items-center gap-2 pt-2">
                        <Bell className="w-4 h-4 text-blue-500" />
                        Notify Members
                      </h3>

                      {/* Send Notification Form */}
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-medium text-sm text-foreground mb-4 flex items-center gap-2">
                          <Send className="w-4 h-4 text-blue-500" />
                          Send Notification
                        </h3>
                        <form onSubmit={handleSendNotification} className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Notification title"
                              value={notifForm.title}
                              onChange={(e) => setNotifForm({ ...notifForm, title: e.target.value })}
                              required
                              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                            <select
                              value={notifForm.type}
                              onChange={(e) => setNotifForm({ ...notifForm, type: e.target.value })}
                              className="px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              {NOTIF_TYPES.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                              ))}
                            </select>
                          </div>
                          <textarea
                            placeholder="Write your notification message..."
                            value={notifForm.message}
                            onChange={(e) => setNotifForm({ ...notifForm, message: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Sends to all active members in this group
                            </p>
                            <button
                              type="submit"
                              disabled={submitting}
                              className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
                            >
                              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                              Send Notification
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* Quick Templates */}
                      <div className="bg-card border border-border rounded-2xl p-6">
                        <h3 className="font-medium text-sm text-foreground mb-4">Quick Templates</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {[
                            {
                              title: "Monthly Due Reminder",
                              message: `Reminder: Your monthly contribution of ₹${Number(selectedGroup.chit_value).toLocaleString("en-IN")} is due. Please make the payment before the due date to avoid penalties.`,
                              type: "DUE_REMINDER",
                              icon: CircleDollarSign,
                              color: "text-emerald-500 bg-emerald-50 border-emerald-200"
                            },
                            {
                              title: "Upcoming Bidding Session",
                              message: "A bidding session is scheduled soon. Please review the rules and prepare your bids. Contact us if you have any questions.",
                              type: "BIDDING_ALERT",
                              icon: Gavel,
                              color: "text-indigo-500 bg-indigo-50 border-indigo-200"
                            },
                            {
                              title: "Late Payment Warning",
                              message: "This is a reminder that your payment is overdue. Late penalties will be applied as per group rules. Please clear your dues immediately.",
                              type: "PENALTY_WARNING",
                              icon: AlertTriangle,
                              color: "text-amber-500 bg-amber-50 border-amber-200"
                            },
                            {
                              title: "Bidding Results Announced",
                              message: "The bidding results for this month have been finalized. Check the announcements section for details.",
                              type: "BIDDING_ALERT",
                              icon: CheckCircle2,
                              color: "text-blue-500 bg-blue-50 border-blue-200"
                            },
                          ].map((tpl, idx) => {
                            const TplIcon = tpl.icon;
                            return (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setNotifForm({ ...notifForm, title: tpl.title, message: tpl.message, type: tpl.type })}
                                className={`flex items-start gap-3 p-4 rounded-xl border text-left hover:shadow-sm transition-all ${tpl.color}`}
                              >
                                <TplIcon className="w-5 h-5 mt-0.5 shrink-0" />
                                <div>
                                  <p className="text-sm font-medium">{tpl.title}</p>
                                  <p className="text-xs opacity-70 mt-1 line-clamp-2">{tpl.message}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Notification History */}
                      <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/30">
                          <h3 className="font-medium text-sm text-foreground">Notification History</h3>
                        </div>
                        {subLoading ? (
                          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                        ) : notifications.length === 0 ? (
                          <div className="text-center py-10 text-muted-foreground text-sm">
                            No notifications sent yet.
                          </div>
                        ) : (
                          <div className="divide-y divide-border max-h-96 overflow-y-auto">
                            {notifications.map((notif) => {
                              const ntConfig = NOTIF_TYPES.find((t) => t.value === notif.type) || NOTIF_TYPES[3];
                              const NtIcon = ntConfig.icon;
                              return (
                                <div key={notif.id} className="px-5 py-3 hover:bg-muted/30 transition-colors">
                                  <div className="flex items-center gap-2 mb-1">
                                    <NtIcon className="w-3.5 h-3.5 text-primary" />
                                    <span className="text-sm font-medium text-foreground">{notif.title}</span>
                                    <span className="px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">{notif.type.replace("_", " ")}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                                  <p className="text-xs text-muted-foreground/60 mt-1">{new Date(notif.created_at).toLocaleString("en-IN")}</p>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Not Approved Message for non-overview tabs */}
              {activeTab !== "overview" && !isApproved && (
                <div className="text-center py-16 bg-card rounded-2xl border border-border">
                  <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground">Organization Not Yet Approved</h3>
                  <p className="text-muted-foreground mt-1">
                    This feature will be available once your organization is approved by the admin.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
      <AuthModal />
    </div>
  );
};

// --- Helper Components ---
const StatCard = ({ label, value, icon: Icon }) => (
  <div className="group relative bg-gradient-to-br from-white to-muted/30 rounded-2xl p-5 text-center border-2 border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 hover:scale-105">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
    <div className="relative">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground font-semibold mb-2 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{value}</p>
    </div>
  </div>
);

const EmptyState = ({ icon: Icon, message }) => (
  <div className="text-center py-16 bg-card rounded-2xl border border-border">
    <Icon className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);

const InputField = ({ label, type = "text", value, onChange, ...props }) => (
  <div>
    <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      {...props}
    />
  </div>
);

export default MyChitGroup;
