import { ShieldCheck, BrainCircuit, Link2, Clock } from "lucide-react";
import { T } from "@/context/LanguageContext";

const StatsSection = () => {
  const stats = [
    { icon: ShieldCheck, value: "100%", label: "Escrow Protected" },
    { icon: BrainCircuit, value: "AI", label: "Risk Assessment" },
    { icon: Link2, value: "On-Chain", label: "Blockchain Verified" },
    { icon: Clock, value: "24/7", label: "Real-time Monitoring" },
  ];

  return (
    <section className="py-12 bg-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="w-8 h-8 mx-auto mb-2 text-secondary" />
              <p className="font-heading font-bold text-3xl md:text-4xl text-primary mb-1">
                {stat.value}
              </p>
              <p className="text-sm text-foreground/70">
                <T>{stat.label}</T>
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
