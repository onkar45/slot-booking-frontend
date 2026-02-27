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
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 flex items-center gap-2">
            <FiCheckCircle className="w-4 h-4" />
            APPROVED
          </span>
        );
      case 'rejected':
        return (
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 flex items-center gap-2">
            <FiXCircle className="w-4 h-4" />
            REJECTED
          </span>
        );
      default: // pending
        return (
          <span className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 flex items-center gap-2">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200">
            My Bookings
          </h2>

          {/* Sort Dropdown */}
          {bookings.length > 0 && (
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort by:
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 pr-10 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="status">Status</option>
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading bookings...</p>
            </div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
            <FiAlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">
              You have no bookings yet.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Start by booking your first slot!
            </p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              <FiCalendar className="mr-2" />
              Browse Available Slots
            </button>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {sortedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-5 sm:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                  {/* Booking Details */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                          {formatDate(booking.date || booking.booking_date) || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FiClock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-300 text-base">
                          {booking.start_time || 'N/A'} - {booking.end_time || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Time Slot</p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Booked on: {new Date(booking.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {getBookingDescription(booking)}
                      </p>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-3">
                    {getStatusBadge(booking.status)}
                    
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelClick(booking)}
                        disabled={cancellingId === booking.id}
                        className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {cancellingId === booking.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent"></div>
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Cancel Booking
              </h3>
              <button
                onClick={cancelCancellation}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-gray-700 dark:text-gray-300 text-base">
                Are you sure you want to cancel this booking?
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiCalendar className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                  <span className="font-semibold">{formatDate(selectedBooking.date || selectedBooking.booking_date)}</span>
                </div>
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiClock className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                  <span className="font-semibold">
                    {selectedBooking.start_time} - {selectedBooking.end_time}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelCancellation}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Keep Booking
              </button>
              <button
                onClick={confirmCancel}
                disabled={cancellingId === selectedBooking.id}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
