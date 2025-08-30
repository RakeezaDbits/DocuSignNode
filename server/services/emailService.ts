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

  async sendWelcomeEmail(user: any): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@guardportal.com',
      to: user.email,
      subject: 'Welcome to GuardPortal - Your Security Journey Begins!',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; overflow: hidden;">
          <!-- Header -->
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 40px 30px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.2);">
            <div style="background: rgba(255,255,255,0.15); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 36px;">🛡️</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">Welcome to GuardPortal</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 18px;">Your property protection starts now</p>
          </div>
          
          <!-- Content -->
          <div style="background: white; padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 24px;">Hello ${user.firstName}! 👋</h2>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0;">
                Thank you for choosing GuardPortal to protect your most valuable assets. We're excited to have you on board!
              </p>
            </div>
            
            <!-- Feature Cards -->
            <div style="margin: 30px 0;">
              <div style="background: linear-gradient(135deg, #EBF8FF 0%, #E6FFFA 100%); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #3182CE;">
                <h3 style="color: #2D3748; margin: 0 0 8px; font-size: 16px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">🔒</span> Title Fraud Protection
                </h3>
                <p style="color: #4A5568; margin: 0; font-size: 14px;">24/7 monitoring of your property records</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #F0FFF4 0%, #F0F9FF 100%); padding: 20px; border-radius: 12px; margin-bottom: 15px; border-left: 4px solid #38A169;">
                <h3 style="color: #2D3748; margin: 0 0 8px; font-size: 16px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">📋</span> Asset Monitoring
                </h3>
                <p style="color: #4A5568; margin: 0; font-size: 14px;">Continuous surveillance and instant alerts</p>
              </div>
              
              <div style="background: linear-gradient(135deg, #FFFAF0 0%, #FEF5E7 100%); padding: 20px; border-radius: 12px; border-left: 4px solid #DD6B20;">
                <h3 style="color: #2D3748; margin: 0 0 8px; font-size: 16px; display: flex; align-items: center;">
                  <span style="margin-right: 8px;">🤝</span> Expert Support
                </h3>
                <p style="color: #4A5568; margin: 0; font-size: 14px;">Dedicated specialists available 24/7</p>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'https://guardportal.com'}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: all 0.3s ease;">
                Get Started Now
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">
              Questions? We're here to help at 
              <a href="mailto:support@guardportal.com" style="color: #3182CE; text-decoration: none;">support@guardportal.com</a>
            </p>
            <p style="color: #A0AEC0; margin: 0; font-size: 12px;">
              © 2024 GuardPortal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(user: any, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5000'}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@guardportal.com',
      to: user.email,
      subject: 'Reset Your GuardPortal Password',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); padding: 40px 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 36px;">🔑</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">Password Reset</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">We received a request to reset your password</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 22px;">Hello ${user.firstName},</h2>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Someone requested a password reset for your GuardPortal account. If this was you, click the button below to reset your password.
              </p>
            </div>
            
            <!-- Security Notice -->
            <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FFFAF0 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #F56565;">
              <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 20px; margin-right: 12px;">⚠️</span>
                <div>
                  <h3 style="color: #C53030; margin: 0 0 8px; font-size: 16px;">Security Notice</h3>
                  <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">
                    This link will expire in 1 hour for your security. If you didn't request this reset, please ignore this email.
                  </p>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4); transition: all 0.3s ease; font-size: 16px;">
                Reset My Password
              </a>
            </div>
            
            <div style="text-align: center; margin-top: 25px;">
              <p style="color: #718096; font-size: 14px; margin: 0;">
                Or copy and paste this link: <br>
                <a href="${resetUrl}" style="color: #3182CE; word-break: break-all; font-size: 12px;">${resetUrl}</a>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">
              Need help? Contact us at 
              <a href="mailto:support@guardportal.com" style="color: #3182CE; text-decoration: none;">support@guardportal.com</a>
            </p>
            <p style="color: #A0AEC0; margin: 0; font-size: 12px;">
              © 2024 GuardPortal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordChangedEmail(user: any): Promise<void> {
    const mailOptions = {
      from: process.env.FROM_EMAIL || 'noreply@guardportal.com',
      to: user.email,
      subject: 'Your GuardPortal Password Has Been Changed',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #48BB78 0%, #38A169 100%); padding: 40px 30px; text-align: center;">
            <div style="background: rgba(255,255,255,0.2); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 36px;">✅</span>
            </div>
            <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.3);">Password Updated</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Your password has been successfully changed</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #2D3748; margin: 0 0 15px; font-size: 22px;">Hello ${user.firstName},</h2>
              <p style="color: #4A5568; font-size: 16px; line-height: 1.6; margin: 0 0 20px;">
                Your GuardPortal account password has been successfully updated. You can now use your new password to access your account.
              </p>
            </div>
            
            <!-- Security Info -->
            <div style="background: linear-gradient(135deg, #F0FFF4 0%, #E6FFFA 100%); padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #48BB78;">
              <h3 style="color: #2D3748; margin: 0 0 15px; font-size: 18px; display: flex; align-items: center;">
                <span style="margin-right: 10px;">🔐</span> Security Tips
              </h3>
              <ul style="color: #4A5568; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.6;">
                <li style="margin-bottom: 8px;">Use a unique password for your GuardPortal account</li>
                <li style="margin-bottom: 8px;">Enable two-factor authentication when available</li>
                <li style="margin-bottom: 8px;">Don't share your password with anyone</li>
                <li>Log out of shared devices after use</li>
              </ul>
            </div>
            
            <!-- Suspicious Activity Alert -->
            <div style="background: linear-gradient(135deg, #FFF5F5 0%, #FFFAF0 100%); padding: 20px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #F56565;">
              <div style="display: flex; align-items: flex-start;">
                <span style="font-size: 20px; margin-right: 12px;">🚨</span>
                <div>
                  <h3 style="color: #C53030; margin: 0 0 8px; font-size: 16px;">Didn't change your password?</h3>
                  <p style="color: #744210; margin: 0; font-size: 14px; line-height: 1.5;">
                    If you didn't make this change, please contact our support team immediately at support@guardportal.com
                  </p>
                </div>
              </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL || 'https://guardportal.com'}/login" style="background: linear-gradient(135deg, #48BB78 0%, #38A169 100%); color: white; padding: 15px 35px; text-decoration: none; border-radius: 25px; font-weight: 600; display: inline-block; box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4); transition: all 0.3s ease; font-size: 16px;">
                Login to Your Account
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background: #F7FAFC; padding: 25px 30px; text-align: center; border-top: 1px solid #E2E8F0;">
            <p style="color: #718096; margin: 0 0 10px; font-size: 14px;">
              Questions about your account security? Contact us at 
              <a href="mailto:support@guardportal.com" style="color: #3182CE; text-decoration: none;">support@guardportal.com</a>
            </p>
            <p style="color: #A0AEC0; margin: 0; font-size: 12px;">
              © 2024 GuardPortal. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}

export const emailService = new EmailService();
