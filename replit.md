# Asset & Title Protection Portal

## Overview

This is a comprehensive property protection service platform that enables homeowners to book security audits and protection services. The system facilitates the complete customer journey from initial landing page visit through appointment booking, payment processing, and document signing. Built as a full-stack web application with React frontend and Express backend, it integrates with Square for payments and DocuSign for legal agreements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth with OpenID Connect integration
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful endpoints with proper error handling

### Database Design
- **Primary Database**: PostgreSQL with Neon serverless adapter
- **Schema Management**: Drizzle migrations in `/migrations` directory
- **Key Tables**:
  - `users` - User profiles and admin flags
  - `appointments` - Booking details with status tracking
  - `sessions` - Session storage for authentication
  - `email_logs` - Email delivery tracking

### Authentication & Authorization
- **Strategy**: Replit Auth with JWT tokens
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Role-based Access**: Admin flag in user table for administrative features
- **Route Protection**: Middleware-based authentication checks

### Payment Integration
- **Provider**: Square Payment API
- **Implementation**: Square Web SDK for secure card tokenization
- **Flow**: Frontend tokenization → backend payment processing
- **Security**: Server-side payment verification with idempotency keys

### Document Management
- **Provider**: DocuSign eSignature API
- **Authentication**: JWT-based API access
- **Workflow**: Automatic envelope creation and sending post-payment
- **Status Tracking**: Real-time document signing status updates

### Email System
- **Provider**: Nodemailer with SMTP configuration
- **Templates**: HTML email templates for confirmations and reminders
- **Logging**: Email delivery tracking in database
- **Types**: Confirmation emails, appointment reminders, status updates

## External Dependencies

### Core Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Square Payments**: Payment processing and tokenization
- **DocuSign**: Electronic signature and document workflow
- **Replit Auth**: Authentication and user management

### Development Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management
- **ESBuild**: Backend bundling for production deployment

### UI Components
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first styling framework
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form validation and submission

### Backend Libraries
- **Express**: Web framework for API routes
- **Passport**: Authentication middleware
- **Nodemailer**: Email delivery service
- **Connect PG Simple**: PostgreSQL session store