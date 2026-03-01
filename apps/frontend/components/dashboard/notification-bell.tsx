"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, Trash2, Loader2, Users, FolderPlus, Save } from "lucide-react";
import { notificationApi, Notification } from "@/lib/api";
import { useAuth } from "@/lib/hooks/use-auth";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const POLL_INTERVAL = 30_000; // 30 seconds

const typeIcons: Record<string, React.ReactNode> = {
  PROJECT_CREATED: <FolderPlus className="w-4 h-4 text-green-400" />,
  DRAFT_SAVED: <Save className="w-4 h-4 text-yellow-400" />,
  PROJECT_MEMBER_ADDED: <Users className="w-4 h-4 text-cyan-500" />,
  PROJECT_MEMBER_REMOVED: <Users className="w-4 h-4 text-red-400" />,
  PROJECT_ROLE_CHANGED: <Users className="w-4 h-4 text-purple-400" />,
};

function timeAgo(dateStr: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Poll for unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await notificationApi.unreadCount();
    if (res.data) {
      setUnreadCount(res.data.unreadCount);
    }
  }, [isAuthenticated]);

  // Fetch full list when dropdown opens
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const res = await notificationApi.list({ limit: 20 });
    if (res.data) {
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    }
    setIsLoading(false);
  }, [isAuthenticated]);

  // Poll unread count on interval
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchUnreadCount]);

  // Fetch when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleMarkAsRead = async (id: string) => {
    await notificationApi.markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const handleDelete = async (id: string, wasUnread: boolean) => {
    await notificationApi.delete(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "relative flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
          open
            ? "bg-[#1A1D21] text-cyan-500"
            : "text-gray-400 hover:text-white hover:bg-[#1A1D21]"
        )}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-4.5 h-4.5 rounded-full bg-cyan-500 text-black text-[10px] font-bold px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-[#1A1D21] border border-[#262626] rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#262626]">
            <h3 className="text-sm font-semibold text-white">{t("title")}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1.5 text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-500" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                <p className="text-sm text-gray-500">{t("noNotificationsYet")}</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "group flex gap-3 px-4 py-3 border-b border-[#1f1f1f] transition-colors hover:bg-[#262626]/50",
                    !n.read && "bg-cyan-500/5"
                  )}
                >
                  {/* Icon */}
                  <div className="shrink-0 mt-0.5">
                    {typeIcons[n.type] || (
                      <Bell className="w-4 h-4 text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn(
                        "text-sm leading-snug",
                        n.read ? "text-gray-400" : "text-white"
                      )}
                    >
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-600 mt-1">
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="p-1 text-gray-500 hover:text-cyan-500 transition-colors"
                        title={t("markAsRead")}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id, !n.read)}
                      className="p-1 text-gray-500 hover:text-red-400 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
