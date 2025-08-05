import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, TrendingUp, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-8 w-8 text-primary" data-testid="logo-icon" />
            <h1 className="text-2xl font-bold text-gray-900" data-testid="app-title">E-Commerce Platform</h1>
          </div>
          <Button onClick={() => window.location.href = '/api/login'} data-testid="button-login">
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6" data-testid="text-hero-title">
            Welcome to Your E-Commerce Hub
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto" data-testid="text-hero-description">
            Join our platform as a supplier to manage your products and grow your business, 
            or access admin tools to oversee the entire marketplace.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="text-lg px-8 py-4"
            data-testid="button-get-started"
          >
            Get Started
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card data-testid="card-supplier-tools">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary" />
                <span>Supplier Tools</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Manage your product catalog, track inventory, and monitor sales performance with our comprehensive supplier dashboard.
              </CardDescription>
            </CardContent>
          </Card>

          <Card data-testid="card-admin-control">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-6 w-6 text-primary" />
                <span>Admin Control</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete platform oversight with user management, order tracking, and comprehensive analytics for administrators.
              </CardDescription>
            </CardContent>
          </Card>

          <Card data-testid="card-analytics">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-6 w-6 text-primary" />
                <span>Analytics & Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Make data-driven decisions with detailed analytics, performance metrics, and business intelligence tools.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white rounded-lg shadow-lg p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4" data-testid="text-cta-title">
            Ready to Start?
          </h3>
          <p className="text-lg text-gray-600 mb-8" data-testid="text-cta-description">
            Sign in to access your personalized dashboard and start managing your business today.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-sign-in-cta"
          >
            Sign In Now
          </Button>
        </div>
      </main>
    </div>
  );
}
