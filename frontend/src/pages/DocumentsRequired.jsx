import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { FileText, CheckCircle2, AlertCircle, Users } from "lucide-react";
import { T } from "@/context/LanguageContext";

const DocumentsRequired = () => {
  const individualDocs = [
    { doc: "Aadhaar Card", required: true, note: "Valid government ID for KYC verification" },
    { doc: "PAN Card", required: true, note: "For tax identification and compliance" },
    { doc: "Bank Account Proof", required: true, note: "Passbook or bank statement (last 3 months)" },
    { doc: "Address Proof", required: true, note: "Electricity bill, rent agreement, or utility bill" },
    { doc: "Passport Size Photo", required: true, note: "4 recent color photographs" },
    { doc: "Income Proof", required: false, note: "Salary slip or ITR (for risk assessment)" },
  ];

  const businessDocs = [
    { doc: "GST Registration Certificate", required: true, note: "If GST registered" },
    { doc: "Business Address Proof", required: true, note: "Lease agreement or ownership proof" },
    { doc: "Business PAN", required: true, note: "For business entity identification" },
    { doc: "Audited Financial Statements", required: false, note: "Last 2 years (if available)" },
    { doc: "Business Registration", required: true, note: "MOA, AOA, or incorporation certificate" },
  ];

  const processSteps = [
    {
      step: 1,
      title: "Document Submission",
      description: "Upload all required documents through our portal or visit our office."
    },
    {
      step: 2,
      title: "KYC Verification",
      description: "Our team verifies the authenticity of documents and conducts background checks."
    },
    {
      step: 3,
      title: "Approval",
      description: "Once verified, you receive approval confirmation via email and SMS."
    },
    {
      step: 4,
      title: "Group Assignment",
      description: "You are assigned to a suitable chit group based on your requirements."
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
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary"><T>Document Checklist</T></span>
            </div>
            <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-3">
              <T>Documents Required for Chits</T>
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              <T>Get a complete checklist of documents needed to join a chit group and start your journey.</T>
            </p>
          </div>
        </section>

        {/* Individual Members */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              <T>Documents for Individual Members</T>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {individualDocs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      item.required ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        item.required ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.required ? '*' : 'O'}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-primary mb-1">
                        <T>{item.doc}</T>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <T>{item.note}</T>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Business Documents */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-primary flex items-center gap-3">
              <FileText className="w-8 h-8" />
              <T>Additional Documents for Business Entities</T>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4">
              {businessDocs.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                      item.required ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <span className={`text-xs font-bold ${
                        item.required ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {item.required ? '*' : 'O'}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <h3 className="font-semibold text-lg text-primary mb-1">
                        <T>{item.doc}</T>
                      </h3>
                      <p className="text-gray-600 text-sm">
                        <T>{item.note}</T>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Verification Process */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center">
              <span className="text-primary">Verification </span>
              <span className="text-secondary">Process</span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processSteps.map((item) => (
                  <div key={item.step} className="bg-white rounded-xl border-2 border-border p-6 hover:border-secondary hover:shadow-lg transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-secondary to-secondary/80 text-white font-bold text-xl shadow-md group-hover:scale-110 transition-transform">
                          {item.step}
                        </div>
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-heading font-bold text-lg text-primary mb-2 group-hover:text-secondary transition-colors">
                          <T>{item.title}</T>
                        </h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          <T>{item.description}</T>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Important Information */}
        <section className="py-16 bg-gradient-to-br from-muted/30 to-background relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-secondary/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-secondary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-primary mb-3"><T>Important Notes</T></h3>
                      <ul className="space-y-2 text-foreground/80 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-secondary mt-0.5">•</span>
                          <span><T>All documents must be original or notarized copies</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary mt-0.5">•</span>
                          <span><T>Documents must be recent (not older than 6 months)</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary mt-0.5">•</span>
                          <span><T>Information on documents must match across all proofs</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-secondary mt-0.5">•</span>
                          <span><T>Digital copies accepted in PDF or JPG format</T></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-primary/5 border-2 border-primary/30 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg text-primary mb-3"><T>Why These Documents?</T></h3>
                      <ul className="space-y-2 text-foreground/80 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span><T>KYC compliance with RBI regulations</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span><T>Fraud prevention and member verification</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span><T>Secure fund disbursement</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span><T>Tax compliance and record keeping</T></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span><T>Risk assessment and credit evaluation</T></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
      <AuthModal />
    </>
  );
};

export default DocumentsRequired;
