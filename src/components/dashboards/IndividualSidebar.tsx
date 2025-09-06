import { NavLink, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X } from 'lucide-react'
import { 
  BookOpen, 
  Calendar,
  CreditCard,
  Heart,
  Shield,
  Home,
  MessageSquare,
  ClipboardList
} from 'lucide-react'

const menuItems = [
  { 
    title: "Dashboard", 
    url: "/individual-dashboard", 
    icon: Home,
    param: "programs"
  },
  { 
    title: "My Bookings", 
    url: "/individual-dashboard", 
    icon: Calendar,
    param: "bookings"
  },
  { 
    title: "Wellness Check", 
    url: "/individual-dashboard", 
    icon: Heart,
    param: "mood"
  },
  { 
    title: "Chat", 
    url: "/individual-dashboard", 
    icon: MessageSquare,
    param: "chat"
  },
  { 
    title: "Assignments", 
    url: "/individual-dashboard", 
    icon: ClipboardList,
    param: "assignments"
  },
  { 
    title: "Privacy", 
    url: "/individual-dashboard", 
    icon: Shield,
    param: "privacy"
  },
]

export function IndividualSidebar() {
  const { state, isMobile, setOpenMobile, openMobile } = useSidebar()
  const location = useLocation()
  const currentParam = new URLSearchParams(location.search).get('tab') || 'programs'

  const isActive = (param: string) => currentParam === param
  const isCollapsed = state === "collapsed"

  const handleItemClick = () => {
    if (isMobile && openMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar
      className="border-r bg-background/95 backdrop-blur-sm md:static md:w-48 lg:w-56"
      collapsible="icon"
      variant="sidebar"
      side="left"
    >
      {/* Mobile/Tablet header with close button */}
      <SidebarHeader className="flex flex-row items-center justify-between p-3 sm:p-4 border-b bg-background/95 lg:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <div>
            <span className="font-semibold text-sm truncate">Individual Learning</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs mt-1 block sm:hidden">
              Individual Learner  
            </Badge>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => {
            setOpenMobile(false);
          }} 
          className="h-8 w-8 p-0 hover:bg-muted shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </SidebarHeader>

      {/* Desktop header - hidden on mobile */}
      <SidebarHeader className="hidden lg:block p-2 border-b bg-background/95">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-base">Individual Learning</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="pt-1 bg-background/95">
        <SidebarGroup>
          <SidebarGroupLabel className={`px-2 py-1 text-sm font-medium ${isCollapsed ? "sr-only" : ""}`}>
            Individual Learning
          </SidebarGroupLabel>
          
          <SidebarGroupContent className="px-1">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.param)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={active}
                      className="w-full justify-start hover:bg-accent/50 data-[active=true]:bg-accent data-[active=true]:text-accent-foreground"
                    >
                      <NavLink
                        to={`${item.url}?tab=${item.param}`}
                        onClick={handleItemClick}
                        className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-sm lg:text-base min-h-[40px] ${
                          active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                        }`}
                      >
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className={`truncate ${isCollapsed ? "hidden" : ""}`}>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}