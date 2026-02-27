import { Smartphone, FileSearch, Network, FileCheck, HandshakeIcon, Calendar, Headphones } from "lucide-react";

const WhyNiveshNidhi = () => {
  const features = [
    {
      icon: Smartphone,
      title: "Chit Kart – Your All-in-One Chit Fund App",
      description: "With our user-friendly Chit Kart app, managing your account has never been easier. You can effortlessly track payments, bids, transactions, and your balance in real time. Available on both Android and iOS, the app ensures a seamless and secure digital experience."
    },
    {
      icon: FileSearch,
      title: "100% Transparency, Total Control",
      description: "Nivesh Nidhi is committed to full transparency, giving you clear access to all records and transactions. Our plans are tailored to suit both individuals and businesses. What you see is exactly what you get — with absolutely no hidden charges."
    },
    {
      icon: Network,
      title: "Multiple Payment Options for Convenience",
      description: "We support payments through UPI, Net Banking, and offline modes, giving you the flexibility to choose what works best. All digital transactions are encrypted and secure. Our goal is to make your payment process smooth and convenient."
    },
    {
      icon: FileCheck,
      title: "Fully Compliant with the Chit Funds Act",
      description: "Nivesh Nidhi strictly operates under the guidelines of the Government of India and adheres to the Chit Fund Rules. With thousands of satisfied subscribers, our credibility and compliance are hallmarks of trust and reliability."
    },
    {
      icon: HandshakeIcon,
      title: "End-to-End Online Services",
      description: "From joining a chit to bidding and receiving funds – everything can be done on your phone. Our instant disbursement process ensures you get your funds right after winning a bid. The entire journey is fully digital and paperless."
    },
    {
      icon: FileCheck,
      title: "Secure E-Agreements at Your Fingertips",
      description: "All your agreements are legally valid, digitally signed, and stored securely. Say goodbye to paperwork, as everything is handled online. You can access or download your agreements anytime directly from the app."
    },
    {
      icon: HandshakeIcon,
      title: "Dedicated Relationship Manager",
      description: "Each subscriber is assigned a relationship manager to ensure a personalized experience. From planning your chit to resolving queries or assisting with payments, your dedicated point of contact is always ready to support you."
    },
    {
      icon: Calendar,
      title: "Never Miss a Due Date",
      description: "Stay updated with automated SMS alerts, app notifications, and email reminders. Our system helps you make timely payments and place bids without fail, supporting your journey toward better financial discipline."
    },
    {
      icon: Headphones,
      title: "Responsive Customer Support",
      description: "Our trained support team provides quick resolutions and speaks your language — with multi-lingual assistance available. Whether it's through the app, a call, or WhatsApp, help is always just a click away."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-primary mb-2">
            Why Nivesh Nidhi Chits?
          </h2>
          <p className="text-foreground/60 text-lg">Trusted, transparent, and technology-driven chit fund solutions</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 border border-border hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="font-heading font-bold text-lg text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyNiveshNidhi;
