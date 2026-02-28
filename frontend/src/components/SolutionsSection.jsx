import { useRef } from "react";
import { T } from "@/context/LanguageContext";

const personalSolutions = [
  { title: "Beginners", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/sol-beginners.jpg", href: "/solutions-personalized#beginners" },
  { title: "Experienced Professionals", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/sol-experienced.jpg", href: "/solutions-personalized#experienced" },
  { title: "Senior Citizens", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/sol-seniors.jpg", href: "/solutions-personalized#seniors" },
  { title: "Home Makers", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/sol-homemakers.jpg", href: "/solutions-personalized#homemakers" },
];

const goalSolutions = [
  { title: "Business Needs", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/goal-business.jpg", href: "/solutions-goal-based#business" },
  { title: "Reducing Liability", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/goal-liability.jpg", href: "/solutions-goal-based#liability" },
  { title: "Family Commitments", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/goal-family.jpg", href: "/solutions-goal-based#family" },
  { title: "Grow Investment & Wealth", image: "https://mahamoney.s3.ap-south-1.amazonaws.com/goal-wealth.jpg", href: "/solutions-goal-based#wealth" },
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
          <T>{card.title}</T>
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
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary mb-2"><T>Our Solutions</T></h2>
          <p className="text-foreground/60 text-lg"><T>Tailored financial solutions for every need</T></p>
        </div>

        {/* Personalised Solutions - Grid */}
        <div className="mb-16">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-center text-foreground mb-8 relative inline-block w-full">
            <span className="relative inline-block">
              <T>Personalised Financial Solutions</T>
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
              <T>Goal Based Solutions</T>
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
