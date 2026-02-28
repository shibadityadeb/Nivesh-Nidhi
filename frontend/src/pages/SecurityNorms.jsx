import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { Shield, Coins, Lock, CheckCircle2 } from "lucide-react";
import { T } from "@/context/LanguageContext";

const securityNorms = [
  {
    icon: Lock,
    title: "Subscription Agreement",
    description: "All members must sign a binding subscription agreement outlining terms and conditions of the chit fund."
  },
  {
    icon: Shield,
    title: "Identity Verification",
    description: "Government-issued ID verification and KYC compliance is mandatory for all members."
  },
  {
    icon: Coins,
    title: "Forfeiture Terms",
    description: "Members who default on payments may face forfeiture of their contributions and entitlements."
  },
  {
    icon: CheckCircle2,
    title: "Dispute Resolution",
    description: "Any disputes are resolved through arbitration as per the chit scheme rules."
  }
];

const drawSteps = [
  { step: "01", title: "Eligibility Check", description: "Ensure you are a member in good standing with no pending dues." },
  { step: "02", title: "Participation in Auction", description: "Participate in the monthly auction and place your bid for the prize money." },
  { step: "03", title: "Winning the Bid", description: "If your bid is the lowest, you win the prize money for that month." },
  { step: "04", title: "Documentation", description: "Submit required documents to verify your identity and claim status." },
  { step: "05", title: "Prize Withdrawal", description: "After verification, prize money is deposited to your registered bank account." }
];

const notes = [
  "Prize money can only be claimed after winning the monthly auction.",
  "All members must maintain their contribution schedule without default.",
  "Prize withdrawal is subject to verification of documents.",
  "For security, all transactions are done through registered bank accounts only."
];

const SecurityNorms = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Gradient Splashes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl" />
        </div>

        {/* Page Header */}
        <section className="pt-28 pb-16 border-b border-gray-100 relative z-10">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-4">
              <T>Trust & Safety</T>
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-gray-900 leading-tight max-w-lg">
                <T>Security Norms & Prize Money</T>
              </h1>
              <p className="text-gray-400 text-base max-w-xs leading-relaxed">
                <T>Protocols and procedures that keep every chit group safe, transparent, and compliant.</T>
              </p>
            </div>
          </div>
        </section>

        {/* Security Norms */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-10">
              <T>Security Norms</T>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden">
              {securityNorms.map((norm, i) => (
                <div key={i} className="bg-white px-8 py-8 group hover:bg-orange-50/40 transition-colors">
                  <norm.icon className="w-5 h-5 text-orange-500 mb-5" />
                  <h3 className="font-bold text-gray-900 text-lg mb-2"><T>{norm.title}</T></h3>
                  <p className="text-gray-500 text-sm leading-relaxed"><T>{norm.description}</T></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How to Draw Prize Money */}
        <section className="py-20 bg-gray-50 border-t border-gray-100 relative z-10">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-10">
              <T>How to draw prize money</T>
            </p>
            <div className="divide-y divide-gray-100">
              {drawSteps.map((item) => (
                <div
                  key={item.step}
                  className="group flex flex-col sm:flex-row sm:items-start gap-6 py-10 hover:bg-orange-50/30 transition-colors rounded-xl px-4 -mx-4"
                >
                  <span className="font-extrabold text-5xl text-gray-100 group-hover:text-orange-200 transition-colors leading-none flex-shrink-0 w-20 select-none">
                    {item.step}
                  </span>
                  <div className="flex-1 pt-2">
                    <h3 className="font-heading font-bold text-xl text-gray-900 mb-2"><T>{item.title}</T></h3>
                    <p className="text-gray-500 leading-relaxed max-w-xl"><T>{item.description}</T></p>
                  </div>
                  <div className="hidden md:flex items-center self-center">
                    <div className="w-8 h-px bg-gray-200 group-hover:bg-orange-300 transition-colors" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-orange-400 transition-colors ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="py-20 border-t border-gray-100 relative z-10">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-10">
              <T>Important notes</T>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-gray-100 rounded-2xl overflow-hidden">
              {notes.map((note, i) => (
                <div key={i} className="bg-white px-8 py-6 flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-orange-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed"><T>{note}</T></p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-16 border-t border-gray-100 relative z-10">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-2xl text-gray-900 mb-1"><T>Have questions about security?</T></h3>
              <p className="text-gray-400 text-sm"><T>Our team is available to walk you through every step.</T></p>
            </div>
            <a
              href="/chit-groups"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #ea580c, #f59e0b)" }}
            >
              <T>Explore Chit Groups →</T>
            </a>
          </div>
        </section>

      </div>
      <Footer />
      <AuthModal />
    </>
  );
};

export default SecurityNorms;
