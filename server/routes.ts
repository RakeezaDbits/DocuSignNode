
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAppointmentSchema, updateAppointmentSchema } from "@shared/schema";
import { squareService } from "./services/squareService";
import { docusignService } from "./services/docusignService";
import { emailService } from "./services/emailService";
import { authService } from "./services/authService";
import jwt from "jsonwebtoken";

// Auth middleware
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  const user = authService.verifyToken(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = user;
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      const result = await authService.signup({ email, password, firstName, lastName });
      
      res.json({ 
        message: "Account created successfully",
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Signup failed" 
      });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await authService.login({ email, password });
      
      res.json({ 
        message: "Login successful",
        user: result.user,
        token: result.token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(401).json({ 
        message: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      await authService.forgotPassword(email);
      
      res.json({ 
        message: "If an account with that email exists, a password reset link has been sent" 
      });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process forgot password request" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ message: "Token and new password are required" });
      }

      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long" });
      }

      await authService.resetPassword(token, password);
      
      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Password reset failed" 
      });
    }
  });

  app.get('/api/auth/user', authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Create appointment
      const appointment = await storage.createAppointment({
        ...validatedData,
        userId,
        email: req.user.email || validatedData.email,
      });

      // Process payment with Square
      try {
        const paymentResult = await squareService.processPayment({
          amount: 22500, // $225.00 in cents
          currency: 'USD',
          sourceId: req.body.paymentSourceId, // From Square payment form
          appointmentId: appointment.id,
        });

        // Update appointment with payment info
        await storage.updateAppointment(appointment.id, {
          paymentStatus: 'paid',
          paymentId: paymentResult.paymentId,
          status: 'confirmed',
        });

        // Try to send DocuSign agreement (non-blocking)
        try {
          const docusignResult = await docusignService.sendAgreement({
            recipientEmail: appointment.email,
            recipientName: appointment.fullName,
            appointmentId: appointment.id,
          });

          // Update appointment with DocuSign info
          await storage.updateAppointment(appointment.id, {
            docusignStatus: 'sent',
            docusignEnvelopeId: docusignResult.envelopeId,
          });
        } catch (docusignError) {
          console.error('DocuSign error (non-blocking):', docusignError);
          // Continue with appointment creation even if DocuSign fails
        }

        // Try to send confirmation email (non-blocking)
        try {
          await emailService.sendConfirmationEmail(appointment);
          await storage.logEmail({
            appointmentId: appointment.id,
            emailType: 'confirmation',
            sentTo: appointment.email,
          });

          // Schedule reminder email (24 hours before)
          await emailService.scheduleReminderEmail(appointment);
        } catch (emailError) {
          console.error('Email error (non-blocking):', emailError);
          // Continue with appointment creation even if email fails
        }

        res.json({ 
          success: true, 
          appointment: await storage.getAppointment(appointment.id),
          message: 'Appointment booked successfully!' 
        });

      } catch (paymentError) {
        // Update appointment with payment failure
        await storage.updateAppointment(appointment.id, {
          paymentStatus: 'failed',
        });
        
        console.error('Payment processing failed:', paymentError);
        res.status(400).json({ 
          message: 'Payment processing failed. Please try again.' 
        });
      }

    } catch (error) {
      console.error('Error creating appointment:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Invalid appointment data' 
      });
    }
  });

  app.get('/api/appointments/my', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/:id', authenticateToken, async (req: any, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Check if user owns the appointment or is admin
      if (appointment.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      res.json(appointment);
    } catch (error) {
      console.error('Error fetching appointment:', error);
      res.status(500).json({ message: 'Failed to fetch appointment' });
    }
  });

  app.patch('/api/appointments/:id', authenticateToken, async (req: any, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      // Check if user owns the appointment or is admin
      if (appointment.userId !== userId && !user?.isAdmin) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      const validatedData = updateAppointmentSchema.parse(req.body);
      const updatedAppointment = await storage.updateAppointment(req.params.id, validatedData);
      
      res.json(updatedAppointment);
    } catch (error) {
      console.error('Error updating appointment:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Invalid update data' 
      });
    }
  });

  // Admin routes
  app.get('/api/admin/appointments', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const status = req.query.status as string;
      const appointments = status 
        ? await storage.getAppointmentsByStatus(status)
        : await storage.getAllAppointments();
      
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching admin appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/admin/stats', authenticateToken, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Admin access required' });
      }

      const stats = await storage.getAppointmentStats();
      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch stats' });
    }
  });

  // Payment processing route
  app.post('/api/payment/process', authenticateToken, async (req: any, res) => {
    try {
      const { sourceId, amount, appointmentId } = req.body;
      
      if (!sourceId || !amount) {
        return res.status(400).json({ message: 'Missing payment information' });
      }

      const paymentResult = await squareService.processPayment({
        amount: amount,
        currency: 'USD',
        sourceId: sourceId,
        appointmentId: appointmentId || `temp-${Date.now()}`,
      });

      res.json({
        success: true,
        paymentId: paymentResult.paymentId,
        status: paymentResult.status,
        amount: paymentResult.amount
      });

    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(400).json({
        message: error instanceof Error ? error.message : 'Payment processing failed'
      });
    }
  });

  // DocuSign webhook for status updates
  app.post('/api/docusign/webhook', async (req, res) => {
    try {
      const { envelopeId, status } = req.body;
      
      // Find appointment by envelope ID and update DocuSign status
      const appointments = await storage.getAllAppointments();
      const appointment = appointments.find(a => a.docusignEnvelopeId === envelopeId);
      
      if (appointment) {
        const docusignStatus = status === 'completed' ? 'signed' : 
                               status === 'declined' ? 'declined' : 'sent';
        
        await storage.updateAppointment(appointment.id, {
          docusignStatus: docusignStatus as any,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('DocuSign webhook error:', error);
      res.status(500).json({ message: 'Webhook processing failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
