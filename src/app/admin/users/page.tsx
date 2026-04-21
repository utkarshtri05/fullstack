

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrentUser } from '@/modules/auth/server';
import { requireAdmin } from '@/modules/auth/server';
import { useAppStore } from '@/lib/store';
import { AppShell } from '@/components/app-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';

export default async function AdminUsersPage() {
  const context = await requireAdmin();
  
  // Mock data for demo - replace with real service
  const users = [
    { id: '1', profile: { name: 'Utkarsh', role: 'admin' }, user: { email: 'utkarsh@gmail.com', createdAt: new Date() }, subscription: { status: 'active' } }
  ];
  
  return (
    <AppShell context={context}>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">View, search, edit, and manage all users</p>
          </div>
          <Button>
            <Plus className="mr-2 size-4" />
            Add User
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">All Users ({users.length})</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input placeholder="Search users..." className="pl-10" />
              </div>
            </div>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.profile.name}</TableCell>
                    <TableCell>{user.user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.profile.role === 'admin' ? 'secondary' : 'outline'}>
                        {user.profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription ? 'default' : 'outline'}>
                        {user.subscription?.status || 'None'}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(user.user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/users/${user.user.id}/edit`}>
                            Edit
                          </Link>
                        </Button>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
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

async function getAllUsers() {
  // Implementation using service
  const users = await db.select().from(users).leftJoin(profiles, eq(users.id, profiles.userId)).leftJoin(subscriptions, eq(users.id, subscriptions.userId));
  return users;
}

