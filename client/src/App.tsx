import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Home from "@/pages/home";
import SupplierDashboard from "@/pages/supplier-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ 
  component: Component, 
  allowedRoles 
}: { 
  component: () => JSX.Element;
  allowedRoles?: string[];
}) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <Component />;
}

function Router() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/auth">
        <AuthPage />
      </Route>
      
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      
      <Route path="/supplier-dashboard">
        <ProtectedRoute 
          component={SupplierDashboard} 
          allowedRoles={["supplier", "admin"]} 
        />
      </Route>
      
      <Route path="/admin-dashboard">
        <ProtectedRoute 
          component={AdminDashboard} 
          allowedRoles={["admin"]} 
        />
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
