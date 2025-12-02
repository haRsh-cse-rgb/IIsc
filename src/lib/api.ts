const API_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_API_URL || '') 
  : '';

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_URL ? `${API_URL}/api` : '/api';
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Copy existing headers if they're a plain object
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      console.error(`API Error (${response.status}):`, error);
      throw new Error(error.error || 'Request failed');
    }

    const data = await response.json();
    console.log(`API Response from ${url}:`, Array.isArray(data) ? `${data.length} items` : 'object');
    return data;
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

  async updateHall(id: string, data: any) {
    return this.request<any>(`/halls/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHall(id: string) {
    return this.request<any>(`/halls/${id}`, {
      method: 'DELETE',
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

  async getMenus(params?: { day?: number; mealType?: string }) {
    const query = new URLSearchParams(params as any).toString();
    return this.request<any[]>(`/menus${query ? `?${query}` : ''}`);
  }

  async createMenu(data: any) {
    return this.request<any>('/menus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMenu(id: string, data: any) {
    return this.request<any>(`/menus/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMenu(id: string) {
    return this.request<any>(`/menus/${id}`, {
      method: 'DELETE',
    });
  }

  getExportUrl(type: 'schedules' | 'complaints'): string {
    return `${this.baseUrl}/export/${type}`;
  }
}

export const api = new ApiClient();
