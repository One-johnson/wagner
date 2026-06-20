import { redirect } from "next/navigation";
import { SessionProvider } from "@/components/auth/session-provider";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";
import {
  getServerSessionUser,
  getSessionTokenFromCookies,
} from "@/lib/auth/session-server";
import type { AdminUser } from "@/lib/auth/types";

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getSessionTokenFromCookies();
  const user = await getServerSessionUser();

  if (!token) redirect("/login");
  if (!user) redirect("/api/auth/clear-session");

  const adminUser: AdminUser = {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role,
  };

  return (
    <SessionProvider initialUser={adminUser} initialToken={token}>
      <AdminShell user={adminUser}>{children}</AdminShell>
      <Toaster />
    </SessionProvider>
  );
}
