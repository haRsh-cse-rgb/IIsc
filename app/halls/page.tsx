'use client';

import { useEffect, useState } from 'react';
import { Users, Clock, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { api } from '@/src/lib/api';
import { socketClient } from '@/src/lib/socket';
import { HallStatus } from '@/src/types';
import { format, differenceInMinutes } from 'date-fns';
import { Layout } from '@/src/components/Layout';

export default function HallsPage() {
  const [hallStatuses, setHallStatuses] = useState<HallStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Halls Dashboard - STIS Conference';
  }, []);

  useEffect(() => {
    loadHallStatus();

    const interval = setInterval(loadHallStatus, 60000);

    socketClient.connect();
    socketClient.on('schedule:update', () => {
      loadHallStatus();
    });

    return () => {
      clearInterval(interval);
      socketClient.off('schedule:update');
    };
  }, []);

  const loadHallStatus = async () => {
    try {
      const data = await api.getHallStatus();
      setHallStatuses(data);
    } catch (error) {
      console.error('Failed to load hall status:', error);
    } finally {
      setLoading(false);
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
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Users className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Halls Dashboard</h1>
          </div>
          <p className="text-purple-100">Real-time view of what's happening in each hall</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {hallStatuses.map((status) => (
            <div key={status.hall.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 text-white">
                <h2 className="text-2xl font-bold">{status.hall.code}</h2>
                <p className="text-purple-100 text-sm">{status.hall.name}</p>
                <div className="flex items-center space-x-2 text-sm mt-1 text-purple-100">
                  <MapPin className="w-4 h-4" />
                  <span>{status.hall.location}</span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Current Session
                    </h3>
                    {status.timeRemaining !== null && (
                      <div className="flex items-center space-x-1 text-sm font-medium text-green-600">
                        <Clock className="w-4 h-4" />
                        <span>{status.timeRemaining} min remaining</span>
                      </div>
                    )}
                  </div>

                  {status.current ? (
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {status.current.title}
                      </h4>
                      <p className="text-gray-700 mb-3">{status.current.authors}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {format(new Date(status.current.startTime), 'h:mm a')} -{' '}
                          {format(new Date(status.current.endTime), 'h:mm a')}
                        </span>
                        {status.current.slideLink && (
                          <a
                            href={status.current.slideLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            <ExternalLink className="w-4 h-4" />
                            <span>Slides</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      <Users className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">No ongoing session</p>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <ArrowRight className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                      Next Session
                    </h3>
                  </div>

                  {status.next ? (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {status.next.title}
                      </h4>
                      <p className="text-gray-700 mb-3">{status.next.authors}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Starts at {format(new Date(status.next.startTime), 'h:mm a')}
                        </span>
                        <span className="text-sm font-medium text-blue-600">
                          In {Math.max(0, differenceInMinutes(new Date(status.next.startTime), new Date()))} min
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-center text-gray-500">
                      <p className="font-medium">No upcoming sessions</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

