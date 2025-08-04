# Club Attendance Management System

A modern web-based attendance management system for educational institutions.

## Features

- Student management with ID format "24SJCCC" + 3 digits
- Section-based organization (BBA A-D, B.COM A-G/I, BA English, BSc Eco)
- Shift-based system (Shift 1, Shift 2)
- Google Sheets bulk import
- Excel report generation
- Real-time attendance tracking
- Purple/violet themed UI with smooth animations

## Quick Deployment

### 1. Database Setup (ElephantSQL)
1. Sign up at [ElephantSQL](https://www.elephantsql.com/)
2. Create a new instance (free tier: 20MB)
3. Copy the connection URL

### 2. Deploy to Render.com
1. Fork/upload this repository to GitHub
2. Sign up at [Render.com](https://render.com/)
3. Create new "Web Service"
4. Connect your GitHub repository
5. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment Variables**:
     - `NODE_ENV=production`
     - `DATABASE_URL=your_elephantsql_connection_url`

### 3. Database Migration
After deployment, run the database migration:
```bash
npm run db:push
```

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   DATABASE_URL=your_database_connection_string
   ```
4. Run database migration: `npm run db:push`
5. Start development server: `npm run dev`

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: Set to "production" for deployment

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Build**: Vite, ESBuild

## Free Deployment Options

1. **Render.com** (Recommended)
   - 750 hours/month free
   - Automatic deployments from GitHub

2. **Railway.app**
   - $5 monthly credit
   - Easy PostgreSQL integration

3. **Fly.io**
   - Limited free tier
   - Requires Docker setup