"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export function AdminPanelLink() {
  return (
    <Button asChild size="lg" className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg h-11">
      <Link href="/admin/login">
        <Shield className="mr-2 size-4" />
        Admin Panel
      </Link>
    </Button>
  );
}

