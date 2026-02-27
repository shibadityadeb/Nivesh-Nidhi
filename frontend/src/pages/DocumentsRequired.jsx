import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, CheckCircle2, AlertCircle, Users } from "lucide-react";

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
        <section className="bg-primary py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-foreground text-center mb-4">
              Documents Required for Chits
            </h1>
            <p className="text-center text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Get a complete checklist of documents needed to join a chit group and start your journey.
            </p>
          </div>
        </section>

        {/* Individual Members */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-8 text-primary flex items-center gap-3">
              <Users className="w-8 h-8" />
              Documents for Individual Members
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
                        {item.doc}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.note}
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
              Additional Documents for Business Entities
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
                        {item.doc}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {item.note}
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
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              Verification Process
            </h2>
            <div className="max-w-3xl mx-auto">
              {processSteps.map((item) => (
                <div key={item.step} className="flex gap-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-white font-bold">
                      {item.step}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold text-lg text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-gray-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Information */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="flex gap-4">
                  <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-yellow-900 mb-2">Important Notes</h3>
                    <ul className="space-y-2 text-yellow-800 text-sm">
                      <li>• All documents must be original or notarized copies</li>
                      <li>• Documents must be recent (not older than 6 months)</li>
                      <li>• Information on documents must match across all proofs</li>
                      <li>• Digital copies accepted in PDF or JPG format</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-900 mb-2">Why These Documents?</h3>
                    <ul className="space-y-2 text-blue-800 text-sm">
                      <li>• KYC compliance with RBI regulations</li>
                      <li>• Fraud prevention and member verification</li>
                      <li>• Secure fund disbursement</li>
                      <li>• Tax compliance and record keeping</li>
                      <li>• Risk assessment and credit evaluation</li>
                    </ul>
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

export default DocumentsRequired;
