import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Users, Building2 } from "lucide-react";
import { T } from "@/context/LanguageContext";

const EligibilityCriteria = () => {
  const individualCriteria = [
    { criterion: "Age", details: "Must be between 18 to 65 years old" },
    { criterion: "Citizenship", details: "Should be an Indian citizen or NRI with valid documentation" },
    { criterion: "Income", details: "Minimum monthly income of ₹15,000 (varies by chit group)" },
    { criterion: "Bank Account", details: "Must have an active savings or current bank account" },
    { criterion: "Credit History", details: "No defaults or negative marks in credit history" },
    { criterion: "Employment", details: "Should be employed or self-employed with proof" },
  ];

  const businessCriteria = [
    { criterion: "Business Registration", details: "Business must be registered and operational for minimum 2 years" },
    { criterion: "Turnover", details: "Minimum annual turnover of ₹25 Lakhs (varies by group size)" },
    { criterion: "GST Compliance", details: "Should be GST registered and compliant with filing" },
    { criterion: "Proprietor Age", details: "Proprietor/Partner must be between 25 to 65 years" },
    { criterion: "Financial Records", details: "Must maintain proper books of accounts" },
  ];

  const disqualifyingFactors = [
    "Defaulted loans from banks or financial institutions",
    "Willful misrepresentation of information",
    "Criminal record or legal proceedings",
    "Involvement in fraud cases",
    "Multiple defaults in previous chit groups",
    "Unsettled disputes with previous chit groups",
    "Insolvency or bankruptcy proceedings",
  ];

  const nicheEligibility = [
    {
      category: "Senior Citizens (60+)",
      benefits: "Special chit groups with reduced contribution amounts and flexible timelines",
      requirements: "Valid age proof and KYC documentation"
    },
    {
      category: "Women Entrepreneurs",
      benefits: "Women-only groups with preferential terms and lower interest rates",
      requirements: "Business registration and GST compliance"
    },
    {
      category: "Start-ups",
      benefits: "Flexible contribution schedules and reduced documentation",
      requirements: "Business registration and founder KYC"
    },
    {
      category: "NRIs",
      benefits: "International fund transfer options and flexible timelines",
      requirements: "NRI status proof and international bank account"
    },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 relative overflow-hidden">
        {/* Gradient Splashes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Hero Section */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-primary/5 to-secondary/5 relative z-10">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary"><T>Membership Requirements</T></span>
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-3">
              <T>Eligibility Criteria</T>
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              <T>Check if you meet the requirements to join a chit group and start your financial journey.</T>
            </p>
          </div>
        </section>

        {/* Individual Members */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              <T>For Individual Members</T>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {individualCriteria.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary mb-1">
                        <T>{item.criterion}</T>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <T>{item.details}</T>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Entities */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-primary flex items-center gap-3">
              <Building2 className="w-8 h-8" />
              <T>For Business Entities</T>
            </h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
              {businessCriteria.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-primary mb-1">
                        <T>{item.criterion}</T>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <T>{item.details}</T>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Disqualifying Factors */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 rounded-lg p-8">
              <div className="flex gap-4 mb-6">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-heading font-bold text-2xl text-red-900 mb-4">
                    <T>Disqualifying Factors</T>
                  </h2>
                  <p className="text-red-800 mb-4">
                    <T>You may not be eligible if any of the following apply:</T>
                  </p>
                  <ul className="space-y-3">
                    {disqualifyingFactors.map((factor, index) => (
                      <li key={index} className="flex gap-3">
                        <span className="text-red-600 font-bold">•</span>
                        <span className="text-red-800"><T>{factor}</T></span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Special Categories */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              <T>Special Categories & Programs</T>
            </h2>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {nicheEligibility.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <h3 className="font-heading font-bold text-lg text-primary mb-3">
                    <T>{item.category}</T>
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1"><T>Benefits:</T></p>
                      <p className="text-gray-600 text-sm">
                        <T>{item.benefits}</T>
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1"><T>Requirements:</T></p>
                      <p className="text-gray-600 text-sm">
                        <T>{item.requirements}</T>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Process */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              <T>Next Steps</T>
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      <T>Check Your Eligibility</T>
                    </h3>
                    <p className="text-gray-600">
                      <T>Verify that you meet all the criteria mentioned above for your category.</T>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      <T>Gather Documents</T>
                    </h3>
                    <p className="text-gray-600">
                      <T>Collect all required documents as per your category and keep them ready.</T>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      <T>Register on Platform</T>
                    </h3>
                    <p className="text-gray-600">
                      <T>Sign up on our platform and complete your basic profile information.</T>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      <T>Submit Documents & Complete KYC</T>
                    </h3>
                    <p className="text-gray-600">
                      <T>Upload documents and complete the KYC verification process.</T>
                    </p>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      <T>Choose Your Chit Group</T>
                    </h3>
                    <p className="text-gray-600">
                      <T>Browse available groups and select the one that matches your requirements.</T>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default EligibilityCriteria;
