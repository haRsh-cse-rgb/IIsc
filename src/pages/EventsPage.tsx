import { useEffect, useState } from 'react';
import { Utensils, Music, Calendar, MapPin, Clock, Ticket } from 'lucide-react';
import { api } from '../lib/api';
import { socketClient } from '../lib/socket';
import { Event } from '../types';
import { format } from 'date-fns';

export const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filter, setFilter] = useState<'all' | 'dinner' | 'cultural'>('all');
  const [loading, setLoading] = useState(true);

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

  const getEventIcon = (type: string) => {
    return type === 'dinner' ? Utensils : Music;
  };

  const getEventColor = (type: string) => {
    return type === 'dinner'
      ? 'from-orange-600 to-orange-700'
      : 'from-purple-600 to-purple-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Utensils className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Dinners & Cultural Events</h1>
        </div>
        <p className="text-pink-100">Join us for evening social events and cultural programs</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilter('dinner')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'dinner'
                ? 'bg-orange-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Dinners</span>
          </button>
          <button
            onClick={() => setFilter('cultural')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'cultural'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Music className="w-4 h-4" />
            <span>Cultural</span>
          </button>
        </div>
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
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{event.title}</h3>
                        <span className="px-2 py-1 bg-white bg-opacity-20 rounded text-xs font-medium uppercase">
                          {event.type}
                        </span>
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
  );
};
