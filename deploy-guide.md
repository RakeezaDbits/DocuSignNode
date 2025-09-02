# GoDaddy VPS Deployment Guide

## Prerequisites

1. **Database Setup**: You need a PostgreSQL database running on your VPS
2. **Environment Variables**: Configure the `.env` file with your production values

## Step 1: Database Setup

Create a PostgreSQL database on your GoDaddy VPS:

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE your_database_name;
CREATE USER your_username WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
\q
```

## Step 2: Environment Configuration

1. Copy `.env.example` to `.env`
2. Update the `DATABASE_URL` with your VPS database credentials:
   ```
   DATABASE_URL=postgresql://your_username:your_secure_password@localhost:5432/your_database_name
   ```

## Step 3: Production Build and Deploy

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:push

# Build the application
npm run build

# Start the production server
npm start
```

## Step 4: Process Manager (Recommended)

Use PM2 to keep your application running:

```bash
# Install PM2 globally
npm install -g pm2

# Start your application with PM2
pm2 start dist/index.js --name "guardportal"

# Save PM2 configuration
pm2 save
pm2 startup
```

## Common Issues

1. **Database Connection Error**: Ensure your DATABASE_URL is correct and the database is accessible
2. **Port Issues**: Make sure port 5000 is open in your firewall
3. **Authentication Issues**: Verify your Replit Auth credentials are correct for production

## Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for your database
- Keep your dependencies updated
- Configure SSL certificates for HTTPS in production