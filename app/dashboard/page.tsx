"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, UserCog, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardRolePage() {
  const router = useRouter();

  const roles = [
    {
      name: "Owner",
      icon: ShieldCheck,
      color: "text-purple-600",
      path: "/dashboard/login_owner",
    },
    {
      name: "Admin",
      icon: UserCog,
      color: "text-blue-600",
      path: "/dashboard/login_admin",
    },
    {
      name: "Kasir",
      icon: Store,
      color: "text-green-600",
      path: "/dashboard/login_kasir",
    },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <Card className="w-full max-w-xl shadow-xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Pilih Akses Dashboard
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {roles.map((role) => (
            <Button
              key={role.name}
              variant="outline"
              className="h-32 flex flex-col items-center justify-center gap-3 hover:shadow-lg transition-all"
              onClick={() => router.push(role.path)}
            >
              <role.icon size={36} className={role.color} />
              <span className="font-semibold">{role.name}</span>
            </Button>
          ))}
        </CardContent>
      </Card>
    </main>
  );
}
