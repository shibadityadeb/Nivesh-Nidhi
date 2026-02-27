import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import StatsSection from "@/components/StatsSection";
import SolutionsSection from "@/components/SolutionsSection";
import WhyNiveshNidhi from "@/components/WhyNiveshNidhi";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Gradient Splashes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-accent/5 to-transparent rounded-full blur-3xl" />
      </div>
      
      <div className="relative z-10">
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <SolutionsSection />
          <WhyNiveshNidhi />
        </main>
        <Footer />
        <AuthModal />
      </div>
    </div>
  );
};

export default Index;
