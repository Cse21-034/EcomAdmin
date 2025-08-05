import React, { createContext, ReactNode, useContext, useEffect } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { authClient, User, LoginData, RegisterData, AuthResponse } from "../lib/authClient";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  loginMutation: UseMutationResult<AuthResponse, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<AuthResponse, Error, RegisterData>;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null>({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      if (!authClient.isAuthenticated()) {
        return null;
      }
      try {
        return await authClient.getCurrentUser();
      } catch (error) {
        console.error("Failed to get current user:", error);
        return null;
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const loginMutation = useMutation({
    mutationFn: authClient.login.bind(authClient),
    onSuccess: (response: AuthResponse) => {
      if (response.requiresApproval) {
        toast({
          title: "Registration successful",
          description: "Your supplier account is pending admin approval.",
        });
      } else {
        queryClient.setQueryData(["auth", "user"], response.user);
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.firstName || response.user.email}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authClient.register.bind(authClient),
    onSuccess: (response: AuthResponse) => {
      if (response.requiresApproval) {
        toast({
          title: "Registration successful",
          description: "Your supplier account is pending admin approval. You'll receive access once approved.",
        });
      } else {
        queryClient.setQueryData(["auth", "user"], response.user);
        toast({
          title: "Registration successful",
          description: `Welcome to our platform, ${response.user.firstName || response.user.email}!`,
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authClient.logout.bind(authClient),
    onSuccess: () => {
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear(); // Clear all cached data
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      // Still clear local state even if server logout fails
      queryClient.setQueryData(["auth", "user"], null);
      queryClient.clear();
      toast({
        title: "Logout completed",
        description: "You have been logged out.",
      });
    },
  });

  // Refetch user data when token changes
  useEffect(() => {
    if (authClient.isAuthenticated() && !user) {
      refetch();
    }
  }, [authClient.isAuthenticated(), user, refetch]);

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        isAuthenticated: authClient.isAuthenticated(),
        loginMutation,
        logoutMutation,
        registerMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}