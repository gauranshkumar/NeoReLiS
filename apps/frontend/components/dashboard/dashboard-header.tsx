"use client";

import { NotificationBell } from "@/components/dashboard/notification-bell";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 right-0 left-64 z-30 h-16 border-b border-[#262626] bg-[#0A0A0A]/80 backdrop-blur-sm flex items-center justify-end px-6 gap-3">
      <NotificationBell />
    </header>
  );
}
