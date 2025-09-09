import { Routes, Route } from 'react-router-dom';
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

const getRoleDashboardUrl = (role: string) => {
  switch (role) {
    case 'ADMIN': return '/admin-dashboard';
    case 'HR': return '/hr-dashboard';
    case 'EMPLOYEE': return '/employee-dashboard';
    case 'COACH': return '/coach-dashboard';
    default: return '/individual-dashboard';
  }
};

const RoleRedirect = () => {
  const { user, userProfile, profileReady } = useAuth();
  useEffect(() => {
    if (!user || !profileReady) return;
    const target = getRoleDashboardUrl(userProfile?.role || 'INDIVIDUAL');
    window.location.replace(target);
  }, [user, userProfile, profileReady]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
};

export const SubdomainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth/individual" element={<Auth />} />
      <Route path="/auth/employee" element={<Auth />} />
      <Route path="/auth/employer" element={<Auth />} />
      <Route path="/book-demo" element={<BookDemo />} />
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HROverview /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/people" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRPeople /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/credits" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRCredits /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/calendar" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRCalendar /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/insights" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRInsights /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard/invoices" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRInvoices /></AppLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><EmployeeDashboard /></EmployeeLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard/content/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><ContentDetail /></EmployeeLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard/blog/:id" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><EmployeeLayout><BlogDetail /></EmployeeLayout></ProtectedRoute>} />
      <Route path="/coach-dashboard" element={<ProtectedRoute allowedRoles={['COACH']}><AppLayout><CoachDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/individual-dashboard" element={<ProtectedRoute allowedRoles={['INDIVIDUAL']}><SimpleLayout><IndividualDashboard /></SimpleLayout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute><RoleBasedLayout><div>Catalog Coming Soon</div></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/coaching" element={<ProtectedRoute><RoleBasedLayout><div>Coaching Coming Soon</div></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/assignments" element={<ProtectedRoute><RoleBasedLayout><AssignmentsList /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/webinars" element={<ProtectedRoute><RoleBasedLayout><WebinarsView /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><RoleBasedLayout><ToolsView /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/tools/:toolId" element={<ProtectedRoute><RoleBasedLayout><ToolPage /></RoleBasedLayout></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Team Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Billing Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Organizations /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><OrganizationDetail /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/coaches" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Coaches /></AppLayout></ProtectedRoute>} />
      <Route path="/admin-dashboard/coaches/:coachId" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><CoachProfile /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};