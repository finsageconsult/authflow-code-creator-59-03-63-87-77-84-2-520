import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: ReactNode;
}

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
    <SidebarProvider 
      defaultOpen={false}
    >
      <div className="relative flex min-h-screen w-full bg-background">
        <Sidebar />
        <div className="flex flex-1 flex-col min-w-0 transition-all duration-300 ease-in-out">
          <TopNav />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 pl-6 sm:pl-8 lg:pl-10 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};