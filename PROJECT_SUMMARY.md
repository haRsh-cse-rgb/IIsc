# STIS Conference PWA - Project Summary

## Overview

A complete Progressive Web App (PWA) for the 4-day STIS Conference at IISc Bangalore, built with React, Node.js, Express, MongoDB, and Socket.IO.

## What Has Been Built

### Backend (21 TypeScript files)
- **Express Server** with WebSocket support via Socket.IO
- **MongoDB Integration** with 7 data models:
  - Users (authentication & roles)
  - Announcements (live updates)
  - Schedules (program sessions)
  - Halls (venue information)
  - Complaints (feedback system)
  - Events (dinners & cultural programs)
  - AuditLog (change tracking)

- **RESTful API** with 8 route modules:
  - Authentication (login/register)
  - Announcements CRUD
  - Schedules CRUD
  - Halls management with real-time status
  - Complaints handling
  - Events management
  - User management
  - Data export (CSV)

- **Security Features**:
  - JWT authentication
  - Bcrypt password hashing
  - Role-based access control (Admin, Volunteer, Attendee)
  - Audit logging for all admin actions

### Frontend (16 React components)
- **7 Main Pages**:
  1. **Home** - Live announcements feed with real-time updates
  2. **Programs** - Filterable schedule with favorites
  3. **Halls** - Dashboard showing current/next presentations
  4. **Maps** - Navigation to key locations
  5. **Complaints** - Feedback submission form
  6. **Events** - Dinners and cultural programs
  7. **Admin** - Management dashboard (login required)

- **Core Features**:
  - Real-time WebSocket updates
  - Responsive mobile-first design
  - Offline support via service worker
  - Authentication context
  - API client with TypeScript types

### PWA Features
- **Service Worker** with caching strategies:
  - Cache-first for static assets
  - Network-first for API calls
  - Offline fallback

- **Web App Manifest**:
  - Installable on mobile devices
  - Standalone display mode
  - Custom theme color
  - App icons (placeholders included)

## Database Seed Data

Running `npm run seed` creates:
- **Admin User**: admin@stis.edu / admin123
- **4 Halls**: HALL-A, HALL-B, HALL-C, HALL-D
- **64 Schedule Entries**: 4 sessions per hall per day for 4 days
- **8 Events**: Dinners and one cultural program
- **3 Sample Announcements**: Including urgent transport alert

## Real-Time Features

The app uses WebSocket for instant updates:
- New announcements broadcast to all clients
- Schedule changes reflect immediately
- Hall status updates every minute
- Complaint submissions notify admins

## API Endpoints Summary

### Public Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/announcements` - View announcements
- `GET /api/schedules` - View schedules
- `GET /api/halls/status` - Hall status
- `GET /api/events` - View events
- `POST /api/complaints` - Submit feedback

### Protected Endpoints (Admin/Volunteer)
- All CRUD operations for announcements, schedules, events
- Complaint management
- User management
- Data export
- Audit log access

## Technology Highlights

- **TypeScript** throughout for type safety
- **Mongoose** for MongoDB schema validation
- **Express Validator** for input validation
- **date-fns** for date formatting
- **Tailwind CSS** for responsive design
- **Lucide React** for icons
- **Socket.IO** for real-time bidirectional communication

## File Structure

```
project/
├── server/                 # Backend Node.js application
│   ├── models/            # 7 MongoDB models
│   ├── routes/            # 8 API route handlers
│   ├── middleware/        # Auth & audit middleware
│   ├── config/            # Database connection
│   ├── utils/             # JWT utilities
│   ├── index.ts           # Express server setup
│   └── seed.ts            # Database seeding script
│
├── src/                   # Frontend React application
│   ├── components/        # Layout component
│   ├── pages/             # 7 page components
│   ├── contexts/          # Auth context provider
│   ├── lib/               # API & socket clients
│   ├── types/             # TypeScript interfaces
│   └── App.tsx            # Main application
│
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # App icons (placeholders)
│
├── README.md              # Main documentation
├── DEPLOYMENT.md          # Deployment guide
└── package.json           # Dependencies & scripts
```

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables in .env
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-secret-key
PORT=3001
VITE_API_URL=http://localhost:3001

# 3. Seed the database
npm run seed

# 4. Start backend (Terminal 1)
npm run server:dev

# 5. Start frontend (Terminal 2)
npm run dev

# 6. Open browser
http://localhost:5173
```

## Production Deployment

```bash
# Build frontend
npm run build

# Start production server
npm run server

# Or deploy separately:
# - Backend: Heroku, Railway, DigitalOcean
# - Frontend: Vercel, Netlify
# - Database: MongoDB Atlas
```

## Key Features Implemented

✅ Real-time announcements with priority levels
✅ Complete schedule management with filtering
✅ Live hall dashboard with current/next sessions
✅ Google Maps integration for navigation
✅ Anonymous feedback submission
✅ Events calendar with RSVP info
✅ Admin authentication with JWT
✅ Role-based access control
✅ WebSocket real-time updates
✅ Service worker for offline support
✅ PWA installability
✅ Responsive mobile design
✅ CSV export functionality
✅ Audit logging system
✅ Database seeding script

## Security Considerations

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with 7-day expiration
- ✅ MongoDB credentials in environment variables only
- ✅ CORS configured for frontend origin
- ✅ Role-based API endpoint protection
- ✅ Input validation on all forms
- ✅ Audit trail of admin actions

## Performance Optimizations

- Service worker caching reduces server load
- API responses cached for offline access
- WebSocket for efficient real-time updates
- Optimized MongoDB queries with indexes
- Responsive images and lazy loading ready

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS/Android)

## What's Included

- Complete frontend React application
- Full backend API with authentication
- MongoDB database models and migrations
- WebSocket real-time communication
- PWA features (service worker, manifest)
- Comprehensive documentation
- Database seed script with sample data
- Production build configuration

## Next Steps for Production

1. Replace placeholder icons with actual PNG icons (192x192 and 512x512)
2. Change default admin password after first login
3. Set up MongoDB Atlas cluster
4. Configure production environment variables
5. Deploy to hosting service with HTTPS
6. Test PWA installation on mobile devices
7. Set up monitoring and error tracking
8. Configure automated database backups

## Notes

- The admin panel is simplified but all backend APIs are fully functional
- Push notification infrastructure is in place (requires browser permission)
- The app uses MongoDB (not Supabase as template suggested) per requirements
- All timestamps are in ISO 8601 format
- The seed script can be run multiple times (it clears existing data)

## Support

For questions about the codebase or deployment, refer to:
- README.md - General information and API docs
- DEPLOYMENT.md - Detailed deployment instructions
- Server code comments - Implementation details

## License

Proprietary - STIS Conference 2024
