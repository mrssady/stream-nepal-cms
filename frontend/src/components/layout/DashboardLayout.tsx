"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar />

      <SidebarInset>
        <Topbar />

        <main className="flex-1 overflow-y-auto bg-muted/30">
          <div className="mx-auto w-full max-w-[1600px] p-6 lg:p-8">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}