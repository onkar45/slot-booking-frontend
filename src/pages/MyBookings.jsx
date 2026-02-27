import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import { FiCalendar, FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiX, FiChevronDown } from 'react-icons/fi';

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('latest'); // 'latest', 'oldest', 'status'
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bookings/my-bookings");
      console.log('📊 MyBookings - Booking data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('📊 Sample booking structure:', res.data[0]);
      }
      setBookings(res.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (!selectedBooking) return;
    
    try {
      setCancellingId(selectedBooking.id);
      await API.delete(`/bookings/${selectedBooking.id}`);
      toast.success("Booking cancelled successfully!", {
        duration: 3000,
        icon: '✅',
      });
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (err) {
      console.error('Cancel booking error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error cancelling booking";
      toast.error(errorMessage, {
        duration: 4000,
      });
    } finally {
      setCancellingId(null);
    }
  };

  const cancelCancellation = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
  };

  // Sort bookings
  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortBy === 'latest') {
      return new Date(b.created_at) - new Date(a.created_at);
    } else if (sortBy === 'oldest') {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortBy === 'status') {
      const statusOrder = { approved: 1, pending: 2, rejected: 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return 0;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-6 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-green-500 to-emerald-600 text-white flex items-center gap-2 shadow-lg shadow-green-500/30">
            <FiCheckCircle className="w-4 h-4" />
            APPROVED
          </span>
        );
      case 'rejected':
        return (
          <span className="px-6 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-red-500 to-red-600 text-white flex items-center gap-2 shadow-lg shadow-red-500/30">
            <FiXCircle className="w-4 h-4" />
            REJECTED
          </span>
        );
      default: // pending
        return (
          <span className="px-6 py-3 rounded-2xl text-sm font-black bg-gradient-to-r from-yellow-500 to-orange-600 text-white flex items-center gap-2 shadow-lg shadow-yellow-500/30">
            <FiClock className="w-4 h-4" />
            PENDING
          </span>
        );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">
              My Bookings
            </h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              View and manage all your booking history
            </p>
          </div>

          {/* Sort Dropdown */}
          {bookings.length > 0 && (
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Sort by:
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-xl px-4 py-3 pr-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">Status</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-12 text-center border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
            <FiAlertCircle className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-900 dark:text-white text-2xl font-black mb-3">
              You have no bookings yet.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-8 font-medium">
              Start by booking your first slot!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1"
            >
              <FiCalendar className="mr-3 w-5 h-5" />
              Browse Available Slots
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 p-6 sm:p-8 border border-white/20 dark:border-gray-700/20 transform hover:-translate-y-1"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6">
                  {/* Booking Details */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FiCalendar className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 dark:text-white text-xl">
                          {formatDate(booking.date || booking.booking_date) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                        <FiClock className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                          {booking.start_time || 'N/A'} - {booking.end_time || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Time Slot</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        Booked on: {new Date(booking.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 font-medium">
                        {getBookingDescription(booking)}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-4">
                    {getStatusBadge(booking.status)}
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking.id}
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:-translate-y-0.5"
                      >
                        {cancellingId === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <FiXCircle className="w-4 h-4" />
                            Cancel Booking
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300 border border-white/20 dark:border-gray-700/20">
            <div className="flex justify-between items-start mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white">
                Cancel Booking
              </h3>
              <button
                onClick={cancelCancellation}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-8 space-y-4">
              <p className="text-gray-700 dark:text-gray-300 text-lg font-medium">
                Are you sure you want to cancel this booking?
              </p>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-2xl p-6 space-y-3 border border-red-200/50 dark:border-red-700/50">
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiCalendar className="w-6 h-6 mr-3 text-red-600 dark:text-red-400" />
                  <span className="font-bold text-lg">{formatDate(selectedBooking.date || selectedBooking.booking_date)}</span>
                </div>
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiClock className="w-6 h-6 mr-3 text-red-600 dark:text-red-400" />
                  <span className="font-bold text-lg">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={cancelCancellation}
                className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancellingId === selectedBooking.id}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5"
              >
                {cancellingId === selectedBooking.id ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Cancelling...
                  </>
                ) : (
                  'Yes, Cancel'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyBookings;
