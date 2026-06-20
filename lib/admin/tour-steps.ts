import type { BeforeHook, Step } from "react-joyride";
import { ADMIN_NAV_ITEMS } from "@/lib/admin/admin-nav";
import { tourNavId, waitForElement } from "@/lib/admin/tour-utils";

function goTo(
  navigate: (path: string) => Promise<void>,
  path: string,
  waitSelector?: string
): BeforeHook {
  return async () => {
    await navigate(path);
    await waitForElement(waitSelector ?? "[data-tour='page-content']");
  };
}

function getNavDescription(href: string): string {
  switch (href) {
    case "/admin/dashboard":
      return "Your home base — live stats, charts, and recent activity.";
    case "/admin/tools":
      return "Manage the full tool inventory with asset tags and statuses.";
    case "/admin/technicians":
      return "Register workshop staff who borrow tools.";
    case "/admin/checkouts":
      return "See what's checked out, lend tools, and process returns.";
    case "/admin/transactions":
      return "Full audit log of every check-out and return.";
    case "/admin/reports":
      return "Who has what, overdue tools, and utilization.";
    case "/admin/categories":
      return "Organize tools into categories like Power Tools or Hand Tools.";
    default:
      return "Navigate to this section.";
  }
}

function getPageDescription(href: string): string {
  switch (href) {
    case "/admin/dashboard":
      return "The dashboard updates in real time as tools move in and out of the shop.";
    case "/admin/tools":
      return "Search, filter, and manage tools in the table. Use dialogs to add or edit.";
    case "/admin/technicians":
      return "Keep technician records current for accurate check-out tracking.";
    case "/admin/checkouts":
      return "All active loans appear here until a return is recorded.";
    case "/admin/transactions":
      return "Filter by date and export CSV for compliance or reporting.";
    case "/admin/reports":
      return "Spot overdue items and see utilization across the fleet.";
    case "/admin/categories":
      return "Create categories first, then assign them when adding tools.";
    default:
      return "This is where you manage this part of the system.";
  }
}

function pageSteps(
  navigate: (path: string) => Promise<void>,
  href: string
): Step[] {
  const segment = href.split("/").filter(Boolean).pop() ?? "home";
  const pageTarget = `[data-tour='page-${segment}']`;

  const base: Step = {
    target: pageTarget,
    title: `${ADMIN_NAV_ITEMS.find((i) => i.href === href)?.label ?? "Page"} workspace`,
    content: getPageDescription(href),
    placement: "bottom",
    skipBeacon: true,
    before: goTo(navigate, href, pageTarget),
    beforeTimeout: 8000,
  };

  switch (href) {
    case "/admin/dashboard":
      return [
        base,
        {
          target: "[data-tour='dashboard-stats']",
          title: "Live statistics",
          content:
            "Track total tools, availability, active check-outs, and overdue returns.",
          placement: "bottom",
          skipBeacon: true,
        },
        {
          target: "[data-tour='dashboard-charts']",
          title: "Visual insights",
          content: "Charts show inventory status and activity trends over time.",
          placement: "top",
          skipBeacon: true,
        },
        {
          target: "[data-tour='dashboard-checkout']",
          title: "Quick check-out",
          content: "Check out a tool directly from the dashboard without leaving the page.",
          placement: "left",
          skipBeacon: true,
        },
      ];
    case "/admin/tools":
      return [
        base,
        {
          target: "[data-tour='tools-add']",
          title: "Add tools",
          content: "Register new inventory through a dialog — name, asset tag, category, and more.",
          placement: "left",
          skipBeacon: true,
        },
        {
          target: "[data-tour='tools-table']",
          title: "Tool inventory table",
          content: "Edit or delete any tool from the row actions. Search and sort as your list grows.",
          placement: "top",
          skipBeacon: true,
        },
      ];
    case "/admin/technicians":
      return [
        base,
        {
          target: "[data-tour='technicians-add']",
          title: "Add technicians",
          content: "Each technician gets a unique employee code used during check-outs.",
          placement: "left",
          skipBeacon: true,
        },
      ];
    case "/admin/checkouts":
      return [
        base,
        {
          target: "[data-tour='checkouts-add']",
          title: "Check out a tool",
          content: "Pick an available tool and technician, set an optional due date, and confirm.",
          placement: "left",
          skipBeacon: true,
        },
        {
          target: "[data-tour='checkouts-table']",
          title: "Process returns",
          content: "Click Return on any row to mark a tool back in the shop.",
          placement: "top",
          skipBeacon: true,
        },
      ];
    case "/admin/transactions":
      return [
        base,
        {
          target: "[data-tour='transactions-table']",
          title: "Audit trail",
          content: "Every check-out and return is logged here with timestamps and notes.",
          placement: "top",
          skipBeacon: true,
        },
      ];
    case "/admin/reports":
      return [
        base,
        {
          target: "[data-tour='reports-summary']",
          title: "Utilization & overdue",
          content: "See who has what, export CSV, and monitor overdue returns.",
          placement: "top",
          skipBeacon: true,
        },
      ];
    case "/admin/categories":
      return [
        base,
        {
          target: "[data-tour='categories-list']",
          title: "Category list",
          content: "Add categories via dialog and remove unused ones when safe.",
          placement: "top",
          skipBeacon: true,
        },
      ];
    default:
      return [base];
  }
}

export function createAdminTourSteps(
  navigate: (path: string) => Promise<void>
): Step[] {
  const sectionSteps = ADMIN_NAV_ITEMS.flatMap((item) => {
    const navId = tourNavId(item.href);
    return [
      {
        target: `[data-tour='${navId}']`,
        title: item.label,
        content: getNavDescription(item.href),
        placement: "right" as const,
        skipBeacon: true,
      },
      ...pageSteps(navigate, item.href),
    ];
  });

  return [
    {
      target: "[data-tour='sidebar-brand']",
      title: "Welcome to Wagner Tools",
      content:
        "This tour covers the entire system. We'll walk through every section step by step.",
      placement: "right",
      skipBeacon: true,
      before: goTo(navigate, "/admin/dashboard"),
    },
    {
      target: "[data-tour='sidebar-nav']",
      title: "Main navigation",
      content: "The sidebar is your hub for all management areas. Let's explore each one.",
      placement: "right",
      skipBeacon: true,
    },
    ...sectionSteps,
    {
      target: "[data-tour='user-profile']",
      title: "Your profile",
      content: "Switch theme (light, dark, system) or sign out from here.",
      placement: "right",
      skipBeacon: true,
    },
    {
      target: "[data-tour='tour-trigger']",
      title: "Replay anytime",
      content: "Click Take tour whenever you need a refresher.",
      placement: "bottom",
      skipBeacon: true,
    },
    {
      target: "[data-tour='page-content']",
      title: "You're all set!",
      content:
        "Add categories, tools, and technicians — then record your first check-out. Happy tracking!",
      placement: "center",
      skipBeacon: true,
    },
  ];
}
