import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { TopNav } from './TopNav';
import { Loader2 } from 'lucide-react';

interface CoachLayoutProps {
  children: ReactNode;
}

export const CoachLayout = ({ children }: CoachLayoutProps) => {
  const { user, loading } = useAuth();

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
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-end border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
        <TopNav />
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};