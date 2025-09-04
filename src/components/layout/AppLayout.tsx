import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { SidebarProvider, SidebarTrigger, SidebarInset, useSidebar } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayoutContent = ({ children }: { children: ReactNode }) => {
  const { state, isMobile, openMobile } = useSidebar();
  
  const isExpanded = state === 'expanded';
  const isCollapsed = state === 'collapsed';
  
  // Calculate margin based on screen size and sidebar state
  const getContentMargin = () => {
    if (isMobile) return 'ml-0'; // No margin on mobile
    return isExpanded ? 'ml-64' : 'ml-16'; // Full or collapsed sidebar width
  };
  
  return (
    <div className="sidebar-layout min-h-screen flex w-full bg-background">
      <Sidebar />
      <SidebarInset 
        className={`
          flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${getContentMargin()}
          ${isMobile && openMobile ? 'pointer-events-none' : ''}
        `}
      >
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 px-4">
          <SidebarTrigger className="-ml-1 hover-scale" />
          <div className="ml-auto">
            <TopNav />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-full mx-auto space-y-6">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </SidebarInset>
    </div>
  );
};

export const AppLayout = ({ children }: AppLayoutProps) => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <SidebarProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </SidebarProvider>
  );
};