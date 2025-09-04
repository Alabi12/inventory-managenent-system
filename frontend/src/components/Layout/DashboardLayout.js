import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Package,
  Home,
  List,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Filter,
  Calendar
} from 'lucide-react';

// Import page components
import Dashboard from '../../pages/Dashboard';
import Inventory from '../../pages/Inventory';
import Transactions from '../../pages/Transactions';
import Reports from '../../pages/Reports';
import SettingsPage from '../../pages/Settings';

const DashboardLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState(7);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Transactions', href: '/transactions', icon: List },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const dayFilters = [
    { label: 'Today', value: 1 },
    { label: 'Last 7 Days', value: 7 },
    { label: 'Last 30 Days', value: 30 },
    { label: 'Last 90 Days', value: 90 },
    { label: 'Custom Range', value: 'custom' },
  ];

  // Handle scroll for header shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleDayFilterChange = (days) => {
    setSelectedDays(days);
    setFilterMenuOpen(false);
    // Here you would typically trigger a data refresh with the new filter
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-sans">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64 flex flex-col bg-gradient-to-b from-indigo-700 to-purple-800">
          <div className="flex items-center justify-between h-16 flex-shrink-0 px-4 bg-indigo-800">
            <div className="flex items-center">
              <div className="bg-white p-2 rounded-lg">
                <Package className="h-6 w-6 text-indigo-700" />
              </div>
              <h1 className="ml-3 text-xl font-bold text-white">InventoryPro</h1>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-5 flex-1 px-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                      active
                        ? 'bg-white text-indigo-700 shadow-lg'
                        : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-indigo-300'}`} />
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-indigo-600 p-4">
            <div className="flex items-center w-full">
              <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-indigo-700" />
                )}
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <p className="text-xs text-indigo-200 truncate">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto p-2 text-indigo-200 hover:text-white transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 transition-all duration-300">
        {/* Top header */}
        <header className={`bg-white py-3 px-4 sm:px-6 border-b border-gray-200 sticky top-0 z-30 transition-shadow ${isScrolled ? 'shadow-lg' : 'shadow-sm'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="p-1.5 rounded-md hover:bg-gray-100 mr-2 lg:hidden"
              >
                <Menu className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800">
                {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Days filter for mobile */}
              <div className="md:hidden relative">
                <button 
                  onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                  className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <Filter className="h-5 w-5" />
                </button>
                
                {filterMenuOpen && (
                  <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40 py-1">
                    {dayFilters.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => handleDayFilterChange(filter.value)}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          selectedDays === filter.value 
                            ? 'bg-indigo-50 text-indigo-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button className="relative p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 transition-colors">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
              </button>
              
              <div className="hidden md:flex items-center">
                <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-2">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                  ) : (
                    <User className="h-4 w-4 text-indigo-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div 
              className="absolute inset-0 bg-black bg-opacity-50" 
              onClick={() => setMobileMenuOpen(false)} 
            />
            <div className="absolute inset-y-0 left-0 w-64 bg-gradient-to-b from-indigo-700 to-purple-800 shadow-lg transform transition-transform">
              <div className="flex items-center justify-between p-4 bg-indigo-800">
                <div className="flex items-center">
                  <div className="bg-white p-2 rounded-lg">
                    <Package className="h-6 w-6 text-indigo-700" />
                  </div>
                  <h1 className="ml-3 text-xl font-bold text-white">InventoryPro</h1>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-md hover:bg-indigo-600 transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
              <nav className="mt-8 px-4 space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                        active
                          ? 'bg-white text-indigo-700 shadow-lg'
                          : 'text-indigo-200 hover:bg-indigo-600 hover:text-white'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${active ? 'text-indigo-600' : 'text-indigo-300'}`} />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              <div className="absolute bottom-0 w-full p-4 border-t border-indigo-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                      ) : (
                        <User className="h-5 w-5 text-indigo-700" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-indigo-200">{user?.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-indigo-200 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            {/* Filter indicator for mobile */}
            <div className="flex items-center justify-between mb-4 md:hidden">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-1" />
                Showing: {dayFilters.find(f => f.value === selectedDays)?.label || 'All time'}
              </div>
              <button 
                onClick={() => setFilterMenuOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Change
              </button>
            </div>
            
            <Routes>
              <Route path="/" element={<Dashboard filterDays={selectedDays} />} />
              <Route path="/inventory" element={<Inventory filterDays={selectedDays} />} />
              <Route path="/transactions" element={<Transactions filterDays={selectedDays} />} />
              <Route path="/reports" element={<Reports filterDays={selectedDays} />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;