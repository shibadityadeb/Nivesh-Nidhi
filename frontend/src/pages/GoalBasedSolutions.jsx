import { Briefcase, TrendingDown, Heart, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { T } from "@/context/LanguageContext";
const solutions = [
  {
    title: "Business Needs",
    tag: "FOR ENTREPRENEURS",
    description: "The perfect financial solution to fuel your business ambitions — from raw materials to expansion.",
    icon: Briefcase,
    accent: "#f97316",
    image: "src/assets/goal-business.jpg",
    items: [
      { title: "Bulk Purchases", desc: "Reduce unit cost of raw materials by buying in bulk with pooled funds." },
      { title: "Expansion", desc: "Grow your business and invest in new products and services seamlessly." },
      { title: "Working Capital", desc: "Meet your orders by giving your business a reliable cash boost." },
      { title: "Seasonal Stock Taking", desc: "Stock up on inventory well in advance of festival demand surges." }
    ]
  },
  {
    title: "Reducing Liability",
    tag: "DEBT FREEDOM",
    description: "Take control of your finances — close high-cost debts and free yourself from financial burden.",
    icon: TrendingDown,
    accent: "#0ea5e9",
    image: "src/assets/goal-liability.jpg",
    items: [
      { title: "Closing High-Cost Loans", desc: "Foreclose loans that eat into your long-term savings and wealth." },
      { title: "Personal & Hand Loans", desc: "Pay off financial obligations to peers or lenders through Chits." },
      { title: "Credit Card Dues", desc: "Save valuable money by clearing outstanding credit card amounts." },
      { title: "Part Closure of Loan", desc: "Reduce loan interest impact on savings by partially closing your loans." }
    ]
  },
  {
    title: "Family Commitments",
    tag: "LIFE MILESTONES",
    description: "Borrow from your future savings to comfortably meet life's most important milestones.",
    icon: Heart,
    accent: "#ec4899",
    image: "src/assets/goal-family.jpg",
    items: [
      { title: "House Renovation", desc: "Don't think twice before taking up a home improvement project." },
      { title: "Medical Expenses", desc: "Maintain a reserve for any healthcare-related emergencies." },
      { title: "Marriage", desc: "Easily available funds for the wedding of your near and dear ones." },
      { title: "Child Education", desc: "Secure your child's future by giving them the best education possible." }
    ]
  },
  {
    title: "Grow Investments & Wealth",
    tag: "WEALTH BUILDING",
    description: "The most cost-efficient tool to acquire assets and multiply wealth — without taking a loan.",
    icon: TrendingUp,
    accent: "#10b981",
    image: "src/assets/goal-wealth.jpg",
    items: [
      { title: "Land & Real Estate", desc: "Purchase land or property and watch your money multiply over time." },
      { title: "Vehicles", desc: "Glide through your daily commute by purchasing your dream vehicle." },
      { title: "Gold", desc: "Protect your earnings against inflation through a highly liquid instrument." },
      { title: "Leisure Trips", desc: "Invest in memories to cherish with your loved ones forever." }
    ]
  }
];

const GoalBasedSolutions = () => {
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          const navbarHeight = 100;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - navbarHeight;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background pt-24 pb-20 relative overflow-hidden">
        {/* Gradient Splashes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-gradient-to-br from-secondary/15 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-20 w-[400px] h-[400px] bg-gradient-to-tr from-primary/15 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">

          {/* Page Header */}
          <div className="text-center mb-20">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-4">
              <T>What can you achieve?</T>
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-5 leading-tight">
              <T>Goal Based Solutions</T>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              <T>NiveshNidhi is specifically designed to enable you to save and meet your borrowing needs — all at once.</T>
            </p>
          </div>

          {/* Solutions */}
          <div className="space-y-24">
            {solutions.map((solution, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="group" id={idx === 0 ? "business" : idx === 1 ? "liability" : idx === 2 ? "family" : "wealth"}>
                  {/* Top: Image + Title block */}
                  <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center mb-8`}>

                    {/* Image */}
                    <div className="w-full md:w-2/5 flex-shrink-0">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
                        <img
                          src={solution.image}
                          alt={solution.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        {/* Overlay with icon */}
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{ background: `linear-gradient(135deg, ${solution.accent}55, transparent)` }}
                        />
                        <div
                          className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: solution.accent }}
                        >
                          <solution.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title + Description */}
                    <div className="flex-1">
                      <span
                        className="inline-block text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-3"
                        style={{ color: solution.accent, backgroundColor: `${solution.accent}15` }}
                      >
                        <T>{solution.tag}</T>
                      </span>
                      <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4 leading-snug">
                        <T>{solution.title}</T>
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
                        <T>{solution.description}</T>
                      </p>
                      <div
                        className="h-1 w-12 rounded-full"
                        style={{ backgroundColor: solution.accent }}
                      />
                    </div>
                  </div>

                  {/* Bottom: Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {solution.items.map((item, i) => (
                      <div
                        key={i}
                        className="group/card relative p-5 bg-background border border-border rounded-xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${solution.accent}20` }}
                        >
                          <CheckCircle2 className="w-4 h-4" style={{ color: solution.accent }} />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm mb-1.5"><T>{item.title}</T></h3>
                        <p className="text-xs text-muted-foreground leading-relaxed"><T>{item.desc}</T></p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  {idx < solutions.length - 1 && (
                    <div className="mt-16 border-t border-dashed border-border" />
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <p className="text-muted-foreground text-sm"><T>Ready to start your financial journey?</T></p>
              <a
                href="/chit-groups"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                <T>Explore Chit Groups</T>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>
      </div>
      <Footer />
      <AuthModal />
    </>
  );
};

export default GoalBasedSolutions;
