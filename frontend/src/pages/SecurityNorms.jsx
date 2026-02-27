import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Coins, Lock, CheckCircle2 } from "lucide-react";

const SecurityNorms = () => {
  const securityNorms = [
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Subscription Agreement",
      description: "All members must sign a binding subscription agreement outlining terms and conditions of the chit fund."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Identity Verification",
      description: "Government-issued ID verification and KYC compliance is mandatory for all members."
    },
    {
      icon: <Coins className="w-8 h-8" />,
      title: "Forfeiture Terms",
      description: "Members who default on payments may face forfeiture of their contributions and entitlements."
    },
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      title: "Dispute Resolution",
      description: "Any disputes are resolved through arbitration as per the chit scheme rules."
    }
  ];

  const drawPrizeMoney = [
    {
      step: 1,
      title: "Eligibility Check",
      description: "Ensure you are a member in good standing with no pending dues."
    },
    {
      step: 2,
      title: "Participation in Auction",
      description: "Participate in the monthly auction and place your bid for the prize money."
    },
    {
      step: 3,
      title: "Winning the Bid",
      description: "If your bid is the lowest, you win the prize money for that month."
    },
    {
      step: 4,
      title: "Documentation",
      description: "Submit required documents to verify your identity and claim status."
    },
    {
      step: 5,
      title: "Prize Withdrawal",
      description: "After verification, prize money is deposited to your registered bank account."
    }
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
              Security Norms & Prize Money
            </h1>
            <p className="text-center text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Understand the security protocols and procedures for drawing prize money from your chit group.
            </p>
          </div>
        </section>

        {/* Security Norms Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              Security Norms
            </h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {securityNorms.map((norm, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-secondary flex-shrink-0">
                      {norm.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-primary mb-2">
                        {norm.title}
                      </h3>
                      <p className="text-gray-600">
                        {norm.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Draw Prize Money Section */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              How to Draw Prize Money
            </h2>
            <div className="max-w-3xl mx-auto">
              {drawPrizeMoney.map((item) => (
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

        {/* Important Notes */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-8">
              <h3 className="font-heading font-bold text-xl text-primary mb-4">
                Important Notes
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>Prize money can only be claimed after winning the monthly auction.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>All members must maintain their contribution schedule without default.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>Prize withdrawal is subject to verification of documents.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                  <span>For security, all transactions are done through registered bank accounts only.</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default SecurityNorms;
