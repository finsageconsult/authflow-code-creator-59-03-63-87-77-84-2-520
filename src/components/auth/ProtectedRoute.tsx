import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: Array<'ADMIN' | 'HR' | 'EMPLOYEE' | 'COACH' | 'INDIVIDUAL'>;
}

const getRoleDashboardUrl = (role: string) => {
  switch (role) {
    case 'ADMIN':
      return '/admin-dashboard';
    case 'HR':
      return '/hr-dashboard';
    case 'EMPLOYEE':
      return '/employee-dashboard';
    case 'COACH':
      return '/coach-dashboard';
    case 'INDIVIDUAL':
    default:
      return '/individual-dashboard';
  }
};

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, userProfile, loading, profileReady } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Not logged in -> send to auth
  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  // Role protection
  if (allowedRoles) {
    // wait until profile is ready to evaluate roles
    if (!profileReady) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    // If profile is missing after ready, send to individual's dashboard
    if (!userProfile) {
      return <Navigate to="/individual-dashboard" replace />;
    }

    // If roles are specified and user doesn't have access -> redirect to their own dashboard
    if (!allowedRoles.includes(userProfile.role)) {
      const redirect = getRoleDashboardUrl(userProfile.role);
      return <Navigate to={redirect} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
