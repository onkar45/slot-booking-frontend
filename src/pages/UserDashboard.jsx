import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import BookingModal from "../components/BookingModal";
import { FiCalendar, FiPlus, FiUsers, FiActivity, FiCheckCircle } from 'react-icons/fi';

function UserDashboard() {
  const [bookings, setBookings] = useState([]);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); // 'checking', 'connected', 'error'
  const [hasPendingBooking, setHasPendingBooking] = useState(false);
  const navigate = useNavigate();

  const processPendingBooking = async () => {
    const pendingBookingData = localStorage.getItem('pendingBooking');
    if (!pendingBookingData) {
      setHasPendingBooking(false);
      return;
    }

    setHasPendingBooking(true);

    try {
      const bookingData = JSON.parse(pendingBookingData);
      console.log('📝 UserDashboard - Processing pending booking:', bookingData);
      console.log('📝 UserDashboard - Description from localStorage:', bookingData.description);
      console.log('📝 UserDashboard - Description type:', typeof bookingData.description);
      console.log('📝 UserDashboard - Description length:', bookingData.description?.length);

      // Convert the data to match the API format
      // PreLoginBookingModal saves: { date, startTime, duration, description }
      // API expects: { date, start_time, duration_minutes, description }
      
      // Ensure time is in HH:MM:SS format
      let formattedTime = bookingData.startTime;
      if (formattedTime && !formattedTime.includes(':00:')) {
        // If time is in HH:MM format, add seconds
        if (formattedTime.match(/^\d{2}:\d{2}$/)) {
          formattedTime = formattedTime + ':00';
        }
        // If time is in H:MM format, pad hour and add seconds
        else if (formattedTime.match(/^\d{1}:\d{2}$/)) {
          formattedTime = '0' + formattedTime + ':00';
        }
      }
      
      // Validate and correct duration to match backend requirements
      const allowedDurations = [30, 60, 90, 120];
      let validDuration = parseInt(bookingData.duration);
      
      if (!allowedDurations.includes(validDuration)) {
        console.warn('⚠️ Invalid duration detected:', validDuration, 'Correcting to nearest valid duration');
        // Find the closest valid duration
        if (validDuration < 30) validDuration = 30;
        else if (validDuration <= 45) validDuration = 30;
        else if (validDuration <= 75) validDuration = 60;
        else if (validDuration <= 105) validDuration = 90;
        else validDuration = 120; // Cap at maximum allowed
        
        console.log('✅ Corrected duration from', bookingData.duration, 'to', validDuration, 'minutes');
      }
      
      const apiBookingData = {
        date: bookingData.date,
        start_time: formattedTime,
        duration_minutes: validDuration,
        description: bookingData.description || null
      };

      console.log('📝 UserDashboard - Sending pending booking to API:', apiBookingData);
      console.log('📝 UserDashboard - Full API payload:', JSON.stringify(apiBookingData, null, 2));
      console.log('📝 UserDashboard - Data validation:');
      console.log('📝 - Date format:', apiBookingData.date, 'Valid:', /^\d{4}-\d{2}-\d{2}$/.test(apiBookingData.date));
      console.log('📝 - Time format:', apiBookingData.start_time, 'Valid:', /^\d{2}:\d{2}:\d{2}$/.test(apiBookingData.start_time));
      console.log('📝 - Duration:', apiBookingData.duration_minutes, 'Type:', typeof apiBookingData.duration_minutes);
      console.log('📝 - Description:', apiBookingData.description ? `"${apiBookingData.description}"` : 'null');
      console.log('📝 - Description included in payload:', 'description' in apiBookingData);
      console.log('📝 - Token present:', !!localStorage.getItem('token'));
      console.log('📝 - API URL:', import.meta.env.VITE_API_URL + '/bookings');
      
      const response = await API.post('/bookings', apiBookingData);
      
      console.log('✅ UserDashboard - Pending booking created successfully:', response.data);
      
      // Remove the pending booking from localStorage
      localStorage.removeItem('pendingBooking');
      setHasPendingBooking(false);
      
      toast.success('Your pre-login booking has been created successfully!', {
        duration: 5000,
        icon: '✅',
      });

      // Refresh the dashboard data to show the new booking
      setTimeout(() => {
        fetchData();
      }, 1000);

    } catch (err) {
      console.error('❌ UserDashboard - Failed to process pending booking:', err);
      console.error('❌ Error details:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error headers:', err.response?.headers);
      
      let errorMessage = 'Failed to create your pre-login booking.';
      
      // Log detailed validation errors if available
      if (err.response?.data?.detail && Array.isArray(err.response.data.detail)) {
        console.error('❌ Validation errors:');
        const validationErrors = [];
        
        err.response.data.detail.forEach((error, index) => {
          const errorInfo = {
            field: error.loc?.join(' → ') || 'Unknown',
            message: error.msg || 'Unknown error',
            type: error.type || 'Unknown',
            input: error.input
          };
          console.error(`❌ Error ${index + 1}:`, errorInfo);
          validationErrors.push(`${errorInfo.field}: ${errorInfo.message}`);
        });
        
        errorMessage = 'Validation errors:\n' + validationErrors.join('\n');
      } else if (err.response?.data?.detail && typeof err.response.data.detail === 'string') {
        errorMessage = err.response.data.detail;
      } else if (err.response?.status === 422) {
        errorMessage = 'Invalid booking data. Please check your date, time, and duration.';
      } else if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please try logging in again.';
      } else if (err.response?.status === 400) {
        // Handle 400 errors (like time slot conflicts)
        errorMessage = err.response?.data?.detail || 'Unable to create booking. The time slot may no longer be available.';
      }
      
      toast.error(errorMessage, {
        duration: 8000,
      });
      
      // If it's a time slot conflict, clear the pending booking so user can try again
      if (err.response?.status === 400 && err.response?.data?.detail?.includes('Conflicts with existing booking')) {
        localStorage.removeItem('pendingBooking');
        setHasPendingBooking(false);
        
        // Show additional helpful message
        setTimeout(() => {
          toast('Please select a different time slot from the available slots below.', {
            duration: 6000,
            icon: 'ℹ️',
          });
        }, 1000);
      }
    }
  };

  useEffect(() => {
    fetchData();
    
    // Check for pending booking after component mounts
    setTimeout(() => {
      processPendingBooking();
    }, 2000); // Wait 2 seconds to ensure user is fully logged in
    
    // Auto-refresh every 30 seconds to catch new bookings
    const intervalId = setInterval(() => {
      fetchData();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setConnectionStatus('checking');
      console.log('🔄 Fetching user dashboard data...');
      console.log('🔑 Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('🌐 API Base URL:', import.meta.env.VITE_API_URL);
      
      const [bookingsRes, activeRes] = await Promise.all([
        API.get("/bookings/my-bookings"),
        API.get("/bookings/active")
      ]);
      
      console.log('📊 UserDashboard - Raw API responses:');
      console.log('📊 Bookings response status:', bookingsRes.status);
      console.log('📊 Active response status:', activeRes.status);
      console.log('📊 Bookings data:', bookingsRes.data);
      console.log('📊 Active data:', activeRes.data);
      
      if (bookingsRes.data && Array.isArray(bookingsRes.data)) {
        console.log('📊 Total bookings found:', bookingsRes.data.length);
        if (bookingsRes.data.length > 0) {
          console.log('📊 Sample booking structure:', bookingsRes.data[0]);
          console.log('📊 All booking dates:', bookingsRes.data.map(b => b.date || b.booking_date));
          console.log('📊 All booking statuses:', bookingsRes.data.map(b => b.status));
        }
      } else {
        console.log('📊 Bookings data is not an array:', typeof bookingsRes.data);
      }
      
      setBookings(bookingsRes.data || []);
      setActiveBookingsCount(activeRes.data?.active_count || 0);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('❌ Error fetching dashboard data:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error details:', err.response?.data);
      setConnectionStatus('error');
      
      // Check if it's a CORS or network error
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        toast.error("Cannot connect to server. Please check if the backend is running on http://127.0.0.1:8000", {
          duration: 6000,
        });
      } else if (err.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
        // Redirect to login
        navigate('/login');
      } else {
        toast.error("Failed to load data: " + (err.response?.data?.detail || err.message));
      }
      
      setActiveBookingsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    // Add a small delay to ensure backend has processed the booking
    setTimeout(() => {
      console.log('🔄 Refreshing dashboard after booking success...');
      fetchData();
    }, 1500); // Increased delay to 1.5 seconds
  };

  const clearPendingBooking = () => {
    localStorage.removeItem('pendingBooking');
    setHasPendingBooking(false);
    toast.success('Pending booking cleared', {
      duration: 2000,
      icon: '🗑️',
    });
  };

  // Calculate stats
  const totalBookings = bookings.length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getBookingDescription = (booking) => {
    const duration = booking.duration_minutes || calculateDuration(booking.start_time, booking.end_time);
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    let durationText = '';
    if (hours > 0 && minutes > 0) {
      durationText = `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      durationText = `${hours}h`;
    } else {
      durationText = `${minutes}m`;
    }
    
    return `Time slot booking for ${durationText} duration`;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 30; // Default fallback
    
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    return Math.round(diffMs / (1000 * 60)); // Convert to minutes
  };

  // Get recent bookings (last 3)
  const recentBookings = bookings
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Toaster position="top-right" />
      <Navbar />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Book a Time</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 dark:text-gray-300">Create and manage your bookings</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    connectionStatus === 'connected' ? 'bg-green-500' :
                    connectionStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {connectionStatus === 'connected' ? 'Connected' :
                     connectionStatus === 'error' ? 'Connection Error' : 'Connecting...'}
                  </span>
                </div>
                {hasPendingBooking && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                    Processing pre-login booking...
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 flex items-center gap-2"
              >
                <FiPlus className="w-4 h-4" />
                Book Custom Time
              </button>
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchData();
                  toast.success('Dashboard refreshed!', { duration: 2000 });
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh dashboard"
              >
                <FiActivity className="w-5 h-5" />
              </button>
              {hasPendingBooking && (
                <button
                  onClick={processPendingBooking}
                  className="px-3 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                  title="Retry processing pending booking"
                >
                  Retry Pending
                </button>
              )}
              {hasPendingBooking && (
                <button
                  onClick={clearPendingBooking}
                  className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                  title="Clear pending booking"
                >
                  Clear Pending
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Your Active Bookings</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{activeBookingsCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <FiActivity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Total Bookings</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalBookings}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FiUsers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
        </div>

        {/* My Recent Bookings */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-t-3xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">My Recent Bookings</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your latest {Math.min(recentBookings.length, 3)} booking(s) out of {bookings.length} total</p>
              </div>
              <button
                onClick={() => navigate('/my-bookings')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                View All ({bookings.length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading bookings...</p>
            </div>
          ) : connectionStatus === 'error' ? (
            <div className="p-8 text-center">
              <div className="text-red-500 text-4xl mb-4">⚠️</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Backend Connection Error</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Cannot connect to the backend server. Please ensure:
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-300 text-left max-w-md mx-auto mb-6 space-y-1">
                <li>• Backend server is running on <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://127.0.0.1:8000</code></li>
                <li>• CORS is configured to allow <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">http://localhost:5173</code></li>
                <li>• All required endpoints are implemented</li>
              </ul>
              <button
                onClick={fetchData}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Retry Connection
              </button>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="p-8 text-center">
              <FiCalendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">No bookings yet</p>
              <button
                onClick={() => setShowBookingModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book Your First Slot
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FiCalendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">
                          {formatDate(booking.date || booking.booking_date)}
                        </p>
                        <p className="text-base text-gray-700 dark:text-gray-300 font-semibold">
                          {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-1">
                          {getBookingDescription(booking)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-bold shadow-md ${
                          booking.status === 'approved'
                            ? 'bg-green-100 text-green-800 border-2 border-green-300'
                            : booking.status === 'rejected'
                            ? 'bg-red-100 text-red-800 border-2 border-red-300'
                            : 'bg-yellow-100 text-yellow-800 border-2 border-yellow-300'
                        }`}
                      >
                        {booking.status === 'approved' && <FiCheckCircle className="w-4 h-4 inline mr-2" />}
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}

export default UserDashboard;