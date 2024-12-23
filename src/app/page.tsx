"use client";

import dynamic from "next/dynamic";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

const Login = dynamic(() => import("@/components/Login"));

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <Login />
    </main>
  );
}
