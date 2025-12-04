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
  isPlenary?: boolean;
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
  type: string; // Allow any string type
  description: string;
  venue: string;
  startTime: string;
  endTime: string;
  rsvpRequired: boolean;
  ticketInfo?: string;
  imageUrl?: string;
}

export interface MenuCategory {
  name: string;
  items: string[];
}

export interface Menu {
  _id: string;
  day: number; // 1, 2, or 3
  mealType: 'breakfast' | 'lunch' | 'tea' | 'tea-am' | 'tea-pm';
  items?: string[]; // Legacy support
  categories?: MenuCategory[]; // New structure with categories
  description?: string;
  createdAt: string;
  updatedAt: string;
}