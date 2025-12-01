'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Bell, Bus, Calendar, Megaphone, Utensils } from 'lucide-react';
import { api } from '@/src/lib/api';
import { socketClient } from '@/src/lib/socket';
import { Announcement } from '@/src/types';
import { formatDistanceToNow } from 'date-fns';
import { Layout } from '@/src/components/Layout';

export default function HomePage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnnouncements();

    socketClient.connect();
    socketClient.on('announcement:new', (announcement: Announcement) => {
      setAnnouncements(prev => [announcement, ...prev]);
    });

    socketClient.on('announcement:update', (announcement: Announcement) => {
      setAnnouncements(prev =>
        prev.map(a => (a._id === announcement._id ? announcement : a))
      );
    });

    socketClient.on('announcement:delete', ({ id }: { id: string }) => {
      setAnnouncements(prev => prev.filter(a => a._id !== id));
    });

    return () => {
      socketClient.off('announcement:new');
      socketClient.off('announcement:update');
      socketClient.off('announcement:delete');
    };
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await api.getAnnouncements({ limit: 50 });
      console.log('Announcements loaded:', data);
      console.log('Announcements count:', data?.length);
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertCircle className="w-5 h-5" />;
      case 'transport':
        return <Bus className="w-5 h-5" />;
      case 'dinner':
        return <Utensils className="w-5 h-5" />;
      case 'cultural':
        return <Calendar className="w-5 h-5" />;
      default:
        return <Megaphone className="w-5 h-5" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Bell className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Live Updates</h1>
          </div>
          <p className="text-blue-100">Stay informed with real-time conference announcements</p>
        </div>

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No announcements yet. Check back later!</p>
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement._id}
                className={`rounded-lg border-2 shadow-md p-5 transition-all hover:shadow-lg ${getPriorityColor(
                  announcement.priority
                )}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getPriorityBadge(announcement.priority)}`}>
                      {getIcon(announcement.type)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{announcement.title}</h3>
                      <div className="flex items-center space-x-2 text-sm opacity-75 mt-1">
                        <span className="capitalize">{announcement.type}</span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getPriorityBadge(
                      announcement.priority
                    )}`}
                  >
                    {announcement.priority}
                  </span>
                </div>

                <p className="text-base leading-relaxed mb-3">{announcement.content}</p>

                {announcement.link && (
                  <a
                    href={announcement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm font-medium hover:underline"
                  >
                    View Details →
                  </a>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

