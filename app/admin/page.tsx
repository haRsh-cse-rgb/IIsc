'use client';

import { useState, useEffect } from 'react';
import { Settings, LogOut, Plus, Edit, Trash2, X, Save, Megaphone, Calendar, MessageCircle, Users, Building2, Sparkles, UserCog } from 'lucide-react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Layout } from '@/src/components/Layout';
import { api } from '@/src/lib/api';
import { socketClient } from '@/src/lib/socket';
import { format } from 'date-fns';
import { Announcement, Schedule, Complaint, Hall, Event, User as UserType } from '@/src/types';

type TabType = 'overview' | 'announcements' | 'schedules' | 'complaints' | 'halls' | 'events' | 'users';

export default function AdminPage() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Admin Panel - STIS Conference';
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8" />
              <div>
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-gray-300 text-sm">Welcome, {user?.name}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'overview'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'announcements'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'schedules'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Schedules</span>
            </button>
            <button
              onClick={() => setActiveTab('complaints')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'complaints'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <MessageCircle className="w-4 h-4" />
              <span>Complaints</span>
            </button>
            <button
              onClick={() => setActiveTab('halls')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'halls'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Halls</span>
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'events'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Events</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserCog className="w-4 h-4" />
              <span>Users</span>
            </button>
          </div>

          {activeTab === 'overview' && <OverviewTab />}
          {activeTab === 'announcements' && <AnnouncementsTab />}
          {activeTab === 'schedules' && <SchedulesTab />}
          {activeTab === 'complaints' && <ComplaintsTab />}
          {activeTab === 'halls' && <HallsTab />}
          {activeTab === 'events' && <EventsTab />}
          {activeTab === 'users' && <UsersTab />}
        </div>
      </div>
    </Layout>
  );
}

// Overview Tab
function OverviewTab() {
  return (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">Quick Stats</h3>
                  <p className="text-blue-700 text-3xl font-bold">4 Days</p>
                  <p className="text-blue-600 text-sm">Conference Duration</p>
                </div>
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-green-900 mb-2">Halls</h3>
                  <p className="text-green-700 text-3xl font-bold">4 Active</p>
                  <p className="text-green-600 text-sm">Conference Venues</p>
                </div>
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-purple-900 mb-2">Your Role</h3>
          <p className="text-purple-700 text-3xl font-bold capitalize">Admin</p>
          <p className="text-purple-600 text-sm">Full Access</p>
                </div>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
                <h3 className="font-bold text-lg text-yellow-900 mb-3">Admin Features</h3>
                <ul className="space-y-2 text-yellow-800">
                  <li>• Create and manage announcements with real-time push updates</li>
                  <li>• Add, edit, and delete conference schedules</li>
                  <li>• Monitor and respond to attendee feedback</li>
          <li>• Manage halls, events, and users</li>
                  <li>• Export data to CSV for reporting</li>
                  <li>• View audit logs of all changes</li>
                </ul>
      </div>
    </div>
  );
}

// Announcements Tab
function AnnouncementsTab() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    type: 'announcement' | 'alert' | 'transport' | 'dinner' | 'cultural';
    priority: 'normal' | 'high' | 'urgent';
    content: string;
    link: string;
  }>({
    title: '',
    type: 'announcement',
    priority: 'normal',
    content: '',
    link: '',
  });

  useEffect(() => {
    loadAnnouncements();
    socketClient.connect();
    socketClient.on('announcement:new', loadAnnouncements);
    socketClient.on('announcement:update', loadAnnouncements);
    socketClient.on('announcement:delete', loadAnnouncements);
    return () => {
      socketClient.off('announcement:new');
      socketClient.off('announcement:update');
      socketClient.off('announcement:delete');
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.updateAnnouncement(editing._id, formData);
      } else {
        await api.createAnnouncement(formData);
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ title: '', type: 'announcement', priority: 'normal', content: '', link: '' });
      loadAnnouncements();
    } catch (error) {
      alert('Failed to save announcement');
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditing(announcement);
    setFormData({
      title: announcement.title,
      type: announcement.type,
      priority: announcement.priority,
      content: announcement.content,
      link: announcement.link || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      try {
        await api.deleteAnnouncement(id);
        loadAnnouncements();
      } catch (error) {
        alert('Failed to delete announcement');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Announcements</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ title: '', type: 'announcement', priority: 'normal', content: '', link: '' });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Create'} Announcement</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="announcement">Announcement</option>
                  <option value="alert">Alert</option>
                  <option value="transport">Transport</option>
                  <option value="dinner">Dinner</option>
                  <option value="cultural">Cultural</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Content</label>
              <textarea
                required
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Link (optional)</label>
              <input
                type="url"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              {editing ? 'Update' : 'Create'}
            </button>
          </form>
            </div>
          )}

      <div className="space-y-3">
        {announcements.map((announcement) => (
          <div key={announcement._id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{announcement.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    announcement.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    announcement.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {announcement.priority}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                    {announcement.type}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{announcement.content}</p>
              <p className="text-sm text-gray-500">
                  {format(new Date(announcement.createdAt), 'PPp')}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(announcement)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(announcement._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">No announcements yet</div>
        )}
      </div>
    </div>
  );
}

// Schedules Tab - Similar structure but for schedules
function SchedulesTab() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    authors: string;
    hall: string;
    startTime: string;
    endTime: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    tags: string;
    slideLink: string;
    description: string;
    isPlenary: boolean;
  }>({
    title: '',
    authors: '',
    hall: '',
    startTime: '',
    endTime: '',
    status: 'upcoming',
    tags: '',
    slideLink: '',
    description: '',
    isPlenary: false,
  });

  useEffect(() => {
    loadData();
    socketClient.connect();
    socketClient.on('schedule:new', loadData);
    socketClient.on('schedule:update', loadData);
    return () => {
      socketClient.off('schedule:new');
      socketClient.off('schedule:update');
    };
  }, []);

  const loadData = async () => {
    try {
      const [schedulesData, hallsData] = await Promise.all([
        api.getSchedules(),
        api.getHalls(),
      ]);
      setSchedules(schedulesData || []);
      setHalls(hallsData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        title: formData.title,
        authors: formData.authors,
        hall: formData.hall,
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        slideLink: formData.slideLink || undefined,
        description: formData.description || undefined,
        isPlenary: Boolean(formData.isPlenary), // Explicitly convert to boolean
      };
      console.log('Submitting schedule data - formData.isPlenary:', formData.isPlenary, 'data.isPlenary:', data.isPlenary);
      console.log('Full data object:', JSON.stringify(data, null, 2));
      if (editing) {
        await api.updateSchedule(editing._id, data);
      } else {
        await api.createSchedule(data);
      }
      setShowForm(false);
      setEditing(null);
      setFormData({
        title: '', authors: '', hall: '', startTime: '', endTime: '',
        status: 'upcoming', tags: '', slideLink: '', description: '', isPlenary: false,
      });
      loadData();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule');
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditing(schedule);
      console.log('Editing schedule:', schedule);
      console.log('isPlenary value:', schedule.isPlenary, typeof schedule.isPlenary);
    setFormData({
      title: schedule.title,
      authors: schedule.authors,
      hall: typeof schedule.hall === 'object' && schedule.hall !== null ? schedule.hall._id : (schedule.hall || ''),
      startTime: format(new Date(schedule.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(schedule.endTime), "yyyy-MM-dd'T'HH:mm"),
      status: schedule.status,
      tags: schedule.tags.join(', '),
      slideLink: schedule.slideLink || '',
      description: schedule.description || '',
      isPlenary: schedule.isPlenary === true || schedule.isPlenary === 'true' || false,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this schedule?')) {
      try {
        await api.deleteSchedule(id);
        loadData();
      } catch (error) {
        alert('Failed to delete schedule');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedules</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({
              title: '', authors: '', hall: '', startTime: '', endTime: '',
              status: 'upcoming', tags: '', slideLink: '', description: '', isPlenary: false,
            });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Create'} Schedule</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Authors</label>
                <input
                  type="text"
                  required
                  value={formData.authors}
                  onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Hall</label>
                <select
                  required
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Hall</option>
                  {halls.map(hall => (
                    <option key={hall._id} value={hall._id}>{hall.name} ({hall.code})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="research, technology, day-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slide Link (optional)</label>
              <input
                type="url"
                value={formData.slideLink}
                onChange={(e) => setFormData({ ...formData, slideLink: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description (optional)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPlenary}
                  onChange={(e) => setFormData({ ...formData, isPlenary: e.target.checked })}
                  className="w-5 h-5 text-yellow-600 border-yellow-300 rounded focus:ring-yellow-500 focus:ring-2"
                />
                <div>
                  <span className="text-sm font-semibold text-yellow-900">Plenary Lecture</span>
                  <p className="text-xs text-yellow-700">Mark this as a plenary lecture (will display with golden design)</p>
                </div>
              </label>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              {editing ? 'Update' : 'Create'}
            </button>
          </form>
            </div>
          )}

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <div key={schedule._id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{schedule.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    schedule.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                    schedule.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                    schedule.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {schedule.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-1">By: {schedule.authors}</p>
                <p className="text-gray-600 text-sm mb-1">
                  {typeof schedule.hall === 'object' && schedule.hall !== null ? schedule.hall.name : 'Unknown Hall'}
                </p>
                <p className="text-gray-500 text-sm">
                  {format(new Date(schedule.startTime), 'PPp')} - {format(new Date(schedule.endTime), 'p')}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(schedule)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(schedule._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {schedules.length === 0 && (
          <div className="text-center py-12 text-gray-500">No schedules yet</div>
        )}
      </div>
    </div>
  );
}

// Complaints Tab
function ComplaintsTab() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Complaint | null>(null);
  const [formData, setFormData] = useState<{
    status: 'pending' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
    response: string;
  }>({
    status: 'pending',
    response: '',
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      const data = await api.getComplaints();
      setComplaints(data || []);
    } catch (error) {
      console.error('Failed to load complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.updateComplaint(editing._id, formData);
      setShowForm(false);
      setEditing(null);
      loadComplaints();
    } catch (error) {
      alert('Failed to update complaint');
    }
  };

  const handleEdit = (complaint: Complaint) => {
    setEditing(complaint);
    setFormData({
      status: complaint.status,
      response: complaint.response || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this complaint?')) {
      try {
        await api.deleteComplaint(id);
        loadComplaints();
      } catch (error) {
        alert('Failed to delete complaint');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complaints & Feedback</h2>
      </div>

      {showForm && editing && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Update Complaint</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Response</label>
              <textarea
                value={formData.response}
                onChange={(e) => setFormData({ ...formData, response: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={4}
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              Update
            </button>
          </form>
            </div>
          )}

      <div className="space-y-3">
        {complaints.map((complaint) => (
          <div key={complaint._id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{complaint.title}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    complaint.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                    complaint.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {complaint.status}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    complaint.priority === 'high' ? 'bg-red-100 text-red-800' :
                    complaint.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>
                <p className="text-gray-700 mb-2">{complaint.description}</p>
                <p className="text-gray-500 text-sm">
                  Category: {complaint.category} | {format(new Date(complaint.createdAt), 'PPp')}
                </p>
                {complaint.response && (
                  <div className="mt-2 p-2 bg-blue-50 rounded">
                    <p className="text-sm font-medium text-blue-900">Response:</p>
                    <p className="text-sm text-blue-800">{complaint.response}</p>
                  </div>
                )}
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(complaint)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(complaint._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {complaints.length === 0 && (
          <div className="text-center py-12 text-gray-500">No complaints yet</div>
          )}
        </div>
    </div>
  );
}

// Halls Tab
function HallsTab() {
  const [halls, setHalls] = useState<Hall[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Hall | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    capacity: '',
    location: '',
  });

  useEffect(() => {
    loadHalls();
  }, []);

  const loadHalls = async () => {
    try {
      const data = await api.getHalls();
      setHalls(data || []);
    } catch (error) {
      console.error('Failed to load halls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        capacity: parseInt(formData.capacity),
      };
      if (editing) {
        await api.updateHall(editing._id, data);
      } else {
        await api.createHall(data);
      }
      setShowForm(false);
      setEditing(null);
      setFormData({ name: '', code: '', capacity: '', location: '' });
      loadHalls();
    } catch (error) {
      alert('Failed to save hall');
    }
  };

  const handleEdit = (hall: Hall) => {
    setEditing(hall);
    setFormData({
      name: hall.name,
      code: hall.code,
      capacity: hall.capacity.toString(),
      location: hall.location,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this hall?')) {
      try {
        await api.deleteHall(id);
        loadHalls();
      } catch (error) {
        alert('Failed to delete hall');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Halls</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setFormData({ name: '', code: '', capacity: '', location: '' });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Create'} Hall</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Code</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              {editing ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {halls.map((hall) => (
          <div key={hall._id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{hall.name} ({hall.code})</h3>
                <p className="text-gray-600 text-sm">Capacity: {hall.capacity}</p>
                <p className="text-gray-600 text-sm">Location: {hall.location}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(hall)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(hall._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {halls.length === 0 && (
          <div className="text-center py-12 text-gray-500">No halls yet</div>
        )}
      </div>
    </div>
  );
}

// Events Tab
function EventsTab() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [customType, setCustomType] = useState('');
  const [customTypes, setCustomTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState<{
    title: string;
    type: string;
    description: string;
    venue: string;
    startTime: string;
    endTime: string;
    rsvpRequired: boolean;
    ticketInfo: string;
    imageUrl: string;
  }>({
    title: '',
    type: 'dinner',
    description: '',
    venue: '',
    startTime: '',
    endTime: '',
    rsvpRequired: false,
    ticketInfo: '',
    imageUrl: '',
  });

  // Load custom types from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('eventCustomTypes');
      if (stored) {
        try {
          setCustomTypes(JSON.parse(stored));
        } catch (e) {
          console.error('Failed to parse custom types:', e);
        }
      }
    }
  }, []);

  // Get all available types (default + custom)
  const getAllTypes = () => {
    const defaultTypes = ['dinner', 'cultural'];
    const allTypes = [...defaultTypes, ...customTypes];
    return Array.from(new Set(allTypes)); // Remove duplicates
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents();
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // If type is "other", use the custom type value
      const finalType = formData.type === 'other' ? customType : formData.type;
      
      // Validate that if type is "other", customType must be provided
      if (formData.type === 'other' && !customType.trim()) {
        alert('Please enter a custom event type');
        return;
      }

      // Validate that finalType is not empty
      if (!finalType || !finalType.trim()) {
        alert('Event type is required');
        return;
      }
      
      // Save custom type if it's new
      if (formData.type === 'other' && customType && !customTypes.includes(customType.trim())) {
        const newCustomTypes = [...customTypes, customType.trim()];
        setCustomTypes(newCustomTypes);
        if (typeof window !== 'undefined') {
          localStorage.setItem('eventCustomTypes', JSON.stringify(newCustomTypes));
        }
      }

      const submitData = {
        ...formData,
        type: finalType.trim(),
      };

      if (editing) {
        await api.updateEvent(editing._id, submitData);
      } else {
        await api.createEvent(submitData);
      }
      setShowForm(false);
      setEditing(null);
      setCustomType('');
      setFormData({
        title: '', type: 'dinner', description: '', venue: '', startTime: '', endTime: '',
        rsvpRequired: false, ticketInfo: '', imageUrl: '',
      });
      loadEvents();
    } catch (error: any) {
      console.error('Error saving event:', error);
      alert(`Failed to save event: ${error.message || 'Unknown error'}`);
    }
  };

  const handleEdit = (event: Event) => {
    setEditing(event);
    const isCustomType = !['dinner', 'cultural'].includes(event.type);
    setFormData({
      title: event.title,
      type: isCustomType ? 'other' : event.type,
      description: event.description,
      venue: event.venue,
      startTime: format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm"),
      rsvpRequired: event.rsvpRequired,
      ticketInfo: event.ticketInfo || '',
      imageUrl: event.imageUrl || '',
    });
    setCustomType(isCustomType ? event.type : '');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await api.deleteEvent(id);
        loadEvents();
      } catch (error) {
        alert('Failed to delete event');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events</h2>
        <button
          onClick={() => {
            setShowForm(true);
            setEditing(null);
            setCustomType('');
            setFormData({
              title: '', type: 'dinner', description: '', venue: '', startTime: '', endTime: '',
              rsvpRequired: false, ticketInfo: '', imageUrl: '',
            });
          }}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          <span>Add New</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">{editing ? 'Edit' : 'Create'} Event</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    setFormData({ ...formData, type: e.target.value });
                    if (e.target.value !== 'other') {
                      setCustomType('');
                    }
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="dinner">Dinner</option>
                  <option value="cultural">Cultural</option>
                  <option value="other">Other</option>
                  {customTypes.map((customType) => (
                    <option key={customType} value={customType}>
                      {customType}
                    </option>
                  ))}
                </select>
                {formData.type === 'other' && (
                  <input
                    type="text"
                    required
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom event type"
                    className="w-full px-3 py-2 border rounded-lg mt-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                      }
                    }}
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Venue</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.rsvpRequired}
                onChange={(e) => setFormData({ ...formData, rsvpRequired: e.target.checked })}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium">RSVP Required</label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ticket Info (optional)</label>
              <input
                type="text"
                value={formData.ticketInfo}
                onChange={(e) => setFormData({ ...formData, ticketInfo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              {editing ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {events.map((event) => (
          <div key={event._id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{event.title}</h3>
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    {event.type}
                  </span>
                  {event.rsvpRequired && (
                    <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                      RSVP Required
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{event.description}</p>
                <p className="text-gray-600 text-sm mb-1">Venue: {event.venue}</p>
                <p className="text-gray-500 text-sm">
                  {format(new Date(event.startTime), 'PPp')} - {format(new Date(event.endTime), 'p')}
                </p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(event)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">No events yet</div>
        )}
      </div>
    </div>
  );
}

// Users Tab
function UsersTab() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<UserType | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: 'admin' | 'volunteer' | 'attendee';
  }>({
    name: '',
    email: '',
    role: 'attendee',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    try {
      await api.updateUser(editing.id, formData);
      setShowForm(false);
      setEditing(null);
      loadUsers();
    } catch (error) {
      alert('Failed to update user');
    }
  };

  const handleEdit = (user: UserType) => {
    setEditing(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await api.deleteUser(id);
        loadUsers();
      } catch (error) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>

      {showForm && editing && (
        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Edit User</h3>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="text-gray-500 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="attendee">Attendee</option>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Save className="w-4 h-4 inline mr-2" />
              Update
            </button>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-bold text-lg">{user.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'volunteer' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users yet</div>
        )}
      </div>
    </div>
  );
}
