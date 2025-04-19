import { MdDashboard } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { MdInventory } from "react-icons/md"; // For Products icon
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getServerSession } from "@/lib/action";
import SignoutItem from "@/app/(dashboard)/(user-settings)/_components/SignoutItem";

export async function AppSidebar() {
  const session = await getServerSession();
  const profile = session?.user?.image;
  const name = session?.user.name;
  const email = session?.user.email;
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
                      <span>Product Actions</span>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <Link href="/product/add">Add Product</Link>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <Link href="/product/view">View Product</Link>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarMenuItem>

              {/* Logout */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div>
                    <SignoutItem />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Settings */}
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
      <SidebarFooter>
        <div className="flex items-center justify-start gap-2">
          <Avatar>
            <AvatarImage
              className="cursor-pointer w-10 h-10 object-cover"
              src={profile ? profile : "https://github.com/shadcn.png"}
            />
            <AvatarFallback>
              {/* MAP THE INITIALS */}
              {name
                ?.split(" ")
                .map((part) => part.charAt(0).toUpperCase())
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start justify-start text-sm opacity-90">
            <span>{name}</span>
            <span>{email}</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
