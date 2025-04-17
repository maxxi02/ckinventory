import { MdDashboard } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { MdInventory } from "react-icons/md"; // For Products icon
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import LogoHeader from "./LogoHeader";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <LogoHeader />
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard">
                    <MdDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Products with collapsible sub-items */}
              <SidebarMenuItem>
                <Collapsible>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <MdInventory />
                      <span>Products</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <Link href="/products/add">Add Product</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href="/products/list">View Products</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href="/products/edit">Edit Products</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href="/products/delete">Delete Products</Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Settings item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <IoMdSettings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
