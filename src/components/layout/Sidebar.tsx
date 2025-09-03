import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { hasRole } from '@/lib/auth';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Calendar,
  Wrench,
  CreditCard,
  Shield,
  GraduationCap,
  BarChart3,
  Coins,
  FileText,
  ShieldCheck
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/individual-dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL'],
    getRoleUrl: (role: string) => {
      switch(role) {
        case 'ADMIN': return '/admin-dashboard';
        case 'HR': return '/hr-dashboard';
        case 'EMPLOYEE': return '/employee-dashboard';
        case 'COACH': return '/coach-dashboard';
        case 'INDIVIDUAL': return '/individual-dashboard';
        default: return '/individual-dashboard';
      }
    }
  },
  {
    title: 'Catalog',
    url: '/catalog',
    icon: BookOpen,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
  },
  {
    title: 'Coaching',
    url: '/coaching',
    icon: GraduationCap,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
  },
  {
    title: 'Webinars',
    url: '/webinars',
    icon: Calendar,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
  },
  {
    title: 'Tools',
    url: '/tools',
    icon: Wrench,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
  },
  {
    title: 'Team',
    url: '/team',
    icon: Users,
    roles: ['ADMIN', 'HR']
  },
  {
    title: 'Billing',
    url: '/billing',
    icon: CreditCard,
    roles: ['ADMIN', 'HR']
  },
  {
    title: 'Organizations',
    url: '/admin/organizations',
    icon: Shield,
    roles: ['ADMIN']
  }
];

const adminMenuItems = [
  {
    title: 'Dashboard',
    url: '/admin-dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN']
  },
  {
    title: 'Analytics',
    url: '/admin-dashboard?tab=analytics',
    icon: BarChart3,
    roles: ['ADMIN']
  },
  {
    title: 'Credits Engine',
    url: '/admin-dashboard?tab=credits',
    icon: Coins,
    roles: ['ADMIN']
  },
  {
    title: 'Content CMS',
    url: '/admin-dashboard?tab=content',
    icon: FileText,
    roles: ['ADMIN']
  },
  {
    title: 'Security Audit',
    url: '/admin-dashboard?tab=security',
    icon: ShieldCheck,
    roles: ['ADMIN']
  },
  {
    title: 'Organizations',
    url: '/admin/organizations',
    icon: Shield,
    roles: ['ADMIN']
  }
];

export const Sidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { userProfile } = useAuth();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  // Filter menu items based on user role - use admin menu for admin users
  const currentMenuItems = userProfile?.role === 'ADMIN' ? adminMenuItems : menuItems;
  const filteredMenuItems = currentMenuItems.filter(item => 
    userProfile ? hasRole(userProfile, item.roles) : false
  );

  const isCollapsed = state === 'collapsed';

  return (
    <SidebarComponent
      className={isCollapsed ? 'w-14' : 'w-64'}
      collapsible="icon"
    >
      <SidebarContent className="pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const itemUrl = (item as any).getRoleUrl && userProfile ? (item as any).getRoleUrl(userProfile.role) : item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={itemUrl} 
                        end 
                        className={getNavCls}
                      >
                        <item.icon className="h-4 w-4" />
                        {!isCollapsed && <span>{item.title}</span>}
                      </NavLink>
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