import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { organizers } from "@/lib/api";
import { toast } from "sonner";
import {
    ArrowRight,
    ArrowLeft,
    Building,
    CheckCircle,
    FileText,
    MapPin,
    Briefcase,
    AlertCircle,
    Shield
} from "lucide-react";
import { T } from "@/context/LanguageContext";

export default function ApplyOrganizer() {
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect if not logged in
    useEffect(() => {
        if (!isAuthenticated) {
            toast.error("Please login to apply as an organizer.");
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) return null;

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        type: "NEW", // NEW | EXISTING | MIGRATING
        company_name: "",
        legal_structure: "Proprietorship",
        gst_number: "",
        chit_license_number: "",
        license_issuing_auth: "",
        years_of_operation: "",
        date_of_birth: "",
        age: "",
        marital_status: "",
        occupation: "",
        company_or_business_name: "",
        years_of_experience: "",
        monthly_income_range: "",
        primary_income_source: "",
        reason_for_opening_fund: "",
        expected_members_count: "",
        target_monthly_contribution: "",
        city: "",
        state: "",
        pincode: "",
        proposed_chit_size: "",
        past_3_yr_turnover: "",
        existing_group_count: "",
        total_active_members: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        if (!formData.date_of_birth) {
            setFormData((prev) => ({ ...prev, age: "" }));
            return;
        }

        const dob = new Date(formData.date_of_birth);
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const monthDiff = now.getMonth() - dob.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
            age -= 1;
        }

        setFormData((prev) => ({ ...prev, age: age >= 0 ? String(age) : "" }));
    }, [formData.date_of_birth]);

    const needsBusinessName = formData.occupation === "Business Owner" || formData.occupation === "Self-Employed";
    const isStudent = formData.occupation === "Student";

    const validateExtendedDetails = () => {
        const age = Number(formData.age);
        const experience = Number(formData.years_of_experience);
        const reasonLength = formData.reason_for_opening_fund.trim().length;

        if (!Number.isFinite(age) || age < 21) return "Age must be at least 21.";
        if (!formData.occupation) return "Occupation is required.";
        if (!formData.monthly_income_range) return "Monthly income range is required.";
        if (!formData.primary_income_source.trim()) return "Primary income source is required.";
        if (reasonLength < 50) return "Reason for opening this fund must be at least 50 characters.";
        if (!Number(formData.expected_members_count) || Number(formData.expected_members_count) < 1) {
            return "Expected members count must be at least 1.";
        }
        if (!Number(formData.target_monthly_contribution) || Number(formData.target_monthly_contribution) < 1) {
            return "Target monthly contribution must be greater than 0.";
        }
        if (!isStudent && (!Number.isFinite(experience) || experience < 1)) {
            return "Years of experience must be at least 1 for non-students.";
        }
        if (needsBusinessName && !formData.company_or_business_name.trim()) {
            return "Company/Business Name is required for selected occupation.";
        }
        return null;
    };

    const prevStep = () => setStep((s) => Math.max(s - 1, 1));
    const handleNextOrSubmit = async (e) => {
        e.preventDefault();

        // If not on the final step, just advance. HTML5 validation has already passed for visible fields.
        if (step < 4) {
            setStep((s) => Math.min(s + 1, 4));
            return;
        }

        // Final step: do actual submission
        const validationError = validateExtendedDetails();
        if (validationError) {
            toast.error(validationError);
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                personalInfo: {
                    dateOfBirth: formData.date_of_birth,
                    age: Number(formData.age),
                    maritalStatus: formData.marital_status || null,
                },
                professionalInfo: {
                    occupation: formData.occupation,
                    companyOrBusinessName: needsBusinessName ? formData.company_or_business_name : null,
                    yearsOfExperience: isStudent ? 0 : Number(formData.years_of_experience),
                },
                incomeInfo: {
                    monthlyIncomeRange: formData.monthly_income_range,
                    primaryIncomeSource: formData.primary_income_source,
                },
                purposeInfo: {
                    reasonForOpeningFund: formData.reason_for_opening_fund,
                    expectedMembersCount: Number(formData.expected_members_count),
                    targetMonthlyContribution: Number(formData.target_monthly_contribution),
                },
            };

            const response = await organizers.apply(payload);
            if (response.data.success) {
                toast.success("Application Submitted Successfully!", {
                    description: "Your trust score has been calculated and sent to admins.",
                });
                navigate("/chit-groups"); // Redirect temporarily
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to submit application");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center pt-24 pb-12 px-4 relative overflow-hidden">
          {/* Gradient Splashes */}
          <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/12 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
          </div>
            <div className="w-full max-w-4xl">
                <div className="mb-8 pl-2">
                    <Link to="/" className="text-sm font-medium text-primary/60 hover:text-primary mb-4 inline-flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" /> <T>Back to Home</T>
                    </Link>
                    <h1 className="text-3xl font-heading font-bold mt-2"><T>Become an Organizer</T></h1>
                    <p className="text-muted-foreground mt-2">
                        <T>Submit your business profile for administrative review to host chit funds.</T>
                    </p>
                </div>

                {/* Progress Tracker */}
                <div className="flex items-center justify-between mb-12 relative px-4">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary/20 -z-10 rounded-full"></div>
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-secondary transition-all duration-300 ease-in-out -z-10 rounded-full"
                        style={{ width: `${((step - 1) / 3) * 100}%` }}
                    ></div>

                    {[
                        { num: 1, label: "Type", icon: Briefcase },
                        { num: 2, label: "Business", icon: Building },
                        { num: 3, label: "Location", icon: MapPin },
                        { num: 4, label: "Financials", icon: FileText },
                    ].map((s) => (
                        <div key={s.num} className="flex flex-col items-center">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors ${step >= s.num
                                    ? "bg-secondary border-background text-secondary-foreground"
                                    : "bg-background border-secondary/30 text-muted-foreground"
                                    }`}
                            >
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span
                                className={`text-xs mt-2 font-medium ${step >= s.num ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                <T>{s.label}</T>
                            </span>
                        </div>
                    ))}
                </div>

                <div className="glass-panel p-8 md:p-10 rounded-2xl relative">
                    <form onSubmit={handleNextOrSubmit}>
                        {/* STEP 1: TYPE */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold font-heading mb-6"><T>Select Organizer Category</T></h2>
                                <div className="grid md:grid-cols-3 gap-6">
                                    {/* NEW */}
                                    <label
                                        className={`relative flex flex-col p-6 cursor-pointer border-2 rounded-xl transition-all ${formData.type === "NEW"
                                            ? "border-secondary bg-secondary/5 shadow-md scale-[1.02]"
                                            : "border-border hover:border-secondary/40"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value="NEW"
                                            checked={formData.type === "NEW"}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="font-bold text-lg mb-2"><T>New Organizer</T></div>
                                        <p className="text-sm text-muted-foreground"><T>No prior history. Strict review queue. Limited initial group sizes.</T></p>
                                    </label>

                                    {/* EXISTING */}
                                    <label
                                        className={`relative flex flex-col p-6 cursor-pointer border-2 rounded-xl transition-all ${formData.type === "EXISTING"
                                            ? "border-blue-500 bg-blue-50 shadow-md scale-[1.02]"
                                            : "border-border hover:border-blue-300"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="type"
                                            value="EXISTING"
                                            checked={formData.type === "EXISTING"}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="font-bold text-lg mb-2 text-blue-700"><T>Existing Business</T></div>
                                        <p className="text-sm text-muted-foreground"><T>Running offline chits. Verified license required. Medium trust tier.</T></p>
                                    </label>

                                    {/* MIGRATING */}
                                    <label
                                        className={`relative flex flex-col p-6 cursor-pointer border-2 rounded-xl transition-all overflow-hidden ${formData.type === "MIGRATING"
                                            ? "border-amber-500 ring-4 ring-amber-500/20 bg-gradient-to-br from-amber-50 to-orange-50 shadow-lg scale-[1.03]"
                                            : "border-border hover:border-amber-400"
                                            }`}
                                    >
                                        <div className="absolute top-0 right-0 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                                            <AlertCircle className="w-3 h-3" /> <T>HIGH PRIORITY</T>
                                        </div>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="MIGRATING"
                                            checked={formData.type === "MIGRATING"}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className="font-bold text-lg mb-2 text-amber-700 mt-2"><T>Migrating Platform</T></div>
                                        <p className="text-sm text-muted-foreground"><T>Bringing existing large-scale operations. Fast-tracked priority review queue.</T></p>
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: BUSINESS */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold font-heading mb-6"><T>Business Identity</T></h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Company Name *</T></label>
                                        <input
                                            required
                                            name="company_name"
                                            value={formData.company_name}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            placeholder="e.g. Acme Chit Funds Pvt Ltd"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Legal Structure</T></label>
                                        <select
                                            name="legal_structure"
                                            value={formData.legal_structure}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                        >
                                            <option value="Proprietorship">Proprietorship</option>
                                            <option value="Partnership">Partnership</option>
                                            <option value="Private Limited">Private Limited</option>
                                            <option value="Trust">Trust</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Chit License Number</T></label>
                                        <input
                                            name="chit_license_number"
                                            value={formData.chit_license_number}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="Required for Existing/Migrating"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Years of Operation *</T></label>
                                        <input
                                            required
                                            type="number"
                                            name="years_of_operation"
                                            value={formData.years_of_operation}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="e.g. 5"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4"><T>Personal Information</T></h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Date of Birth *</T></label>
                                            <input
                                                required
                                                type="date"
                                                name="date_of_birth"
                                                value={formData.date_of_birth}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Age *</T></label>
                                            <input
                                                readOnly
                                                name="age"
                                                value={formData.age}
                                                className="flex h-12 w-full rounded-md border border-input bg-muted/40 px-3 py-1 text-sm shadow-sm cursor-not-allowed"
                                                placeholder="Auto-calculated"
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-semibold"><T>Marital Status (Optional)</T></label>
                                            <select
                                                name="marital_status"
                                                value={formData.marital_status}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            >
                                                <option value=""><T>Select marital status</T></option>
                                                <option value="Single">Single</option>
                                                <option value="Married">Married</option>
                                                <option value="Divorced">Divorced</option>
                                                <option value="Widowed">Widowed</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4"><T>Professional Information</T></h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Occupation *</T></label>
                                            <select
                                                required
                                                name="occupation"
                                                value={formData.occupation}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            >
                                                <option value=""><T>Select occupation</T></option>
                                                <option value="Business Owner">Business Owner</option>
                                                <option value="Salaried">Salaried</option>
                                                <option value="Self-Employed">Self-Employed</option>
                                                <option value="Freelancer">Freelancer</option>
                                                <option value="Student">Student</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>

                                        {needsBusinessName && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold"><T>Company/Business Name *</T></label>
                                                <input
                                                    required={needsBusinessName}
                                                    name="company_or_business_name"
                                                    value={formData.company_or_business_name}
                                                    onChange={handleChange}
                                                    className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                                    placeholder="Enter company or business name"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Years of Experience *</T></label>
                                            <input
                                                required={!isStudent}
                                                type="number"
                                                min="0"
                                                name="years_of_experience"
                                                value={formData.years_of_experience}
                                                onChange={handleChange}
                                                disabled={isStudent}
                                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm disabled:bg-muted/40 disabled:cursor-not-allowed"
                                                placeholder={isStudent ? "Not required for students" : "e.g. 3"}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: LOCATION */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold font-heading mb-6"><T>Operational Geography</T></h2>
                                <p className="text-sm text-muted-foreground mb-4">
                                    <T>This determines your local discovery ranking algorithm positioning.</T>
                                </p>
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>City *</T></label>
                                        <input
                                            required
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="e.g. Pune"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>State *</T></label>
                                        <input
                                            required
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="e.g. Maharashtra"
                                        />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-sm font-semibold"><T>Pincode *</T></label>
                                        <input
                                            required
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="e.g. 411001"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 4: FINANCIALS & MIGRATION */}
                        {step === 4 && (
                            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                                <h2 className="text-2xl font-bold font-heading mb-6"><T>Financial Declarations</T></h2>

                                <div className="bg-secondary/10 border border-secondary/20 p-4 rounded-lg mb-6 flex gap-3">
                                    <Shield className="w-6 h-6 text-secondary shrink-0 mt-0.5" />
                                    <p className="text-sm text-secondary font-medium">
                                        <T>All funds will be secured in the platform Escrow. You will never hold member deposits directly.</T>
                                    </p>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Proposed Max Chit Size (₹)</T></label>
                                        <input
                                            type="number"
                                            name="proposed_chit_size"
                                            value={formData.proposed_chit_size}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="e.g. 1000000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold"><T>Past 3 Yr Turnover (₹)</T></label>
                                        <input
                                            type="number"
                                            name="past_3_yr_turnover"
                                            value={formData.past_3_yr_turnover}
                                            onChange={handleChange}
                                            className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                            placeholder="Required for Migrating"
                                        />
                                    </div>

                                    {formData.type === "MIGRATING" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-amber-600"><T>Existing Groups Count *</T></label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="existing_group_count"
                                                    value={formData.existing_group_count}
                                                    onChange={handleChange}
                                                    className="flex h-12 w-full border-amber-300 bg-amber-50/30 rounded-md border px-3 py-1 text-sm shadow-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold text-amber-600"><T>Total Active Members *</T></label>
                                                <input
                                                    required
                                                    type="number"
                                                    name="total_active_members"
                                                    value={formData.total_active_members}
                                                    onChange={handleChange}
                                                    className="flex h-12 w-full border-amber-300 bg-amber-50/30 rounded-md border px-3 py-1 text-sm shadow-sm"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4"><T>Income Information</T></h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Monthly Income Range *</T></label>
                                            <select
                                                required
                                                name="monthly_income_range"
                                                value={formData.monthly_income_range}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                            >
                                                <option value=""><T>Select income range</T></option>
                                                <option value="< ₹25k">&lt; ₹25k</option>
                                                <option value="₹25k – ₹50k">₹25k – ₹50k</option>
                                                <option value="₹50k – ₹1L">₹50k – ₹1L</option>
                                                <option value="> ₹1L">&gt; ₹1L</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Primary Income Source *</T></label>
                                            <input
                                                required
                                                name="primary_income_source"
                                                value={formData.primary_income_source}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                                placeholder="e.g. Salary, Business Revenue"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-6 mt-2">
                                    <h3 className="text-lg font-semibold mb-4"><T>Purpose & Intent</T></h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2 md:col-span-2">
                                            <label className="text-sm font-semibold"><T>Reason for Opening This Fund *</T></label>
                                            <textarea
                                                required
                                                minLength={50}
                                                name="reason_for_opening_fund"
                                                value={formData.reason_for_opening_fund}
                                                onChange={handleChange}
                                                className="flex min-h-28 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                                                placeholder="Describe your objective in at least 50 characters"
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                {formData.reason_for_opening_fund.trim().length}/50 minimum characters
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Expected Members Count *</T></label>
                                            <input
                                                required
                                                min="1"
                                                type="number"
                                                name="expected_members_count"
                                                value={formData.expected_members_count}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                                placeholder="e.g. 25"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold"><T>Target Monthly Contribution (₹) *</T></label>
                                            <input
                                                required
                                                min="1"
                                                type="number"
                                                name="target_monthly_contribution"
                                                value={formData.target_monthly_contribution}
                                                onChange={handleChange}
                                                className="flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                                placeholder="e.g. 5000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Form Footer Controls */}
                        <div className="mt-12 flex justify-between items-center pt-6 border-t">
                            <button
                                type="button"
                                onClick={prevStep}
                                disabled={step === 1}
                                className="px-6 py-2.5 rounded-full border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                            >
                                <T>Previous</T>
                            </button>

                            {step < 4 ? (
                                <button
                                    type="submit"
                                    className="px-6 flex items-center gap-2 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
                                >
                                    <T>Continue</T> <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-8 flex flex-row items-center gap-2 py-3 rounded-full gradient-saffron text-saffron-foreground font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all text-lg disabled:opacity-75 disabled:scale-100"
                                >
                                    {isSubmitting ? <T>Submitting...</T> : <T>Submit Application</T>}
                                    {!isSubmitting && <CheckCircle className="w-5 h-5" />}
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
