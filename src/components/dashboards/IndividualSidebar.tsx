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
import { X } from 'lucide-react'
import { 
  BookOpen, 
  Calendar,
  CreditCard,
  Heart,
  FileText,
  Shield,
  Home
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
    title: "Payments", 
    url: "/individual-dashboard", 
    icon: CreditCard,
    param: "payments"
  },
  { 
    title: "Wellness Check", 
    url: "/individual-dashboard", 
    icon: Heart,
    param: "mood"
  },
  { 
    title: "Assessment", 
    url: "/individual-dashboard", 
    icon: FileText,
    param: "questionnaire"
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
      className="border-r data-[state=expanded]:w-64 data-[state=collapsed]:w-16 transition-all duration-300"
      collapsible="icon"
    >
      {/* Mobile header with close button */}
      <SidebarHeader className="flex flex-row items-center justify-between p-4 border-b lg:hidden">
        <span className="font-semibold text-sm">Menu</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setOpenMobile(false)} 
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="pt-2 lg:pt-4">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Individual Learning
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => {
                const active = isActive(item.param)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={active}
                      className="w-full justify-start"
                    >
                      <NavLink
                        to={`${item.url}?tab=${item.param}`}
                        onClick={handleItemClick}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate font-medium">{item.title}</span>
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