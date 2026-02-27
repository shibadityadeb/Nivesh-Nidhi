
import { ArrowRight, Shield, Users, TrendingUp, ChevronDown } from "lucide-react";
import { T } from "@/context/LanguageContext";

const HeroSection = () => {

  return (
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img src="https://mahamoney.s3.ap-south-1.amazonaws.com/women-empowerment-business-indian.jpg" alt="Digital Chit Fund Platform" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/70 to-primary/40" />
      </div>

      <div className="relative container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-secondary"><T>Government Registered Platform</T></span>
          </div>

          <h1 className="font-heading font-extrabold text-5xl md:text-6xl lg:text-7xl text-primary-foreground leading-tight mb-8">
            <T>Group Savings &</T><br />
            <span className="text-secondary"><T>Chit Fund</T></span> <T>Digitization</T>
          </h1>

          <p className="text-xl text-primary-foreground/80 mb-10 max-w-lg leading-relaxed">
            <T>A transparent, secure, and blockchain-backed platform for traditional chit funds and group savings — empowering communities across India.</T>
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <a
              href="/chit-groups"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full gradient-saffron text-saffron-foreground font-heading font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            >
              <T>Explore Chits</T>
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/apply-organizer"
              className="flex items-center gap-2 px-7 py-3.5 rounded-full border-2 border-primary-foreground/30 text-primary-foreground font-heading font-semibold hover:bg-primary-foreground/10 transition-all border-amber-300"
            >
              <T>Become an Organizer</T>
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8">
            {[
              { icon: Users, label: "Active Groups", value: "2,500+" },
              { icon: TrendingUp, label: "Funds Managed", value: "₹50Cr+" },
              { icon: Shield, label: "Secured by", value: "Blockchain" },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="font-heading font-bold text-primary-foreground text-xl">{stat.value}</p>
                  <p className="text-sm text-primary-foreground/60"><T>{stat.label}</T></p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-primary-foreground/60" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
