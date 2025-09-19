import React from "react";
import {
  Shield,
  Upload,
  Database,
  MessageSquare,
  FileText,
  Home,
  Search,
  Settings2,
  User,
} from "lucide-react";

import { NavMain } from "@/components/blocks/Dashboard/NavMain";
import { NavProjects } from "@/components/blocks/Dashboard/NavProjects";
import { NavUser } from "@/components/blocks/Dashboard/NavUser";
import { TeamSwitcher } from "@/components/blocks/Dashboard/TeamSwitcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AppSidebar({ currentScreen, setCurrentScreen, ...props }) {
  const data = {
    user: {
      name: "Officer Smith",
      email: "officer.smith@forensics.gov",
      avatar: "/avatars/officer.jpg",
    },
    teams: [
      {
        name: "Digital Forensics Unit",
        logo: Shield,
        plan: "Investigation",
      },
    ],
    navMain: [
      {
        title: "Investigation Workflow",
        url: "#",
        icon: Home,
        isActive: true,
        items: [
          {
            title: "Welcome",
            url: "#",
            onClick: () => setCurrentScreen("welcome"),
            isActive: currentScreen === "welcome",
          },
          {
            title: "Upload UFDR",
            url: "#",
            onClick: () => setCurrentScreen("upload"),
            isActive: currentScreen === "upload",
          },
          {
            title: "Data Structure",
            url: "#",
            onClick: () => setCurrentScreen("structure"),
            isActive: currentScreen === "structure",
          },
          {
            title: "Query Data",
            url: "#",
            onClick: () => setCurrentScreen("query"),
            isActive: currentScreen === "query",
          },
          {
            title: "Summary Report",
            url: "#",
            onClick: () => setCurrentScreen("summary"),
            isActive: currentScreen === "summary",
          },
        ],
      },
      {
        title: "Tools",
        url: "#",
        icon: Search,
        items: [
          { title: "Advanced Search", url: "#" },
          { title: "Pattern Analysis", url: "#" },
          { title: "Timeline View", url: "#" },
          { title: "Network Analysis", url: "#" },
        ],
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
        items: [
          { title: "Preferences", url: "#" },
          { title: "Security", url: "#" },
          { title: "Export Options", url: "#" },
          { title: "Audit Log", url: "#" },
        ],
      },
    ],
    projects: [
      { name: "Case #2024-001", url: "#", icon: FileText },
      { name: "Case #2024-002", url: "#", icon: FileText },
      { name: "Case #2024-003", url: "#", icon: FileText },
    ],
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-full">
          <NavMain items={data.navMain} />
          <NavProjects projects={data.projects} />
        </ScrollArea>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
