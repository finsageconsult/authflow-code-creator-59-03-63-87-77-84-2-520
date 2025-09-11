import { Routes, Route, Navigate } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import BookDemo from '@/pages/BookDemo';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { HROverview } from '@/components/hr/HROverview';
import { HRPeople } from '@/components/hr/HRPeople';
import { HRCredits } from '@/components/hr/HRCredits';
import { HRCalendar } from '@/components/hr/HRCalendar';
import { HRInsights } from '@/components/hr/HRInsights';
import { HRInvoices } from '@/components/hr/HRInvoices';
import { HRSupport } from '@/pages/HRSupport';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { CoachDashboard } from '@/components/dashboards/CoachDashboard';
import { IndividualDashboard } from '@/components/dashboards/IndividualDashboard';
import Organizations from '@/pages/admin/Organizations';
import OrganizationDetail from '@/pages/admin/OrganizationDetail';
import Coaches from '@/pages/admin/Coaches';
import CoachProfile from '@/pages/admin/CoachProfile';
import { AppLayout } from '@/components/layout/AppLayout';
import { SimpleLayout } from '@/components/layout/SimpleLayout';
import { EmployeeLayout } from '@/components/layout/EmployeeLayout';
import { RoleBasedLayout } from '@/components/layout/RoleBasedLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { WebinarsView } from '@/components/webinars/WebinarsView';
import { ToolsView } from '@/components/tools/ToolsView';
import { ToolPage } from '@/components/tools/ToolPage';
import { ContentDetail } from '@/components/employee/ContentDetail';
import { BlogDetail } from '@/components/employee/BlogDetail';
import AssignmentsList from '@/components/assignments/AssignmentsList';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import RoleRedirect from '@/pages/RoleRedirect';

// Helper function to detect subdomain
const getSubdomain = () => {
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length > 2) {
    return parts[0]; // Return the subdomain part
  }
  return null;
};

const getRoleDashboardUrl = (role: string) => {
  switch (role) {
    case 'ADMIN': return '/admin-dashboard';
    case 'HR': return '/hr-dashboard';
    case 'EMPLOYEE': return '/employee-dashboard';
    case 'COACH': return '/coach-dashboard';
    default: return '/individual-dashboard';
  }
};

export const SubdomainRouter = () => {
  const subdomain = getSubdomain();
  
  // Handle subdomain-based routing
  useEffect(() => {
    if (subdomain) {
      const currentPath = window.location.pathname;
      
      // Redirect subdomain users to appropriate auth or dashboards
      if (currentPath === '/') {
        switch (subdomain) {
          case 'admin':
            window.location.replace('/admin-dashboard');
            break;
          case 'hr':
            // HR subdomain goes to access code login
            window.location.replace('/auth/hr');
            break;
          case 'coach':
            // Coach subdomain goes to dual auth (access code + email)
            window.location.replace('/auth/coach');
            break;
          case 'employee':
            window.location.replace('/employee-dashboard');
            break;
        }
      }
    }
  }, [subdomain]);

  return (
    <Routes>
      {/* Main domain routes */}
      <Route path="/" element={<Index />} />
      <Route path="/auth/individual" element={<Auth />} />
      <Route path="/auth/employee" element={<Auth />} />
      <Route path="/auth/employer" element={<Auth />} />
      <Route path="/auth/hr" element={<Auth />} />
      <Route path="/auth/coach" element={<Auth />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/role-redirect" element={<RoleRedirect />} />
      <Route path="/book-demo" element={<BookDemo />} />
      
      {/* Admin routes - accessible from admin subdomain or main domain */}
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Organizations /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><OrganizationDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/coaches" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Coaches /></AppLayout></ProtectedRoute>} />
      <Route path="/admin-dashboard/coaches/:coachId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><CoachProfile /></AppLayout></ProtectedRoute>} />
      
      {/* HR routes - accessible from hr subdomain or main domain */}
      <Route path="/hr-dashboard" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HROverview /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/people" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRPeople /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/credits" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRCredits /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/calendar" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRCalendar /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/insights" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRInsights /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/support" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRSupport /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/invoices" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRInvoices /></AppLayout></ProtectedRoute>} />
      
      {/* Employee routes - accessible from employee subdomain or main domain */}
      <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><EmployeeDashboard /></EmployeeLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard/content/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><ContentDetail /></EmployeeLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard/blog/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><BlogDetail /></EmployeeLayout></ProtectedRoute>} />
      
      {/* Coach routes - accessible from coach subdomain or main domain */}
      <Route path="/coach-dashboard" element={<ProtectedRoute allowedRoles={['COACH']}><AppLayout><CoachDashboard /></AppLayout></ProtectedRoute>} />
      
      {/* Individual routes */}
      <Route path="/individual-dashboard" element={<ProtectedRoute allowedRoles={['INDIVIDUAL']}><SimpleLayout><IndividualDashboard /></SimpleLayout></ProtectedRoute>} />
      
      {/* Common routes accessible from all subdomains */}
      <Route path="/catalog" element={<ProtectedRoute><RoleBasedLayout><div>Catalog Coming Soon</div></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/coaching" element={<ProtectedRoute><RoleBasedLayout><div>Coaching Coming Soon</div></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><RoleBasedLayout><AssignmentsList /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/webinars" element={<ProtectedRoute><RoleBasedLayout><WebinarsView /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><RoleBasedLayout><ToolsView /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/tools/:toolId" element={<ProtectedRoute><RoleBasedLayout><ToolPage /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Team Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Billing Coming Soon</div></AppLayout></ProtectedRoute>} />
      
      {/* Fallback route */}
      <Route path="*" element={<Index />} />
    </Routes>
  );
};