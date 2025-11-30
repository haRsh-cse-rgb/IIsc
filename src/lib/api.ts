const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = `${API_URL}/api`;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: { email: string; password: string; name: string; role?: string }) {
    return this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAnnouncements(params?: { type?: string; priority?: string; limit?: number }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/announcements${query ? `?${query}` : ''}`);
  }

  async createAnnouncement(data: any) {
    return this.request<any>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAnnouncement(id: string, data: any) {
    return this.request<any>(`/announcements/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.request<any>(`/announcements/${id}`, {
      method: 'DELETE',
    });
  }

  async getSchedules(params?: { hall?: string; status?: string; day?: string; tags?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/schedules${query ? `?${query}` : ''}`);
  }

  async createSchedule(data: any) {
    return this.request<any>('/schedules', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchedule(id: string, data: any) {
    return this.request<any>(`/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSchedule(id: string) {
    return this.request<any>(`/schedules/${id}`, {
      method: 'DELETE',
    });
  }

  async getHalls() {
    return this.request<any[]>('/halls');
  }

  async getHallStatus() {
    return this.request<any[]>('/halls/status');
  }

  async createHall(data: any) {
    return this.request<any>('/halls', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComplaints(params?: { status?: string; category?: string; priority?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/complaints${query ? `?${query}` : ''}`);
  }

  async getPublicComplaints() {
    return this.request<any[]>('/complaints/public');
  }

  async createComplaint(data: any) {
    return this.request<any>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateComplaint(id: string, data: any) {
    return this.request<any>(`/complaints/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getEvents(params?: { type?: string; upcoming?: boolean }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/events${query ? `?${query}` : ''}`);
  }

  async createEvent(data: any) {
    return this.request<any>('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEvent(id: string, data: any) {
    return this.request<any>(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string) {
    return this.request<any>(`/events/${id}`, {
      method: 'DELETE',
    });
  }

  async getUsers() {
    return this.request<any[]>('/users');
  }

  async updateUser(id: string, data: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  getExportUrl(type: 'schedules' | 'complaints'): string {
    return `${this.baseUrl}/export/${type}`;
  }
}

export const api = new ApiClient();
