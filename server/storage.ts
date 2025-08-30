import {
  users,
  appointments,
  emailLogs,
  type User,
  type UpsertUser,
  type Appointment,
  type InsertAppointment,
  type UpdateAppointment,
  type EmailLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Appointment operations
  createAppointment(appointment: InsertAppointment & { userId: string }): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  updateAppointment(id: string, updates: UpdateAppointment): Promise<Appointment>;
  getUserAppointments(userId: string): Promise<Appointment[]>;
  getAllAppointments(): Promise<Appointment[]>;
  getAppointmentsByStatus(status: string): Promise<Appointment[]>;
  
  // Email logging
  logEmail(log: { appointmentId?: string; emailType: string; sentTo: string; status?: string }): Promise<EmailLog>;
  
  // Admin operations
  getAppointmentStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    revenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.email,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Appointment operations
  async createAppointment(appointmentData: InsertAppointment & { userId: string }): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(appointmentData)
      .returning();
    return appointment;
  }

  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.id, id));
    return appointment;
  }

  async updateAppointment(id: string, updates: UpdateAppointment): Promise<Appointment> {
    const [appointment] = await db
      .update(appointments)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appointments.id, id))
      .returning();
    return appointment;
  }

  async getUserAppointments(userId: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.userId, userId))
      .orderBy(desc(appointments.createdAt));
  }

  async getAllAppointments(): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.createdAt));
  }

  async getAppointmentsByStatus(status: string): Promise<Appointment[]> {
    return await db
      .select()
      .from(appointments)
      .where(eq(appointments.status, status as any))
      .orderBy(desc(appointments.createdAt));
  }

  // Email logging
  async logEmail(logData: { appointmentId?: string; emailType: string; sentTo: string; status?: string }): Promise<EmailLog> {
    const [log] = await db
      .insert(emailLogs)
      .values(logData)
      .returning();
    return log;
  }

  // Admin operations
  async getAppointmentStats(): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    completed: number;
    revenue: number;
  }> {
    const allAppointments = await db.select().from(appointments);
    
    const stats = {
      total: allAppointments.length,
      pending: allAppointments.filter(a => a.status === 'pending').length,
      confirmed: allAppointments.filter(a => a.status === 'confirmed').length,
      completed: allAppointments.filter(a => a.status === 'completed').length,
      revenue: allAppointments
        .filter(a => a.paymentStatus === 'paid')
        .reduce((sum, a) => sum + parseFloat(a.paymentAmount || '0'), 0)
    };
    
    return stats;
  }
}

export const storage = new DatabaseStorage();
