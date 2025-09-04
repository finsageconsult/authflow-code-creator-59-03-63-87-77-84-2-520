import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LayoutDashboard, BookOpen, Users, Calendar, Wrench, CreditCard, Shield, GraduationCap, BarChart3, Coins, FileText, ShieldCheck, X, UserCheck, Clock, HelpCircle } from 'lucide-react';
const menuItems = [{
  title: 'Dashboard',
  url: '/individual-dashboard',
  icon: LayoutDashboard,
  roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL'],
  getRoleUrl: (role: string) => {
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
        return '/individual-dashboard';
      default:
        return '/individual-dashboard';
    }
  }
}, {
  title: 'Catalog',
  url: '/catalog',
  icon: BookOpen,
  roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Coaching',
  url: '/coaching',
  icon: GraduationCap,
  roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Webinars',
  url: '/webinars',
  icon: Calendar,
  roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Tools',
  url: '/tools',
  icon: Wrench,
  roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
}, {
  title: 'Support',
  url: '/employee-dashboard?tab=support',
  icon: HelpCircle,
  roles: ['EMPLOYEE']
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
  title: 'Analytics',
  url: '/coach-dashboard?tab=analytics',
  icon: BarChart3,
  roles: ['COACH']
}, {
  title: 'Sessions',
  url: '/coach-dashboard?tab=sessions',
  icon: Calendar,
  roles: ['COACH']
}, {
  title: 'Clients',
  url: '/coach-dashboard?tab=clients',
  icon: UserCheck,
  roles: ['COACH']
}, {
  title: 'Content',
  url: '/coach-dashboard?tab=content',
  icon: FileText,
  roles: ['COACH']
}, {
  title: 'Availability',
  url: '/coach-dashboard?tab=availability',
  icon: Clock,
  roles: ['COACH']
}, {
  title: 'Payouts',
  url: '/coach-dashboard?tab=payouts',
  icon: Coins,
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
  title: 'Calendar',
  url: '/hr-dashboard/calendar',
  icon: Calendar,
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
    state,
    setOpenMobile,
    isMobile,
    openMobile
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
  const isExpanded = state === 'expanded';
  
  const handleNavClick = (url: string) => {
    if (isMobile && openMobile) {
      setOpenMobile(false);
    }
    navigate(url);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && openMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fade-in" 
          onClick={() => setOpenMobile(false)}
        />
      )}
      
      <SidebarComponent 
        collapsible="icon" 
        className={`
          border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95
          transition-all duration-300 ease-in-out z-50
          ${isMobile 
            ? `fixed left-0 top-0 h-screen shadow-xl ${openMobile ? 'translate-x-0' : '-translate-x-full'}` 
            : 'fixed left-0 top-0 h-screen'
          }
          ${isExpanded ? 'w-64' : 'w-16'}
          ${isExpanded ? 'animate-slide-in-right' : ''}
        `}
      >
        {/* Mobile header with close button */}
        {isMobile && (
          <SidebarHeader className="flex flex-row items-center justify-between p-4 border-b">
            <span className="font-semibold text-sm">Menu</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setOpenMobile(false)} 
              className="h-8 w-8 p-0 hover-scale"
            >
              <X className="h-4 w-4" />
            </Button>
          </SidebarHeader>
        )}
        
        <SidebarContent className="overflow-y-auto pt-4">
          <SidebarGroup>
            <SidebarGroupLabel className={isCollapsed && !isMobile ? 'sr-only' : 'px-4 pb-2'}>
              Navigation
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-2">
                {filteredMenuItems.map(item => {
                  const itemUrl = (item as any).getRoleUrl && userProfile ? (item as any).getRoleUrl(userProfile.role) : item.url;
                  const active = isActive(itemUrl);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        onClick={() => handleNavClick(itemUrl)} 
                        isActive={active} 
                        className={`
                          w-full justify-start transition-all duration-200 hover-scale
                          ${active 
                            ? 'bg-primary text-primary-foreground shadow-sm' 
                            : 'hover:bg-accent/50'
                          }
                          ${isCollapsed && !isMobile ? 'justify-center px-2' : 'justify-start px-3'}
                        `}
                        tooltip={isCollapsed && !isMobile ? item.title : undefined}
                      >
                        <item.icon className={`h-4 w-4 ${active ? 'text-primary-foreground' : ''}`} />
                        {(!isCollapsed || isMobile) && (
                          <span className="truncate ml-3 animate-fade-in">{item.title}</span>
                        )}
                        {active && isCollapsed && !isMobile && (
                          <div className="absolute left-full ml-2 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </SidebarComponent>
    </>
  );
};