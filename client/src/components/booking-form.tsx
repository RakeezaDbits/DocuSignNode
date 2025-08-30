import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import SquarePayment from "./square-payment";
import { insertAppointmentSchema } from "@shared/schema";
import { Calendar, Lock, CheckCircle, Clock } from "lucide-react";

type BookingStep = 'form' | 'payment' | 'confirmation';

interface BookingFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  preferredDate: Date;
  preferredTime?: string;
  isReady: boolean;
}

export default function BookingForm() {
  const [step, setStep] = useState<BookingStep>('form');
  const [appointmentData, setAppointmentData] = useState<any>(null);
  const [paymentSourceId, setPaymentSourceId] = useState<string>('');
  
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(insertAppointmentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      preferredDate: new Date(),
      preferredTime: '',
      isReady: false,
    },
  });

  const createAppointmentMutation = useMutation({
    mutationFn: async (data: BookingFormData & { paymentSourceId: string }) => {
      return await apiRequest('POST', '/api/appointments', data);
    },
    onSuccess: async (response) => {
      const result = await response.json();
      setAppointmentData(result.appointment);
      setStep('confirmation');
      queryClient.invalidateQueries({ queryKey: ['/api/appointments/my'] });
      toast({
        title: "Success!",
        description: result.message || "Appointment booked successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Authentication Required",
          description: "Please log in to book an appointment",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      
      toast({
        title: "Booking Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to book an appointment",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 1000);
      return;
    }

    setAppointmentData(data);
    setStep('payment');
  };

  const handlePaymentSuccess = (sourceId: string) => {
    setPaymentSourceId(sourceId);
    createAppointmentMutation.mutate({
      ...appointmentData,
      paymentSourceId: sourceId,
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <Card className="shadow-lg border border-border" data-testid="card-booking-form">
      <CardContent className="p-8">
        {step === 'form' && (
          <div data-testid="booking-step-form">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            {...field} 
                            data-testid="input-full-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your.email@example.com" 
                            {...field} 
                            data-testid="input-email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            placeholder="(555) 123-4567" 
                            {...field} 
                            data-testid="input-phone"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="preferredDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Date *</FormLabel>
                        <FormControl>
                          <Input 
                            type="date"
                            min={getMinDate()}
                            max={getMaxDate()}
                            {...field}
                            value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                            data-testid="input-preferred-date"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Address *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your complete property address" 
                          className="h-24 resize-none"
                          {...field} 
                          data-testid="textarea-address"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="preferredTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Time</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-preferred-time">
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="9:00 AM - 11:00 AM">9:00 AM - 11:00 AM</SelectItem>
                            <SelectItem value="11:00 AM - 1:00 PM">11:00 AM - 1:00 PM</SelectItem>
                            <SelectItem value="1:00 PM - 3:00 PM">1:00 PM - 3:00 PM</SelectItem>
                            <SelectItem value="3:00 PM - 5:00 PM">3:00 PM - 5:00 PM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="isReady"
                    render={({ field }) => (
                      <FormItem className="flex items-end space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-ready"
                          />
                        </FormControl>
                        <FormLabel className="text-sm">
                          I'm ready to proceed with the audit and protection service
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="bg-muted/50 rounded-lg p-6 border border-border">
                  <h4 className="font-semibold text-card-foreground mb-3">Service Investment:</h4>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-muted-foreground">First Month Service:</span>
                    <span className="font-semibold text-foreground">$100.00</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-muted-foreground">Audit & Setup Fee:</span>
                    <span className="font-semibold text-foreground">$125.00</span>
                  </div>
                  <div className="border-t border-border my-3"></div>
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-card-foreground">Total Today:</span>
                    <span className="text-primary">$225.00</span>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-primary text-primary-foreground py-4 text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-book-appointment"
                >
                  <Lock className="mr-3" />
                  Book Appointment & Secure Payment
                </Button>
              </form>
            </Form>
          </div>
        )}

        {step === 'payment' && (
          <div className="text-center" data-testid="booking-step-payment">
            <div className="mb-8">
              <Calendar className="text-primary text-4xl mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2 text-card-foreground">Secure Payment</h3>
              <p className="text-muted-foreground">Complete your payment to confirm your appointment</p>
            </div>
            
            <SquarePayment
              amount={22500} // $225.00 in cents
              onSuccess={handlePaymentSuccess}
              onError={(error) => {
                toast({
                  title: "Payment Failed",
                  description: error,
                  variant: "destructive",
                });
                setStep('form');
              }}
            />
          </div>
        )}

        {step === 'confirmation' && (
          <div className="text-center py-12" data-testid="booking-step-confirmation">
            <CheckCircle className="text-secondary text-6xl mx-auto mb-6" />
            <h3 className="text-3xl font-bold mb-4 text-card-foreground">Appointment Confirmed!</h3>
            <p className="text-lg text-muted-foreground mb-8">
              Your security audit has been scheduled. Check your email for confirmation details.
            </p>
            
            <div className="bg-muted/30 rounded-lg p-6 max-w-md mx-auto border border-border mb-8">
              <h4 className="font-semibold mb-3 text-card-foreground">Appointment Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Date:</span>
                  <span data-testid="text-appointment-date">
                    {appointmentData?.preferredDate ? new Date(appointmentData.preferredDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Time:</span>
                  <span data-testid="text-appointment-time">
                    {appointmentData?.preferredTime || 'To be confirmed'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Service ID:</span>
                  <span data-testid="text-service-id">
                    {appointmentData?.id || 'Processing...'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Button 
                className="bg-primary text-primary-foreground px-6 py-3 font-medium hover:bg-primary/90 transition-colors"
                onClick={() => window.location.href = '/dashboard'}
                data-testid="button-access-dashboard"
              >
                <Calendar className="mr-2" />
                Access Your Dashboard
              </Button>
              
              <p className="text-sm text-muted-foreground">
                A DocuSign agreement will be sent to your email shortly.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
