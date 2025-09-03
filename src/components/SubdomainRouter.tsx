import { Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Dashboard from '@/pages/Dashboard';
import { AppLayout } from '@/components/layout/AppLayout';

export const SubdomainRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
      <Route path="/catalog" element={<AppLayout><div>Catalog Coming Soon</div></AppLayout>} />
      <Route path="/coaching" element={<AppLayout><div>Coaching Coming Soon</div></AppLayout>} />
      <Route path="/webinars" element={<AppLayout><div>Webinars Coming Soon</div></AppLayout>} />
      <Route path="/tools" element={<AppLayout><div>Tools Coming Soon</div></AppLayout>} />
      <Route path="/team" element={<AppLayout><div>Team Coming Soon</div></AppLayout>} />
      <Route path="/billing" element={<AppLayout><div>Billing Coming Soon</div></AppLayout>} />
      <Route path="/admin" element={<AppLayout><div>Admin Coming Soon</div></AppLayout>} />
      <Route path="*" element={<Index />} />
    </Routes>
  );
};