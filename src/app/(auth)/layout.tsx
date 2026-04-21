export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="mesh-bg grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
