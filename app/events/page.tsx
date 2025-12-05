'use client';

import { useEffect, useState, useRef } from 'react';
import { Utensils, Music, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { api } from '@/src/lib/api';
import { socketClient } from '@/src/lib/socket';
import { Event } from '@/src/types';
import { format } from 'date-fns';
import { Layout } from '@/src/components/Layout';

function FilterButtonsWithScrollIndicator({
  filter,
  setFilter,
  uniqueTypes,
  getEventIcon,
  getFilterButtonColor,
  getTypeDisplayName,
}: {
  filter: string;
  setFilter: (filter: string) => void;
  uniqueTypes: string[];
  getEventIcon: (type: string) => any;
  getFilterButtonColor: (type: string, isActive: boolean) => string;
  getTypeDisplayName: (type: string) => string;
}) {
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const checkScrollability = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const needsScrolling = scrollWidth > clientWidth;
    setCanScrollLeft(needsScrolling && scrollLeft > 0);
    setCanScrollRight(needsScrolling && scrollLeft < scrollWidth - clientWidth - 1);
  };

  useEffect(() => {
    checkScrollability();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollability);
      window.addEventListener('resize', checkScrollability);
    }
    return () => {
      if (container) {
        container.removeEventListener('scroll', checkScrollability);
      }
      window.removeEventListener('resize', checkScrollability);
    };
  }, [uniqueTypes]);

  return (
    <div 
      ref={scrollContainerRef}
      className={`horizontal-scroll-container scroll-fade-left scroll-fade-right flex items-center space-x-3 pb-2 ${
        canScrollLeft ? '' : 'scrolled-to-start'
      } ${canScrollRight ? '' : 'scrolled-to-end'}`}
    >
      <button
        onClick={() => setFilter('all')}
        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
          filter === 'all'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        All Events
      </button>
      {uniqueTypes.map((type) => {
        const Icon = getEventIcon(type);
        return (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex-shrink-0 ${getFilterButtonColor(type, filter === type)}`}
          >
            <Icon className="w-4 h-4" />
            <span>{getTypeDisplayName(type)}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Events - STIS Conference';
  }, []);

  useEffect(() => {
    loadEvents();

    socketClient.connect();
    socketClient.on('event:new', (event: Event) => {
      setEvents(prev => [...prev, event].sort((a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ));
    });

    socketClient.on('event:update', (event: Event) => {
      setEvents(prev =>
        prev.map(e => (e._id === event._id ? event : e))
      );
    });

    socketClient.on('event:delete', ({ id }: { id: string }) => {
      setEvents(prev => prev.filter(e => e._id !== id));
    });

    return () => {
      socketClient.off('event:new');
      socketClient.off('event:update');
      socketClient.off('event:delete');
    };
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.getEvents({ upcoming: true });
      setEvents(data);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event =>
    filter === 'all' || event.type === filter
  );

  // Get all unique event types from the events
  const uniqueTypes = Array.from(new Set(events.map(event => event.type))).sort();

  const getEventIcon = (type: string) => {
    if (type === 'dinner') return Utensils;
    if (type === 'cultural') return Music;
    // Default icon for custom types
    return Calendar;
  };

  const getEventColor = (type: string) => {
    if (type === 'dinner') {
      return 'from-orange-600 to-orange-700';
    } else if (type === 'cultural') {
      return 'from-purple-600 to-purple-700';
    } else {
      // Default color for custom types
      return 'from-blue-600 to-blue-700';
    }
  };

  const getFilterButtonColor = (type: string, isActive: boolean) => {
    if (!isActive) {
      return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
    if (type === 'dinner') {
      return 'bg-orange-600 text-white';
    } else if (type === 'cultural') {
      return 'bg-purple-600 text-white';
    } else {
      return 'bg-blue-600 text-white';
    }
  };

  const getTypeDisplayName = (type: string) => {
    // Capitalize first letter and handle common types
    if (type === 'dinner') return 'Dinners';
    if (type === 'cultural') return 'Cultural';
    // For custom types, capitalize first letter
    return type.charAt(0).toUpperCase() + type.slice(1);
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
        <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Utensils className="w-8 h-8" />
            <h1 className="text-3xl font-bold">STIS-V Events</h1>
          </div>
          <p className="text-pink-100">Join us for evening social events and cultural programs at STIS-V</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <FilterButtonsWithScrollIndicator
            filter={filter}
            setFilter={setFilter}
            uniqueTypes={uniqueTypes}
            getEventIcon={getEventIcon}
            getFilterButtonColor={getFilterButtonColor}
            getTypeDisplayName={getTypeDisplayName}
          />
        </div>

        <div className="space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>No {filter === 'all' ? '' : filter} events scheduled yet.</p>
            </div>
          ) : (
            filteredEvents.map((event) => {
              const Icon = getEventIcon(event.type);
              return (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className={`bg-gradient-to-r ${getEventColor(event.type)} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="p-2 bg-white bg-opacity-20 rounded-lg flex-shrink-0">
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-2xl font-bold mb-1 break-words">{event.title}</h3>
                          <div className="overflow-x-auto">
                            <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-medium uppercase whitespace-nowrap inline-block">
                              {event.type}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <p className="text-gray-700 leading-relaxed">{event.description}</p>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-start space-x-3">
                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Date</p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Time</p>
                          <p className="font-medium text-gray-900">
                            {format(new Date(event.startTime), 'h:mm a')} -{' '}
                            {format(new Date(event.endTime), 'h:mm a')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-500">Venue</p>
                          <p className="font-medium text-gray-900">{event.venue}</p>
                        </div>
                      </div>

                      {(event.rsvpRequired || event.ticketInfo) && (
                        <div className="flex items-start space-x-3">
                          <Ticket className="w-5 h-5 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">RSVP</p>
                            <p className="font-medium text-gray-900">
                              {event.rsvpRequired ? 'Required' : 'Not Required'}
                            </p>
                            {event.ticketInfo && (
                              <p className="text-sm text-gray-600 mt-1">{event.ticketInfo}</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}

