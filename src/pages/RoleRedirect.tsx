import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

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

export default function RoleRedirect() {
  const { user, userProfile, profileReady } = useAuth();

  useEffect(() => {
    if (!user) return; // ProtectedRoute will handle redirect to /auth
    if (!profileReady) return;

    const target = getRoleDashboardUrl(userProfile?.role || 'INDIVIDUAL');
    // Use hard redirect to avoid flicker and enforce correct route
    window.location.replace(target);
  }, [user, userProfile, profileReady]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  );
}
