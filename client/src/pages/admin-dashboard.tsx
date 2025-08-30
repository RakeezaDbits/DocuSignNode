import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Calendar, Clock, CheckCircle, DollarSign, Users, TrendingUp, Eye, Edit, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Redirect if not authenticated or not admin
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
    
    if (!isLoading && isAuthenticated && !(user as any)?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Admin access required",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const { data: stats } = useQuery<any>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated && (user as any)?.isAdmin,
  });

  const { data: appointments } = useQuery<any[]>({
    queryKey: ["/api/admin/appointments"],
    enabled: isAuthenticated && (user as any)?.isAdmin,
  });

  if (isLoading || !isAuthenticated || !(user as any)?.isAdmin) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-secondary/10 text-secondary';
      case 'pending':
        return 'bg-accent/10 text-accent';
      case 'completed':
        return 'bg-primary/10 text-primary';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive';
      default:
        return 'bg-muted/10 text-muted-foreground';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-secondary';
      case 'pending':
        return 'text-accent';
      case 'failed':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="text-primary text-2xl mr-3" />
              <span className="text-xl font-bold text-foreground">GuardPortal Admin</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {(user as any)?.firstName || 'Admin'}
              </span>
              <Button
                variant="ghost"
                onClick={() => window.location.href = '/home'}
                data-testid="button-home"
              >
                Home
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => window.location.href = '/api/logout'}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage appointments and monitor system performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="card-total-appointments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Appointments</p>
                  <p className="text-2xl font-bold text-card-foreground">{(stats as any)?.total || 0}</p>
                </div>
                <Calendar className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-pending-appointments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-accent">{(stats as any)?.pending || 0}</p>
                </div>
                <Clock className="text-accent text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-confirmed-appointments">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Confirmed</p>
                  <p className="text-2xl font-bold text-secondary">{(stats as any)?.confirmed || 0}</p>
                </div>
                <CheckCircle className="text-secondary text-2xl" />
              </div>
            </CardContent>
          </Card>
          
          <Card data-testid="card-revenue">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-card-foreground">
                    ${(stats as any)?.revenue?.toLocaleString() || '0'}
                  </p>
                </div>
                <DollarSign className="text-primary text-2xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments Table */}
        <Card data-testid="card-appointments-table">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Appointments</CardTitle>
              <div className="flex space-x-2">
                <select className="px-3 py-2 rounded-lg border border-input bg-background text-foreground text-sm">
                  <option>All Status</option>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                </select>
                <Button size="sm" data-testid="button-add-appointment">
                  Add Appointment
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Client</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(appointments as any[])?.map((appointment: any) => (
                    <tr key={appointment.id} className="hover:bg-muted/30" data-testid={`row-appointment-${appointment.id}`}>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-card-foreground">{appointment.fullName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-card-foreground">
                        {new Date(appointment.preferredDate).toLocaleDateString()} {appointment.preferredTime}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-card-foreground">
                          ${appointment.paymentAmount}
                        </span>
                        <p className={`text-xs ${getPaymentStatusColor(appointment.paymentStatus)}`}>
                          {appointment.paymentStatus}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:text-primary/80"
                            data-testid={`button-view-${appointment.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground"
                            data-testid={`button-edit-${appointment.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-destructive hover:text-destructive/80"
                            data-testid={`button-delete-${appointment.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
