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
      {/* Public routes - available without authentication */}
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/landing" component={Landing} />

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

      {/* Home route - always shows home page */}
      <Route path="/" component={Home} />

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
