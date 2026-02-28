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
import { T } from "@/context/LanguageContext";

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
      
      if (digits.length === 12) {
        const status = validateAadhaar(digits);
        setAadhaarStatus(status);
      } else {
        setAadhaarStatus("");
      }
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
      <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-3">
              <span className="text-primary">Complete Your </span>
              <span className="text-secondary">KYC</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto"><T>Instant verification powered by Government of India's DigiLocker</T></p>
          </div>

          <div className="grid md:grid-cols-[1fr,420px] gap-10 items-start">
            {/* Form Section */}
            <div className="bg-card border-2 border-border rounded-2xl p-8 shadow-lg order-2 md:order-1">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="aadhaarNumber" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"><T>Aadhaar Number</T></label>
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
                  {form.aadhaarNumber.replace(/\s/g, "").length === 12 && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${aadhaarStatus === "verified" ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800"}`}>
                      {aadhaarStatus === "verified" ? (
                        <>
                          <BadgeCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                            <T>Aadhaar Card Verified ✓</T>
                          </p>
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full border-2 border-red-500 flex items-center justify-center">
                            <span className="text-red-500 text-xs font-bold">✕</span>
                          </div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                            <T>Invalid Aadhaar Number</T>
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"><T>Full Name</T></label>
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
                  <label htmlFor="age" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"><T>Age</T></label>
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

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="state" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"><T>State</T></label>
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
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    >
                      <option value=""><T>Select</T></option>
                      {STATES.map((state) => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5 relative">
                    <label htmlFor="citySearch" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide"><T>City</T></label>
                    <input
                      id="citySearch"
                      name="citySearch"
                      type="text"
                      required
                      value={cityQuery}
                      onChange={(e) => {
                        if (!form.state) {
                          toast.error("Please select a state first");
                          return;
                        }
                        setCityQuery(e.target.value);
                        setForm((prev) => ({ ...prev, city: "" }));
                        setShowCityOptions(true);
                      }}
                      onFocus={(e) => {
                        if (!form.state) {
                          toast.error("Please select a state first");
                          e.target.blur();
                        } else {
                          setShowCityOptions(true);
                        }
                      }}
                      onBlur={() => setTimeout(() => setShowCityOptions(false), 200)}
                      className="flex h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all disabled:opacity-50"
                      placeholder={form.state ? "Search" : "Select state first"}
                    />
                    {showCityOptions && form.state && filteredCities.length > 0 && (
                      <div className="absolute z-20 mt-1 w-full max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-xl">
                        {filteredCities.map((city) => (
                          <button
                            key={city}
                            type="button"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, city }));
                              setCityQuery(city);
                              setShowCityOptions(false);
                            }}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
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
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-primary to-primary/90 text-white font-semibold hover:from-primary/90 hover:to-primary hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none mt-6"
                >
                  <T>Verify & Continue</T>
                </button>
              </form>
            </div>

            {/* Info Sidebar */}
            <div className="space-y-6 order-1 md:order-2">
              {/* DigiLocker Badge */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                <div className="flex flex-col items-center text-center mb-4">
                  <img
                    src="https://digilocker.gov.in/assets/img/digilocker_logo.png"
                    alt="DigiLocker"
                    className="w-48 h-48 object-contain mb-3"
                  />
                  <h3 className="font-heading font-bold text-xl text-blue-900 dark:text-blue-100 mb-1"><T>DigiLocker Verified</T></h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300 font-medium"><T>Government of India</T></p>
                </div>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed text-center"><T>Your documents are securely verified through India's official digital locker system</T></p>
              </div>

              {/* Security Features */}
              <div className="bg-card border-2 border-border rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2 text-primary">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-secondary" />
                  </div>
                  <T>Secured Verification</T>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground"><T>256-bit encrypted data transmission</T></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground"><T>Instant verification in seconds</T></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground"><T>No data stored on our servers</T></p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-secondary" />
                    </div>
                    <p className="text-sm text-muted-foreground"><T>Compliant with IT Act 2000</T></p>
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
            <T>Verifying your Aadhaar details securely...</T>
          </p>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 z-[90] bg-background/95 flex flex-col items-center justify-center px-4">
          <CircleCheckBig className="w-16 h-16 text-green-600 animate-pulse" />
          <p className="mt-4 text-lg font-semibold text-foreground"><T>KYC Verified Successfully</T></p>
        </div>
      )}
    </div>
  );
}
