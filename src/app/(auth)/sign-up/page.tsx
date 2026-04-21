import { Suspense } from "react";
import { AuthForm } from "@/modules/auth/components/auth-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Create account"
};

export default function SignUpPage() {
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <AuthForm mode="sign-up" />
    </Suspense>
  );
}
