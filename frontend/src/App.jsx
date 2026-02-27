import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/context/AuthContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import LoadingFallback from "@/components/LoadingFallback";
import PageTransition from "@/components/PageTransition";
import Chatbot from "@/components/Chatbot";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const ChitGroups = lazy(() => import("./pages/ChitGroups"));
const ChitGroupDetails = lazy(() => import("./pages/ChitGroupDetails"));
const ApplyOrganizer = lazy(() => import("./pages/ApplyOrganizer"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const MyChitGroup = lazy(() => import("./pages/MyChitGroup"));
const JoinedGroups = lazy(() => import("./pages/JoinedGroups"));
const Kyc = lazy(() => import("./pages/Kyc"));
const ChitProcess = lazy(() => import("./pages/ChitProcess"));
const GovSchemes = lazy(() => import("./pages/GovSchemes"));
const GoalBasedSolutions = lazy(() => import("./pages/GoalBasedSolutions"));
const PersonalizedSolutions = lazy(() => import("./pages/PersonalizedSolutions"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30000,
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <PageTransition>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/chit-groups" element={<ChitGroups />} />
                  <Route path="/chit-groups/:id" element={<ChitGroupDetails />} />
                  <Route path="/apply-organizer" element={<ApplyOrganizer />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/kyc" element={<Kyc />} />
                  <Route path="/chit-process" element={<ChitProcess />} />
                  <Route path="/gov-schemes" element={<GovSchemes />} />
                  <Route path="/solutions-goal-based" element={<GoalBasedSolutions />} />
                  <Route path="/solutions-personalized" element={<PersonalizedSolutions />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/joined-groups" element={<JoinedGroups />} />
                  <Route path="/my-chit-group" element={<MyChitGroup />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PageTransition>
            </Suspense>
            <Chatbot />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;