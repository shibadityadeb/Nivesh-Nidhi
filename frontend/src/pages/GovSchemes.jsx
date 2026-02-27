import { ExternalLink } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const schemes = [
  {
    name: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    ministry: "Ministry of Finance",
    category: "Financial Inclusion",
    description: "Financial inclusion program ensuring access to financial services like banking, credit, insurance, and pension.",
    features: ["Zero balance bank account", "RuPay Debit Card", "₹2 Lakh accident insurance"],
    applyLink: "https://pmjdy.gov.in/",
    detailsLink: "https://pmjdy.gov.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/d9/Pradhan_Mantri_Jan_Dhan_Yojana_logo.png"
  },
  {
    name: "Sukanya Samriddhi Yojana",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "A savings scheme for the girl child under the Beti Bachao, Beti Padhao campaign with attractive interest rates.",
    features: ["8.2% interest rate", "Tax benefits under 80C", "Maturity at 21 years"],
    applyLink: "https://www.india.gov.in/sukanya-samriddhi-yojana",
    detailsLink: "https://www.india.gov.in/sukanya-samriddhi-yojana",
    logoUrl: "https://goodmoneying.com/wp-content/uploads/2015/03/sukanya-samridhi-scheme.jpg"
  },
  {
    name: "Atal Pension Yojana (APY)",
    ministry: "Ministry of Finance",
    category: "Pension",
    description: "Pension scheme for workers in the unorganized sector providing guaranteed minimum pension.",
    features: ["₹1,000 - ₹5,000 monthly pension", "Govt co-contribution", "Tax benefits"],
    applyLink: "https://npscra.nsdl.co.in/",
    detailsLink: "https://npscra.nsdl.co.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/d/db/Atal_Pension_Yojana.png"
  },
  {
    name: "PM Mudra Yojana",
    ministry: "Ministry of Finance",
    category: "Loans",
    description: "Provides loans up to ₹10 lakh to non-corporate, non-farm small/micro enterprises.",
    features: ["Shishu: up to ₹50,000", "Kishore: up to ₹5 Lakh", "Tarun: up to ₹10 Lakh"],
    applyLink: "https://www.mudra.org.in/",
    detailsLink: "https://www.mudra.org.in/",
    logoUrl: "https://www.ibef.org/uploads/govtschemes/Pradhan-Mantri-Mudra-Loan-Bank-Yojana-july-2025.png"
  },
  {
    name: "Public Provident Fund (PPF)",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "Long-term savings instrument with attractive interest and returns fully exempted from tax.",
    features: ["7.1% interest rate", "15 year maturity", "EEE tax status"],
    applyLink: "https://www.indiapost.gov.in/",
    detailsLink: "https://www.indiapost.gov.in/",
    logoUrl: "https://upload.wikimedia.org/wikipedia/en/thumb/3/32/India_Post.svg/500px-India_Post.svg.png"
  },
  {
    name: "National Savings Certificate (NSC)",
    ministry: "Ministry of Finance",
    category: "Savings",
    description: "Fixed income investment scheme with guaranteed returns, available at any post office.",
    features: ["7.7% interest rate", "5 year lock-in", "Tax deduction under 80C"],
    applyLink: "https://www.indiapost.gov.in/",
    detailsLink: "https://www.indiapost.gov.in/",
    logoUrl: "https://www.iasgyan.in//ig-uploads/images//All_about_National_Savings_Certificate_(NSC)_Scheme.jpg"
  }
];

const GovSchemes = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-12 relative overflow-hidden">
        {/* Gradient Splashes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="font-heading font-bold text-4xl text-primary mb-4">Government Schemes</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore various government financial schemes designed to empower citizens with savings, loans, and pension benefits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((scheme, index) => (
              <div key={index} className="gradient-subtle rounded-2xl shadow-lg border border-border p-6 hover:shadow-xl transition-shadow">
                {/* Logo */}
                <div className="w-16 h-16 flex items-center justify-center mb-4">
                  <img 
                    src={scheme.logoUrl} 
                    alt={scheme.name} 
                    className={scheme.name === "Sukanya Samriddhi Yojana" ? "w-full h-full object-cover rounded-lg" : "w-full h-full object-contain"} 
                  />
                </div>

                <h3 className="font-heading font-bold text-lg text-foreground mb-1">{scheme.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">{scheme.ministry}</p>

                <div className="inline-block px-3 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full mb-4">
                  {scheme.category}
                </div>

                <p className="text-sm text-muted-foreground mb-4">{scheme.description}</p>

                <ul className="space-y-2 mb-6">
                  {scheme.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-secondary mt-1">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex gap-3">
                  <a
                    href={scheme.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg gradient-saffron text-saffron-foreground font-medium text-sm hover:shadow-lg transition-all"
                  >
                    Apply Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={scheme.detailsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 rounded-lg border border-input text-foreground font-medium text-sm hover:bg-muted transition-colors"
                  >
                    Details
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default GovSchemes;
