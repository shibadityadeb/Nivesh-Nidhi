import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, CircleCheckBig } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/context/AuthContext";
import { kyc } from "@/lib/api";
import { validateAadhaar } from "@/lib/validateAadhaar";

const initialForm = {
  aadhaarNumber: "",
  name: "",
  age: "",
  address: "",
};

export default function Kyc() {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateUser } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [aadhaarStatus, setAadhaarStatus] = useState("");

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
    const nextValue = name === "aadhaarNumber" ? value.replace(/[^\d\s]/g, "").slice(0, 14) : value;

    setForm((prev) => ({
      ...prev,
      [name]: nextValue,
    }));

    if (name === "aadhaarNumber") {
      const status = validateAadhaar(nextValue);
      setAadhaarStatus(status);
    }
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
        aadhaarNumber: form.aadhaarNumber.trim(),
        name: form.name.trim(),
        age: Number(form.age),
        address: form.address.trim(),
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

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-40 right-40 w-[500px] h-[500px] bg-gradient-to-br from-accent/12 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-40 left-40 w-[450px] h-[450px] bg-gradient-to-tr from-primary/10 to-transparent rounded-full blur-3xl" />
      </div>
      <Navbar />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="max-w-xl mx-auto bg-card border border-border rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl bg-secondary/15 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Complete Your KYC</h1>
              <p className="text-sm text-muted-foreground">Secure Aadhaar verification is required to continue.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="aadhaarNumber" className="text-sm font-semibold">Aadhaar Number</label>
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
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="12-digit Aadhaar number"
              />
              {form.aadhaarNumber.length > 0 && (
                <p className={`text-xs ${aadhaarStatus === "verified" ? "text-green-600" : "text-destructive"}`}>
                  {aadhaarStatus === "verified" ? "Aadhaar status: verified" : "Aadhaar status: not verified"}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-semibold">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                minLength={3}
                required
                value={form.name}
                onChange={handleChange}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="age" className="text-sm font-semibold">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min={18}
                required
                value={form.age}
                onChange={handleChange}
                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter your age"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="address" className="text-sm font-semibold">Address</label>
              <textarea
                id="address"
                name="address"
                minLength={10}
                required
                value={form.address}
                onChange={handleChange}
                className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Enter your complete address"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isSuccess}
              className="w-full h-12 rounded-md bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Submit for Verification
            </button>
          </form>
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
