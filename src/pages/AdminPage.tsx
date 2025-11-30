import { useState } from 'react';
import { Settings, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const AdminPage = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'schedules' | 'complaints'>('overview');

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
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
        <div className="flex space-x-2 mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'announcements'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Announcements
          </button>
          <button
            onClick={() => setActiveTab('schedules')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'schedules'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Schedules
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
              activeTab === 'complaints'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Complaints
          </button>
        </div>

        {activeTab === 'overview' && (
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
                <p className="text-purple-700 text-3xl font-bold capitalize">{user?.role}</p>
                <p className="text-purple-600 text-sm">Access Level</p>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
              <h3 className="font-bold text-lg text-yellow-900 mb-3">Admin Features</h3>
              <ul className="space-y-2 text-yellow-800">
                <li>• Create and manage announcements with real-time push updates</li>
                <li>• Add, edit, and delete conference schedules</li>
                <li>• Monitor and respond to attendee feedback</li>
                <li>• Manage events and cultural programs</li>
                <li>• Export data to CSV for reporting</li>
                <li>• View audit logs of all changes</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Full CRUD interface for announcements would be implemented here.
            </p>
            <p className="text-sm text-gray-500">
              Features: Create urgent alerts, schedule announcements, attach files, and push notifications.
            </p>
          </div>
        )}

        {activeTab === 'schedules' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Full schedule management interface would be implemented here.
            </p>
            <p className="text-sm text-gray-500">
              Features: Add/edit sessions, assign halls, update statuses, and bulk import.
            </p>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">
              Complaint management dashboard would be implemented here.
            </p>
            <p className="text-sm text-gray-500">
              Features: View all feedback, assign to volunteers, update status, and respond.
            </p>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-lg text-blue-900 mb-2">Need More Admin Features?</h3>
        <p className="text-blue-800 text-sm">
          This is a simplified admin panel. Full CRUD interfaces for all entities can be expanded based on requirements.
          The backend API endpoints are fully functional and ready to be connected to comprehensive admin UI components.
        </p>
      </div>
    </div>
  );
};
