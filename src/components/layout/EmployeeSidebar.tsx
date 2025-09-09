import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar as SidebarComponent, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/useAuth';
import { LayoutDashboard, TrendingUp, CreditCard, HelpCircle, Wrench, Calendar, BookOpen, MessageSquare, ClipboardList } from 'lucide-react';

const employeeMenuItems = [
  {
    title: 'Dashboard',
    url: '/employee-dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Programs',
    url: '/employee-dashboard?tab=programs',
    icon: BookOpen,
  },
  {
    title: 'My Credits',
    url: '/employee-dashboard?tab=credits',
    icon: CreditCard,
  },
  {
    title: 'Chat',
    url: '/employee-dashboard?tab=chat',
    icon: MessageSquare,
  },
  {
    title: 'Assignments',
    url: '/employee-dashboard?tab=assignments',
    icon: ClipboardList,
  },
  {
    title: 'Webinars',
    url: '/webinars',
    icon: Calendar,
  },
  {
    title: 'Support',
    url: '/employee-dashboard?tab=support',
    icon: HelpCircle,
  },
  {
    title: 'Tools',
    url: '/tools',
    icon: Wrench,
  },
];

export const EmployeeSidebar = () => {
  const { state, isMobile, setOpenMobile, openMobile } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const currentPath = location.pathname;
  const currentSearch = location.search;
  
  const isActive = (path: string) => {
    if (path.includes('?')) {
      const [pathPart, queryPart] = path.split('?');
      return currentPath === pathPart && currentSearch.includes(queryPart);
    }
    return currentPath === path && !currentSearch;
  };

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
        <div className="p-2">
          <SidebarTrigger className="mb-2" />
        </div>
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? 'sr-only' : ''}>
            Finsage
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {employeeMenuItems.map(item => {
                const active = isActive(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      onClick={() => handleNavClick(item.url)} 
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