import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, FileText, Edit, X } from "lucide-react";

interface AppointmentCardProps {
  appointment: any;
  showActions?: boolean;
}

export default function AppointmentCard({ appointment, showActions = false }: AppointmentCardProps) {
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

  const handleViewAgreement = () => {
    // In production, this would open the DocuSign document
    window.open(`https://demo.docusign.net/Signing/${appointment.docusignEnvelopeId}`, '_blank');
  };

  const handleReschedule = () => {
    // In production, this would open a reschedule modal
    console.log('Reschedule appointment:', appointment.id);
  };

  const handleCancel = () => {
    // In production, this would show a confirmation dialog and call API
    console.log('Cancel appointment:', appointment.id);
  };

  return (
    <Card className="mb-8" data-testid="card-appointment-details">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="text-primary mr-3" />
          Your Upcoming Appointment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium text-card-foreground" data-testid="text-appointment-date">
                {new Date(appointment.preferredDate).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium text-card-foreground" data-testid="text-appointment-time">
                {appointment.preferredTime || 'To be confirmed'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <Badge className={getStatusColor(appointment.status)} data-testid="badge-appointment-status">
                {appointment.status}
              </Badge>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service ID:</span>
              <span className="font-medium text-card-foreground" data-testid="text-service-id">
                {appointment.id}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment:</span>
              <span className={`font-medium ${appointment.paymentStatus === 'paid' ? 'text-secondary' : 'text-accent'}`} data-testid="text-payment-status">
                {appointment.paymentStatus} (${appointment.paymentAmount})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreement:</span>
              {appointment.docusignEnvelopeId ? (
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary hover:underline p-0 h-auto"
                  onClick={handleViewAgreement}
                  data-testid="button-view-agreement"
                >
                  <FileText className="mr-1 h-3 w-3" />
                  View Agreement
                </Button>
              ) : (
                <span className="text-muted-foreground text-sm">Pending</span>
              )}
            </div>
          </div>
        </div>
        
        {showActions && (
          <div className="mt-6 flex space-x-4">
            <Button
              variant="outline"
              onClick={handleReschedule}
              disabled={appointment.status !== 'pending' && appointment.status !== 'confirmed'}
              data-testid="button-reschedule-appointment"
            >
              <Edit className="mr-2 h-4 w-4" />
              Reschedule
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={appointment.status === 'completed' || appointment.status === 'cancelled'}
              data-testid="button-cancel-appointment"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
