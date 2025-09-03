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

export const SubdomainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin-dashboard" element={<AppLayout><AdminDashboard /></AppLayout>} />
      <Route path="/hr-dashboard" element={<AppLayout><HRDashboard /></AppLayout>} />
      <Route path="/employee-dashboard" element={<AppLayout><EmployeeDashboard /></AppLayout>} />
      <Route path="/coach-dashboard" element={<AppLayout><CoachDashboard /></AppLayout>} />
      <Route path="/individual-dashboard" element={<AppLayout><IndividualDashboard /></AppLayout>} />
      <Route path="/catalog" element={<AppLayout><div>Catalog Coming Soon</div></AppLayout>} />
      <Route path="/coaching" element={<AppLayout><div>Coaching Coming Soon</div></AppLayout>} />
      <Route path="/webinars" element={<AppLayout><div>Webinars Coming Soon</div></AppLayout>} />
      <Route path="/tools" element={<AppLayout><div>Tools Coming Soon</div></AppLayout>} />
      <Route path="/team" element={<AppLayout><div>Team Coming Soon</div></AppLayout>} />
      <Route path="/billing" element={<AppLayout><div>Billing Coming Soon</div></AppLayout>} />
      <Route path="/admin/organizations" element={<AppLayout><Organizations /></AppLayout>} />
      <Route path="/admin/organizations/:id" element={<AppLayout><OrganizationDetail /></AppLayout>} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};