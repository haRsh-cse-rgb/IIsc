# Next.js Migration Notes

This project has been successfully migrated from Vite + React + Express to Next.js.

## Key Changes

### 1. Project Structure
- **Before**: Separate `src/` (frontend) and `server/` (backend) directories
- **After**: Unified Next.js app structure with `app/` directory for pages and API routes

### 2. Routing
- **Before**: Client-side routing with React state management
- **After**: Next.js App Router with file-based routing
  - `/` → Home page
  - `/programs` → Programs page
  - `/halls` → Halls dashboard
  - `/maps` → Maps & navigation
  - `/complaints` → Feedback form
  - `/events` → Events page
  - `/admin` → Admin panel
  - `/login` → Login page

### 3. API Routes
- **Before**: Express routes in `server/routes/`
- **After**: Next.js API routes in `app/api/`
  - All API routes migrated to Next.js Route Handlers
  - Authentication middleware updated for Next.js
  - Socket.IO integration via custom server

### 4. Server Setup
- **Before**: Separate Express server (`server/index.ts`)
- **After**: Custom Next.js server (`server.js`) with Socket.IO integration
- Socket.IO server runs alongside Next.js on the same port

### 5. Client-Side Code
- All React components updated with `'use client'` directive
- `localStorage` access wrapped in `typeof window !== 'undefined'` checks
- API client updated to use relative paths (works with Next.js API routes)
- Socket client updated to use Next.js environment variables

### 6. Configuration Files
- `package.json`: Updated with Next.js dependencies, removed Vite
- `tsconfig.json`: Updated for Next.js
- `tailwind.config.js`: Updated content paths for Next.js
- `next.config.js`: Added PWA support configuration
- `vite.config.ts`: Can be removed (no longer needed)

### 7. Environment Variables
- `VITE_API_URL` → `NEXT_PUBLIC_API_URL`
- Added `NEXT_PUBLIC_APP_URL` for Socket.IO
- Added `NEXT_PUBLIC_SOCKET_URL` (optional, falls back to API URL)

## Running the Application

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Database Seeding
```bash
npm run seed
```

## Important Notes

1. **Socket.IO**: Uses a custom Next.js server (`server.js`) to integrate Socket.IO. The server must be used for both dev and production.

2. **API Routes**: All API routes are now in `app/api/` and use Next.js Route Handlers. They automatically work with the same domain.

3. **PWA Features**: Service worker and manifest are in `public/` directory and should continue to work. May need updates for Next.js routing.

4. **Old Files**: The following can be removed after verification:
   - `server/index.ts` (Express server)
   - `server/routes/` (Express routes - already migrated)
   - `vite.config.ts`
   - `index.html`
   - `src/main.tsx`
   - `src/App.tsx` (replaced by app router)

5. **Database Models**: Models are in `lib/server/models/` and are shared between API routes and seed script.

## Migration Checklist

- [x] Update package.json
- [x] Create Next.js app structure
- [x] Migrate pages to app router
- [x] Migrate API routes
- [x] Set up Socket.IO server
- [x] Update components for Next.js
- [x] Update TypeScript configs
- [x] Update Tailwind config
- [x] Create environment variable template
- [ ] Test all pages
- [ ] Test API routes
- [ ] Test Socket.IO connections
- [ ] Test authentication flow
- [ ] Verify PWA features
- [ ] Remove old files

## Next Steps

1. Test the application thoroughly
2. Update any remaining API route handlers if needed
3. Verify Socket.IO real-time updates work
4. Test PWA installation and offline features
5. Remove old Vite/Express files after verification
6. Update deployment configuration if needed

