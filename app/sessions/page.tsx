'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, X } from 'lucide-react';
import { Layout } from '@/src/components/Layout';

interface Session {
  sessionNo: string;
  theme: string;
  sessionChair: string;
  startTime: string;
  endTime: string;
  hallName: string;
  hallCode: string;
}

interface SessionsData {
  [date: string]: Session[];
}

export default function SessionsPage() {
  const [selectedDate, setSelectedDate] = useState<string>('2024-12-10');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [imageError, setImageError] = useState(false);
  const [imageExtIndex, setImageExtIndex] = useState(0);
  const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

  const dates = [
    { label: '10th December', value: '2024-12-10' },
    { label: '11th December', value: '2024-12-11' },
  ];

  useEffect(() => {
    document.title = 'Sessions - STIS Conference';
    loadSessions();
  }, [selectedDate]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/sessions-data.json');
      const data: SessionsData = await response.json();
      setSessions(data[selectedDate] || []);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setImageError(false);
    setImageExtIndex(0);
  };

  const handleCloseImage = () => {
    setSelectedSession(null);
    setImageError(false);
    setImageExtIndex(0);
  };

  const getImagePath = (sessionNo: string) => {
    return `/sessions/${sessionNo}${IMAGE_EXTENSIONS[imageExtIndex]}`;
  };

  const handleImageError = () => {
    if (imageExtIndex < IMAGE_EXTENSIONS.length - 1) {
      setImageExtIndex((idx) => idx + 1);
    } else {
      setImageError(true);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-lg p-6 md:p-8 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="w-8 h-8 md:w-10 md:h-10" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Sessions</h1>
              <p className="text-indigo-100 text-sm md:text-base">
                Browse all technical sessions by date
              </p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex flex-wrap gap-3 mt-6">
            {dates.map((date) => (
              <button
                key={date.value}
                onClick={() => setSelectedDate(date.value)}
                className={`px-4 py-2 md:px-6 md:py-3 rounded-lg font-medium text-sm md:text-base transition-all ${
                  selectedDate === date.value
                    ? 'bg-white text-indigo-600 shadow-lg scale-105'
                    : 'bg-indigo-500 text-white hover:bg-indigo-400'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading sessions...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No sessions found for this date</p>
          </div>
        ) : (
          /* Sessions Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {sessions.map((session) => (
              <div
                key={session.sessionNo}
                onClick={() => handleSessionClick(session)}
                className="bg-white rounded-xl shadow-md hover:shadow-xl border-2 border-gray-200 hover:border-indigo-400 p-5 md:p-6 cursor-pointer transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {/* Session Number Badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">
                    {session.sessionNo}
                  </span>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>

                {/* Theme */}
                <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {session.theme}
                </h3>

                {/* Session Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start space-x-2">
                    <Users className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <span className="flex-1">
                      <span className="font-medium">Chair:</span> {session.sessionChair}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span>
                      {session.startTime} - {session.endTime}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                    <span className="font-medium">
                      {session.hallName} ({session.hallCode})
                    </span>
                  </div>
                </div>

                {/* Click Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-indigo-600 font-medium text-center">
                    Click to view presentations →
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Modal */}
        {selectedSession && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={handleCloseImage}
          >
            <div className="relative max-w-7xl w-full h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={handleCloseImage}
                className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

              {/* Session Info Header */}
              <div className="bg-white rounded-t-lg p-4 mb-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                      {selectedSession.sessionNo}: {selectedSession.theme}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedSession.startTime} - {selectedSession.endTime} | {selectedSession.hallName}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseImage}
                    className="md:hidden bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Image Container */}
              <div className="flex-1 bg-gray-900 rounded-b-lg overflow-auto flex items-center justify-center p-4">
                {imageError ? (
                  <div className="text-center text-white">
                    <p className="text-lg mb-2">Image not found</p>
                    <p className="text-sm text-gray-400">
                      Please ensure the image file is named: <code className="bg-gray-800 px-2 py-1 rounded">{selectedSession.sessionNo}.jpg</code>
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Expected path: <code className="bg-gray-800 px-2 py-1 rounded">/sessions/{selectedSession.sessionNo}.jpg</code>
                    </p>
                  </div>
                ) : (
                  <img
                    key={`${selectedSession.sessionNo}-${imageExtIndex}`}
                    src={getImagePath(selectedSession.sessionNo)}
                    alt={`Session ${selectedSession.sessionNo} presentations`}
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={handleImageError}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

