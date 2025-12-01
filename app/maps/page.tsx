'use client';

import { MapPin, Navigation, Building, Home as HomeIcon, Utensils } from 'lucide-react';
import { Layout } from '@/src/components/Layout';

interface Location {
  name: string;
  address: string;
  coordinates: string;
  icon: any;
  color: string;
}

export default function MapsPage() {
  const locations: Location[] = [
    {
      name: 'Main Campus Entrance',
      address: 'IISc Main Gate, CV Raman Avenue, Bangalore',
      coordinates: '13.0214,77.5671',
      icon: Building,
      color: 'blue'
    },
    {
      name: 'Registration Desk',
      address: 'Faculty Hall, IISc Campus',
      coordinates: '13.0207,77.5662',
      icon: HomeIcon,
      color: 'green'
    },
    {
      name: 'Conference Halls',
      address: 'Faculty Hall Complex, IISc',
      coordinates: '13.0207,77.5662',
      icon: Building,
      color: 'purple'
    },
    {
      name: 'Dining Hall',
      address: 'Central Dining Facility, IISc',
      coordinates: '13.0220,77.5655',
      icon: Utensils,
      color: 'orange'
    },
    {
      name: 'Guest House',
      address: 'IISc Guest House, Malleshwaram',
      coordinates: '13.0210,77.5660',
      icon: HomeIcon,
      color: 'red'
    }
  ];

  const openInMaps = (coordinates: string, name: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coordinates}`;
    window.open(url, '_blank');
  };

  const getColorClasses = (color: string) => {
    const classes: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600 border-blue-300',
      green: 'bg-green-100 text-green-600 border-green-300',
      purple: 'bg-purple-100 text-purple-600 border-purple-300',
      orange: 'bg-orange-100 text-orange-600 border-orange-300',
      red: 'bg-red-100 text-red-600 border-red-300'
    };
    return classes[color] || classes.blue;
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <MapPin className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Maps & Navigation</h1>
          </div>
          <p className="text-green-100">Find your way around the conference venue</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">How to Reach IISc Bangalore</h2>
          <p className="text-gray-700 mb-4">
            Indian Institute of Science is located in the heart of Bangalore city. The campus is easily accessible
            from all parts of the city.
          </p>
          <button
            onClick={() => openInMaps('13.0214,77.5671', 'IISc Bangalore')}
            className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            <Navigation className="w-5 h-5" />
            <span>Open in Google Maps</span>
          </button>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Key Locations</h2>

          {locations.map((location, index) => {
            const Icon = location.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className={`p-3 rounded-lg border-2 ${getColorClasses(location.color)}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">{location.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{location.address}</p>
                      <button
                        onClick={() => openInMaps(location.coordinates, location.name)}
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Get Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-lg text-blue-900 mb-2">Need Help?</h3>
          <p className="text-blue-800 text-sm">
            If you're having trouble finding a location, please visit the Registration Desk or contact a volunteer.
            Emergency contact: +91-80-2293-2001
          </p>
        </div>
      </div>
    </Layout>
  );
}

