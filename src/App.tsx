import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ProgramsPage } from './pages/ProgramsPage';
import { HallsPage } from './pages/HallsPage';
import { MapsPage } from './pages/MapsPage';
import { ComplaintsPage } from './pages/ComplaintsPage';
import { EventsPage } from './pages/EventsPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { isAuthenticated, isAdmin, isVolunteer } = useAuth();

  const handleNavigate = (page: string) => {
    if (page === 'admin' && !isAuthenticated) {
      setCurrentPage('login');
    } else {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => console.log('SW registered:', registration))
          .catch(error => console.log('SW registration failed:', error));
      });
    }
  }, []);

  if (currentPage === 'login') {
    return <LoginPage onSuccess={() => setCurrentPage('admin')} />;
  }

  if (currentPage === 'admin' && !isAuthenticated) {
    setCurrentPage('login');
    return null;
  }

  return (
    <Layout currentPage={currentPage} onNavigate={handleNavigate}>
      {currentPage === 'home' && <HomePage />}
      {currentPage === 'programs' && <ProgramsPage />}
      {currentPage === 'halls' && <HallsPage />}
      {currentPage === 'maps' && <MapsPage />}
      {currentPage === 'complaints' && <ComplaintsPage />}
      {currentPage === 'events' && <EventsPage />}
      {currentPage === 'admin' && <AdminPage />}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
