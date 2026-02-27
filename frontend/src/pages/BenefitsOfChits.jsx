import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { TrendingUp, Users, Target, Award, Zap, DollarSign } from "lucide-react";

const BenefitsOfChits = () => {
  const benefits = [
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: "Access to Lump Sum Funds",
      description: "Get instant access to a large amount of money without heavy documentation or lengthy approval processes."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Better Returns Than FDs",
      description: "Earn better returns compared to fixed deposits while maintaining security through group participation."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community Support",
      description: "Build financial discipline and trust within a community of like-minded individuals."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Flexible Payment Plans",
      description: "Choose chit groups with payment frequencies that match your financial capacity."
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Dividend Benefits",
      description: "Earn regular dividends from the discount amounts generated during auctions."
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Tax Benefits",
      description: "Eligible for tax deductions on chit subscriptions under Section 80D of Income Tax Act."
    }
  ];

  const scenarios = [
    {
      title: "For Business Owners",
      description: "Secure working capital or funds for business expansion without collateral or credit checks."
    },
    {
      title: "For Home Buyers",
      description: "Accumulate funds for down payments, home renovations, or furniture with manageable monthly contributions."
    },
    {
      title: "For Education Planning",
      description: "Build a dedicated fund for children's education with guaranteed future availability."
    },
    {
      title: "For Investments",
      description: "Create a corpus for stock market or mutual fund investments with structured savings."
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
        <section className="bg-primary py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h1 className="font-heading font-bold text-4xl md:text-5xl text-primary-foreground text-center mb-4">
              Benefits of Chits
            </h1>
            <p className="text-center text-primary-foreground/80 text-lg max-w-2xl mx-auto">
              Discover why chits are an excellent financial instrument for savings, investments, and achieving your financial goals.
            </p>
          </div>
        </section>

        {/* Main Benefits */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              Key Advantages
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-all hover:-translate-y-1 p-6"
                >
                  <div className="text-secondary mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg text-primary mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 bg-gray-50 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              Perfect For
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {scenarios.map((scenario, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-border shadow-sm p-6"
                >
                  <h3 className="font-semibold text-lg text-primary mb-3">
                    {scenario.title}
                  </h3>
                  <p className="text-gray-600">
                    {scenario.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-16 relative z-10">
          <div className="container mx-auto px-4">
            <h2 className="font-heading font-bold text-3xl mb-12 text-center text-primary">
              Why Choose Chits?
            </h2>
            <div className="max-w-3xl mx-auto bg-white rounded-lg border border-border p-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-secondary flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Minimal Documentation</h4>
                    <p className="text-gray-600">Faster approval compared to bank loans with simple KYC requirements.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-secondary flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">No Collateral Required</h4>
                    <p className="text-gray-600">Access funds without pledging property or valuables.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-secondary flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Flexible Tenure</h4>
                    <p className="text-gray-600">Choose group cycles ranging from 12 to 60 months based on your needs.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-secondary flex-shrink-0">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-primary mb-1">Transparent Process</h4>
                    <p className="text-gray-600">All terms are clear and agreed upon before joining the group.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BenefitsOfChits;
