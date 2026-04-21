import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireAdmin } from "@/modules/auth/server";
import { listAdminUsers } from "@/modules/admin/service";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Admin Users"
};

export default async function AdminUsersPage() {
  const context = await requireAdmin();
  const users = await listAdminUsers();

  return (
    <AppShell context={context}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Users</h1>
          <p className="mt-2 text-muted-foreground">Subscription status, profile role, and account creation history.</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
            <CardDescription>{users.length} accounts in the current workspace.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name ?? "Unknown"}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "secondary" : "outline"}>{user.role ?? "user"}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscriptionStatus === "active" ? "success" : "outline"}>
                        {user.subscriptionStatus ?? "none"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
