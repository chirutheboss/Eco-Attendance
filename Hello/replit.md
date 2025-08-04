# Club Attendance Management System

## Overview

This is a full-stack Club Attendance Management System built for educational institutions to track student attendance. The application allows administrators to manage student records, mark attendance for different dates and sections, and generate comprehensive reports. It features a modern React frontend with a clean, responsive design and an Express.js backend with PostgreSQL database integration.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (August 2025)

✅ **Updated Color Scheme**: Changed primary colors to purple/violet theme (hsl(262, 83%, 58%)) with pink secondary accent
✅ **Enhanced Attendance Animations**: Added smooth hover effects, scale animations, and click feedback for Present/Absent buttons  
✅ **Google Sheets Integration**: Replaced CSV bulk upload with Google Sheets import functionality that auto-parses student data
✅ **Fixed Scrolling Issues**: Improved page scrolling with smooth behavior and proper overflow handling
✅ **Student ID Input Fix**: Removed automatic "000" padding - users can now enter custom 3-digit numbers
✅ **Database Schema Migration**: Changed from "year" field to "shift" field throughout the application
✅ **Shift System Implementation**: Replaced year with shift dropdown (Shift 1, Shift 2) across all student forms and tables
✅ **Removed Today's Attendance Rate**: Eliminated the attendance rate display from dashboard as requested
✅ **External Deployment Ready**: Application configured for deployment on Render.com, Railway, Fly.io with ElephantSQL/external PostgreSQL
✅ **Database Migration Fixed**: Fixed foreign key constraints for proper student deletion and bulk import functionality

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS variables for consistent theming and responsive design
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod schema validation for robust form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: Express.js with TypeScript for RESTful API development
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **API Design**: RESTful endpoints following standard HTTP conventions
- **Error Handling**: Centralized error handling middleware for consistent error responses
- **Request Logging**: Custom middleware for API request logging and monitoring

### Database Design
- **Database**: PostgreSQL for reliable relational data storage
- **Schema Management**: Drizzle Kit for database migrations and schema versioning
- **Tables**: 
  - Students table with fields for personal info, class, section, and status
  - Attendance table linking students to dates with presence status
- **Relationships**: One-to-many relationship between students and attendance records
- **Constraints**: Unique student IDs and proper foreign key relationships

### Data Validation
- **Schema Validation**: Zod schemas shared between frontend and backend for consistent data validation
- **Input Sanitization**: Automatic validation of all API inputs using Zod schemas
- **Type Safety**: End-to-end TypeScript coverage from database to UI components

### Key Features Architecture
- **Student Management**: CRUD operations for student records with search and filtering
- **Attendance Tracking**: Date-based attendance marking with section filtering
- **Reporting System**: Statistical analysis and data export capabilities
- **Responsive Design**: Mobile-first approach with adaptive layouts for all screen sizes

### Development Workflow
- **Monorepo Structure**: Client, server, and shared code organized in a single repository
- **Hot Reloading**: Vite development server with HMR for rapid frontend development
- **TypeScript Compilation**: Shared TypeScript configuration across all packages
- **Path Aliases**: Organized imports using TypeScript path mapping

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting for production deployment
- **Connection Pooling**: Neon's connection pooling for efficient database connections

### UI and Styling
- **Radix UI**: Headless component primitives for accessibility and customization
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Lucide React**: Icon library for consistent iconography
- **Google Fonts**: Roboto font family and Material Icons for typography

### Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer

### Data Processing
- **XLSX**: Excel file processing for data import/export functionality
- **Date-fns**: Date manipulation and formatting utilities

### Validation and Forms
- **Zod**: Runtime type validation and schema parsing
- **React Hook Form**: Performant form library with minimal re-renders
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation