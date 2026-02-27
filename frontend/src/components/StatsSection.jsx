import { Users, Building2, MapPin, UserCheck } from "lucide-react";

const StatsSection = () => {
  const stats = [
    { icon: Users, value: "108,000+", label: "Happy subscribers" },
    { icon: Building2, value: "1,000+", label: "Employees" },
    { icon: MapPin, value: "50+", label: "Branches" },
    { icon: UserCheck, value: "1,500+", label: "Adviser" },
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
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
