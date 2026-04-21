import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithPassword } from "@/modules/auth/server";

export const metadata = {
  title: "Admin Login"
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  async function handleLogin(formData: FormData) {
    "use server";

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      await signInWithPassword({ email, password });
      redirect("/admin");
    } catch {
      redirect("/admin/login?error=invalid");
    }
  }

  return (
    <main className="mesh-bg flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-center text-2xl font-bold">Admin Login</CardTitle>
          <CardDescription className="text-center">Secure access to the control panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {params.error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              Invalid email or password.
            </div>
          ) : null}
          <form action={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required className="h-11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required className="h-11" />
            </div>
            <Button type="submit" className="w-full h-11">
              Sign in
            </Button>
          </form>
          <div className="border-t pt-4 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:underline">
              Back to app
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
