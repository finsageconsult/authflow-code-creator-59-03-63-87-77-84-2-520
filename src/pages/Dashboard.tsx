import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/dashboards/AdminDashboard';
import { HRDashboard } from '@/components/dashboards/HRDashboard';
import { EmployeeDashboard } from '@/components/dashboards/EmployeeDashboard';
import { CoachDashboard } from '@/components/dashboards/CoachDashboard';
import { IndividualDashboard } from '@/components/dashboards/IndividualDashboard';

export default function Dashboard() {
  const { userProfile, loading } = useAuth();

  // Route to appropriate dashboard based on user role
  if (loading) {
    return <div>Loading...</div>;
  }
  if (!userProfile) {
    return <IndividualDashboard />;
  }

  switch (userProfile.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'HR':
      return <HRDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    case 'COACH':
      return <CoachDashboard />;
    case 'INDIVIDUAL':
      return <IndividualDashboard />;
    default:
      return <IndividualDashboard />;
  }
}