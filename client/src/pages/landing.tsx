import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BookingForm from "@/components/booking-form";
import { Shield, CheckCircle, Calendar, Lock, Phone, Mail, Clock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Landing() {
  const [showBooking, setShowBooking] = useState(false);
  const { isAuthenticated, user } = useAuth();

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
      <header className="sticky top-0 z-50 nav-glass">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 animate-fade-in">
              <div className="flex items-center">
                <div className="relative">
                  <Shield className="text-primary text-3xl mr-3 floating-element" />
                  <div className="absolute inset-0 text-primary text-3xl mr-3 pulse-glow opacity-50"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GuardPortal
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Services</a>
              <a href="#process" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Process</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105 font-medium">Contact</a>
            </nav>

            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <Button
                  variant="outline"
                  className="hover:scale-105 transition-transform"
                  onClick={() => window.location.href = '/dashboard'}
                  data-testid="button-dashboard"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="hover:scale-105 transition-transform"
                    onClick={() => window.location.href = '/login'}
                    data-testid="button-login"
                  >
                    Login
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 hover:scale-105 transition-all shadow-lg"
                    onClick={() => window.location.href = '/signup'}
                    data-testid="button-signup"
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-gradient text-white py-24 lg:py-40 relative overflow-hidden">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white/5 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center px-6 py-2 mb-8 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 animate-bounce-in">
              <Shield className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">#1 Property Protection Service</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 leading-tight animate-fade-in">
              Protect Your Home's{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 bg-clip-text text-transparent animate-pulse">
                Asset & Title
              </span>{' '}
              Today
            </h1>
            
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 text-white/90 leading-relaxed max-w-4xl mx-auto animate-slide-up">
              Professional property protection services with comprehensive title monitoring, fraud prevention, and 24/7 security audits for your complete peace of mind.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-slide-up">
              <div className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <CheckCircle className="text-green-300 mr-3 w-5 h-5" />
                <span className="font-medium">Free Security Audit</span>
              </div>
              <div className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <CheckCircle className="text-green-300 mr-3 w-5 h-5" />
                <span className="font-medium">24/7 Monitoring</span>
              </div>
              <div className="flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:bg-white/20 transition-all">
                <CheckCircle className="text-green-300 mr-3 w-5 h-5" />
                <span className="font-medium">Expert Protection</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 animate-bounce-in">
              <Button
                size="lg"
                className="bg-white text-primary px-10 py-6 text-xl font-bold hover:bg-white/90 transform hover:scale-110 transition-all shadow-2xl hover:shadow-white/25 group"
                onClick={scrollToBooking}
                data-testid="button-schedule-audit"
              >
                <Calendar className="mr-3 w-6 h-6 group-hover:animate-bounce" />
                Schedule Your Free Audit Now
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white hover:text-primary px-8 py-6 text-lg font-semibold backdrop-blur-sm transition-all hover:scale-105"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-white/80 text-sm animate-fade-in">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                <span>No obligations</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                <span>Same-day booking</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                <span>Trusted by 10,000+ homeowners</span>
              </div>
            </div>
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

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            <Card className="feature-card group relative bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="text-primary text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-card-foreground group-hover:text-primary transition-colors">Title Fraud Protection</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Advanced monitoring systems detect and prevent title fraud attempts before they can affect your property ownership. Get instant alerts for any suspicious activity.
                </p>
                <div className="mt-6 flex items-center text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <CheckCircle className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card group relative bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-gradient-to-br from-secondary/20 to-secondary/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Lock className="text-secondary text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-card-foreground group-hover:text-secondary transition-colors">Asset Monitoring</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Continuous surveillance of your property records and immediate alerts for any suspicious activities or changes. 24/7 automated protection.
                </p>
                <div className="mt-6 flex items-center text-secondary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <CheckCircle className="ml-2 w-4 h-4" />
                </div>
              </CardContent>
            </Card>

            <Card className="feature-card group relative bg-gradient-to-br from-card to-card/50">
              <CardContent className="p-10">
                <div className="w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                  <Phone className="text-accent text-3xl" />
                </div>
                <h3 className="text-2xl font-bold mb-6 text-card-foreground group-hover:text-accent transition-colors">Expert Support</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Dedicated protection specialists available 24/7 to respond to threats and guide you through any issues. Direct access to security experts.
                </p>
                <div className="mt-6 flex items-center text-accent font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Learn more</span>
                  <CheckCircle className="ml-2 w-4 h-4" />
                </div>
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