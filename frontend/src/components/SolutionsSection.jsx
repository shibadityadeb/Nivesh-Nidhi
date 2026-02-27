import { useRef } from "react";
import solBeginners from "@/assets/sol-beginners.jpg";
import solExperienced from "@/assets/sol-experienced.jpg";
import solSeniors from "@/assets/sol-seniors.jpg";
import solHomemakers from "@/assets/sol-homemakers.jpg";
import solBusiness from "@/assets/sol-business.jpg";
import solHni from "@/assets/sol-hni.jpg";
import goalBusiness from "@/assets/goal-business.jpg";
import goalLiability from "@/assets/goal-liability.jpg";
import goalFamily from "@/assets/goal-family.jpg";
import goalWealth from "@/assets/goal-wealth.jpg";



const personalSolutions = [
  { title: "Beginners", image: solBeginners, href: "/solutions-personalized#beginners" },
  { title: "Experienced Professionals", image: solExperienced, href: "/solutions-personalized#experienced" },
  { title: "Senior Citizens", image: solSeniors, href: "/solutions-personalized#seniors" },
  { title: "Home Makers", image: solHomemakers, href: "/solutions-personalized#homemakers" },
  // { title: "Business (MSME)", image: solBusiness, href: "/solutions-personalized#business" },
  // { title: "HNI Investors", image: solHni, href: "/solutions-personalized#hni" },
];

const goalSolutions = [
  { title: "Business Needs", image: goalBusiness, href: "/solutions-goal-based#business" },
  { title: "Reducing Liability", image: goalLiability, href: "/solutions-goal-based#liability" },
  { title: "Family Commitments", image: goalFamily, href: "/solutions-goal-based#family" },
  { title: "Grow Investment & Wealth", image: goalWealth, href: "/solutions-goal-based#wealth" },
];

const SolutionCardComponent = ({ card, aspectRatio = "aspect-[4/3]" }) => {
  return (
    <a
      href={card.href}
      className={`group relative overflow-hidden rounded-2xl ${aspectRatio} w-full text-left cursor-pointer flex-shrink-0 block`}
    >
      <img
        src={card.image}
        alt={card.title}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="font-heading font-semibold text-primary-foreground text-base lg:text-lg leading-snug">
          {card.title}
        </h3>
      </div>
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-secondary/50 rounded-2xl transition-colors" />
    </a>
  );
};

const SolutionsSection = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary mb-2">Our Solutions</h2>
          <p className="text-foreground/60 text-lg">Tailored financial solutions for every need</p>
        </div>

        {/* Personalised Solutions - Grid */}
        <div className="mb-16">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center text-foreground mb-8 relative inline-block w-full">
            <span className="relative inline-block">
              Personalised Financial Solutions
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M0,7 Q75,2 150,7 T300,7" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {personalSolutions.map((card) => (
              <SolutionCardComponent key={card.title} card={card} aspectRatio="aspect-[16/9]" />
            ))}
          </div>
        </div>

        {/* Goal Based Solutions - Equal Rectangular Grid */}
        <div className="mb-16">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center text-foreground mb-8 relative inline-block w-full">
            <span className="relative inline-block">
              Goal Based Solutions
              <svg className="absolute -bottom-2 left-0 w-full" height="12" viewBox="0 0 300 12" preserveAspectRatio="none">
                <path d="M0,7 Q75,2 150,7 T300,7" stroke="#f97316" strokeWidth="3" fill="none" strokeLinecap="round"/>
              </svg>
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {goalSolutions.map((card) => (
              <SolutionCardComponent key={card.title} card={card} aspectRatio="aspect-[16/9]" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
