import React, { useState, useEffect } from 'react';
import api from '../../config/axios'; // Centralized API
import { LogOut, Menu, X } from 'lucide-react'; // ADDED Menu, X
import OwnerOverview from './OwnerOverview';
import OwnerSales from './OwnerSales';
import OwnerFeedback from './OwnerFeedback';
import OwnerAmenities from './OwnerAmenities';
import { useAuth } from '../AuthContext'; // Import useAuth

const OwnerDashboard = () => {
  const { user, logout } = useAuth(); // CRITICAL: Get user and secure logout from context
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // NEW STATE FOR HAMBURGER
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // NEW STATE FOR LOGOUT MODAL
  
  // Sales data
  const [salesData, setSalesData] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [salesByService, setSalesByService] = useState([]);
  
  // Feedback data
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({ positive: 0, negative: 0, neutral: 0 });
  
  // Amenities data
  const [amenities, setAmenities] = useState([]);
  
  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [chartType, setChartType] = useState('bar');
  const [feedbackFilter, setFeedbackFilter] = useState('all');

  // CRITICAL: Check if user is authenticated (from context)
  useEffect(() => {
    if (!user) { 
      window.location.href = '/';
    } else if (user.role !== 'owner') {
        window.location.href = `/${user.role}`;
    }
    
    if (user) {
        fetchDashboardData();
    }
  }, [user, dateRange, feedbackFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchSalesData(),
        fetchFeedbackData(),
        fetchAmenities()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async () => {
    try {
      const response = await api.get("/api/owner/sales", {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate }
      });
      // ... (rest of sales logic)
      const sales = response.data.sales || [];
      setSalesData(sales);
      const total = sales.reduce((sum, sale) => sum + Number(sale.amount || 0), 0);
      setTotalRevenue(total);
      const grouped = sales.reduce((a, s) => { a[s.serviceType] = (a[s.serviceType] || 0) + Number(s.amount || 0); return a; }, {});
      setSalesByService(Object.keys(grouped).map(key => ({ name: key, value: grouped[key] })));
    } catch (error) {
      console.error("Error loading sales:", error);
      setSalesData([]); setTotalRevenue(0); setSalesByService([]);
    }
  };

  const fetchFeedbackData = async () => {
    try {
      const response = await api.get('/api/owner/feedback', {
        params: { startDate: dateRange.startDate, endDate: dateRange.endDate, filter: feedbackFilter }
      });
      // ... (rest of feedback logic)
      const feedback = response.data.feedback || [];
      setFeedbackData(feedback);
      const stats = feedback.reduce((acc, fb) => { if (fb.rating >= 4) acc.positive++; else if (fb.rating <= 2) acc.negative++; else acc.neutral++; return acc; }, { positive: 0, negative: 0, neutral: 0 });
      setFeedbackStats(stats);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setFeedbackData([]); setFeedbackStats({ positive: 0, negative: 0, neutral: 0 });
    }
  };

  const fetchAmenities = async () => {
    try {
      const response = await api.get('/api/owner/amenities');
      setAmenities(response.data.amenities || []);
    } catch (error) {
      console.error('Error fetching amenities:', error);
      setAmenities([]);
    }
  };

  // LOGOUT HANDLERS
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleCancelLogout = () => setShowLogoutConfirm(false);
  const handleConfirmLogout = () => { 
    logout(); // Calls secure logout function from AuthContext
    setShowLogoutConfirm(false);
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-lp-light-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-lp-orange mx-auto"></div>
          <p className="mt-4 text-lp-dark">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) return null;

  return (
    <div className="min-h-screen bg-lp-light-bg">
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm mx-4">
            <div className="text-center">
              <LogOut className="w-12 h-12 text-lp-orange mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to log out of Owner Dashboard?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleCancelLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleConfirmLogout} className="px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- HEADER (Logo, User, Logout) --- */}
      <header className="bg-white shadow-sm relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            
            <div className="flex items-center space-x-3">
              {/* HAMBURGER ICON */}
              <button 
                className="lg:hidden text-lp-dark hover:text-lp-orange"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              
              {/* Logo/Title */}
              <div className="w-10 h-10 bg-lp-orange rounded-full flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">LP</span>
              </div>
              <div className="hidden sm:block"> 
                <h1 className="text-lg md:text-xl font-bold text-lp-dark font-header">La Piscina Resort</h1>
                <p className="text-xs md:text-sm text-gray-600">Owner Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex items-center space-x-2 text-lp-dark">
                <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-sm font-semibold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">{user?.username}</span>
                  <span className="text-xs text-gray-500">Owner Access</span>
                </div>
              </div>
              <button
                onClick={handleLogoutClick} 
                className="flex items-center gap-2 px-3 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- NAV LINKS (Tabs) & MOBILE MENU --- */}
      <nav className="bg-white border-b border-gray-100 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Desktop Tabs (Large Screens Only) */}
          <div className="hidden lg:flex space-x-8">
            {['overview', 'sales', 'feedback', 'amenities'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition ${
                  activeTab === tab
                    ? 'border-lp-orange text-lp-orange'
                    : 'border-transparent text-lp-dark hover:text-lp-orange hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Mobile Menu Dropdown (Visible on Mobile/Tablet) */}
          {isMobileMenuOpen && (
             <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
                {['overview', 'sales', 'feedback', 'amenities'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => {setActiveTab(tab); setIsMobileMenuOpen(false);}}
                        className={`py-3 px-6 text-left w-full text-sm font-medium capitalize transition ${
                        activeTab === tab
                            ? 'text-lp-orange bg-orange-50 border-l-4 border-lp-orange'
                            : 'text-lp-dark hover:bg-gray-50'
                        }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OwnerOverview 
            totalRevenue={totalRevenue}
            salesData={salesData}
            feedbackData={feedbackData}
            salesByService={salesByService}
            feedbackStats={feedbackStats}
          />
        )}
        
        {activeTab === 'sales' && (
          <OwnerSales 
            salesData={salesData}
            salesByService={salesByService}
            dateRange={dateRange}
            setDateRange={setDateRange}
            chartType={chartType}
            setChartType={setChartType}
          />
        )}
        
        {activeTab === 'feedback' && (
          <OwnerFeedback 
            feedbackData={feedbackData}
            feedbackStats={feedbackStats}
            dateRange={dateRange}
            setDateRange={setDateRange}
            feedbackFilter={feedbackFilter}
            setFeedbackFilter={setFeedbackFilter}
          />
        )}
        
        {activeTab === 'amenities' && (
          <OwnerAmenities 
            amenities={amenities}
            fetchAmenities={fetchAmenities}
          />
        )}
      </main>
    </div>
  );
};

export default OwnerDashboard;