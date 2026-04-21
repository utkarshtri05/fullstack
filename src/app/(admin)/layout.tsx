import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { AdminSidebar } from '@/modules/admin/components/admin-sidebar';
import { getCurrentUser } from '@/modules/auth/server';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getCurrentUser();

  if (!context) {
    redirect('/admin/login');
  }

  if (context.profile.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <AppShell context={context}>
      <div className="flex min-h-screen">
        <AdminSidebar user={{ name: context.profile.name, avatarUrl: context.profile.avatarUrl || undefined }} />
        <main className="flex-1 p-8 md:ml-0 ml-0 md:p-12">
          {children}
        </main>
      </div>
    </AppShell>
  );
}

