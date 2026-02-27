import { GraduationCap, Briefcase, Users, Home, Building2, TrendingUp, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { T } from "@/context/LanguageContext";
const personas = [
  {
    title: "Beginners",
    tag: "JUST STARTING OUT",
    subtitle: "Build the habits of regular investment and set the foundation for lifelong wealth.",
    icon: GraduationCap,
    accent: "#f97316",
    image: "src/assets/sol-beginners.jpg",
    items: [
      { q: "Monthly Compulsory Savings", a: "Build a disciplined saving habit with automated monthly contributions." },
      { q: "Large Expenses", a: "Save systematically for major milestones like your wedding or first home." },
      { q: "Get on the Road", a: "A simple borrowing solution to purchase your first car, bike, or scooter." },
      { q: "Higher Studies", a: "Boost your earning potential by funding higher education affordably." },
      { q: "Latest Gadgets", a: "Get your hands on the latest iPhone, laptop, or PlayStation without stress." }
    ]
  },
  {
    title: "Experienced Professionals",
    tag: "CAREER DRIVEN",
    subtitle: "Economical and invaluable options to reduce dependency on loans and avoid liabilities.",
    icon: Briefcase,
    accent: "#0ea5e9",
    image: "src/assets/sol-experienced.jpg",
    items: [
      { q: "Prepay Loans", a: "Save hard-earned money by pre-closing your existing loans early." },
      { q: "Future Expenses", a: "Convenient saving for marriages, education, cars, and home renovations." },
      { q: "Credit Card Dues", a: "Clear outstanding credit card amounts and stop paying high interest." },
      { q: "Realize Your Dreams", a: "Buy your first home or take that long-awaited trip overseas." }
    ]
  },
  {
    title: "Senior Citizens",
    tag: "GOLDEN YEARS",
    subtitle: "Fulfil lifelong ambitions and stay prepared for emergencies without dipping into savings.",
    icon: Users,
    accent: "#8b5cf6",
    image: "src/assets/sol-seniors.jpg",
    items: [
      { q: "Lifelong Dreams", a: "Finally take that dream leisure trip you have been putting off for years." },
      { q: "Life Upgrade", a: "Upgrade to a comfortable automatic car for easier daily commutes." },
      { q: "Emergency Reserve", a: "Stay prepared to meet unexpected medical expenses with ease." },
      { q: "Create Memories", a: "Purchase memorable gifts for your grandchildren and loved ones." }
    ]
  },
  {
    title: "Homemakers",
    tag: "HOME & HEART",
    subtitle: "A hard-to-miss opportunity to generate additional income and create a buffer for contingencies.",
    icon: Home,
    accent: "#ec4899",
    image: "src/assets/sol-homemakers.jpg",
    items: [
      { q: "Monthly Compulsory Saving", a: "Grow your monthly savings with higher returns and zero risk." },
      { q: "Child Education", a: "Provide your child with the best education possible, stress-free." },
      { q: "Gold & Jewelry", a: "Save systematically and buy gold jewellery at the right time." },
      { q: "Parallel Saving Plan", a: "A simple alternate saving plan with easy borrowing built-in." },
      { q: "Ready-to-Use Funds", a: "Quickly accessible funds for marriage, car, or home renovation needs." }
    ]
  },
  // {
  //   title: "Business (MSME)",
  //   tag: "FOR ENTREPRENEURS",
  //   subtitle: "The simplest way for businesses to raise funds efficiently for any requirement.",
  //   icon: Building2,
  //   accent: "#f59e0b",
  //   image: "src/assets/sol-business.jpg",
  //   items: [
  //     { q: "Business Finance", a: "Cost-efficient funds for working capital and business expansion." },
  //     { q: "High-Cost Loans", a: "Reduce liability by closing or reducing expensive loan arrangements." },
  //     { q: "Grow & Diversify", a: "A smart solution for growing and diversifying your business ventures." },
  //     { q: "Seasonal Stocktaking", a: "Cash injection for festival purchases and seasonal stocking needs." },
  //     { q: "Parallel Saving", a: "Save regularly and borrow simultaneously with no questions asked." }
  //   ]
  // },
  // {
  //   title: "HNI Investors",
  //   tag: "WEALTH BUILDERS",
  //   subtitle: "Diversify your investment portfolio with steady returns unaffected by market volatility.",
  //   icon: TrendingUp,
  //   accent: "#10b981",
  //   image: "src/assets/sol-hni.jpg",
  //   items: [
  //     { q: "One More Basket", a: "A great alternative asset to meet your diverse financial objectives." },
  //     { q: "Parallel Investment", a: "Invest and borrow against future savings simultaneously." },
  //     { q: "Another Asset Class", a: "Diversify your portfolio with a secure, non-market-linked class." },
  //     { q: "Funding Charities", a: "A convenient solution to fund your CSR and philanthropic initiatives." }
  //   ]
  // }
];

const PersonalizedSolutions = () => {
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
      <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Page Header */}
          <div className="text-center mb-20">
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-orange-500 bg-orange-50 border border-orange-100 rounded-full px-4 py-1.5 mb-4">
              <T>Built for everyone</T>
            </span>
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-foreground mb-5 leading-tight">
              <T>Personalized Financial Solutions</T>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
              <T>A unique financial solution that encourages systematic saving and allows easy borrowing — for everyone.</T>
            </p>
          </div>

          {/* Personas */}
          <div className="space-y-24">
            {personas.map((persona, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="group" id={idx === 0 ? "beginners" : idx === 1 ? "experienced" : idx === 2 ? "seniors" : "homemakers"}>

                  {/* Top: Image + Title block */}
                  <div className={`flex flex-col ${isEven ? "md:flex-row" : "md:flex-row-reverse"} gap-10 items-center mb-8`}>

                    {/* Image */}
                    <div className="w-full md:w-2/5 flex-shrink-0">
                      <div className="relative rounded-2xl overflow-hidden aspect-[4/3] shadow-xl">
                        <img
                          src={persona.image}
                          alt={persona.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{ background: `linear-gradient(135deg, ${persona.accent}55, transparent)` }}
                        />
                        <div
                          className="absolute bottom-4 left-4 w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                          style={{ backgroundColor: persona.accent }}
                        >
                          <persona.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Title + Description */}
                    <div className="flex-1">
                      <span
                        className="inline-block text-xs font-bold tracking-widest uppercase rounded-full px-3 py-1 mb-3"
                        style={{ color: persona.accent, backgroundColor: `${persona.accent}15` }}
                      >
                        <T>{persona.tag}</T>
                      </span>
                      <h2 className="font-heading font-bold text-3xl md:text-4xl text-foreground mb-4 leading-snug">
                        <T>{persona.title}</T>
                      </h2>
                      <p className="text-muted-foreground text-base leading-relaxed mb-6 max-w-md">
                        <T>{persona.subtitle}</T>
                      </p>
                      <div
                        className="h-1 w-12 rounded-full"
                        style={{ backgroundColor: persona.accent }}
                      />
                    </div>
                  </div>

                  {/* Bottom: Feature Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {persona.items.map((item, i) => (
                      <div
                        key={i}
                        className="relative p-5 bg-background border border-border rounded-xl hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-default"
                      >
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center mb-3"
                          style={{ backgroundColor: `${persona.accent}20` }}
                        >
                          <CheckCircle2 className="w-4 h-4" style={{ color: persona.accent }} />
                        </div>
                        <h3 className="font-semibold text-foreground text-sm mb-1.5"><T>{item.q}</T></h3>
                        <p className="text-xs text-muted-foreground leading-relaxed"><T>{item.a}</T></p>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  {idx < personas.length - 1 && (
                    <div className="mt-16 border-t border-dashed border-border" />
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="mt-24 text-center">
            <div className="inline-flex flex-col items-center gap-4">
              <p className="text-muted-foreground text-sm"><T>Find a chit group tailored to your needs</T></p>
              <a
                href="/chit-groups"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
                style={{ background: "linear-gradient(135deg, #f97316, #fb923c)" }}
              >
                <T>Find Your Perfect Chit Group</T>
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

export default PersonalizedSolutions;
