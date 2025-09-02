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
import MockPayment from "./mock-payment";
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

  const { isAuthenticated, user } = useAuth(); // Assuming user object with token is available
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

  // Mocking formData and appointmentId for handlePaymentSuccess
  // In a real scenario, these would come from form state and mutation response respectively
  const formData = form.getValues(); 
  const [appointmentId, setAppointmentId] = useState<string | null>(null);

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

  const handlePaymentSuccess = async (sourceId: string) => {
    try {
      if (!isAuthenticated || !user) {
        throw new Error('Please log in to complete your booking');
      }

      // Show immediate success feedback
      toast({
        title: "Payment Successful!",
        description: "Processing your appointment...",
      });

      // Use the mutation instead of direct fetch
      const appointmentData = {
        ...form.getValues(),
        paymentSourceId: sourceId,
      };

      const response = await createAppointmentMutation.mutateAsync(appointmentData);
      
      // The mutation's onSuccess handler will handle the rest
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Failed to create appointment",
        variant: "destructive",
      });
      setStep('form');
    }
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
    <Card className="shadow-2xl border border-primary/20 bg-gradient-to-br from-card to-card/80 backdrop-blur-sm" data-testid="card-booking-form">
      <CardContent className="p-8 md:p-12">
        {step === 'form' && (
          <div data-testid="booking-step-form" className="animate-fade-in">
            {/* Form Header */}
            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Book Your Security Audit
              </h3>
              <p className="text-lg text-muted-foreground">
                Fill out the form below to schedule your free property security assessment
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-lg font-semibold text-foreground">Full Name *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter your full name" 
                            className="h-12 text-lg border-2 border-border focus:border-primary transition-all"
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
                      <FormItem className="space-y-3">
                        <FormLabel className="text-lg font-semibold text-foreground">Email Address *</FormLabel>
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="your.email@example.com" 
                            className="h-12 text-lg border-2 border-border focus:border-primary transition-all"
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

                <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 border-2 border-primary/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                  <div className="relative z-10">
                    <h4 className="font-bold text-xl text-card-foreground mb-6 flex items-center">
                      <Lock className="mr-3 w-6 h-6 text-primary" />
                      Service Investment
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-lg p-3 bg-white/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">First Month Service:</span>
                        <span className="font-bold text-foreground text-xl">$100.00</span>
                      </div>
                      <div className="flex justify-between items-center text-lg p-3 bg-white/50 rounded-lg">
                        <span className="font-medium text-muted-foreground">Audit & Setup Fee:</span>
                        <span className="font-bold text-foreground text-xl">$125.00</span>
                      </div>
                      <div className="border-t-2 border-primary/30 my-4"></div>
                      <div className="flex justify-between items-center text-2xl font-bold p-4 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl border border-primary/30">
                        <span className="text-card-foreground">Total Today:</span>
                        <span className="text-primary text-3xl">$225.00</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:via-secondary/90 hover:to-accent/90 text-white py-6 text-xl font-bold transition-all transform hover:scale-105 shadow-2xl hover:shadow-3xl"
                  disabled={form.formState.isSubmitting}
                  data-testid="button-book-appointment"
                >
                  <Lock className="mr-4 w-6 h-6" />
                  {form.formState.isSubmitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    'Book Appointment & Secure Payment'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {step === 'payment' && (
          <div className="text-center animate-fade-in" data-testid="booking-step-payment">
            <div className="mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-6 pulse-glow">
                <Lock className="text-white text-4xl" />
              </div>
              <h3 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Secure Payment</h3>
              <p className="text-xl text-muted-foreground">Complete your payment to confirm your appointment</p>
            </div>

            {/* Use mock payment in development */}
            <MockPayment
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
          <div className="text-center py-16 animate-bounce-in" data-testid="booking-step-confirmation">
            <div className="relative">
              <CheckCircle className="text-secondary text-8xl mx-auto mb-8 animate-pulse" />
              <div className="absolute inset-0 text-secondary text-8xl mx-auto mb-8 pulse-glow opacity-50"></div>
            </div>
            <h3 className="text-5xl font-bold mb-6 bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Appointment Confirmed!</h3>
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              🎉 Your security audit has been successfully scheduled! Check your email for detailed confirmation and next steps.
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