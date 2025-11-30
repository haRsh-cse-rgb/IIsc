export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'volunteer' | 'attendee';
}

export interface Announcement {
  _id: string;
  title: string;
  type: 'announcement' | 'alert' | 'transport' | 'dinner' | 'cultural';
  priority: 'normal' | 'high' | 'urgent';
  content: string;
  link?: string;
  file?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Hall {
  _id: string;
  name: string;
  code: string;
  capacity: number;
  location: string;
}

export interface Schedule {
  _id: string;
  title: string;
  authors: string;
  hall: Hall;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  tags: string[];
  slideLink?: string;
  description?: string;
}

export interface HallStatus {
  hall: {
    id: string;
    name: string;
    code: string;
    location: string;
  };
  current: Schedule | null;
  next: Schedule | null;
  timeRemaining: number | null;
}

export interface Complaint {
  _id: string;
  category: 'transport' | 'guesthouse' | 'cleaning' | 'presentation' | 'other';
  priority: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  contactEmail?: string;
  contactPhone?: string;
  attachments: string[];
  status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  assignedTo?: {
    name: string;
    email: string;
  };
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  type: 'dinner' | 'cultural';
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  rsvpRequired: boolean;
  ticketInfo?: string;
  imageUrl?: string;
}
