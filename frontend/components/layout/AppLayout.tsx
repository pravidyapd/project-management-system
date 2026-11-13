
"use client";

import { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {mounted && <Sidebar />}

      <main className="min-h-screen w-full bg-background px-4 pb-6 pt-24 text-foreground sm:px-6 lg:px-8">
        <div className="page-enter mx-auto w-full max-w-[1600px]">
          {children}
        </div>
      </main>
    </div>
  );
}
