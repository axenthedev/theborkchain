
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BorkProvider } from "@/context/BorkContext";

import Header from "@/components/Header";
import Footer from "@/components/Footer";

import HomePage from "@/pages/HomePage";
import TasksPage from "@/pages/TasksPage";
import ReferralsPage from "@/pages/ReferralsPage";
import AdminPage from "@/pages/AdminPage";
import AdminLoginPage from "@/pages/AdminLoginPage";
import CoinomicsPage from "@/pages/CoinomicsPage";
import Index from "@/pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BorkProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/index" element={<Index />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/referrals" element={<ReferralsPage />} />
                <Route path="/coinomics" element={<CoinomicsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </BorkProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
