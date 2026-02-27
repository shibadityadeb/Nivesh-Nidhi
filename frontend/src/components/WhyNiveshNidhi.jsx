const WhyNiveshNidhi = () => {
  const advantages = [
    {
      image: "https://thumbs.dreamstime.com/b/escrow-text-written-orange-vintage-stamp-round-rubber-247120676.jpg",
      title: "Secure Escrow Payments",
      subtitle: "& Fast Payouts",
      titleColor: "text-secondary",
      subtitleColor: "text-primary"
    },
    {
      image: "https://mypaisaa.com/assets/images/2_eAuction.svg",
      title: "Transparent Real-Time",
      subtitle: "e-auctions",
      titleColor: "text-primary",
      subtitleColor: "text-secondary"
    },
    {
      image: "https://mypaisaa.com/assets/images/3_4auctions.svg",
      title: "Structured Monthly",
      subtitle: "chit cycles",
      titleColor: "text-secondary",
      subtitleColor: "text-foreground/70"
    },
    {
      image: "https://mypaisaa.com/assets/images/5_24x7support.svg",
      title: "AI Assistant",
      subtitle: "& guided user support",
      titleColor: "text-secondary",
      subtitleColor: "text-foreground/70"
    },
    {
      image: "https://mypaisaa.com/assets/images/6_fullycomplaint.svg",
      title: "Blockchain Audit",
      subtitle: "& trust layer",
      titleColor: "text-secondary",
      subtitleColor: "text-foreground/70"
    },
    {
      image: "https://mypaisaa.com/assets/images/7_everyone.svg",
      title: "Chit Plans for",
      subtitle: "everyone",
      titleColor: "text-foreground/70",
      subtitleColor: "text-secondary"
    }
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl mb-3">
            <span className="text-primary">Nivesh Nidhi</span>
            <span className="text-secondary"> Advantage</span>
          </h2>
          <p className="text-foreground/70 text-base md:text-lg max-w-3xl mx-auto">
            Our digital savings app offers you a superior experience through quick and easy payouts,
            transparent transactions and customer-first processes.
          </p>
        </div>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
          {advantages.map((advantage, index) => (
            <div key={index} className="flex flex-col items-center text-center group">
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-white shadow-lg flex items-center justify-center mb-5 group-hover:shadow-xl transition-shadow">
                <img 
                  src={advantage.image} 
                  alt={advantage.title}
                  className="w-32 h-32 md:w-36 md:h-36 object-contain"
                />
              </div>
              <h3 className={`font-heading font-semibold text-lg md:text-xl ${advantage.titleColor}`}>
                {advantage.title}
              </h3>
              <p className={`font-heading font-semibold text-lg md:text-xl ${advantage.subtitleColor}`}>
                {advantage.subtitle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNiveshNidhi;
