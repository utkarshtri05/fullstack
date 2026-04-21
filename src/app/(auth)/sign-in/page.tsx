import { Suspense } from "react";
import { AuthForm } from "@/modules/auth/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Sign in"
};

export default function SignInPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AuthForm mode="sign-in" />
    </Suspense>
  );
}
