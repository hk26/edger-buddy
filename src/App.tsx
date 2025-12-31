import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import VepariDetail from "./pages/VepariDetail";
import Backup from "./pages/Backup";
import Overdue from "./pages/Overdue";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const Router = window.location.protocol === "file:" ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/vepari/:id" element={<VepariDetail />} />
            <Route path="/backup" element={<Backup />} />
            <Route path="/overdue" element={<Overdue />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
