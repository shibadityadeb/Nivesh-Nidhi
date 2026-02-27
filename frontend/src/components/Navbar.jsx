import { useState, useRef } from "react";
import { ChevronDown, Menu, X, LogIn, User, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { user as userApi } from "@/lib/api";



const navItems = [
  {
    label: "CHITS",
    submenu: [
      { label: "The Chit Process – How It Works", href: "/chit-process" },
      { label: "Security Norms / How To Draw Prize Money", href: "#" },
      { label: "Benefits Of Chits", href: "#" },
      { label: "Documents Required For Chits", href: "#" },
      { label: "Eligibility Criteria", href: "#" },
    ],
  },
  {
    label: "CHIT GROUP",
    submenu: [
      { label: "New Chits Available", href: "/chit-groups" },
      { label: "Ongoing Chits Available", href: "/chit-groups" },
      { label: "Planning Amount", href: "#" },
      { label: "My Chits", href: "#" },
      { label: "Bid Offer Submission", href: "#" },
      { label: "Join Live Auction", href: "#" },
    ],
  },
  {
    label: "SOLUTIONS",
    submenu: [
      { label: "Goal Based Solution", href: "#solutions-goal-based" },
      { label: "Personalised Solution", href: "#solutions-personalised" },
    ],
  },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const { user, logoutUser, setShowAuthModal, updateUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);

  const handleMouseEnter = (label) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setActiveMenu(null), 200);
  };

  const handleProfileClick = async () => {
    if (!user || profileLoading) return;

    setProfileLoading(true);

    try {
      const { data } = await userApi.getMe();
      const latestUser = data?.data?.user;

      if (latestUser) {
        updateUser(latestUser);
        setActiveMenu((prev) => (prev === "profile" ? null : "profile"));
      }
    } catch {
      setActiveMenu((prev) => (prev === "profile" ? null : "profile"));
    } finally {
      setProfileLoading(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 w-full">
      <div className="h-1 gradient-tricolor" />

      <div className="py-3">
        <div className="container mx-auto px-4">
          <div className="gradient-subtle rounded-2xl shadow-lg px-6 py-3 flex items-center justify-between border border-border/50">
            {/* Logo */}
            <a href="/">
              <img src="/NiveshNidhi Logo.png" alt="Nivesh Nidhi" className="h-12 object-contain" />
            </a>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="/" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors relative pb-1">
                HOME
                {location.pathname === '/' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
              </a>
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${activeMenu === item.label ? "text-primary" : "text-foreground hover:text-primary"}`}>
                    {item.label}
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === item.label ? "rotate-180" : ""}`} />
                  </button>

                  {activeMenu === item.label && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl shadow-xl border border-border p-2 animate-slide-down">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub.label}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                        >
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <a
                href="/gov-schemes"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative pb-1"
              >
                GOVT. SCHEMES
                {location.pathname === '/gov-schemes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
              </a>
            </div>

            {/* Sign In & Profile */}
            <div className="flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="hidden sm:flex flex-col items-end mr-1">
                      <span className="text-sm font-bold leading-none">{user.name?.split(' ')[0]}</span>
                      <span className="text-xs text-muted-foreground">
                        {user.role}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleProfileClick}
                      disabled={profileLoading}
                      className={`hidden sm:flex w-10 h-10 rounded-full bg-secondary/10 items-center justify-center border border-secondary/30 transition-colors ${profileLoading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <User className="w-5 h-5 text-secondary" />
                    </button>
                  </div>

                  {activeMenu === 'profile' && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border p-2 animate-slide-down">
                      {user.role === "ADMIN" && (
                        <a href="/admin" className="block px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mb-1">
                          Admin Dashboard
                        </a>
                      )}
                      {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                        <a href="/my-chit-group" className="block px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mb-1">
                          My Chit Group
                        </a>
                      )}
                      <a href="/joined-groups" className="block px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1">
                        Joined Groups
                      </a>
                      <a href="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1">
                        My Dashboard
                      </a>
                      {user.isKycVerified ? (
                        <div className="block px-4 py-2.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg mb-1">
                          KYC Verified
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            navigate("/kyc");
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1"
                        >
                          Complete KYC
                        </button>
                      )}
                      <button
                        onClick={logoutUser}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4 rotate-180" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-lg gradient-saffron text-saffron-foreground font-medium text-sm shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden mt-3">
              <div className="gradient-subtle rounded-2xl shadow-lg p-4 space-y-2 border border-border/50">
                <a href="/" className="block px-4 py-3 font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors">
                  Home
                </a>
                {navItems.map((item) => (
                  <MobileNavItem key={item.label} item={item} />
                ))}
                <a href="/gov-schemes" className="block px-4 py-3 font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors">
                  GOVT. SCHEMES
                </a>
                {user ? (
                  <>
                    {user.role === "ADMIN" && (
                      <a
                        href="/admin"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-amber-500 text-amber-600 font-medium text-sm"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        Admin Dashboard
                      </a>
                    )}
                    {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                      <a
                        href="/my-chit-group"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-indigo-500 text-indigo-600 font-medium text-sm"
                      >
                        My Chit Group
                      </a>
                    )}
                    <a
                      href="/joined-groups"
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-input text-foreground font-medium text-sm"
                    >
                      <Users className="w-4 h-4" />
                      Joined Groups
                    </a>
                    <button
                      onClick={logoutUser}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-input text-foreground font-medium text-sm"
                    >
                      <User className="w-4 h-4" />
                      Logout ({user.name?.split(' ')[0]})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg gradient-saffron text-saffron-foreground font-medium text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Sign In / Sign Up
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const MobileNavItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
      >
        {item.label}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 space-y-1 animate-slide-down">
          {item.submenu.map((sub) => (
            <a
              key={sub.label}
              href={sub.href}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
