import { useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import PageTransition from "@/components/PageTransition";
import Chatbot from "@/components/Chatbot";
import IntroVideo from "@/components/IntroVideo";
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
  const { user, isAuthenticated, showTermsModal, showSuccessModal, showLoginSuccessModal } = useAuth();
  const location = useLocation();
  const lastAttemptRef = useRef("");

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const storageKey = `hasSeenTutorial_${user.id}`;
    if (localStorage.getItem(storageKey)) return;

    // Do not attempt if modals are open
    if (showTermsModal || showSuccessModal || showLoginSuccessModal) return;

    const attemptKey = `global:${location.pathname}`;
    // We only want to prevent *repeated* identical path attempts that failed, 
    // but we SHOULD retry if we just closed a modal.
    // If it succeeds, the storageKey prevents future runs.

    // Use an interval to poll every 500ms for up to 5 seconds to see if DOM is ready
    let attempts = 0;
    const maxAttempts = 10;

    const tryStart = () => {
      attempts++;
      console.log(`[TutorialBootstrap] Attempt ${attempts} to start tutorial on path ${location.pathname}`);
      const started = startAppTutorial();
      if (started) {
        console.log(`[TutorialBootstrap] Tutorial started successfully! Setting local storage.`);
        localStorage.setItem(`hasSeenTutorial_${user.id}`, "true");
      } else if (attempts < maxAttempts) {
        console.log(`[TutorialBootstrap] Tutorial failed to start (no elements?). Retrying in 500ms...`);
        timer = setTimeout(tryStart, 500);
      } else {
        console.log(`[TutorialBootstrap] Max attempts reached. Giving up on path ${location.pathname}.`);
        lastAttemptRef.current = attemptKey;
      }
    };

    let timer = setTimeout(tryStart, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, location.pathname, showTermsModal, showSuccessModal, showLoginSuccessModal]);

  return null;
};

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "138523538314-guc5eib1v0hvi0jc5kei8op0kacj344g.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <AuthProvider>
            <Toaster />
            <Sonner />
            <IntroVideo />
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
  </GoogleOAuthProvider>
);

export default App;
