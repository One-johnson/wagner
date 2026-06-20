import type { LucideIcon } from "lucide-react";
import {
  ArrowLeftRight,
  ClipboardList,
  FileBarChart,
  LayoutDashboard,
  LogOut as LogOutIcon,
  Users,
  Wrench,
} from "lucide-react";

export type AdminNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/tools", label: "Tools", icon: Wrench },
  { href: "/admin/technicians", label: "Technicians", icon: Users },
  { href: "/admin/checkouts", label: "Check-outs", icon: LogOutIcon },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/reports", label: "Reports", icon: FileBarChart },
  { href: "/admin/categories", label: "Categories", icon: ClipboardList },
];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin/dashboard") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
