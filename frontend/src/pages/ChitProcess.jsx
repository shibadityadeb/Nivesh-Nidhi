import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ChitProcess = () => {
  const steps = [
    {
      step: 1,
      title: "Registration",
      description: "Join a chit group by registering with required documents and paying the first installment."
    },
    {
      step: 2,
      title: "Monthly Contributions",
      description: "All members contribute a fixed monthly amount to the common pool."
    },
    {
      step: 3,
      title: "Auction Process",
      description: "Members bid for the prize money. The lowest bidder wins the amount for that month."
    },
    {
      step: 4,
      title: "Prize Distribution",
      description: "Winner receives the prize money after deducting the discount amount."
    },
    {
      step: 5,
      title: "Dividend Sharing",
      description: "The discount amount is distributed equally among all members as dividend."
    },
    {
      step: 6,
      title: "Cycle Completion",
      description: "Process continues until all members receive the prize money once."
    }
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 relative overflow-hidden">
        {/* Gradient Splashes */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-3xl" />
        </div>
        {/* Hero Section */}
        <section className="bg-primary py-16">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-foreground text-center mb-4">
              The Chit Process – How It Works
            </h1>
            <p className="text-primary-foreground/80 text-center text-lg max-w-3xl mx-auto">
              Understanding the complete chit fund process from registration to completion
            </p>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="space-y-8">
              {steps.map((item, index) => (
                <div key={item.step} className="flex gap-6 items-start">
                  <div className="flex-shrink-0 w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <span className="font-heading font-bold text-2xl text-secondary-foreground">{item.step}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-2xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-lg">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example Section */}
        <section className="py-16 bg-secondary/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="font-heading font-bold text-3xl text-center text-foreground mb-8">Example</h2>
            <div className="bg-white rounded-2xl p-8 shadow-lg">
              <p className="text-lg mb-4">
                <strong>Chit Value:</strong> ₹1,00,000 | <strong>Duration:</strong> 20 months | <strong>Members:</strong> 20
              </p>
              <p className="text-lg mb-4">
                <strong>Monthly Contribution:</strong> ₹5,000 per member
              </p>
              <p className="text-lg mb-4">
                <strong>Month 1:</strong> Member A bids ₹10,000 discount and wins ₹90,000
              </p>
              <p className="text-lg">
                <strong>Dividend:</strong> ₹10,000 ÷ 20 = ₹500 per member
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default ChitProcess;
