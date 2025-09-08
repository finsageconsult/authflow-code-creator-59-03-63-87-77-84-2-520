import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Simple, non-aggressive approach to remove chat widgets
    const removeWidgets = () => {
      try {
        // Only target specific external chat widget containers
        const widgetSelectors = [
          'iframe[src*="tawk.to"]',
          'iframe[src*="intercom"]',
          'iframe[src*="crisp"]',
          'iframe[src*="rohitsaw"]',
          '#tawk-widget',
          '.tawk-widget',
          '#intercom-frame',
          '.intercom-frame'
        ];

        widgetSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(element => {
            if (element && element.parentNode && !element.closest('#root')) {
              // Only remove if it's not inside our React app
              (element as HTMLElement).style.display = 'none';
              element.remove();
            }
          });
        });

        // Hide elements with rohitsaw text instead of removing them
        const textElements = document.querySelectorAll('div:not(#root *), span:not(#root *), p:not(#root *)');
        textElements.forEach(element => {
          if (element.textContent?.toLowerCase().includes('rohitsaw')) {
            (element as HTMLElement).style.display = 'none';
          }
        });
      } catch (e) {
        console.warn('Error removing chat widgets:', e);
      }
    };

    // Initial cleanup
    removeWidgets();

    // Periodic cleanup - less frequent to avoid conflicts
    const interval = setInterval(removeWidgets, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SubdomainRouter />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;