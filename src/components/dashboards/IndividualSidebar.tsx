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
  useSidebar,
} from "@/components/ui/sidebar"
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
  const { state } = useSidebar()
  const location = useLocation()
  const currentParam = new URLSearchParams(location.search).get('tab') || 'programs'

  const isActive = (param: string) => currentParam === param

  return (
    <Sidebar
      className={state === "collapsed" ? "w-14" : "w-60"}
      collapsible="icon"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={state === "collapsed" ? "sr-only" : ""}>
            Individual Learning
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`${item.url}?tab=${item.param}`}
                      className={({ isActive: linkActive }) => 
                        isActive(item.param) 
                          ? "bg-muted text-primary font-medium" 
                          : "hover:bg-muted/50"
                      }
                    >
                      <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />
                      {state !== "collapsed" && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}