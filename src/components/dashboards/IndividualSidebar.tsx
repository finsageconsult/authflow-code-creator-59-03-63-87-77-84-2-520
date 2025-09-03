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
      className="border-r bg-background md:translate-x-0 lg:translate-x-0"
      collapsible="icon"
      variant="sidebar"
    >
      {/* Mobile/Tablet header with close button */}
      <SidebarHeader className="flex flex-row items-center justify-between p-4 border-b bg-background xl:hidden">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">Individual Learning</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setOpenMobile(false)} 
          className="h-8 w-8 p-0 hover:bg-muted"
        >
          <X className="h-4 w-4" />
        </Button>
      </SidebarHeader>
      
      <SidebarContent className="pt-2 md:pt-4 bg-background">
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
                        className={({ isActive: linkActive }) => 
                          `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm md:text-base ${
                            active ? "bg-accent text-accent-foreground font-medium" : "hover:bg-accent/50"
                          }`
                        }
                      >
                        <item.icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
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