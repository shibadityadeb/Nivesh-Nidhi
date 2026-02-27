import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { chitGroups as chitGroupsApi, user as userApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  MapPin,
  Users,
  Calendar,
  IndianRupee,
  ShieldCheck,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Building2,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const STATUS_CONFIG = {
  OPEN: { label: "Open", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  IN_PROGRESS: { label: "Ongoing", color: "bg-blue-100 text-blue-700", icon: Clock },
  COMPLETED: { label: "Completed", color: "bg-gray-100 text-gray-600", icon: CheckCircle2 },
};

const APP_STATUS_CONFIG = {
  PENDING: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: Clock },
  UNDER_RISK_ASSESSMENT: { label: "Under Assessment", color: "bg-orange-100 text-orange-700", icon: AlertTriangle },
  APPROVED: { label: "Approved", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  APPROVED_LIMITED: { label: "Approved (Limited)", color: "bg-teal-100 text-teal-700", icon: CheckCircle2 },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: XCircle },
  SUSPENDED: { label: "Suspended", color: "bg-red-100 text-red-700", icon: XCircle },
};

const MyChitFundGroup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [chitGroups, setChitGroups] = useState([]);
  const [applications, setApplications] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [profileStatus, setProfileStatus] = useState(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [form, setForm] = useState({
    organization_id: "",
    name: "",
    chit_value: "",
    duration_months: "",
    member_capacity: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    // Fetch latest user profile to sync role (e.g. admin may have promoted to ORGANIZER)
    const initPage = async () => {
      try {
        const { data } = await userApi.getMe();
        const latestUser = data?.data?.user;
        if (latestUser) {
          updateUser(latestUser);
        }
      } catch {
        // Ignore - use cached user
      }
      fetchMyGroups();
    };

    initPage();
  }, []);

  const fetchMyGroups = async () => {
    setLoading(true);
    try {
      const res = await chitGroupsApi.getMyGroups();
      if (res.data.success) {
        setChitGroups(res.data.data.chitGroups || []);
        setApplications(res.data.data.applications || []);
        setOrganizations(res.data.data.organizations || []);
        setProfileStatus(res.data.data.profileStatus);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // No organizer profile yet - still show the page with applications
        setChitGroups([]);
        setOrganizations([]);
      } else {
        toast.error("Failed to load your chit groups");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      organization_id: organizations.length === 1 ? organizations[0].id : "",
      name: "",
      chit_value: "",
      duration_months: "",
      member_capacity: "",
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await chitGroupsApi.create(form);
      if (res.data.success) {
        toast.success("Chit group created successfully!");
        setShowCreateModal(false);
        resetForm();
        fetchMyGroups();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create chit group");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (group) => {
    setEditingGroup(group);
    setForm({
      organization_id: group.organization_id,
      name: group.name,
      chit_value: group.chit_value,
      duration_months: group.duration_months,
      member_capacity: group.member_capacity,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await chitGroupsApi.update(editingGroup.id, {
        name: form.name,
        chit_value: form.chit_value,
        duration_months: form.duration_months,
        member_capacity: form.member_capacity,
        status: form.status || undefined,
      });
      if (res.data.success) {
        toast.success("Chit group updated successfully!");
        setShowEditModal(false);
        setEditingGroup(null);
        fetchMyGroups();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update chit group");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await chitGroupsApi.delete(id);
      if (res.data.success) {
        toast.success("Chit group deleted successfully!");
        setDeleteConfirm(null);
        fetchMyGroups();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete chit group");
    }
  };

  const activeTab = "groups"; // Can extend to tabs later

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-[450px] h-[450px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
      </div>
      
      <Navbar />
      <main className="container mx-auto px-4 py-24 pb-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary font-medium text-sm mb-2">
              Organizer Dashboard
            </span>
            <h1 className="font-heading font-bold text-2xl md:text-3xl text-foreground">
              My Chit Fund Groups
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your chit fund groups, track applications, and organize everything.
            </p>
          </div>
          {organizations.length > 0 && (
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-saffron text-saffron-foreground font-medium text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02] self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              Create New Group
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading your chit groups...</span>
          </div>
        ) : (
          <div className="space-y-8">
            {/* No data at all - guide the user */}
            {applications.length === 0 && chitGroups.length === 0 && organizations.length === 0 && (
              <div className="text-center py-16 bg-card rounded-2xl border border-border max-w-xl mx-auto">
                <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-foreground">No Applications Yet</h3>
                <p className="text-muted-foreground mt-1 mb-4">
                  You haven't applied as an organizer yet. Apply to start managing your own chit fund groups.
                </p>
                <a
                  href="/apply-organizer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-navy text-primary-foreground font-medium text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Apply as Organizer
                </a>
              </div>
            )}

            {/* Applications Status Section */}
            {applications.length > 0 && (
              <section>
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-secondary" />
                  Your Applications
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {applications.map((app) => {
                    const statusCfg = APP_STATUS_CONFIG[app.status] || APP_STATUS_CONFIG.PENDING;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div
                        key={app.id}
                        className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-card-foreground text-sm">
                            {app.company_name || "Unnamed Application"}
                          </h3>
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusCfg.label}
                          </span>
                        </div>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5" />
                            Type: <span className="font-medium text-foreground">{app.type}</span>
                          </div>
                          {app.proposed_chit_size && (
                            <div className="flex items-center gap-2">
                              <IndianRupee className="w-3.5 h-3.5" />
                              Proposed Size: ₹{Number(app.proposed_chit_size).toLocaleString("en-IN")}
                            </div>
                          )}
                          {app.target_area && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5" />
                              {app.target_area}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5" />
                            Applied: {new Date(app.created_at).toLocaleDateString("en-IN")}
                          </div>
                        </div>

                        {app.status === "REJECTED" && (
                          <div className="mt-3 p-2.5 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs text-red-600 font-medium">
                              Your application was rejected. You may re-apply with updated details.
                            </p>
                          </div>
                        )}
                        {(app.status === "APPROVED" || app.status === "APPROVED_LIMITED") && (
                          <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                            <p className="text-xs text-emerald-700 font-medium">
                              ✅ Approved! Your organization and chit group have been created.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Organizations Section */}
            {organizations.length > 0 && (
              <section>
                <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Your Organizations
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-card-foreground">{org.name}</h3>
                        {org.is_verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <ShieldCheck className="w-3 h-3" />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" />
                        {org.city}, {org.state}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Chit Groups Section */}
            <section>
              <h2 className="font-heading font-semibold text-lg text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                Your Chit Groups
              </h2>

              {chitGroups.length === 0 ? (
                <div className="text-center py-16 bg-card rounded-2xl border border-border max-w-xl mx-auto">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-foreground">No Chit Groups Yet</h3>
                  <p className="text-muted-foreground mt-1 mb-4">
                    {organizations.length > 0
                      ? "Create your first chit fund group to get started."
                      : "Your application needs to be approved before you can create groups."}
                  </p>
                  {organizations.length > 0 && (
                    <button
                      onClick={() => {
                        resetForm();
                        setShowCreateModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-navy text-primary-foreground font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Create Chit Group
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {chitGroups.map((group) => {
                    const statusCfg = STATUS_CONFIG[group.status] || STATUS_CONFIG.OPEN;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <div
                        key={group.id}
                        className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg transition-shadow group/card relative"
                      >
                        {/* Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(group)}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </button>
                          {group.status !== "IN_PROGRESS" && (
                            <button
                              onClick={() => setDeleteConfirm(group.id)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-500" />
                            </button>
                          )}
                        </div>

                        <div className="flex items-start justify-between mb-4 pr-16">
                          <h3 className="font-heading font-semibold text-lg text-card-foreground">
                            {group.name}
                          </h3>
                        </div>

                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mb-4 ${statusCfg.color}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {statusCfg.label}
                        </span>

                        <div className="space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-secondary" />
                            {group.organization?.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-secondary" />
                            {group.organization?.city}, {group.organization?.state}
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-accent" />
                            {group.current_members} / {group.member_capacity} Members
                          </div>
                          <div className="flex items-center gap-2">
                            <IndianRupee className="w-4 h-4 text-primary" />
                            ₹{Number(group.chit_value).toLocaleString("en-IN")}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {group.duration_months} months
                          </div>
                          {group.organization?.is_verified && (
                            <div className="flex items-center gap-2 text-green-600">
                              <ShieldCheck className="w-4 h-4" />
                              Verified
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-border text-xs text-muted-foreground">
                          Created: {new Date(group.created_at).toLocaleDateString("en-IN")}
                        </div>

                        {/* Delete confirmation */}
                        {deleteConfirm === group.id && (
                          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center p-6 z-10">
                            <Trash2 className="w-8 h-8 text-red-500 mb-3" />
                            <p className="text-sm font-medium text-foreground text-center mb-1">Delete this group?</p>
                            <p className="text-xs text-muted-foreground text-center mb-4">This action cannot be undone.</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setDeleteConfirm(null)}
                                className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleDelete(group.id)}
                                className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border animate-slide-down">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading font-bold text-lg text-foreground">Create Chit Group</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-lg hover:bg-muted">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Organization</label>
                {organizations.length === 1 ? (
                  <div className="w-full px-4 py-2.5 rounded-xl border border-input bg-muted text-sm text-foreground">
                    {organizations[0].name || organizations[0].id}
                  </div>
                ) : (
                  <select
                    value={form.organization_id}
                    onChange={(e) => setForm({ ...form, organization_id: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                  >
                    <option value="">Select organization</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>{org.name || org.id}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Group Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Gold Savings Chit"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Chit Value (₹)</label>
                  <input
                    type="number"
                    value={form.chit_value}
                    onChange={(e) => setForm({ ...form, chit_value: e.target.value })}
                    placeholder="e.g. 500000"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                    min="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration (months)</label>
                  <input
                    type="number"
                    value={form.duration_months}
                    onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                    placeholder="e.g. 20"
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                    min="1"
                    max="60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Member Capacity</label>
                <input
                  type="number"
                  value={form.member_capacity}
                  onChange={(e) => setForm({ ...form, member_capacity: e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  min="2"
                  max="100"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingGroup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border animate-slide-down">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="font-heading font-bold text-lg text-foreground">Edit Chit Group</h2>
              <button
                onClick={() => { setShowEditModal(false); setEditingGroup(null); }}
                className="p-2 rounded-lg hover:bg-muted"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Group Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Chit Value (₹)</label>
                  <input
                    type="number"
                    value={form.chit_value}
                    onChange={(e) => setForm({ ...form, chit_value: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                    min="1000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Duration (months)</label>
                  <input
                    type="number"
                    value={form.duration_months}
                    onChange={(e) => setForm({ ...form, duration_months: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    required
                    min="1"
                    max="60"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Member Capacity</label>
                <input
                  type="number"
                  value={form.member_capacity}
                  onChange={(e) => setForm({ ...form, member_capacity: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  required
                  min="2"
                  max="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Status</label>
                <select
                  value={form.status || editingGroup.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditModal(false); setEditingGroup(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
      <AuthModal />
    </div>
  );
};

export default MyChitFundGroup;
