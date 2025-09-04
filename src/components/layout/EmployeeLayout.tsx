import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { EmployeeSidebar } from './EmployeeSidebar';

interface EmployeeLayoutProps {
  children: ReactNode;
}

export const EmployeeLayout = ({ children }: EmployeeLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <EmployeeSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4">
            <SidebarTrigger className="mr-4" />
            <div className="flex-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Finsage</h2>
              <span className="text-sm text-muted-foreground">Dashboard</span>
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