import { ReactNode, useState } from 'react';
import { Menu, X, Home, Calendar, Users, MapPin, MessageCircle, Utensils, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, isVolunteer } = useAuth();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'programs', label: 'Programs', icon: Calendar },
    { id: 'halls', label: 'Halls', icon: Users },
    { id: 'maps', label: 'Maps', icon: MapPin },
    { id: 'complaints', label: 'Feedback', icon: MessageCircle },
    { id: 'events', label: 'Events', icon: Utensils },
  ];

  if (isAdmin || isVolunteer) {
    navItems.push({ id: 'admin', label: 'Admin', icon: Settings });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold">STIS Conference</h1>
                <p className="text-xs text-blue-100">IISc Bangalore</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      currentPage === item.id
                        ? 'bg-white text-blue-600 shadow-md'
                        : 'text-white hover:bg-blue-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-500 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                      currentPage === item.id
                        ? 'bg-white text-blue-600'
                        : 'text-white hover:bg-blue-500'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {isAuthenticated && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm">
          {user?.name} ({user?.role})
        </div>
      )}
    </div>
  );
};
