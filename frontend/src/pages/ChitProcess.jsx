import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/context/LanguageContext";
const steps = [
  {
    step: "01",
    title: "Registration",
    description: "Join a chit group by registering with required documents and paying the first installment to secure your spot."
  },
  {
    step: "02",
    title: "Monthly Contributions",
    description: "All members contribute a fixed monthly amount to the common pool — consistent and predictable."
  },
  {
    step: "03",
    title: "Auction Process",
    description: "Members bid for the prize money each month. The lowest bidder wins the pooled amount for that cycle."
  },
  {
    step: "04",
    title: "Prize Distribution",
    description: "The winner receives the prize money after deducting the discount amount agreed upon during auction."
  },
  {
    step: "05",
    title: "Dividend Sharing",
    description: "The discount amount is split equally among all members as a dividend — everyone benefits."
  },
  {
    step: "06",
    title: "Cycle Completion",
    description: "The process continues until every member has received the prize money exactly once."
  }
];

const exampleData = [
  { label: "Chit Value", value: "₹1,00,000" },
  { label: "Duration", value: "20 months" },
  { label: "Members", value: "20" },
  { label: "Monthly / Member", value: "₹5,000" },
  { label: "Month 1 Bid", value: "₹10,000" },
  { label: "Winner Receives", value: "₹90,000" },
  { label: "Dividend / Member", value: "₹500" },
];

const ChitProcess = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">

        {/* Page Header */}
        <section className="pt-28 pb-16 border-b border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-4">
              <T>How it works</T>
            </p>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <h1 className="font-heading font-extrabold text-5xl md:text-6xl text-gray-900 leading-tight max-w-lg">
                <T>The Chit Fund Process</T>
              </h1>
              <p className="text-gray-400 text-base max-w-xs leading-relaxed">
                <T>From registration to completion — a clear, step-by-step walkthrough of how chit funds work.</T>
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-20">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">
            <div className="divide-y divide-gray-100">
              {steps.map((item, i) => (
                <div
                  key={item.step}
                  className="group flex flex-col sm:flex-row sm:items-start gap-6 py-10 hover:bg-orange-50/30 transition-colors rounded-xl px-4 -mx-4"
                >
                  {/* Step number */}
                  <span className="font-extrabold text-5xl text-gray-100 group-hover:text-orange-200 transition-colors leading-none flex-shrink-0 w-20 select-none">
                    {item.step}
                  </span>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3 className="font-heading font-bold text-xl text-gray-900 mb-2"><T>{item.title}</T></h3>
                    <p className="text-gray-500 leading-relaxed max-w-xl"><T>{item.description}</T></p>
                  </div>

                  {/* Right accent */}
                  <div className="hidden md:flex items-center self-center">
                    <div className="w-8 h-px bg-gray-200 group-hover:bg-orange-300 transition-colors" />
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-orange-400 transition-colors ml-1" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Example */}
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl">

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-orange-500 mb-3">
                  <T>Worked example</T>
                </p>
                <h2 className="font-heading font-extrabold text-4xl text-gray-900"><T>See it in numbers</T></h2>
              </div>
              <p className="text-gray-400 text-sm max-w-xs">
                <T>A 20-member chit group with a ₹1,00,000 value over 20 months.</T>
              </p>
            </div>

            {/* Data grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-gray-200 rounded-2xl overflow-hidden">
              {exampleData.map((d, i) => (
                <div
                  key={i}
                  className={`bg-white px-6 py-5 ${
                    i === exampleData.length - 1 && exampleData.length % 4 !== 0
                      ? "col-span-2 sm:col-span-1"
                      : ""
                  }`}
                >
                  <p className="text-xs text-gray-400 mb-1.5 uppercase tracking-wide"><T>{d.label}</T></p>
                  <p className="font-extrabold text-xl text-gray-900"><T>{d.value}</T></p>
                </div>
              ))}

              {/* Summary callout in last cell */}
              <div className="bg-orange-500 px-6 py-5 flex flex-col justify-between">
                <p className="text-xs text-orange-200 uppercase tracking-wide mb-1.5"><T>Net benefit</T></p>
                <p className="font-extrabold text-xl text-white"><T>₹500/mo saved</T></p>
              </div>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-400 mt-5 leading-relaxed max-w-lg">
              <T>* Actual dividend varies each month based on the winning bid amount. Higher competition = higher dividend for all members.</T>
            </p>
          </div>
        </section>

        {/* CTA strip */}
        <section className="py-16 border-t border-gray-100">
          <div className="container mx-auto px-6 lg:px-16 max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-heading font-bold text-2xl text-gray-900 mb-1"><T>Ready to join a chit group?</T></h3>
              <p className="text-gray-400 text-sm"><T>Browse active groups and find the right fit for your savings goal.</T></p>
            </div>
            <a
              href="/chit-groups"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-semibold text-sm whitespace-nowrap hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg, #ea580c, #f59e0b)" }}
            >
              <T>Explore Chit Groups →</T>
            </a>
          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default ChitProcess;
