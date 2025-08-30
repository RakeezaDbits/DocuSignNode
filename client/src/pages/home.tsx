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
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-foreground">GuardPortal</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span className="text-sm text-muted-foreground">
                    Welcome, {(user as any)?.firstName || 'User'}
                  </span>
                  <Button
                    variant="ghost"
                    onClick={() => window.location.href = '/api/logout'}
                    data-testid="button-logout"
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">
                      Login
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="outline">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your property protection services</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <Card data-testid="card-quick-actions">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard">
                <Button variant="outline" className="w-full justify-start" data-testid="button-view-appointments">
                  <Calendar className="mr-2 h-4 w-4" />
                  View My Appointments
                </Button>
              </Link>
              
              {(user as any)?.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-admin-panel">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin Panel
                  </Button>
                </Link>
              )}
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/'}
                data-testid="button-book-new"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Book New Appointment
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
          <Card data-testid="card-protection-status">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2" />
                Protection Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <div className="text-center p-4 bg-secondary/10 rounded-lg">
                  <Shield className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Property Monitoring</p>
                  <p className="font-semibold text-secondary">Active</p>
                </div>
                
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Title Protection</p>
                  <p className="font-semibold text-primary">Active</p>
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
