'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { api } from '@/src/lib/api';
import { TechnicalSession, Schedule } from '@/src/types';
import { format } from 'date-fns';
import { Layout } from '@/src/components/Layout';

const DAYS = [
  { label: 'Day 3 - Dec 10', value: '2025-12-10' },
  { label: 'Day 4 - Dec 11', value: '2025-12-11' },
];

export default function TechnicalSessionsPage() {
  const [selectedDay, setSelectedDay] = useState<string>(DAYS[0].value);
  const [sessions, setSessions] = useState<TechnicalSession[]>([]);
  const [presentations, setPresentations] = useState<Record<string, Schedule[]>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingPresentations, setLoadingPresentations] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadSessions(selectedDay);
  }, [selectedDay]);

  const loadSessions = async (day: string) => {
    try {
      setLoadingSessions(true);
      const data = await api.getTechnicalSessions({ day });
      setSessions(data || []);
    } catch (error) {
      console.error('Failed to load technical sessions', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadPresentations = async (sessionId: string) => {
    setLoadingPresentations((prev) => ({ ...prev, [sessionId]: true }));
    try {
      const data = await api.getSchedules({ technicalSession: sessionId });
      setPresentations((prev) => ({ ...prev, [sessionId]: data || [] }));
    } catch (error) {
      console.error('Failed to load presentations', error);
    } finally {
      setLoadingPresentations((prev) => ({ ...prev, [sessionId]: false }));
    }
  };

  const togglePresentations = (sessionId: string) => {
    if (presentations[sessionId]) {
      // Collapse if already loaded
      setPresentations((prev) => {
        const copy = { ...prev };
        delete copy[sessionId];
        return copy;
      });
    } else {
      loadPresentations(sessionId);
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Technical Sessions</h1>
              <p className="text-gray-600 text-sm">
                Day-wise listing with halls, chairs, and linked presentations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <button
                key={day.value}
                onClick={() => setSelectedDay(day.value)}
                className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                  selectedDay === day.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {loadingSessions ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            Loading sessions...
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center text-gray-500">
            No technical sessions for this day.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {sessions.map((session) => (
              <div key={session._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-semibold text-blue-600">Technical Session</p>
                    <h3 className="text-lg font-bold text-gray-900">{session.title}</h3>
                    <p className="text-sm text-gray-500">{session.code}</p>
                  </div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700">
                    {format(new Date(session.startTime), 'h:mm a')} - {format(new Date(session.endTime), 'h:mm a')}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{session.hall ? `${session.hall.name} (${session.hall.code})` : 'Hall TBD'}</span>
                  </div>
                  {session.chairName && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        Chair: {session.chairName}
                        {session.chairTitle ? `, ${session.chairTitle}` : ''}
                      </span>
                    </div>
                  )}
                  {session.description && <p className="text-gray-600">{session.description}</p>}
                </div>

                <button
                  onClick={() => togglePresentations(session._id)}
                  className="w-full flex items-center justify-center space-x-2 text-sm font-medium text-blue-600 hover:text-blue-700 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {presentations[session._id] ? 'Hide presentations' : 'Show presentations'}
                  </span>
                </button>

                {presentations[session._id] && (
                  <div className="border border-gray-100 rounded-lg p-3 space-y-3 bg-gray-50">
                    {loadingPresentations[session._id] ? (
                      <div className="text-sm text-gray-500">Loading presentations...</div>
                    ) : presentations[session._id].length === 0 ? (
                      <div className="text-sm text-gray-500">No presentations linked yet.</div>
                    ) : (
                      presentations[session._id].map((item) => (
                        <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-3 space-y-1">
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-600">{item.authors}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(new Date(item.startTime), 'h:mm a')} - {format(new Date(item.endTime), 'h:mm a')}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

