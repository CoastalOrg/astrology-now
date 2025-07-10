
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import SecureAuthPage from "@/components/auth/SecureAuthPage";
import Dashboard from "@/components/dashboard/Dashboard";
import { getSecurityHeaders, generateNonce } from "@/utils/security";

const queryClient = new QueryClient();

// Enhanced security headers setup
const SecurityHeaders = () => {
  useEffect(() => {
    // Generate nonce for CSP
    const nonce = generateNonce();
    
    // Set enhanced security headers via meta tags
    const securityHeaders = getSecurityHeaders(nonce);
    
    // Remove existing security meta tags
    const existingMetas = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"], meta[http-equiv*="X-Frame-Options"]');
    existingMetas.forEach(meta => meta.remove());
    
    // Add new security headers
    Object.entries(securityHeaders).forEach(([name, value]) => {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = value;
      document.head.appendChild(meta);
    });

    // Set additional security attributes
    document.documentElement.setAttribute('data-nonce', nonce);

    return () => {
      // Cleanup on unmount
      const metas = document.querySelectorAll('meta[http-equiv*="Content-Security-Policy"], meta[http-equiv*="X-Frame-Options"], meta[http-equiv*="X-Content-Type-Options"], meta[http-equiv*="X-XSS-Protection"]');
      metas.forEach(meta => meta.remove());
      document.documentElement.removeAttribute('data-nonce');
    };
  }, []);

  return null;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-nova-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nova-action"></div>
          <p className="text-nova-secondary">Loading your cosmic experience...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/" 
        element={user ? <Navigate to="/dashboard" replace /> : <SecureAuthPage />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? <Dashboard /> : <Navigate to="/" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/" replace />} 
      />
    </Routes>
  );
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityHeaders />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={
              <div className="min-h-screen bg-nova-primary flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nova-action"></div>
              </div>
            }>
              <AppRoutes />
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
