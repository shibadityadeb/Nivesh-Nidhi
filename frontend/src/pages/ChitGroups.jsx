import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { chitGroups as chitGroupsApi } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, Users, Calendar, IndianRupee, ShieldCheck, Loader2 } from "lucide-react";

const ChitGroups = () => {
  const [chitGroups, setChitGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChitGroups();
  }, []);

  const fetchChitGroups = async () => {
    setLoading(true);
    try {
      const res = await chitGroupsApi.getAll();
      if (res.data.success) {
        setChitGroups(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to load chit groups");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-accent/12 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-40 w-[450px] h-[450px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 py-12 pt-24">
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-4">
            Browse Groups
          </span>
          <h1 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-3">
            Chit Fund Groups Near You
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Discover registered and verified chit fund groups operating in your area.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading chit groups...</span>
          </div>
        ) : chitGroups.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-xl mx-auto shadow-sm">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground">No Chit Groups Available Yet</h3>
            <p className="text-muted-foreground mt-1">
              Check back later — approved organizers will list their chit funds here.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {chitGroups.map((group) => (
              <div
                key={group.id}
                className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-heading font-semibold text-xl text-card-foreground group-hover:text-primary transition-colors">
                    {group.name}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${group.status === "OPEN" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                    {group.status === "OPEN" ? "Open" : group.status === "IN_PROGRESS" ? "Ongoing" : group.status}
                  </span>
                </div>

                <div className="space-y-3 text-sm text-muted-foreground flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/10 rounded-lg"><MapPin className="w-4 h-4 text-secondary" /></div>
                    <span className="font-medium">{group.organization?.city}, {group.organization?.state}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/10 rounded-lg"><Users className="w-4 h-4 text-accent" /></div>
                    <span className="font-medium">{group.current_members} / {group.member_capacity} Members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg"><IndianRupee className="w-4 h-4 text-primary" /></div>
                    <span className="font-medium">Total: ₹{Number(group.chit_value).toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg"><Calendar className="w-4 h-4 text-gray-600" /></div>
                    <span className="font-medium">{group.duration_months} months</span>
                  </div>
                  {group.organization?.is_verified && (
                    <div className="flex items-center gap-2 mt-4 text-green-600 bg-green-50 p-2 rounded-lg text-xs font-semibold border border-green-100">
                      <ShieldCheck className="w-4 h-4" />
                      Verified Organization
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Organized by</p>
                    <p className="text-sm font-semibold text-foreground">{group.organization?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground mb-1">Monthly EMI</p>
                    <p className="text-sm font-bold text-primary">₹{(Number(group.chit_value) / group.duration_months).toLocaleString("en-IN")}</p>
                  </div>
                </div>

                <Link
                  to={`/chit-groups/${group.id}`}
                  className="w-full py-3 rounded-xl font-semibold text-sm transition-colors shadow-sm text-center bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <AuthModal />
    </div>
  );
};

export default ChitGroups;
