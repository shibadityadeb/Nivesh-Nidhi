import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import PageTransition from "@/components/PageTransition";
import Chatbot from "@/components/Chatbot";
import Index from "./pages/Index";
import ChitGroups from "./pages/ChitGroups";
import ChitGroupDetails from "./pages/ChitGroupDetails";
import ApplyOrganizer from "./pages/ApplyOrganizer";
import AdminDashboard from "./pages/AdminDashboard";
import UserDashboard from "./pages/UserDashboard";
import MyChitGroup from "./pages/MyChitGroup";
import JoinedGroups from "./pages/JoinedGroups";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="/joined-groups" element={<JoinedGroups />} />
              <Route path="/my-chit-group" element={<MyChitGroup />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </PageTransition>
          <Chatbot />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;