import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertAppointmentSchema, updateAppointmentSchema } from "@shared/schema";
import { squareService } from "./services/squareService";
import { docusignService } from "./services/docusignService";
import { emailService } from "./services/emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Appointment routes
  app.post('/api/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertAppointmentSchema.parse(req.body);
      
      // Create appointment
      const appointment = await storage.createAppointment({
        ...validatedData,
        userId,
        email: req.user.claims.email || validatedData.email,
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

        // Send DocuSign agreement
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

        // Send confirmation email
        await emailService.sendConfirmationEmail(appointment);
        await storage.logEmail({
          appointmentId: appointment.id,
          emailType: 'confirmation',
          sentTo: appointment.email,
        });

        // Schedule reminder email (24 hours before)
        await emailService.scheduleReminderEmail(appointment);

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

  app.get('/api/appointments/my', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const appointments = await storage.getUserAppointments(userId);
      res.json(appointments);
    } catch (error) {
      console.error('Error fetching user appointments:', error);
      res.status(500).json({ message: 'Failed to fetch appointments' });
    }
  });

  app.get('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const userId = req.user.claims.sub;
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

  app.patch('/api/appointments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const appointment = await storage.getAppointment(req.params.id);
      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found' });
      }

      const userId = req.user.claims.sub;
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
  app.get('/api/admin/appointments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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
