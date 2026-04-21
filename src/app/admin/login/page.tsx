import { redirect } from 'next/navigation';
import { signInWithPassword } from '@/modules/auth/server';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
export const metadata = {
  title: 'Admin Login'
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const sp = await searchParams;
  async function handleLogin(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    
    try {
      await signInWithPassword({ email, password });
      redirect('/admin');
    } catch (error) {
      console.error('Admin login failed:', error);
      redirect('/admin/login?error=invalid');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
{sp.error && (
            <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-sm text-destructive-foreground mb-4">
              Invalid email or password. Please try again.
            </div>
          )}
          <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
            Admin Login
          </CardTitle>
          <CardDescription className="text-center">
            Secure access to admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="utkarsh@gmail.com"
                required 
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                name="password" 
                type="password" 
                placeholder="utkarsh@12345" 
                required 
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11 bg-orange-600 hover:bg-orange-700">
              Sign in
            </Button>
          </form>
          
          <div className="text-xs text-center text-muted-foreground pt-4 border-t">
            <Link href="/" className="hover:underline">← Back to app</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

