import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingForm from "@/components/booking-form";
import { Shield, Home, ShieldQuestion, CheckCircle, Calendar, Lock, Phone, Mail, Clock } from "lucide-react";

export default function Landing() {
  const [showBooking, setShowBooking] = useState(false);

  const scrollToBooking = () => {
    setShowBooking(true);
    setTimeout(() => {
      document.getElementById('booking')?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Shield className="text-primary text-2xl mr-3" />
                <span className="text-xl font-bold text-foreground">GuardPortal</span>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Services</a>
              <a href="#process" className="text-muted-foreground hover:text-foreground transition-colors">Process</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                onClick={() => window.location.href = '/login'}
                data-testid="button-login"
              >
                Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/signup'}
                data-testid="button-signup"
              >
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Protect Your Home's <span className="text-yellow-300">Asset & Title</span> Today
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 leading-relaxed">
              Professional property protection services with comprehensive title monitoring, fraud prevention, and 24/7 security audits for your peace of mind.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <div className="flex items-center text-lg">
                <CheckCircle className="text-green-300 mr-3" />
                <span>Free Security Audit</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="text-green-300 mr-3" />
                <span>24/7 Monitoring</span>
              </div>
              <div className="flex items-center text-lg">
                <CheckCircle className="text-green-300 mr-3" />
                <span>Expert Protection</span>
              </div>
            </div>
            
            <Button 
              size="lg"
              className="bg-accent text-accent-foreground px-8 py-4 text-xl font-semibold hover:bg-accent/90 transform hover:scale-105 transition-all shadow-xl"
              onClick={scrollToBooking}
              data-testid="button-schedule-audit"
            >
              <Calendar className="mr-3" />
              Schedule Your Free Audit Now
            </Button>
            
            <p className="text-sm text-blue-200 mt-4">
              ✓ No obligations • ✓ Same-day booking available • ✓ Trusted by 10,000+ homeowners
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="services" className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Choose Our Protection Services?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive protection for your most valuable asset with industry-leading security measures.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="feature-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-primary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Title Fraud Protection</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Advanced monitoring systems detect and prevent title fraud attempts before they can affect your property ownership.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Home className="text-secondary text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Asset Monitoring</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Continuous surveillance of your property records and immediate alerts for any suspicious activities or changes.
                </p>
              </CardContent>
            </Card>
            
            <Card className="feature-card hover:shadow-lg transition-all duration-300">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <ShieldQuestion className="text-accent text-2xl" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-card-foreground">Expert Support</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dedicated protection specialists available 24/7 to respond to threats and guide you through any issues.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Simple 3-Step Process</h2>
            <p className="text-lg text-muted-foreground">Get protected in minutes with our streamlined onboarding process</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="step-number w-16 h-16 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-primary to-secondary">
                1
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Book Your Audit</h3>
              <p className="text-muted-foreground">Schedule a free security audit at your convenience. Our expert will visit your property within 7 days.</p>
            </div>
            
            <div className="text-center">
              <div className="step-number w-16 h-16 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-primary to-secondary">
                2
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Secure Payment</h3>
              <p className="text-muted-foreground">Complete payment securely through Square. $100 first month + $125 service charge for comprehensive protection.</p>
            </div>
            
            <div className="text-center">
              <div className="step-number w-16 h-16 rounded-full text-white text-xl font-bold flex items-center justify-center mx-auto mb-6 bg-gradient-to-r from-primary to-secondary">
                3
              </div>
              <h3 className="text-xl font-semibold mb-4 text-foreground">Instant Protection</h3>
              <p className="text-muted-foreground">Sign digital agreement via DocuSign and get immediate protection coverage with automated monitoring.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      {showBooking && (
        <section id="booking" className="py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Schedule Your Free Security Audit</h2>
                <p className="text-lg text-muted-foreground">Book your appointment and secure your property today</p>
              </div>
              
              <BookingForm />
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12" id="contact">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <Shield className="text-primary text-2xl mr-3" />
                <span className="text-xl font-bold text-foreground">GuardPortal</span>
              </div>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Protecting your property and assets with advanced monitoring and professional security services.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Services</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>Title Protection</li>
                <li>Asset Monitoring</li>
                <li>Security Audits</li>
                <li>24/7 Support</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-card-foreground mb-4">Contact</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-center">
                  <Phone className="mr-2 h-4 w-4" />
                  <span>(555) 123-4567</span>
                </li>
                <li className="flex items-center">
                  <Mail className="mr-2 h-4 w-4" />
                  <span>support@guardportal.com</span>
                </li>
                <li className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>24/7 Support</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 GuardPortal. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
