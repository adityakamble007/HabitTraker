"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { LayoutDashboard, ChartColumnBig, History } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton"; // Make sure you have this

const items = [
  { title: "Home", url: "/", icon: LayoutDashboard },
  { title: "Analytics", url: "/analytics", icon: ChartColumnBig },
  { title: "History", url: "/history", icon: History },
];

export function AppSidebar() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk(); // <-- Import signOut from Clerk

  return (
    <Sidebar>
      <SidebarContent>
        {/* User Info Section */}
        <div className="flex items-center gap-3 p-4 border-b">
          {!isLoaded ? (
            <>
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </>
          ) : user ? (
            <>
              <img
                src={user.imageUrl}
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <div className="flex flex-col">
                <span className="font-medium">{user.fullName}</span>
                <span className="text-sm text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </span>
              </div>
            </>
          ) : null}
        </div>

        {/* Sidebar Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className="flex items-center gap-2 hover:underline"
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Sign Out Button */}
        <div className="mt-auto p-4">
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-black text-white hover:bg-black/90 px-4 py-2 text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
