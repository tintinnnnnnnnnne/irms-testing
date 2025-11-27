import React, { useState, useEffect } from "react";
import AmenitiesCard from "../../components/AmenitiesCard";
import { useAuth } from "../AuthContext"; // Use the correct AuthContext path
import api from "../../config/axios"; 
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter, LogOut, Eye, Calendar, Menu, X } from 'lucide-react'; 

const CustomerDashboard = () => {
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); // STATE FOR LOGOUT MODAL
  const [pageLoad, setPageLoad] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // STATE FOR HAMBURGER MENU
  
  const [filters, setFilters] = useState({
    availability: 'any',
    capacity: 'any',
    priceRange: 'any',
    search: ''
  });
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const backgroundImageUrl = "/images/bg.jpg";
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoad(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleNavigation = (section) => {
    setActiveSection(section);
    setIsMobileMenuOpen(false); // Close menu after clicking link
    switch(section) {
      case 'home': window.scrollTo({ top: 0, behavior: 'smooth' }); break;
      case 'amenities': navigate('/amenities'); break;
      case 'reservations': navigate('/reservations'); break;
      case 'feedback': navigate('/feedback'); break;
      case 'contact': navigate('/contact'); break;
      default: break;
    }
  };

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/amenities');
      const backendUrl = import.meta.env.VITE_API_URL; 
      
      const dataWithImages = response.data.map(item => ({
        ...item,
        // IMAGE FIX: Construct full URL using ENV
        image: item.image ? `${backendUrl}/uploads/am_images/${item.image}` : null
      }));

      setAmenities(dataWithImages);
      setFilteredAmenities(dataWithImages);
    } catch (err) {
      console.error('Error fetching amenities:', err);
      setError(err.message || "Failed to load amenities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, amenities]);

  const applyFilters = () => {
    let filtered = [...amenities];
    if (filters.search) {
      filtered = filtered.filter(amenity =>
        amenity.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.availability !== 'any') {
      if (filters.availability === 'available') filtered = filtered.filter(amenity => amenity.available === 'Yes');
      else if (filters.availability === 'unavailable') filtered = filtered.filter(amenity => amenity.available === 'No');
    }
    if (filters.capacity !== 'any') {
      switch (filters.capacity) {
        case '1-5': filtered = filtered.filter(amenity => amenity.capacity >= 1 && amenity.capacity <= 5); break;
        case '6-10': filtered = filtered.filter(amenity => amenity.capacity >= 6 && amenity.capacity <= 10); break;
        case '10+': filtered = filtered.filter(amenity => amenity.capacity > 10); break;
        default: break;
      }
    }
    if (filters.priceRange !== 'any') {
      switch (filters.priceRange) {
        case '0-200': filtered = filtered.filter(amenity => amenity.price >= 0 && amenity.price <= 200); break;
        case '201-1000': filtered = filtered.filter(amenity => amenity.price >= 201 && amenity.price <= 1000); break;
        case '1001+': filtered = filtered.filter(amenity => amenity.price > 1000); break;
        default: break;
      }
    }
    setFilteredAmenities(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const clearFilters = () => {
    setFilters({ availability: 'any', capacity: 'any', priceRange: 'any', search: '' });
  };

  const handleBookAmenity = (amenity) => {
    navigate('/reservations', { state: { selectedAmenity: amenity } });
  };

  // LOGOUT HANDLERS (Same as OwnerDashboard)
  const handleLogoutClick = () => setShowLogoutConfirm(true);
  const handleConfirmLogout = () => { logout(); navigate('/'); setShowLogoutConfirm(false); }; // Uses secure logout()
  const handleCancelLogout = () => setShowLogoutConfirm(false);

  const activeFilterCount = Object.values(filters).filter(filter => filter !== 'any' && filter !== '').length;

  return (
    <div className={`min-h-screen flex flex-col font-body transition-all duration-500 ${pageLoad ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Logout Confirmation Modal (SECURE) */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleCancelLogout} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button onClick={handleConfirmLogout} className="px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- NAVBAR --- */}
      <nav className="bg-white py-3 md:py-4 shadow-sm relative z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          {/* Logo & Hamburger Container */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu Button (Visible on lg and below) */}
            <button 
                className="lg:hidden text-gray-600 hover:text-lp-orange transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">LP</div>
                <span className="text-lg font-bold text-lp-dark font-header tracking-tight truncate">La Piscina IRMS</span>
            </div>
          </div>

          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden lg:flex space-x-8">
            {['Home', 'Amenities', 'Reservations', 'Feedback', 'Contact'].map((item) => (
              <button
                key={item}
                onClick={() => handleNavigation(item.toLowerCase())}
                className={`text-sm font-medium transition-colors ${
                  activeSection === item.toLowerCase() ? 'text-lp-orange border-b-2 border-lp-orange pb-1' : 'text-gray-600 hover:text-lp-orange'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* User & Logout Section */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 text-right">
                 <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                   {user?.username?.charAt(0).toUpperCase()}
                 </div>
                 <div className="hidden lg:block leading-tight">
                    <p className="text-sm font-bold text-gray-800">{user?.username}</p>
                    <p className="text-[10px] text-gray-500">Welcome back!</p>
                 </div>
              </div>
            )}
            <button onClick={handleLogoutClick} className="flex items-center gap-2 px-3 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition text-sm font-medium">
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU DROPDOWN --- */}
        {isMobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 w-full bg-white border-t border-gray-100 shadow-lg z-50">
                <div className="flex flex-col py-2">
                    {['Home', 'Amenities', 'Reservations', 'Feedback', 'Contact'].map((item) => (
                    <button
                        key={item}
                        onClick={() => handleNavigation(item.toLowerCase())}
                        className={`px-6 py-3 text-left w-full text-sm font-medium hover:bg-gray-50 transition-colors ${
                        activeSection === item.toLowerCase() ? 'text-lp-orange bg-orange-50 border-l-4 border-lp-orange' : 'text-gray-600'
                        }`}
                    >
                        {item}
                    </button>
                    ))}
                </div>
            </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative flex-grow flex items-center justify-center min-h-[90vh] md:min-h-screen">
        <div 
            className="absolute inset-0 z-0"
            style={{ backgroundImage: `url(${backgroundImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
            <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 w-full max-w-5xl px-4 text-center py-10 md:py-0">
            <h1 className="text-3xl md:text-6xl font-bold text-white font-header mb-4 drop-shadow-md leading-tight">
                La Piscina De Conception Resort
            </h1>
            <p className="text-sm md:text-lg text-gray-200 max-w-2xl mx-auto mb-8 md:mb-12 drop-shadow-sm px-2">
                Enjoy a relaxing stay that’s affordable but still feels special. Great rooms, nice amenities, and easy bookings—all for you.
            </p>

            {/* --- FILTER BOX --- */}
            <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl shadow-2xl border border-white/10 text-left w-full max-w-4xl mx-auto ring-1 ring-white/5 mt-6">
                
                <div className="flex justify-between items-center mb-3 px-1">
                    <p className="text-white text-xs font-bold uppercase tracking-wider opacity-90">Filter Amenities</p>
                    {activeFilterCount > 0 && (
                      <button onClick={clearFilters} className="text-[10px] text-white/80 underline hover:text-lp-orange transition-colors">Clear Filters</button>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.availability}
                        onChange={(e) => handleFilterChange('availability', e.target.value)}
                    >
                        <option value="any">Any Status</option>
                        <option value="available">Available</option>
                        <option value="unavailable">Unavailable</option>
                    </select>
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.capacity}
                        onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    >
                        <option value="any">Any Capacity</option>
                        <option value="1-5">Small (1-5)</option>
                        <option value="6-10">Medium (6-10)</option>
                        <option value="10+">Large (11+)</option>
                    </select>
                    <select 
                        className="w-full py-2 px-3 rounded-md bg-white/95 border-none focus:ring-2 focus:ring-lp-orange text-gray-800 text-sm shadow-sm"
                        value={filters.priceRange}
                        onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    >
                        <option value="any">Any Price</option>
                        <option value="0-200">₱0 - ₱200</option>
                        <option value="201-1000">₱201 - ₱1,000</option>
                        <option value="1001+">₱1,001+</option>
                    </select>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3">
                    <button onClick={() => handleNavigation('amenities')} className="flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium border border-white/30 bg-white/10 text-white hover:bg-lp-orange hover:border-lp-orange backdrop-blur-sm">
                        <Eye size={16} /> View Amenities
                    </button>
                    <button onClick={() => handleNavigation('reservations')} className="flex items-center justify-center gap-2 px-6 py-2 rounded-md text-sm font-medium border border-white/30 bg-white/10 text-white hover:bg-lp-orange hover:border-lp-orange backdrop-blur-sm">
                        <Calendar size={16} /> Make Reservations
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Main Content & Footer */}
      <main className="container mx-auto px-6 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-lp-dark font-header mb-4">Featured Amenities</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">Discover our premium facilities designed for your comfort.</p>
          </div>

          {loading && <div className="text-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lp-orange mx-auto"></div><p className="mt-4 text-gray-600">Loading...</p></div>}
          
          {error && <div className="text-center py-12"><div className="text-red-500 text-4xl mb-2">⚠️</div><p className="text-gray-600 mb-4">{error}</p><button onClick={fetchAmenities} className="bg-lp-orange text-white px-6 py-2 rounded-lg">Try Again</button></div>}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAmenities.slice(0, 6).map((amenity) => ( 
                  <AmenitiesCard key={amenity.id} amenity={amenity} onBook={handleBookAmenity} />
                ))}
              </div>
              {filteredAmenities.length === 0 && amenities.length > 0 && (
                <div className="text-center py-12"><p className="text-gray-500 mb-4">No matches found.</p><button onClick={clearFilters} className="bg-lp-orange text-white px-6 py-2 rounded-lg">Clear Filters</button></div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="bg-lp-dark text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-header text-lp-orange">Visit Us</h3>
              <p>Barangay Gumamela, Balayan, Batangas</p>
              <p>+63 (912) 345-6789</p>
              <p>info@lapiscinaconception.com</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-header text-lp-orange">Quick Links</h3>
              <div className="grid grid-cols-2 gap-2">
                {['Home', 'Amenities', 'Reservations', 'Feedback', 'Contact'].map(link => (
                    <button key={link} onClick={() => handleNavigation(link.toLowerCase())} className="text-left hover:text-lp-orange">{link}</button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-bold font-header text-lp-orange">Follow Us</h3>
              <div className="flex space-x-4">
                  <Facebook className="w-5 h-5 hover:text-lp-orange cursor-pointer" />
                  <Instagram className="w-5 h-5 hover:text-lp-orange cursor-pointer" />
                  <Twitter className="w-5 h-5 hover:text-lp-orange cursor-pointer" />
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} La Piscina De Conception Resort. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;