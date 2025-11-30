# STIS Conference PWA

A Progressive Web App for the 4-day STIS Conference at IISc Bangalore, featuring real-time updates, schedules, hall dashboards, and attendee feedback system.

## Features

### Attendee Features
- **Live Updates**: Real-time announcements and alerts with WebSocket integration
- **Programs Schedule**: Browse sessions by day and hall with favorites
- **Halls Dashboard**: Current and next presentations for all halls
- **Maps & Navigation**: Quick links to key locations with Google Maps integration
- **Feedback System**: Submit complaints and queries anonymously
- **Events**: View dinners and cultural programs

### Admin Features
- **Authentication**: Secure login for admins and volunteers
- **CRUD Operations**: Manage announcements, schedules, events, and complaints
- **Real-time Push**: Broadcast urgent updates to all connected clients
- **Audit Logging**: Track all changes with user attribution
- **Data Export**: Download schedules and complaints as CSV
- **Role-based Access**: Admin, Volunteer, and Attendee roles

### PWA Features
- **Offline Support**: Service worker caching for offline access
- **Installable**: Add to home screen on mobile devices
- **Push Notifications**: Support for urgent alerts
- **Responsive Design**: Works on desktop, tablet, and mobile

## Technology Stack

### Backend
- Node.js + Express
- MongoDB for data persistence
- Socket.IO for real-time updates
- JWT authentication
- Bcrypt for password hashing

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Socket.IO client
- date-fns for date formatting
- Lucide React for icons

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection (Server-side only)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Server Configuration
PORT=3001
JWT_SECRET=your-secret-key-change-in-production

# Frontend API URL
VITE_API_URL=http://localhost:3001
```

**IMPORTANT**: Never expose MongoDB credentials in client-side code. The connection string is used only on the server.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Seed the database with initial data:
```bash
npm run seed
```

This will create:
- Admin user (email: admin@stis.edu, password: admin123)
- 4 conference halls
- Sample schedules for 4 days
- Events (dinners and cultural programs)
- Sample announcements

## Running the Application

### Development

Run the backend server:
```bash
npm run server:dev
```

Run the frontend (in a separate terminal):
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

### Production

Build the frontend:
```bash
npm run build
```

Start the production server:
```bash
npm run server
```

## Project Structure

```
project/
├── server/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, audit logging
│   ├── config/          # Database connection
│   ├── utils/           # JWT utilities
│   ├── index.ts         # Server entry point
│   └── seed.ts          # Database seeding
│
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Page components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/             # API client, socket client
│   ├── types/           # TypeScript interfaces
│   └── App.tsx          # Main app component
│
├── public/
│   ├── manifest.json    # PWA manifest
│   └── sw.js            # Service worker
│
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/register` - Register new user

### Announcements
- `GET /api/announcements` - List all announcements
- `POST /api/announcements` - Create announcement (admin)
- `PUT /api/announcements/:id` - Update announcement (admin)
- `DELETE /api/announcements/:id` - Delete announcement (admin)

### Schedules
- `GET /api/schedules` - List schedules (filterable)
- `POST /api/schedules` - Create schedule (admin)
- `PUT /api/schedules/:id` - Update schedule (admin)
- `DELETE /api/schedules/:id` - Delete schedule (admin)

### Halls
- `GET /api/halls` - List all halls
- `GET /api/halls/status` - Real-time hall status
- `POST /api/halls` - Create hall (admin)

### Complaints
- `GET /api/complaints` - List complaints (authenticated)
- `GET /api/complaints/public` - Public complaint stats
- `POST /api/complaints` - Submit complaint (public)
- `PUT /api/complaints/:id` - Update complaint (admin/volunteer)

### Events
- `GET /api/events` - List events
- `POST /api/events` - Create event (admin)
- `PUT /api/events/:id` - Update event (admin)
- `DELETE /api/events/:id` - Delete event (admin)

### Export
- `GET /api/export/schedules` - Export schedules CSV (admin)
- `GET /api/export/complaints` - Export complaints CSV (admin)

## Real-time Updates

The app uses WebSocket for real-time updates:

- `announcement:new` - New announcement created
- `announcement:update` - Announcement updated
- `announcement:delete` - Announcement deleted
- `schedule:new` - New schedule created
- `schedule:update` - Schedule updated
- `schedule:delete` - Schedule deleted
- `event:new` - New event created
- `event:update` - Event updated
- `complaint:new` - New complaint submitted

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Audit logging for all admin actions
- CORS configured for frontend origin
- Environment variables for sensitive data

## Deployment

### Prerequisites
- Node.js 18+ installed
- MongoDB cluster accessible
- HTTPS certificate (required for PWA and service workers)

### Steps

1. Clone the repository
2. Set up environment variables
3. Install dependencies: `npm install`
4. Seed database: `npm run seed`
5. Build frontend: `npm run build`
6. Start server: `npm run server`
7. Configure reverse proxy (nginx/Apache) for HTTPS
8. Point domain to server

### Recommended Hosting
- Backend: Heroku, Railway, DigitalOcean
- MongoDB: MongoDB Atlas
- Frontend: Vercel, Netlify (static build)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Contributing

This is a conference-specific application. For issues or feature requests, contact the development team.

## License

Proprietary - STIS Conference 2024

## Support

For technical support during the conference:
- Email: admin@stis.edu
- Emergency: +91-80-2293-2001
