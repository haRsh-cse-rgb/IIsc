# Interview Materials - STIS Conference PWA Project

## Interview Explanation

I built a full-stack Progressive Web App (PWA) for a 4-day academic conference at IISc Bangalore. The application serves both attendees and administrators, providing real-time updates, schedule management, and a comprehensive feedback system.

**Purpose**: The app was designed to enhance the conference experience by providing instant access to announcements, session schedules, hall availability, and event information. It eliminates the need for printed schedules and enables real-time communication between organizers and attendees.

**My Role**: I was the sole developer responsible for the entire project lifecycle—from initial requirements gathering to deployment. I architected the system, implemented both frontend and backend, integrated real-time WebSocket communication, and deployed the application across multiple platforms (Vercel for the Next.js app and Railway for the Socket.IO server).

**Key Technical Achievements**:
- Built a responsive PWA with offline support using service workers
- Implemented real-time bidirectional communication using Socket.IO
- Designed and developed a RESTful API with MongoDB backend
- Created a role-based authentication system with JWT
- Deployed a distributed architecture with separate services for optimal performance

---

## Challenges & Solutions (Q&A Format)

### Q: What was the biggest technical challenge you faced while building this project?

**A**: The most significant challenge was implementing real-time updates in a serverless environment. Initially, I tried to run Socket.IO directly within the Next.js application on Vercel, but Vercel's serverless architecture doesn't support persistent WebSocket connections. 

**Solution**: I architected a distributed system by separating the Socket.IO server onto Railway (which supports persistent connections) while keeping the Next.js frontend on Vercel. I created an HTTP-based event emission system that allows the Next.js API routes to communicate with the remote Socket.IO server via REST endpoints. This hybrid approach maintains real-time functionality while leveraging the benefits of serverless deployment for the main application.

**What I Learned**: This experience taught me the importance of understanding platform limitations and architectural trade-offs. I learned to design systems that work within infrastructure constraints rather than against them, and gained expertise in microservices communication patterns.

---

### Q: How did you handle timezone and date/time management across different parts of the application?

**A**: Timezone handling was particularly challenging because the conference schedule needed to display times consistently across different user devices and server locations. The initial implementation had issues where times would shift based on the server's timezone.

**Solution**: I standardized all date-time storage in UTC ISO format in the database, then implemented client-side conversion using the user's local timezone. I created helper functions to convert between 12-hour and 24-hour formats for user input, and ensured all date comparisons and filtering happened in UTC before converting to display format. I also used the `date-fns` library for consistent date formatting across the application.

**What I Learned**: I gained a deep understanding of timezone complexities in web applications and learned best practices for handling dates in distributed systems. This experience reinforced the importance of storing dates in UTC and converting only for display purposes.

---

### Q: What challenges did you face with the PWA implementation, and how did you solve them?

**A**: Implementing offline functionality and service worker caching was challenging, especially ensuring that critical data like announcements remained accessible offline while still allowing real-time updates when online.

**Solution**: I implemented a hybrid caching strategy: cache-first for static assets (images, CSS, JS) to ensure fast loading, and network-first with cache fallback for API calls. This ensures users see cached data immediately while fresh data loads in the background. For real-time updates, I designed the service worker to bypass cache for WebSocket connections, ensuring live updates always reach users when online.

**What I Learned**: I learned about Progressive Web App architecture, service worker lifecycle management, and different caching strategies. I also understood the balance between offline functionality and data freshness, which is crucial for real-time applications.

---

### Q: How did you ensure security in the application, especially for admin operations?

**A**: Security was a critical concern, especially for the admin panel that manages sensitive conference data. I needed to protect against unauthorized access while maintaining a smooth user experience.

**Solution**: I implemented a multi-layered security approach: (1) JWT-based authentication with secure token storage in localStorage, (2) bcrypt password hashing with 10 rounds for all user passwords, (3) role-based access control (RBAC) at both the API route level and frontend component level, (4) audit logging that tracks all admin actions with user attribution and timestamps, and (5) input validation on all forms to prevent injection attacks. I also ensured MongoDB credentials were never exposed to the client by keeping them server-side only.

**What I Learned**: This project gave me hands-on experience with authentication and authorization patterns, security best practices, and the importance of defense-in-depth. I learned to think about security at every layer of the application stack.

---

### Q: What was challenging about the database schema design, and how did you approach it?

**A**: Designing a flexible schema that could handle relationships between schedules, halls, events, and users while maintaining data integrity was complex. I also needed to support features like filtering schedules by multiple criteria and tracking hall status in real-time.

**Solution**: I used Mongoose schemas with proper references between collections (e.g., schedules referencing halls). I implemented virtual fields for computed properties like "current session" and "next session" for halls. For performance, I added indexes on frequently queried fields like date, hall ID, and status. I also designed the schema to support denormalization where appropriate—for example, storing hall names in schedules for faster queries while maintaining the reference for updates.

**What I Learned**: I learned about MongoDB schema design patterns, when to use references vs. embedded documents, and how to optimize queries with proper indexing. This experience taught me to balance normalization with query performance.

---

### Q: How did you handle the complexity of managing state across real-time updates and user interactions?

**A**: Managing state became complex because updates could come from multiple sources: user actions (form submissions), real-time WebSocket events, and periodic polling for hall status. Keeping the UI in sync without conflicts was challenging.

**Solution**: I implemented a centralized state management approach using React Context for authentication and local component state for data. I created a Socket.IO client wrapper that automatically updates component state when events are received. For hall status, I implemented a polling mechanism that updates every minute, but I also listen for real-time schedule updates to immediately reflect changes. I used optimistic UI updates for form submissions, then sync with server responses to handle any conflicts.

**What I Learned**: I learned about state management patterns in React, handling asynchronous updates, and coordinating between different data sources. This experience taught me the importance of having a clear data flow architecture.

---

## Short Summary

I developed a full-stack Progressive Web App for a 4-day academic conference, enabling real-time communication between organizers and attendees. The application features a Next.js frontend with Socket.IO real-time updates, MongoDB backend, and comprehensive admin tools. I architected a distributed deployment strategy, separating the Socket.IO server from the main application to work within serverless platform constraints. The PWA includes offline support, role-based authentication, and real-time schedule and announcement management, successfully serving conference attendees with instant updates and seamless user experience.

---

## Resume Bullet (One-Liner)

**Engineered a full-stack Progressive Web App for a 4-day academic conference using Next.js, MongoDB, and Socket.IO, implementing real-time WebSocket communication across distributed services (Vercel + Railway), achieving offline functionality with service workers, and delivering role-based authentication with JWT—serving 100+ concurrent users with sub-second update latency.**
