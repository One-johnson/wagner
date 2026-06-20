"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { Bell, CheckCheck, X } from "lucide-react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAdminSession } from "@/components/auth/session-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function NotificationsMenu() {
  const router = useRouter();
  const { sessionToken } = useAdminSession();
  const notifications = useQuery(
    api.notifications.list,
    sessionToken ? { sessionToken, limit: 20 } : "skip"
  );
  const unread = useQuery(
    api.notifications.unreadCount,
    sessionToken ? { sessionToken } : "skip"
  );

  const markRead = useMutation(api.notifications.markRead);
  const markAllRead = useMutation(api.notifications.markAllRead);
  const dismiss = useMutation(api.notifications.dismiss);
  const dismissAll = useMutation(api.notifications.dismissAll);

  async function openNotification(
    notificationId: Id<"notifications">,
    href: string | null,
    readAt: number | null
  ) {
    if (!sessionToken) return;
    if (!readAt) await markRead({ sessionToken, notificationId });
    if (href) router.push(href);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            className="relative"
            aria-label="Notifications"
            data-tour="notifications"
          />
        }
      >
        <Bell className="size-4" />
        {unread ? (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-2 py-1.5">
            <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Mark all read"
                disabled={!unread}
                onClick={() => sessionToken && void markAllRead({ sessionToken })}
              >
                <CheckCheck className="size-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Dismiss all"
                disabled={!notifications?.length}
                onClick={() => sessionToken && void dismissAll({ sessionToken })}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {!notifications?.length ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications right now
          </p>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification._id}
              className="flex cursor-pointer items-start gap-2 p-3"
              onClick={() =>
                void openNotification(
                  notification._id,
                  notification.href,
                  notification.readAt
                )
              }
            >
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p
                    className={cn(
                      "truncate text-sm",
                      !notification.readAt && "font-semibold"
                    )}
                  >
                    {notification.title}
                  </p>
                  <Badge
                    variant={
                      notification.type === "overdue_checkout" ? "destructive" : "secondary"
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {notification.type === "overdue_checkout" ? "Overdue" : "Due soon"}
                  </Badge>
                </div>
                <p className="line-clamp-2 text-xs text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0"
                aria-label="Dismiss notification"
                onClick={(e) => {
                  e.stopPropagation();
                  if (sessionToken) {
                    void dismiss({ sessionToken, notificationId: notification._id });
                  }
                }}
              >
                <X className="size-3.5" />
              </Button>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem render={<Link href="/admin/reports" />}>
          View all reports
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
