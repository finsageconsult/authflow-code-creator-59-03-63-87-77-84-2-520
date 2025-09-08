import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { SubdomainRouter } from "@/components/SubdomainRouter";
import { AuthProvider } from "@/hooks/useAuth";
import { useEffect } from "react";

const queryClient = new QueryClient();

// Function to safely remove external chat widgets
const removeExternalChatWidgets = () => {
  try {
    // Remove common chat widget elements with safety checks
    const chatWidgetSelectors = [
      '[id*="tawk"]',
      '[class*="tawk"]',
      '[id*="intercom"]',
      '[class*="intercom"]',
      '[id*="crisp"]',
      '[class*="crisp"]',
      '[id*="zendesk"]',
      '[class*="zendesk"]',
      'iframe[src*="tawk.to"]',
      'iframe[src*="intercom"]',
      'iframe[src*="crisp"]',
      'iframe[src*="rohitsaw"]'
    ];

    chatWidgetSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            if (element && element.parentNode && document.contains(element)) {
              console.log('Removing chat widget element:', element);
              element.remove();
            }
          } catch (e) {
            console.warn('Failed to remove chat widget element:', e);
          }
        });
      } catch (e) {
        console.warn('Failed to query selector:', selector, e);
      }
    });

    // Remove elements containing "rohitsaw" text - more targeted approach
    const textElements = document.querySelectorAll('div, span, p, h1, h2, h3, h4, h5, h6');
    textElements.forEach((element) => {
      try {
        if (element && element.textContent?.toLowerCase().includes('rohitsaw')) {
          if (element.parentNode && document.contains(element)) {
            console.log('Removing element with rohitsaw:', element);
            element.remove();
          }
        }
      } catch (e) {
        console.warn('Failed to remove rohitsaw element:', e);
      }
    });

    // Remove any scripts from external chat services
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      try {
        const src = script.getAttribute('src') || '';
        if (src.includes('tawk.to') || 
            src.includes('intercom') || 
            src.includes('crisp') || 
            src.includes('rohitsaw') ||
            src.includes('zendesk')) {
          if (script.parentNode && document.contains(script)) {
            console.log('Removing external chat script:', src);
            script.remove();
          }
        }
      } catch (e) {
        console.warn('Failed to remove chat script:', e);
      }
    });
  } catch (e) {
    console.warn('Error in removeExternalChatWidgets:', e);
  }
};

const App = () => {
  useEffect(() => {
    // Remove widgets on initial load
    removeExternalChatWidgets();

    // Set up a mutation observer to remove widgets as they appear
    const observer = new MutationObserver((mutations) => {
      try {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              try {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  
                  // Check if the added element or its children contain "rohitsaw"
                  if (element.textContent?.toLowerCase().includes('rohitsaw')) {
                    if (element.parentNode && document.contains(element)) {
                      console.log('Removing dynamically added rohitsaw element:', element);
                      element.remove();
                    }
                  }
                  
                  // Check for chat widget patterns
                  try {
                    const chatElements = element.querySelectorAll('[id*="tawk"], [class*="tawk"], [id*="intercom"], [class*="intercom"], [id*="crisp"], [class*="crisp"]');
                    chatElements.forEach(chatElement => {
                      try {
                        if (chatElement.parentNode && document.contains(chatElement)) {
                          console.log('Removing dynamically added chat widget:', chatElement);
                          chatElement.remove();
                        }
                      } catch (e) {
                        console.warn('Failed to remove dynamic chat widget:', e);
                      }
                    });
                  } catch (e) {
                    console.warn('Failed to query chat elements:', e);
                  }
                }
              } catch (e) {
                console.warn('Failed to process added node:', e);
              }
            });
          }
        });
      } catch (e) {
        console.warn('Error in MutationObserver:', e);
      }
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Clean up widgets every 5 seconds as a fallback
    const interval = setInterval(removeExternalChatWidgets, 5000);

    // Cleanup
    return () => {
      observer.disconnect();
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