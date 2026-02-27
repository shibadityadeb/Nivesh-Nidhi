import { useEffect, useState, useRef } from "react";
import { ChevronDown, Menu, X, LogIn, User, ShieldAlert, Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { user as userApi } from "@/lib/api";
import LanguageSelector from "@/components/LanguageSelector";
import { T } from "@/context/LanguageContext";
import { startAppTutorial } from "@/utils/tutorial";



const navItems = [
  {
    label: "CHITS",
    submenu: [
      { label: "The Chit Process – How It Works", href: "/chit-process" },
      { label: "Security Norms / How To Draw Prize Money", href: "/security-norms" },
      { label: "Benefits Of Chits", href: "/benefits-of-chits" },
      { label: "Documents Required For Chits", href: "/documents-required" },
      { label: "Eligibility Criteria", href: "/eligibility-criteria" },
    ],
  },
  {
    label: "CHIT GROUP",
    buttonId: "auctionBtnMobile",
    submenu: [
      { label: "New Chits Available", href: "/chit-groups", id: "exploreChitsBtnMobile" },
      { label: "Ongoing Chits Available", href: "/chit-groups" },
      { label: "Planning Amount", href: "#" },
      { label: "My Chits", href: "#" },
      { label: "Bid Offer Submission", href: "#" },
      { label: "Join Live Auction", href: "/chit-groups", id: "auctionBtn" },
    ],
  },
  {
    label: "SOLUTIONS",
    submenu: [
      { label: "Goal Based Solution", href: "/solutions-goal-based" },
      { label: "Personalised Solution", href: "/solutions-personalized" },
    ],
  },
];

// Helper to render translated label
const TLabel = ({ text }) => <T>{text}</T>;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [markAllLoading, setMarkAllLoading] = useState(false);
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

  const handleProfileClick = () => {
    setActiveMenu((prev) => (prev === "profile" ? null : "profile"));
  };

  const fetchNotifications = async ({ silent = false } = {}) => {
    if (!user) return;
    if (!silent) setNotificationsLoading(true);
    try {
      const { data } = await userApi.getNotifications();
      if (data?.success) {
        setNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      if (!silent) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } finally {
      if (!silent) setNotificationsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications({ silent: true });
    const timer = setInterval(() => fetchNotifications({ silent: true }), 30000);
    return () => clearInterval(timer);
  }, [user?.id]);

  const handleNotificationBell = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    const shouldOpen = activeMenu !== "notifications";
    setActiveMenu(shouldOpen ? "notifications" : null);
    if (shouldOpen) {
      await fetchNotifications();
    }
  };

  const handleMarkAllRead = async () => {
    if (!user || markAllLoading) return;
    setMarkAllLoading(true);
    try {
      await userApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } finally {
      setMarkAllLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.id) return;
    if (!notification.is_read) {
      try {
        await userApi.markNotificationRead(notification.id);
        setNotifications((prev) =>
          prev.map((item) =>
            item.id === notification.id ? { ...item, is_read: true } : item
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch {
        // keep UX non-blocking
      }
    }
    if (notification.chit_group?.id) {
      setActiveMenu(null);
      navigate(`/chit-groups/${notification.chit_group.id}`);
    }
  };

  const handleRestartTutorial = () => {
    localStorage.removeItem("hasSeenTutorial");
    setActiveMenu(null);
    setMobileOpen(false);
    setTimeout(() => {
      startAppTutorial();
      localStorage.setItem("hasSeenTutorial", "true");
    }, 150);
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
                <T>HOME</T>
                {location.pathname === '/' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
              </a>
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    id={item.label === "CHIT GROUP" ? "auctionBtn" : undefined}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors ${activeMenu === item.label ? "text-primary" : "text-foreground hover:text-primary"}`}
                  >
                    <T>{item.label}</T>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${activeMenu === item.label ? "rotate-180" : ""}`} />
                  </button>

                  {activeMenu === item.label && (
                    <div className="absolute top-full left-0 mt-2 w-72 bg-card rounded-xl shadow-xl border border-border p-2 animate-slide-down">
                      {item.submenu.map((sub) => (
                        <a
                          key={sub.label}
                          id={sub.id}
                          href={sub.href}
                          className="block px-4 py-2.5 text-sm text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors"
                        >
                          <T>{sub.label}</T>
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
                <T>GOVT. SCHEMES</T>
                {location.pathname === '/gov-schemes' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary" />}
              </a>
            </div>

            {/* Sign In & Profile */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  id="bellBtn"
                  type="button"
                  onClick={handleNotificationBell}
                  className="relative w-10 h-10 rounded-full bg-primary/10 items-center justify-center border border-primary/20 transition-colors hover:bg-primary/15 flex"
                >
                  <Bell className="w-5 h-5 text-primary" />
                  {user && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {activeMenu === "notifications" && user && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-card rounded-xl shadow-xl border border-border p-2 animate-slide-down">
                    <div className="flex items-center justify-between px-2 py-1.5">
                      <p className="text-sm font-semibold text-card-foreground">Notifications</p>
                      <button
                        type="button"
                        disabled={markAllLoading || unreadCount === 0}
                        onClick={handleMarkAllRead}
                        className="text-xs text-primary disabled:text-muted-foreground"
                      >
                        {markAllLoading ? "Marking..." : "Mark all read"}
                      </button>
                    </div>

                    {notificationsLoading ? (
                      <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-8 text-sm text-muted-foreground text-center">
                        No notifications yet
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto space-y-1">
                        {notifications.map((notif) => (
                          <button
                            key={notif.id}
                            type="button"
                            onClick={() => handleNotificationClick(notif)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                              notif.is_read
                                ? "border-transparent hover:bg-muted"
                                : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                            }`}
                          >
                            <p className="text-sm font-medium text-card-foreground line-clamp-1">{notif.title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.message}</p>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-[11px] text-muted-foreground">
                                {notif.chit_group?.name || "Group update"}
                              </span>
                              <span className="text-[11px] text-muted-foreground">
                                {notif.created_at ? new Date(notif.created_at).toLocaleString("en-IN") : ""}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

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
                      id="profileBtn"
                      className="hidden sm:flex w-10 h-10 rounded-full bg-secondary/10 items-center justify-center border border-secondary/30 transition-colors"
                    >
                      <User className="w-5 h-5 text-secondary" />
                    </button>
                  </div>

                  {activeMenu === 'profile' && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-card rounded-xl shadow-xl border border-border p-2 animate-slide-down">
                      {user.role === "ADMIN" && (
                        <a href="/admin" className="block px-4 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mb-1">
                          <T>Admin Dashboard</T>
                        </a>
                      )}
                      {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                        <a id="createChitBtn" href="/my-chit-group" className="block px-4 py-2.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors mb-1">
                          <T>My Chit Group</T>
                        </a>
                      )}
                      <a href="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1">
                        <T>My Dashboard</T>
                      </a>
                      {user.isKycVerified ? (
                        <div className="block px-4 py-2.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg mb-1">
                          <T>KYC Verified</T>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveMenu(null);
                            navigate("/kyc");
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1"
                        >
                          <T>Complete KYC</T>
                        </button>
                      )}
                      <button
                        onClick={handleRestartTutorial}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted hover:text-primary rounded-lg transition-colors mb-1"
                      >
                        <T>Restart Tutorial</T>
                      </button>
                      <button
                        onClick={logoutUser}
                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogIn className="w-4 h-4 rotate-180" />
                        <T>Sign Out</T>
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
                  <T>Sign In</T>
                </button>
              )}
              <LanguageSelector />
              <button
                id="profileBtnMobile"
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
                  <T>Home</T>
                </a>
                {navItems.map((item) => (
                  <MobileNavItem key={item.label} item={item} />
                ))}
                <a href="/gov-schemes" className="block px-4 py-3 font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors">
                  <T>GOVT. SCHEMES</T>
                </a>
                {user ? (
                  <>
                    {user.role === "ADMIN" && (
                      <a
                        href="/admin"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-amber-500 text-amber-600 font-medium text-sm"
                      >
                        <ShieldAlert className="w-4 h-4" />
                        <T>Admin Dashboard</T>
                      </a>
                    )}
                    {(user.role === "ORGANIZER" || user.role === "ADMIN") && (
                      <a
                        id="createChitBtnMobile"
                        href="/my-chit-group"
                        className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-indigo-500 text-indigo-600 font-medium text-sm"
                      >
                        <T>My Chit Group</T>
                      </a>
                    )}
                    <a
                      href="/dashboard"
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-input text-foreground font-medium text-sm hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4" />
                      <T>My Dashboard</T>
                    </a>
                    <button
                      onClick={handleRestartTutorial}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-input text-foreground font-medium text-sm"
                    >
                      <T>Restart Tutorial</T>
                    </button>
                    <button
                      onClick={logoutUser}
                      className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-input text-foreground font-medium text-sm"
                    >
                      <User className="w-4 h-4" />
                      <T>Logout</T> ({user.name?.split(' ')[0]})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full mt-2 flex items-center justify-center gap-2 px-5 py-3 rounded-lg gradient-saffron text-saffron-foreground font-medium text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <T>Sign In / Sign Up</T>
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
        id={item.buttonId}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 font-medium text-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
      >
        <T>{item.label}</T>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="ml-4 space-y-1 animate-slide-down">
          {item.submenu.map((sub) => (
            <a
              key={sub.label}
              id={sub.id}
              href={sub.href}
              className="block px-4 py-2 text-sm text-muted-foreground hover:text-primary rounded-lg hover:bg-muted transition-colors"
            >
              <T>{sub.label}</T>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default Navbar;
