import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Calendar, FileText, Settings } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: appointments } = useQuery<any[]>({
    queryKey: ["/api/appointments/my"],
    enabled: isAuthenticated, // Only fetch if user is authenticated
  });

  const upcomingAppointment = appointments?.[0];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="nav-glass border-b border-border/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center animate-fade-in">
              <div className="relative">
                <Shield className="text-primary text-3xl mr-3 floating-element" />
                <div className="absolute inset-0 text-primary text-3xl mr-3 pulse-glow opacity-50"></div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                GuardPortal
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full border border-primary/20">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">
                      Welcome, {(user as any)?.firstName || 'User'}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    className="hover:scale-105 transition-transform border-red-200 text-red-600 hover:bg-red-50"
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" className="hover:scale-105 transition-transform">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-105 transition-all">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Dashboard Header with gradient background */}
        <div className="mb-12 relative">
          <div className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-3xl p-8 border border-border/50">
            <div className="relative z-10">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 animate-fade-in">
                Dashboard
              </h1>
              <p className="text-xl text-muted-foreground animate-slide-up">
                Manage your property protection services and monitor your security status
              </p>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-secondary/10 rounded-full blur-lg"></div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card className="feature-card bg-gradient-to-br from-card to-card/80 border border-primary/20" data-testid="card-quick-actions">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center mr-3">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start h-12 text-left hover:scale-105 transition-all border-primary/30 hover:border-primary hover:bg-primary/5" data-testid="button-view-appointments">
                  <Calendar className="mr-3 h-5 w-5 text-primary" />
                  <span className="font-medium">View My Appointments</span>
                </Button>
              </Link>
              
              {(user as any)?.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start h-12 text-left hover:scale-105 transition-all border-secondary/30 hover:border-secondary hover:bg-secondary/5" data-testid="button-admin-panel">
                    <Shield className="mr-3 h-5 w-5 text-secondary" />
                    <span className="font-medium">Admin Panel</span>
                  </Button>
                </Link>
              )}
              
              <Button 
                className="w-full justify-start h-12 bg-gradient-to-r from-accent/80 to-accent hover:from-accent hover:to-accent/90 hover:scale-105 transition-all shadow-lg"
                onClick={() => window.location.href = '/'}
                data-testid="button-book-new"
              >
                <Calendar className="mr-3 h-5 w-5" />
                <span className="font-medium text-white">Book New Appointment</span>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Appointment */}
          {upcomingAppointment && (
            <Card data-testid="card-upcoming-appointment">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2" />
                  Upcoming Appointment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date:</span>
                    <span className="font-medium text-card-foreground">
                      {new Date(upcomingAppointment.preferredDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="font-medium text-card-foreground">
                      {upcomingAppointment.preferredTime || 'TBD'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      upcomingAppointment.status === 'confirmed' 
                        ? 'bg-secondary/10 text-secondary' 
                        : 'bg-accent/10 text-accent'
                    }`}>
                      {upcomingAppointment.status}
                    </span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Link href="/dashboard">
                    <Button size="sm" className="w-full" data-testid="button-view-details">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Protection Status */}
          <Card className="feature-card bg-gradient-to-br from-card to-card/80 border border-secondary/20" data-testid="card-protection-status">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center text-xl font-bold">
                <div className="w-10 h-10 bg-gradient-to-r from-secondary to-accent rounded-lg flex items-center justify-center mr-3">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl border border-secondary/30 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Property Monitoring</p>
                  <p className="font-bold text-secondary text-lg">🟢 Active</p>
                </div>
                
                <div className="text-center p-6 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl border border-primary/30 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 pulse-glow">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Title Protection</p>
                  <p className="font-bold text-primary text-lg">🟢 Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Welcome Message for New Users */}
        {(!appointments || appointments.length === 0) && (
          <Card className="mt-8" data-testid="card-welcome-message">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Shield className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Welcome to GuardPortal!</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't scheduled any appointments yet. Get started by booking your free security audit.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  data-testid="button-get-started"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Free Audit
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
