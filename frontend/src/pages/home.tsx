import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!authLoading && user) {
      // Redirect based on user role
      if ((user as any)?.role === 'admin') {
        setLocation('/admin-dashboard');
      } else if ((user as any)?.role === 'supplier') {
        setLocation('/supplier-dashboard');
      } else {
        // For customers or other roles, you might want to redirect to a different page
        setLocation('/');
      }
    }
  }, [user, authLoading, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-home">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" data-testid="redirecting-home">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Redirecting to your dashboard...</p>
      </div>
    </div>
  );
}
