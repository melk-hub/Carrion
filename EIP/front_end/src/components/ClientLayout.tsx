"use client";

import React, { useState } from "react";
import Navbar from "@/components/NavBar";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { setIsAuthenticated } = useAuth();

  return (
    <>
      <Navbar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        setIsAuthenticated={setIsAuthenticated}
      />
      <main>{children}</main>
    </>
  );
}
