import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployeeSidebar } from './EmployeeSidebar';
import { TopNav } from './TopNav';

interface EmployeeLayoutProps {
  children: ReactNode;
}

export const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b flex items-center px-6 w-full bg-background">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Finsage</h2>
              <TopNav />
            </div>
          </header>
          <main className="flex-1 p-6 bg-muted/20 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};