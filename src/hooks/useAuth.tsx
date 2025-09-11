import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, Organization, getCurrentUserProfile, getUserOrganization } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  organization: Organization | null;
  loading: boolean; // auth state readiness
  profileReady: boolean; // profile fetched and ready for role checks
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileReady, setProfileReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getRoleDashboardUrl = (role: string) => {
    switch(role) {
      case 'ADMIN': return '/admin-dashboard';
      case 'HR': return '/hr-dashboard';
      case 'EMPLOYEE': return '/employee-dashboard';
      case 'COACH': return '/coach-dashboard';
      case 'INDIVIDUAL': return '/individual-dashboard';
      default: return '/individual-dashboard';
    }
  };

  const refreshProfile = async () => {
    if (!session?.user) return;
    setProfileReady(false);
    
    try {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
      
      if (profile?.organization_id) {
        const org = await getUserOrganization(profile.organization_id);
        setOrganization(org);
      } else {
        setOrganization(null);
      }

      // Auto-redirect to role-specific dashboard after login
      const authPaths = ['/auth', '/auth/individual', '/auth/employee', '/auth/employer'];
      if (location.pathname === '/' || authPaths.includes(location.pathname) || location.pathname === '/dashboard' || location.pathname === '/role-redirect') {
        const dashboardUrl = profile ? getRoleDashboardUrl(profile.role) : '/individual-dashboard';
        console.log(`Initial redirect: ${profile?.role} -> ${dashboardUrl}`);
        navigate(dashboardUrl, { replace: true });
      } else if (profile) {
        // Check if user is on wrong dashboard for their role
        const correctDashboard = getRoleDashboardUrl(profile.role);
        const currentPath = location.pathname;
        
        // List of dashboard paths
        const dashboardPaths = ['/admin-dashboard', '/hr-dashboard', '/employee-dashboard', '/coach-dashboard', '/individual-dashboard'];
        
        // If user is on a dashboard but it's not the correct one for their role, redirect immediately
        if (dashboardPaths.includes(currentPath) && currentPath !== correctDashboard) {
          console.log(`Security redirect: ${profile.role} from ${currentPath} to ${correctDashboard}`);
          window.location.href = correctDashboard; // Force immediate redirect for security
        }
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setProfileReady(true);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid auth state change conflicts
          setTimeout(async () => {
            await refreshProfile();
          }, 0);
        } else {
          setUserProfile(null);
          setOrganization(null);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          await refreshProfile();
        }, 0);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update profile when session changes
  useEffect(() => {
    if (session?.user && !userProfile) {
      refreshProfile();
    }
  }, [session, userProfile]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      organization,
      loading,
      profileReady,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};