'use client';

import { useEffect, useState } from 'react';
import { Coffee, Utensils, Coffee as TeaIcon, Calendar } from 'lucide-react';
import { Menu } from '@/src/types';
import { Layout } from '@/src/components/Layout';
import menuData from './menu.json';

export default function MenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);

  useEffect(() => {
    document.title = 'Menu - STIS Conference';
  }, []);

  useEffect(() => {
    loadMenus();
  }, []);

  const loadMenus = () => {
    try {
      // Convert JSON data to Menu format (add _id for compatibility)
      const formattedMenus: Menu[] = menuData.map((menu, index) => ({
        ...menu,
        mealType: menu.mealType as 'breakfast' | 'lunch' | 'tea' | 'tea-am' | 'tea-pm',
        _id: `menu-${menu.day}-${menu.mealType}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      const sorted = formattedMenus.sort((a: Menu, b: Menu) => {
        if (a.day !== b.day) return a.day - b.day;
        const order: { [key: string]: number } = { 
          breakfast: 1, 
          lunch: 2, 
          'tea-am': 3,
          'tea-pm': 4,
          tea: 5 
        };
        return (order[a.mealType] || 99) - (order[b.mealType] || 99);
      });
      setMenus(sorted);
    } catch (error) {
      console.error('Failed to load menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return <Coffee className="w-6 h-6" />;
      case 'lunch':
        return <Utensils className="w-6 h-6" />;
      case 'tea':
        return <TeaIcon className="w-6 h-6" />;
      default:
        return <Utensils className="w-6 h-6" />;
    }
  };

  const getMealColor = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'lunch':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'tea':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getMealTitle = (mealType: string) => {
    switch (mealType) {
      case 'breakfast':
        return 'Breakfast';
      case 'lunch':
        return 'Lunch';
      case 'tea':
        return 'Tea Time';
      case 'tea-am':
        return 'Hi-Tea (AM)';
      case 'tea-pm':
        return 'Hi-Tea (PM)';
      default:
        return mealType;
    }
  };

  const getMenusByDay = (day: number) => {
    return menus.filter(m => m.day === day);
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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center space-x-3 mb-3">
            <Coffee className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Conference Menu</h1>
          </div>
          <p className="text-orange-100">3-day meal schedule for all attendees</p>
        </div>

        {/* Day Filter Buttons */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-wrap gap-3 justify-center">
            {[1, 2, 3].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  selectedDay === day
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Day {day}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Day Menu */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <h2 className="text-xl font-bold">Day {selectedDay}</h2>
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const dayMenus = getMenusByDay(selectedDay);
                return ['breakfast', 'lunch', 'tea-am', 'tea-pm'].map((mealType) => {
                  const menu = dayMenus.find(m => m.mealType === mealType);
                  const colorClass = mealType === 'tea-am' || mealType === 'tea-pm' 
                    ? getMealColor('tea') 
                    : getMealColor(mealType);
                  const icon = mealType === 'tea-am' || mealType === 'tea-pm' 
                    ? getMealIcon('tea') 
                    : getMealIcon(mealType);
                  
                  return (
                    <div
                      key={mealType}
                      className={`rounded-lg border-2 p-4 ${colorClass} h-full flex flex-col`}
                    >
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="p-2 bg-white rounded-lg">
                          {icon}
                        </div>
                        <h3 className="font-bold text-lg">{getMealTitle(mealType)}</h3>
                      </div>

                      {menu ? (
                        <div className="flex-1">
                          {menu.description && (
                            <p className="text-sm mb-3 opacity-75 font-medium">{menu.description}</p>
                          )}
                          {menu.categories ? (
                            <div className="space-y-4">
                              {menu.categories.map((category, catIdx) => (
                                <div key={catIdx} className="space-y-1">
                                  <h4 className="font-semibold text-sm uppercase tracking-wide opacity-90 mb-1.5">
                                    {category.name}
                                  </h4>
                                  <ul className="space-y-1 ml-2">
                                    {category.items.map((item, idx) => (
                                      <li key={idx} className="flex items-start space-x-2">
                                        <span className="text-lg leading-none mt-0.5">•</span>
                                        <span className="text-sm">{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          ) : menu.items ? (
                            <ul className="space-y-1">
                              {menu.items.map((item, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-lg leading-none">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : null}
                        </div>
                      ) : (
                        <p className="text-sm opacity-60 italic">Menu not available</p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {menus.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Coffee className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No menu items available yet. Check back later!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}

