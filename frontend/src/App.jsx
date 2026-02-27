import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import PageTransition from "@/components/PageTransition";
import Chatbot from "@/components/Chatbot";
import { startAppTutorial } from "@/utils/tutorial";
import Index from "./pages/Index";
import ChitGroups from "./pages/ChitGroups";
import ChitGroupDetails from "./pages/ChitGroupDetails";
import ApplyOrganizer from "./pages/ApplyOrganizer";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import MyChitGroup from "./pages/MyChitGroup";
import Kyc from "./pages/Kyc";
import ChitProcess from "./pages/ChitProcess";
import GovSchemes from "./pages/GovSchemes";
import GoalBasedSolutions from "./pages/GoalBasedSolutions";
import PersonalizedSolutions from "./pages/PersonalizedSolutions";
import SecurityNorms from "./pages/SecurityNorms";
import BenefitsOfChits from "./pages/BenefitsOfChits";
import DocumentsRequired from "./pages/DocumentsRequired";
import EligibilityCriteria from "./pages/EligibilityCriteria";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const TutorialBootstrap = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const lastAttemptRef = useRef("");

  useEffect(() => {
    if (!isAuthenticated) return;

    const storageKey = "hasSeenTutorial";
    if (localStorage.getItem(storageKey)) return;

    const attemptKey = `global:${location.pathname}`;
    if (lastAttemptRef.current === attemptKey) return;
    lastAttemptRef.current = attemptKey;

    const timer = setTimeout(() => {
      const started = startAppTutorial();
      if (started) {
        localStorage.setItem(storageKey, "true");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <LanguageProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <TutorialBootstrap />
            <PageTransition>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chit-groups" element={<ChitGroups />} />
                <Route path="/chit-groups/:id" element={<ChitGroupDetails />} />
                <Route path="/apply-organizer" element={<ApplyOrganizer />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/kyc" element={<Kyc />} />
                <Route path="/chit-process" element={<ChitProcess />} />
                <Route path="/security-norms" element={<SecurityNorms />} />
                <Route path="/benefits-of-chits" element={<BenefitsOfChits />} />
                <Route path="/documents-required" element={<DocumentsRequired />} />
                <Route path="/eligibility-criteria" element={<EligibilityCriteria />} />
                <Route path="/gov-schemes" element={<GovSchemes />} />
                <Route path="/solutions-goal-based" element={<GoalBasedSolutions />} />
                <Route path="/solutions-personalized" element={<PersonalizedSolutions />} />
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/my-chit-group" element={<MyChitGroup />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
            <Chatbot />
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
