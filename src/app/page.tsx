"use client";

import { AuthProvider } from "@/hooks/useAuth";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";

const queryClient = new QueryClient();

const page = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Index />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default page;
