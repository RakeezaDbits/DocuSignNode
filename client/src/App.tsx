import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import AdminDashboard from "@/pages/admin-dashboard";
import UserDashboard from "@/pages/user-dashboard";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {/* Main landing page */}
      <Route path="/" component={Landing} />
      
      {/* Public routes - available without authentication */}
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* User home/dashboard - requires authentication */}
      <Route path="/home">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        ) : !isAuthenticated ? (
          <Login />
        ) : (
          <Home />
        )}
      </Route>

      {/* Protected dashboard route - requires authentication */}
      <Route path="/dashboard">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        ) : !isAuthenticated ? (
          <Login />
        ) : user?.isAdmin ? (
          <AdminDashboard />
        ) : (
          <UserDashboard />
        )}
      </Route>

      {/* Admin route */}
      <Route path="/admin">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            Loading...
          </div>
        ) : !isAuthenticated ? (
          <Login />
        ) : (
          <AdminDashboard />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
