import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, Users, Calendar, Wrench, CreditCard, Shield, GraduationCap, BarChart3, Coins, FileText, ShieldCheck, X, UserCheck, Clock, HelpCircle, MessageSquare } from 'lucide-react';

const menuItems = [{
  title: 'Dashboard',
  url: '/individual-dashboard',
  icon: LayoutDashboard,
  roles: ['ADMIN', 'HR', 'COACH', 'INDIVIDUAL'],
  getRoleUrl: (role: string) => {
    switch (role) {
      case 'ADMIN':
        return '/admin-dashboard';
      case 'HR':
        return '/hr-dashboard';
      case 'COACH':
        return '/coach-dashboard';
      case 'INDIVIDUAL':
        return '/individual-dashboard';
      default:
        return '/individual-dashboard';
    }
  }
}, {
  title: 'Catalog',
  url: '/catalog',
  icon: BookOpen,
  roles: ['ADMIN', 'HR', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Coaching',
  url: '/coaching',
  icon: GraduationCap,
  roles: ['ADMIN', 'HR', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Webinars',
  url: '/webinars',
  icon: Calendar,
  roles: ['ADMIN', 'HR', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Tools',
  url: '/tools',
  icon: Wrench,
  roles: ['ADMIN', 'HR', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Team',
  url: '/team',
  icon: Users,
  roles: ['ADMIN', 'HR']
}, {
  title: 'Billing',
  url: '/billing',
  icon: CreditCard,
  roles: ['ADMIN', 'HR']
}, {
  title: 'Organizations',
  url: '/admin/organizations',
  icon: Shield,
  roles: ['ADMIN']
}];

const adminMenuItems = [{
  title: 'Dashboard',
  url: '/admin-dashboard',
  icon: LayoutDashboard,
  roles: ['ADMIN']
}, {
  title: 'Organizations',
  url: '/admin/organizations',
  icon: Shield,
  roles: ['ADMIN']
}, {
  title: 'Coaches',
  url: '/admin/coaches',
  icon: UserCheck,
  roles: ['ADMIN']
}, {
  title: 'Demo Requests',
  url: '/admin-dashboard?tab=demo-requests',
  icon: MessageSquare,
  roles: ['ADMIN']
}, {
  title: 'Credits Engine',
  url: '/admin-dashboard?tab=credits',
  icon: Coins,
  roles: ['ADMIN']
}, {
  title: 'Content CMS',
  url: '/admin-dashboard?tab=content',
  icon: FileText,
  roles: ['ADMIN']
}, {
  title: 'Analytics',
  url: '/admin-dashboard?tab=analytics',
  icon: BarChart3,
  roles: ['ADMIN']
}, {
  title: 'Security Audit',
  url: '/admin-dashboard?tab=security',
  icon: ShieldCheck,
  roles: ['ADMIN']
}, {
  title: 'Support',
  url: '/admin-dashboard?tab=support',
  icon: HelpCircle,
  roles: ['ADMIN']
}];

const coachMenuItems = [{
  title: 'Dashboard',
  url: '/coach-dashboard',
  icon: LayoutDashboard,
  roles: ['COACH']
}, {
  title: 'Assignments',
  url: '/coach-dashboard?tab=assignments',
  icon: MessageSquare,
  roles: ['COACH']
}, {
  title: 'Chat',
  url: '/coach-dashboard?tab=chat',
  icon: MessageSquare,
  roles: ['COACH']
}, {
  title: 'Sessions',
  url: '/coach-dashboard?tab=sessions',
  icon: Calendar,
  roles: ['COACH']
}, {
  title: 'Availability',
  url: '/coach-dashboard?tab=availability',
  icon: Clock,
  roles: ['COACH']
}, {
  title: 'Support',
  url: '/coach-dashboard?tab=support',
  icon: HelpCircle,
  roles: ['COACH']
}];

const hrMenuItems = [{
  title: 'Overview',
  url: '/hr-dashboard',
  icon: LayoutDashboard,
  roles: ['HR']
}, {
  title: 'People',
  url: '/hr-dashboard/people',
  icon: Users,
  roles: ['HR']
}, {
  title: 'Credits',
  url: '/hr-dashboard/credits',
  icon: CreditCard,
  roles: ['HR']
}, {
  title: 'Webinars',
  url: '/webinars',
  icon: Calendar,
  roles: ['HR']
}, {
  title: 'Calendar',
  url: '/hr-dashboard/calendar',
  icon: Clock,
  roles: ['HR']
}, {
  title: 'Insights',
  url: '/hr-dashboard/insights',
  icon: BarChart3,
  roles: ['HR']
}, {
  title: 'Invoices',
  url: '/hr-dashboard/invoices',
  icon: FileText,
  roles: ['HR']
}, {
  title: 'Support',
  url: '/hr-dashboard/support',
  icon: HelpCircle,
  roles: ['HR']
}];

export const Sidebar = () => {
  const {
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    state
  } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userProfile
  } = useAuth();
  const currentPath = location.pathname;
  const currentSearch = location.search;
  
  const isActive = (path: string) => {
    if (path.includes('?')) {
      return currentPath + currentSearch === path;
    }
    return currentPath === path;
  };

  // Filter menu items based on user role - use specific menus for admin, hr and coach users
  const currentMenuItems = userProfile?.role === 'ADMIN' ? adminMenuItems : 
                           userProfile?.role === 'HR' ? hrMenuItems :
                           userProfile?.role === 'COACH' ? coachMenuItems : menuItems;
  const filteredMenuItems = currentMenuItems.filter(item => userProfile ? hasRole(userProfile, item.roles) : false);
  
  const isCollapsed = state === 'collapsed';
  
  const handleNavClick = (url: string) => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
    navigate(url);
  };
  
  return (
    <SidebarComponent 
      collapsible="icon" 
      className="border-r bg-background h-screen sticky top-0"
    >
      <SidebarContent className="overflow-y-auto">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {filteredMenuItems.map(item => {
                const itemUrl = (item as any).getRoleUrl && userProfile ? (item as any).getRoleUrl(userProfile.role) : item.url;
                const active = isActive(itemUrl);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavClick(itemUrl)} 
                      isActive={active} 
                      className="w-full justify-start"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};