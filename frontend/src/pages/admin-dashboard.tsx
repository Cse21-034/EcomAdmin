import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Users, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Store,
  Bell,
  LogOut,
  Search,
  BarChart3,
  Settings,
  Mail,
  TrendingUp,
  UserPlus,
  Eye,
  MoreVertical
} from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not authenticated or not an admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && (user as any)?.role !== 'admin'))) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, user, toast]);

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  // Fetch users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  // Fetch contact messages
  const { data: messages, isLoading: messagesLoading } = useQuery({
    queryKey: ["/api/admin/messages"],
    enabled: !!user && (user as any)?.role === 'admin',
    retry: false,
  });

  // Update message status mutation
  const updateMessageMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return await apiRequest('PUT', `/api/admin/messages/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Success",
        description: "Message status updated successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update message status",
        variant: "destructive",
      });
    },
  });

  const filteredUsers = users?.filter((user: any) => 
    (users as any)?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${(users as any)?.firstName} ${(users as any)?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const unreadMessages = messages?.filter((msg: any) => msg.status === 'unread') || [];

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center" data-testid="loading-admin">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-16 bg-secondary text-white" data-testid="sidebar-logo">
            <Shield className="text-2xl mr-3" />
            <h1 className="text-xl font-bold">Admin Portal</h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" className="flex items-center px-4 py-3 text-gray-700 bg-gray-100 rounded-lg" data-testid="nav-dashboard">
              <BarChart3 className="mr-3 text-secondary" />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-users">
              <Users className="mr-3" />
              <span>Users & Suppliers</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-products">
              <Package className="mr-3" />
              <span>All Products</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-orders">
              <ShoppingCart className="mr-3" />
              <span>Orders</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-messages">
              <Mail className="mr-3" />
              <span>Messages</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-analytics">
              <TrendingUp className="mr-3" />
              <span>Analytics</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-settings">
              <Settings className="mr-3" />
              <span>Settings</span>
            </a>
          </nav>
          
          {/* User Info */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center">
              {(users as any)?.profileImageUrl && (
                <img 
                  src={(users as any)?.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid="img-profile"
                />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                  {(users as any)?.firstName} {(users as any)?.lastName}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Admin Dashboard</h2>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative" data-testid="button-notifications">
                  <Bell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadMessages.length}
                  </span>
                </button>
                <button 
                  className="flex items-center text-gray-700 hover:text-gray-900"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-sign-out"
                >
                  <span className="mr-2">Sign Out</span>
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6">
          {/* System Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Card data-testid="card-total-users">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.totalUsers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-2xl text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-active-suppliers">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.activeSuppliers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Store className="text-2xl text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-total-products">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package className="text-2xl text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-total-orders">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : stats?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-2xl text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-total-revenue">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : `$${stats?.totalRevenue || 0}`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-2xl text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity and Top Suppliers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <Card data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                      <UserPlus className="text-white text-sm" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">New supplier registered</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 rounded-lg">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                      <Package className="text-white text-sm" />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">New product added</p>
                      <p className="text-xs text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Suppliers */}
            <Card data-testid="card-top-suppliers">
              <CardHeader>
                <CardTitle>Top Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersLoading ? (
                    <div className="text-center py-4">Loading suppliers...</div>
                  ) : (
                    users?.filter((user: any) => (user as any)?.role === 'supplier')
                      .slice(0, 3)
                      .map((supplier: any) => (
                        <div key={supplier.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Avatar>
                              <AvatarImage src={supplier.profileImageUrl} />
                              <AvatarFallback>
                                {supplier.firstName?.[0]}{supplier.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {supplier.firstName} {supplier.lastName}
                              </p>
                              <p className="text-xs text-gray-500">{supplier.productCount || 0} products</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">Revenue</p>
                            <p className="text-xs text-green-600">Active</p>
                          </div>
                        </div>
                      )) || []
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Management Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Users Management */}
            <Card data-testid="card-user-management">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>User Management</CardTitle>
                  <div className="relative">
                    <Input
                      placeholder="Search (users as any)?..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-48"
                      data-testid="input-search-users"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="text-center py-4" data-testid="loading-users">Loading (users as any)?...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-4" data-testid="empty-users">No users found</div>
                ) : (
                  <div className="space-y-4">
                    {filteredUsers.slice(0, 5).map((user: any) => (
                      <div key={(users as any)?.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg" data-testid={`user-item-${(users as any)?.id}`}>
                        <div className="flex items-center">
                          <Avatar>
                            <AvatarImage src={(users as any)?.profileImageUrl} />
                            <AvatarFallback>
                              {(users as any)?.firstName?.[0]}{(users as any)?.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {(users as any)?.firstName} {(users as any)?.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{(users as any)?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={(user as any)?.role === 'supplier' ? 'default' : 'secondary'}>
                            {(user as any)?.role}
                          </Badge>
                          <Button size="sm" variant="ghost" data-testid={`button-user-menu-${(users as any)?.id}`}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-users">
                    View All Users
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Messages */}
            <Card data-testid="card-contact-messages">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Contact Messages</CardTitle>
                  <Badge variant="destructive" data-testid="badge-unread-messages">
                    {unreadMessages.length} Unread
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {messagesLoading ? (
                  <div className="text-center py-4" data-testid="loading-messages">Loading (messages as any)?...</div>
                ) : messages?.length === 0 ? (
                  <div className="text-center py-4" data-testid="empty-messages">No messages found</div>
                ) : (
                  <div className="space-y-4">
                    {messages?.slice(0, 5).map((message: any) => (
                      <div 
                        key={(messages as any)?.id} 
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                        onClick={() => updateMessageMutation.mutate({ id: (messages as any)?.id, status: 'read' })}
                        data-testid={`message-item-${(messages as any)?.id}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className="text-sm font-medium text-gray-900">{(messages as any)?.name}</p>
                              {(messages as any)?.status === 'unread' && (
                                <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{(messages as any)?.subject}</p>
                            <p className="text-xs text-gray-500 mt-1 truncate">
                              {(messages as any)?.(messages as any)?.substring(0, 50)}...
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">
                            {new Date((messages as any)?.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )) || []}
                  </div>
                )}
                <div className="mt-4 text-center">
                  <Button variant="ghost" size="sm" data-testid="button-view-all-messages">
                    View All Messages
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
