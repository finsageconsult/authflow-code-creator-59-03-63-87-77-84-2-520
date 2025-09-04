import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { EmployeeSidebar } from "./EmployeeSidebar";

export default function EmployeeLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <header className="h-12 flex items-center border-b bg-background">
        <SidebarTrigger className="ml-2" />
        <div className="ml-4">
          <h1 className="font-semibold">Employee Dashboard</h1>
        </div>
      </header>

      <div className="flex min-h-screen w-full">
        <EmployeeSidebar />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}