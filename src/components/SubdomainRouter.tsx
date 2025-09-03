import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { CoachDashboard } from '@/components/dashboards/CoachDashboard';
import { IndividualDashboard } from '@/components/dashboards/IndividualDashboard';
import Organizations from '@/pages/admin/Organizations';
import OrganizationDetail from '@/pages/admin/OrganizationDetail';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
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
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin-dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/hr-dashboard" element={<ProtectedRoute allowedRoles={['HR']}><AppLayout><HRDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/employee-dashboard" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><AppLayout><EmployeeDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/coach-dashboard" element={<ProtectedRoute allowedRoles={['COACH']}><AppLayout><CoachDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/individual-dashboard" element={<ProtectedRoute allowedRoles={['INDIVIDUAL']}><AppLayout><IndividualDashboard /></AppLayout></ProtectedRoute>} />
      <Route path="/catalog" element={<ProtectedRoute><AppLayout><div>Catalog Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/coaching" element={<ProtectedRoute><AppLayout><div>Coaching Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/webinars" element={<ProtectedRoute><AppLayout><div>Webinars Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><AppLayout><div>Tools Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Team Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/billing" element={<ProtectedRoute allowedRoles={['ADMIN','HR']}><AppLayout><div>Billing Coming Soon</div></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><Organizations /></AppLayout></ProtectedRoute>} />
      <Route path="/admin/organizations/:id" element={<ProtectedRoute allowedRoles={['ADMIN']}><AppLayout><OrganizationDetail /></AppLayout></ProtectedRoute>} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};