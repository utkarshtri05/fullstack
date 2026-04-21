import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-5 p-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-5 md:grid-cols-3">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
