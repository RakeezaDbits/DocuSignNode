import nodemailer from 'nodemailer';
import type { Appointment } from '@shared/schema';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
      },
    });
  }

  async sendConfirmationEmail(appointment: Appointment): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@guardportal.com',
      to: appointment.email,
      subject: 'Appointment Confirmed - GuardPortal Security Audit',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">🛡️ GuardPortal</h1>
            <h2 style="color: #1F2937; margin: 10px 0;">Appointment Confirmed!</h2>
          </div>
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1F2937; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Service ID:</strong> ${appointment.id}</p>
            <p><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.preferredTime || 'To be confirmed'}</p>
            <p><strong>Address:</strong> ${appointment.address}</p>
            <p><strong>Amount Paid:</strong> $${appointment.paymentAmount}</p>
          </div>
          
          <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1F2937; margin-top: 0;">📋 Preparation Checklist:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Property deed and title documents</li>
              <li>Recent property tax statements</li>
              <li>Insurance documents and receipts</li>
              <li>Warranty papers for valuable items</li>
              <li>List of high-value assets</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6B7280;">A DocuSign agreement has been sent to your email for electronic signature.</p>
            <p style="color: #6B7280;">You'll receive a reminder 24 hours before your appointment.</p>
          </div>
          
          <div style="text-align: center; background: #F3F4F6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #4B5563;">Questions? Contact us at support@guardportal.com or (555) 123-4567</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendReminderEmail(appointment: Appointment): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@guardportal.com',
      to: appointment.email,
      subject: 'Reminder: Your Security Audit Tomorrow - GuardPortal',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #3B82F6; margin: 0;">🛡️ GuardPortal</h1>
            <h2 style="color: #1F2937; margin: 10px 0;">Security Audit Reminder</h2>
          </div>
          
          <div style="background: #FEF3C7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #F59E0B;">
            <h3 style="color: #92400E; margin-top: 0;">⏰ Your appointment is tomorrow!</h3>
            <p style="color: #92400E; margin: 0;">Don't forget about your scheduled security audit.</p>
          </div>
          
          <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1F2937; margin-top: 0;">Appointment Details:</h3>
            <p><strong>Date:</strong> ${new Date(appointment.preferredDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${appointment.preferredTime || 'To be confirmed'}</p>
            <p><strong>Address:</strong> ${appointment.address}</p>
            <p><strong>Service ID:</strong> ${appointment.id}</p>
          </div>
          
          <div style="background: #EEF2FF; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #1F2937; margin-top: 0;">📋 Please Have Ready:</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Property deed and title documents</li>
              <li>Recent property tax statements</li>
              <li>Insurance documents and receipts</li>
              <li>Warranty papers for valuable items</li>
              <li>List of high-value assets</li>
            </ul>
          </div>
          
          <div style="text-align: center; background: #F3F4F6; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; color: #4B5563;">Need to reschedule? Contact us at support@guardportal.com or (555) 123-4567</p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async scheduleReminderEmail(appointment: Appointment): Promise<void> {
    // Calculate 24 hours before appointment
    const appointmentDate = new Date(appointment.preferredDate);
    const reminderDate = new Date(appointmentDate.getTime() - 24 * 60 * 60 * 1000);
    
    // In a production environment, you would use a job queue like Bull or Agenda
    // For now, we'll use a simple setTimeout (not recommended for production)
    const delay = reminderDate.getTime() - Date.now();
    
    if (delay > 0) {
      setTimeout(async () => {
        try {
          await this.sendReminderEmail(appointment);
          // Mark reminder as sent in database
          // await storage.updateAppointment(appointment.id, { reminderSent: true });
        } catch (error) {
          console.error('Failed to send reminder email:', error);
        }
      }, delay);
    }
  }
}

export const emailService = new EmailService();
