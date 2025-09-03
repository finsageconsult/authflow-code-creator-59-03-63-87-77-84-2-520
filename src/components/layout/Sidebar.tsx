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
  GraduationCap
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'HR', 'EMPLOYEE', 'COACH', 'INDIVIDUAL']
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

export const Sidebar = () => {
  const { state } = useSidebar();
  const location = useLocation();
  const { userProfile } = useAuth();

  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;

  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-accent/50';

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => 
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
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};