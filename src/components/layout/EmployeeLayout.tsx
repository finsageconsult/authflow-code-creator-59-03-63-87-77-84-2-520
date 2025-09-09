import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployeeSidebar } from './EmployeeSidebar';
import { TopNav } from './TopNav';
import { Button } from '@/components/ui/button';
import { BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const ContentLibraryButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isContentLibraryActive = location.search.includes('tab=content-library');

  return (
    <Button 
      variant="ghost" 
      onClick={() => navigate('/employee-dashboard?tab=content-library')}
      className={`flex items-center gap-2 relative ${isContentLibraryActive ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary' : ''}`}
    >
      <BookOpen className="h-4 w-4" />
      <span>Content Library</span>
    </Button>
  );
};

interface EmployeeLayoutProps {
  children: ReactNode;
}

export const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-6 w-full">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold">Finsage</h2>
                <ContentLibraryButton />
              </div>
              <TopNav />
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};