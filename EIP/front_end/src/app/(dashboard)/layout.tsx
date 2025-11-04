"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/NavBar/NavBar";
import Loading from "@/components/Loading/Loading";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loadingAuth, checkAuthStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  useEffect(() => {
    if (!loadingAuth && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loadingAuth, router]);

  if (loadingAuth) {
    return <Loading />;
  }

  if (isAuthenticated) {
    return <Navbar>{children}</Navbar>;
  }

  return null;
}
