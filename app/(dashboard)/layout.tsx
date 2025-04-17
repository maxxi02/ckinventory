import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        <AppSidebar />
        <div className="w-full relative">
          <div>
            <SidebarTrigger size={"lg"} className="cursor-pointer" />
          </div>
          <main className="w-full m-1.5 overflow-x-hidden">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default layout;
