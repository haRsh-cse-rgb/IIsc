'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Tag, ExternalLink, Star } from 'lucide-react';
import { api } from '@/src/lib/api';
import { socketClient } from '@/src/lib/socket';
import { Schedule } from '@/src/types';
import { format } from 'date-fns';
import { Layout } from '@/src/components/Layout';

export default function ProgramsPage() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedHall, setSelectedHall] = useState<string>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadSchedules();
    loadFavorites();

    socketClient.connect();
    socketClient.on('schedule:new', (schedule: Schedule) => {
      setSchedules(prev => [...prev, schedule].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));
    });

    socketClient.on('schedule:update', (schedule: Schedule) => {
      setSchedules(prev =>
        prev.map(s => (s._id === schedule._id ? schedule : s))
      );
    });

    socketClient.on('schedule:delete', ({ id }: { id: string }) => {
      setSchedules(prev => prev.filter(s => s._id !== id));
    });

    return () => {
      socketClient.off('schedule:new');
      socketClient.off('schedule:update');
      socketClient.off('schedule:delete');
    };
  }, []);

  // Update current time frequently and at exact transition moments
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    // Update every 5 seconds for responsive real-time updates
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 5000); // Update every 5 seconds

    // Calculate next status transition time and set timeout
    const calculateNextTransition = () => {
      const now = new Date().getTime();
      let nextTransition: number | null = null;

      schedules.forEach(schedule => {
        if (schedule.status === 'cancelled') return;

        const startTime = new Date(schedule.startTime).getTime();
        const endTime = new Date(schedule.endTime).getTime();

        // If upcoming, next transition is when it starts
        if (now < startTime) {
          if (nextTransition === null || startTime < nextTransition) {
            nextTransition = startTime;
          }
        }
        // If ongoing, next transition is when it ends
        else if (now >= startTime && now <= endTime) {
          if (nextTransition === null || endTime < nextTransition) {
            nextTransition = endTime;
          }
        }
      });

      return nextTransition;
    };

    const scheduleNextUpdate = () => {
      // Clear any existing timeout
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }

      const nextTransition = calculateNextTransition();
      if (nextTransition) {
        const now = new Date().getTime();
        const delay = Math.max(0, nextTransition - now);
        
        // Only set timeout if it's within a reasonable range (not too far in the future)
        if (delay > 0 && delay < 24 * 60 * 60 * 1000) { // Within 24 hours
          timeoutId = setTimeout(() => {
            setCurrentTime(new Date());
            scheduleNextUpdate(); // Schedule the next one
          }, delay);
        }
      }
    };

    // Schedule updates for exact transition moments
    scheduleNextUpdate();

    // Also update when the page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setCurrentTime(new Date());
        scheduleNextUpdate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [schedules]);

  const loadSchedules = async () => {
    try {
      const data = await api.getSchedules();
      console.log('Schedules loaded:', data);
      console.log('Schedules count:', data?.length);
      setSchedules(data || []);
    } catch (error) {
      console.error('Failed to load schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favorites');
      if (stored) {
        setFavorites(new Set(JSON.parse(stored)));
      }
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
    if (typeof window !== 'undefined') {
      localStorage.setItem('favorites', JSON.stringify(Array.from(newFavorites)));
    }
  };

  const getUniqueDays = () => {
    const days = new Set<string>();
    schedules.forEach(schedule => {
      const day = format(new Date(schedule.startTime), 'yyyy-MM-dd');
      days.add(day);
    });
    return Array.from(days).sort();
  };

  const getUniqueHalls = () => {
    const halls = new Set<string>();
    schedules.forEach(schedule => {
      if (schedule.hall && typeof schedule.hall === 'object' && schedule.hall !== null) {
        halls.add(schedule.hall._id);
      }
    });
    return Array.from(halls);
  };

  const filteredSchedules = schedules.filter(schedule => {
    const dayMatch = selectedDay === 'all' ||
      format(new Date(schedule.startTime), 'yyyy-MM-dd') === selectedDay;
    const hallMatch = selectedHall === 'all' || 
      (schedule.hall && typeof schedule.hall === 'object' && schedule.hall._id === selectedHall);
    return dayMatch && hallMatch;
  });

  // Calculate status based on current time vs presentation time
  const getCalculatedStatus = (schedule: Schedule): 'upcoming' | 'ongoing' | 'completed' | 'cancelled' => {
    // If status is cancelled, respect that
    if (schedule.status === 'cancelled') {
      return 'cancelled';
    }

    const now = currentTime.getTime();
    const startTime = new Date(schedule.startTime).getTime();
    const endTime = new Date(schedule.endTime).getTime();

    if (now < startTime) {
      return 'upcoming';
    } else if (now >= startTime && now <= endTime) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'completed':
        return 'bg-gray-100 text-gray-600 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
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

  const uniqueDays = getUniqueDays();
  const uniqueHalls = getUniqueHalls();

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Conference Programs</h1>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Day</label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Days</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day}>
                    {format(new Date(day), 'EEEE, MMMM d')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Hall</label>
              <select
                value={selectedHall}
                onChange={(e) => setSelectedHall(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Halls</option>
                {uniqueHalls.map(hallId => {
                  const hall = schedules.find(s => s.hall._id === hallId)?.hall;
                  return hall ? (
                    <option key={hallId} value={hallId}>
                      {hall.name} ({hall.code})
                    </option>
                  ) : null;
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSchedules.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No programs found for the selected filters.</p>
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <div
                key={schedule._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{schedule.title}</h3>
                      <button
                        onClick={() => toggleFavorite(schedule._id)}
                        className={`p-1 rounded-full transition-colors ${
                          favorites.has(schedule._id)
                            ? 'text-yellow-500 hover:text-yellow-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <Star className={`w-5 h-5 ${favorites.has(schedule._id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                    <p className="text-gray-600 mb-3">{schedule.authors}</p>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2 text-gray-700">
                        <Clock className="w-4 h-4" />
                        <span>
                          {format(new Date(schedule.startTime), 'h:mm a')} -{' '}
                          {format(new Date(schedule.endTime), 'h:mm a')}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-gray-700">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {schedule.hall && typeof schedule.hall === 'object' && schedule.hall !== null
                            ? `${schedule.hall.name} (${schedule.hall.code})`
                            : 'Unknown Hall'}
                        </span>
                      </div>
                    </div>

                    {schedule.tags.length > 0 && (
                      <div className="flex items-center space-x-2 mt-3">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex flex-wrap gap-2">
                          {schedule.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getStatusColor(
                        getCalculatedStatus(schedule)
                      )}`}
                    >
                      {getCalculatedStatus(schedule)}
                    </span>

                    {schedule.slideLink && (
                      <a
                        href={schedule.slideLink}
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

                {schedule.description && (
                  <p className="text-gray-600 text-sm mt-3 pt-3 border-t border-gray-200">
                    {schedule.description}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}

