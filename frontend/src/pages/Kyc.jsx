import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, CircleCheckBig, Lock, CheckCircle2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { kyc, locations } from "@/lib/api";
import { validateAadhaar } from "@/lib/validateAadhaar";
import { STATES } from "@/constants/indiaLocations";

const initialForm = {
  aadhaarNumber: "",
  name: "",
  age: "",
  state: "",
  city: "",
};

export default function Kyc() {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState("");

  const [stateQuery, setStateQuery] = useState("");
  const [showStateOptions, setShowStateOptions] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [showCityOptions, setShowCityOptions] = useState(false);

  const [cityOptions, setCityOptions] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user?.isKycVerified) {
      navigate("/chit-groups");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (!form.state) {
      setCityOptions([]);
      setForm((prev) => ({ ...prev, city: "" }));
      setCityQuery("");
      return;
    }

    let cancelled = false;
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const res = await locations.getCities(form.state);
        const cities = res.data?.data?.cities || res.data?.cities || [];
        if (!cancelled) {
          setCityOptions(cities);
        }
      } catch (error) {
        if (!cancelled) setCityOptions([]);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    };

    fetchCities();

    return () => {
      cancelled = true;
    };
  }, [form.state]);

  useEffect(() => {
    if (isSubmitting || isSuccess) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }

    document.body.style.overflow = "";
    return undefined;
  }, [isSubmitting, isSuccess]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let nextValue = value;

    if (name === "aadhaarNumber") {
      const digits = value.replace(/\D/g, "");
      nextValue = digits
        .slice(0, 12)
        .replace(/(\d{4})(?=\d)/g, "$1 ")
        .trim();
      const status = validateAadhaar(digits);
      setAadhaarStatus(status);
    }

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || isSuccess) return;

    setIsSubmitting(true);

    try {
      const status = validateAadhaar(form.aadhaarNumber);
      if (status !== "verified") {
        setIsSubmitting(false);
        setAadhaarStatus("not verified");
        toast.error("Please enter a valid Aadhaar number");
        return;
      }

      const payload = {
        aadhaarNumber: form.aadhaarNumber.replace(/\s/g, ""),
        name: form.name.trim(),
        age: Number(form.age),
        state: form.state,
        city: form.city,
      };

      const response = await kyc.verify(payload);
      const updatedUser = response?.data?.data?.user;

      if (updatedUser) {
        updateUser(updatedUser);
      }

      setIsSubmitting(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate("/chit-groups");
      }, 1400);
    } catch (error) {
      setIsSubmitting(false);
      const message = error?.response?.data?.message || "KYC verification failed";
      toast.error(message);
    }
  };

  if (!isAuthenticated) return null;

  const filteredStates = STATES.filter((s) =>
    s.toLowerCase().includes(stateQuery.toLowerCase())
  );

  const filteredCities = cityOptions.filter((city) =>
    city.toLowerCase().includes(cityQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-accent/12 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-40 w-[450px] h-[450px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 mb-4">
              <ShieldCheck className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">Complete Your KYC</h1>
            <p className="text-muted-foreground">Secure and instant verification powered by Government of India</p>
          </div>

          <div className="grid md:grid-cols-[1fr,380px] gap-8 items-start">
            {/* Form Section */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm order-2 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="aadhaarNumber" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aadhaar Number</label>
                  <input
                    id="aadhaarNumber"
                    name="aadhaarNumber"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9\s]{12,14}"
                    minLength={12}
                    maxLength={14}
                    required
                    value={form.aadhaarNumber}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    placeholder="XXXX XXXX XXXX"
                  />
                  {form.aadhaarNumber.length > 0 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${aadhaarStatus === "verified" ? "bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800" : "bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"}`}>
                      {aadhaarStatus === "verified" ? (
                        <BadgeCheck className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
                      )}
                      <p className={`text-xs font-medium ${aadhaarStatus === "verified" ? "text-orange-700 dark:text-orange-300" : "text-amber-700 dark:text-amber-300"}`}>
                        {aadhaarStatus === "verified" ? "Aadhaar Verified Successfully" : "Enter valid 12-digit Aadhaar"}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    minLength={3}
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    placeholder="As per Aadhaar card"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="age" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Age</label>
                  <input
                    id="age"
                    name="age"
                    type="number"
                    min={18}
                    required
                    value={form.age}
                    onChange={handleChange}
                    className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    placeholder="18+"
                  />
                </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-semibold">State</label>
                <select
                  id="state"
                  name="state"
                  required
                  value={form.state}
                  onChange={(e) => {
                    const nextState = e.target.value;
                    setForm((prev) => ({ ...prev, state: nextState, city: "" }));
                    setCityQuery("");
                    setShowCityOptions(false);
                  }}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select state</option>
                  {STATES.map((state) => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 relative">
                <label htmlFor="citySearch" className="text-sm font-semibold">City</label>
                <input
                  id="citySearch"
                  name="citySearch"
                  type="text"
                  required
                  disabled={!form.state}
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setForm((prev) => ({ ...prev, city: "" }));
                    setShowCityOptions(true);
                  }}
                  onFocus={() => setShowCityOptions(true)}
                  onBlur={() => setTimeout(() => setShowCityOptions(false), 120)}
                  className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                  placeholder={form.state ? "Search city" : "Select state first"}
                />
                {showCityOptions && form.state && filteredCities.length > 0 && (
                  <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-md border border-border bg-card shadow-lg">
                    {filteredCities.map((city) => (
                      <button
                        key={city}
                        type="button"
                        onClick={() => {
                          setForm((prev) => ({ ...prev, city }));
                          setCityQuery(city);
                          setShowCityOptions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

                <button
                  type="submit"
                  disabled={isSubmitting || isSuccess || !form.state || !form.city}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold hover:from-orange-600 hover:to-orange-700 hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-6"
                >
                  Verify & Continue
                </button>
              </form>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-4 order-1 md:order-2">
              {/* DigiLocker Badge */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                    <img 
                      src="https://digilocker.gov.in/assets/img/digilocker_logo.png" 
                      alt="DigiLocker" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900 dark:text-blue-100">DigiLocker</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Government of India</p>
                  </div>
                </div>
                <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">Your documents are securely verified through India's official digital locker system</p>
              </div>

              {/* Security Features */}
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-orange-600" />
                  Secured Verification
                </h3>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">256-bit encrypted data transmission</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">Instant verification in seconds</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">No data stored on our servers</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-muted-foreground">Compliant with IT Act 2000</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <AuthModal />

      {isSubmitting && (
        <div className="fixed inset-0 z-[80] bg-background/95 flex flex-col items-center justify-center px-4">
          <Loader2 className="w-12 h-12 text-secondary animate-spin" />
          <p className="mt-5 text-base text-foreground font-medium text-center">
            Verifying your Aadhaar details securely...
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 z-[90] bg-background/95 flex flex-col items-center justify-center px-4">
          <CircleCheckBig className="w-16 h-16 text-green-600 animate-pulse" />
          <p className="mt-4 text-lg font-semibold text-foreground">KYC Verified Successfully</p>
        </div>
      )}
    </div>
  );
}
