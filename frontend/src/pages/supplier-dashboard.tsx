import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Bell,
  LogOut,
  Search,
  TrendingUp,
  BarChart3
} from "lucide-react";

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  comparePrice: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().min(0, "Quantity must be 0 or greater"),
  categoryId: z.number().optional(),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function SupplierDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Redirect if not authenticated or not a supplier
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user && (user as any)?.role !== 'supplier'))) {
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

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      shortDescription: "",
      price: "",
      comparePrice: "",
      sku: "",
      quantity: 0,
      featured: false,
      active: true,
    },
  });

  // Fetch supplier stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/supplier/stats"],
    enabled: !!user && (user as any)?.role === 'supplier',
    retry: false,
  });

  // Fetch supplier products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/supplier/products"],
    enabled: !!user && (user as any)?.role === 'supplier',
    retry: false,
  });

  // Fetch categories for product form
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    retry: false,
  });

  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const endpoint = editingProduct 
        ? `/api/supplier/products/${editingProduct.id}`
        : '/api/supplier/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      return await apiRequest(method, endpoint, {
        ...data,
        price: parseFloat(data.price),
        comparePrice: data.comparePrice ? parseFloat(data.comparePrice) : undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/stats"] });
      setIsProductDialogOpen(false);
      setEditingProduct(null);
      form.reset();
      toast({
        title: "Success",
        description: `Product ${editingProduct ? 'updated' : 'created'} successfully`,
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
        description: `Failed to ${editingProduct ? 'update' : 'create'} product`,
        variant: "destructive",
      });
    },
  });

  // Delete product mutation
  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      return await apiRequest('DELETE', `/api/supplier/products/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/supplier/stats"] });
      toast({
        title: "Success",
        description: "Product deleted successfully",
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
        description: "Failed to delete product",
        variant: "destructive",
      });
    },
  });

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      slug: product.slug,
      description: product.description || "",
      shortDescription: product.shortDescription || "",
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || "",
      sku: product.sku || "",
      quantity: product.quantity,
      categoryId: product.categoryId,
      featured: product.featured,
      active: product.active,
    });
    setIsProductDialogOpen(true);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    form.reset();
    setIsProductDialogOpen(true);
  };

  const onSubmit = (data: ProductFormData) => {
    productMutation.mutate(data);
  };

  const filteredProducts = (products as any)?.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && product.active) ||
      (statusFilter === "inactive" && !product.active) ||
      (statusFilter === "out-of-stock" && product.quantity === 0);
    return matchesSearch && matchesStatus;
  }) || [];

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center" data-testid="loading-supplier">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center justify-center h-16 bg-primary text-white" data-testid="sidebar-logo">
            <Store className="text-2xl mr-3" />
            <h1 className="text-xl font-bold">Supplier Portal</h1>
          </div>
          
          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <a href="#" className="flex items-center px-4 py-3 text-gray-700 bg-blue-50 rounded-lg" data-testid="nav-dashboard">
              <BarChart3 className="mr-3 text-primary" />
              <span className="font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-products">
              <Package className="mr-3" />
              <span>My Products</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-orders">
              <ShoppingCart className="mr-3" />
              <span>Orders</span>
            </a>
            <a href="#" className="flex items-center px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" data-testid="nav-analytics">
              <TrendingUp className="mr-3" />
              <span>Analytics</span>
            </a>
          </nav>
          
          {/* User Info */}
          <div className="px-4 py-4 border-t">
            <div className="flex items-center">
              {(user as any)?.profileImageUrl && (
                <img 
                  src={(user as any)?.profileImageUrl} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full object-cover"
                  data-testid="img-profile"
                />
              )}
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900" data-testid="text-user-name">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </p>
                <p className="text-xs text-gray-500">Supplier</p>
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
              <h2 className="text-2xl font-bold text-gray-900" data-testid="text-page-title">Supplier Dashboard</h2>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-600 relative" data-testid="button-notifications">
                  <Bell className="text-xl" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
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
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-total-products">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">My Products</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : (stats as any)?.totalProducts || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Package className="text-2xl text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-orders-received">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Orders Received</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : (stats as any)?.totalOrders || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <ShoppingCart className="text-2xl text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-revenue">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : `$${(stats as any)?.totalRevenue || 0}`}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-2xl text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card data-testid="card-low-stock">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {statsLoading ? "..." : (stats as any)?.lowStockProducts || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="text-2xl text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
            <Card data-testid="card-quick-actions">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={handleNewProduct}
                  data-testid="button-add-product"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-bulk-edit">
                  <Edit className="mr-2 h-4 w-4" />
                  Bulk Edit Products
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity placeholder */}
            <Card className="lg:col-span-3" data-testid="card-recent-activity">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 text-center py-8">No recent activity to display</p>
              </CardContent>
            </Card>
          </div>

          {/* Products Table */}
          <Card data-testid="card-products-table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>My Products</CardTitle>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Input
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                      data-testid="input-search-products"
                    />
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48" data-testid="select-status-filter">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {productsLoading ? (
                <div className="text-center py-8" data-testid="loading-products">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8" data-testid="empty-products">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No products found. Add your first product to get started.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((product: any) => (
                      <TableRow key={product.id} data-testid={`row-product-${product.id}`}>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-sm text-gray-500">{product.slug}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.sku || '-'}</TableCell>
                        <TableCell>${product.price}</TableCell>
                        <TableCell>
                          <span className={product.quantity <= (product.lowStockThreshold || 5) ? "text-red-600" : ""}>
                            {product.quantity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.active ? "default" : "secondary"}>
                            {product.active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              data-testid={`button-view-${product.id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEditProduct(product)}
                              data-testid={`button-edit-${product.id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => deleteMutation.mutate(product.id)}
                              disabled={deleteMutation.isPending}
                              data-testid={`button-delete-${product.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="sm:max-w-[425px]" data-testid="dialog-product">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update your product information.' : 'Add a new product to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-product-slug" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" step="0.01" data-testid="input-product-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number" 
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-product-quantity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} data-testid="textarea-product-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={productMutation.isPending}
                  data-testid="button-save-product"
                >
                  {productMutation.isPending ? 'Saving...' : 'Save Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
