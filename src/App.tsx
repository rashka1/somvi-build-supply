import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import Index from "./pages/Index";
import Platform from "./pages/Platform";
import MyRFQs from "./pages/MyRFQs";
import RFQDetails from "./pages/RFQDetails";
import CompletedOrders from "./pages/CompletedOrders";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/admin/Dashboard";
import RFQManagement from "./pages/admin/RFQManagement";
import SupplierManagement from "./pages/admin/SupplierManagement";
import ClientManagement from "./pages/admin/ClientManagement";
import MaterialManagement from "./pages/admin/MaterialManagement";
import FinanceTracking from "./pages/admin/FinanceTracking";
import Reports from "./pages/admin/Reports";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/platform" element={<Platform />} />
            <Route path="/my-rfqs" element={<MyRFQs />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/rfqs" element={<RFQManagement />} />
            <Route path="/admin/rfq/:id" element={<RFQDetails />} />
            <Route path="/admin/suppliers" element={<SupplierManagement />} />
            <Route path="/admin/clients" element={<ClientManagement />} />
            <Route path="/admin/materials" element={<MaterialManagement />} />
            <Route path="/admin/finance" element={<FinanceTracking />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/completed" element={<CompletedOrders />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
