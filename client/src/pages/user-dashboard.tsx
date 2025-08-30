import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, FileText, Bell, Edit, X } from "lucide-react";
import AppointmentCard from "@/components/appointment-card";

export default function UserDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: appointments } = useQuery<any[]>({
    queryKey: ["/api/appointments/my"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const upcomingAppointment = (appointments as any[])?.find(
    (apt: any) => apt.status !== 'completed' && apt.status !== 'cancelled'
  );

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
              <span className="text-sm text-muted-foreground">
                Welcome, {(user as any)?.firstName || 'User'}
              </span>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/home'}
                data-testid="button-home"
              >
                Home
              </Button>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your appointments and protection services</p>
        </div>

        {/* Current Appointment */}
        {upcomingAppointment && (
          <AppointmentCard 
            appointment={upcomingAppointment} 
            showActions 
            data-testid="card-current-appointment"
          />
        )}

        {/* Protection Status */}
        <Card className="mb-8" data-testid="card-protection-status">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-3 text-secondary" />
              Protection Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-secondary/10 rounded-lg">
                <Shield className="h-8 w-8 text-secondary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Property Monitoring</p>
                <p className="font-semibold text-secondary">Active</p>
              </div>
              
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Title Protection</p>
                <p className="font-semibold text-primary">Active</p>
              </div>
              
              <div className="text-center p-4 bg-accent/10 rounded-lg">
                <Bell className="h-8 w-8 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Alert System</p>
                <p className="font-semibold text-accent">Enabled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Appointments */}
        <Card data-testid="card-all-appointments">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-3" />
              Appointment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(appointments as any[])?.length ? (
              <div className="space-y-4">
                {(appointments as any[]).map((appointment: any) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium text-card-foreground">
                            {new Date(appointment.preferredDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {appointment.preferredTime || 'Time TBD'}
                          </p>
                        </div>
                        <Badge className={`${
                          appointment.status === 'confirmed' ? 'bg-secondary/10 text-secondary' :
                          appointment.status === 'pending' ? 'bg-accent/10 text-accent' :
                          appointment.status === 'completed' ? 'bg-primary/10 text-primary' :
                          'bg-destructive/10 text-destructive'
                        }`}>
                          {appointment.status}
                        </Badge>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Service ID: {appointment.id}</span>
                        <span>${appointment.paymentAmount}</span>
                        <span className={appointment.paymentStatus === 'paid' ? 'text-secondary' : 'text-accent'}>
                          {appointment.paymentStatus}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      {appointment.docusignEnvelopeId && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-view-agreement-${appointment.id}`}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          Agreement
                        </Button>
                      )}
                      {appointment.status === 'pending' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="outline"
                            data-testid={`button-reschedule-${appointment.id}`}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Reschedule
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            data-testid={`button-cancel-${appointment.id}`}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Appointments Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't scheduled any appointments. Get started with a free security audit.
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  data-testid="button-schedule-first"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Your First Audit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
