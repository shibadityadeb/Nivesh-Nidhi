import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { chitGroups as chitGroupsApi } from "@/lib/api";
import { toast } from "sonner";
import { MapPin, Users, Calendar, IndianRupee, ShieldCheck, Loader2, Filter } from "lucide-react";
import { T } from "@/context/LanguageContext";

const ChitGroups = () => {
  const [chitGroups, setChitGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState("");

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
      <main className="container mx-auto px-4 py-12 pt-32 relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">
            <span className="text-primary">Chit Fund Groups </span>
            <span className="text-secondary">Near You</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            <T>Discover registered and verified chit fund groups operating in your area.</T>
          </p>
        </div>

        {/* Location Filter */}
        {!loading && chitGroups.length > 0 && (
          <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{chitGroups.filter(group => !locationFilter || `${group.organization?.city}, ${group.organization?.state}` === locationFilter).length}</span> groups available
            </p>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl border-2 border-border bg-card text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary min-w-[220px] transition-all"
              >
                <option value="">All Locations</option>
                {[...new Set(chitGroups.map(g => `${g.organization?.city}, ${g.organization?.state}`))]
                  .filter(Boolean)
                  .sort()
                  .map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
              </select>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground"><T>Loading chit groups...</T></span>
          </div>
        ) : chitGroups.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-2xl border border-border max-w-xl mx-auto shadow-sm">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-foreground"><T>No Chit Groups Available Yet</T></h3>
            <p className="text-muted-foreground mt-1">
              <T>Check back later — approved organizers will list their chit funds here.</T>
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {chitGroups
              .filter(group => !locationFilter || `${group.organization?.city}, ${group.organization?.state}` === locationFilter)
              .map((group) => (
              <div
                key={group.id}
                className="bg-card border-2 border-border rounded-2xl p-6 shadow-md hover:shadow-xl hover:border-secondary/50 transition-all duration-300 group flex flex-col"
              >
                <div className="mb-5">
                  <div className="flex items-center justify-end mb-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${group.status === "OPEN" ? "bg-green-100 text-green-700 border border-green-200" : "bg-amber-100 text-amber-700 border border-amber-200"}`}>
                      {group.status === "OPEN" ? "Open" : group.status === "IN_PROGRESS" ? "Ongoing" : group.status}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-lg text-primary group-hover:text-secondary transition-colors leading-tight">
                    {group.name}
                  </h3>
                </div>

                <div className="space-y-3.5 text-sm flex-grow mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-secondary" />
                    </div>
                    <span className="font-semibold text-foreground">{group.organization?.city}, {group.organization?.state}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4 text-accent" />
                    </div>
                    <span className="font-medium text-muted-foreground">{group.current_members} / {group.member_capacity} Members</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <IndianRupee className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Total Value</p>
                      <p className="font-bold text-foreground">₹{Number(group.chit_value).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="font-medium text-muted-foreground">{group.duration_months} months duration</span>
                  </div>
                </div>

                {group.organization?.is_verified && (
                  <div className="flex items-center gap-2 mb-5 text-green-600 bg-green-50 px-3 py-2 rounded-xl text-xs font-bold border border-green-200">
                    <ShieldCheck className="w-4 h-4" />
                    <T>Verified Organization</T>
                  </div>
                )}

                <div className="bg-gradient-to-br from-muted/50 to-muted/30 rounded-xl p-4 mb-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1"><T>Organized by</T></p>
                      <p className="text-sm font-bold text-foreground">{group.organization?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1"><T>Monthly</T></p>
                      <p className="text-lg font-bold text-secondary">₹{(Number(group.chit_value) / group.duration_months).toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/chit-groups/${group.id}`}
                  className="w-full py-3 rounded-xl font-bold text-sm transition-all text-center bg-gradient-to-r from-primary to-primary/90 text-white hover:from-primary/90 hover:to-primary hover:shadow-lg"
                >
                  <T>View Details →</T>
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
