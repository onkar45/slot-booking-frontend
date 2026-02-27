import { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';
import API from '../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiUser, FiSearch } from 'react-icons/fi';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      console.log('📊 Admin Dashboard - Booking data:', res.data);
      if (res.data && res.data.length > 0) {
        console.log('📊 Sample booking structure:', res.data[0]);
      }
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      approved: bookings.filter(b => b.status === 'approved').length,
      rejected: bookings.filter(b => b.status === 'rejected').length,
    };
  }, [bookings]);

  // Filter, search, and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(b => b.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => {
        const userName = (b.user?.name || b.user?.email || '').toLowerCase();
        return userName.includes(query);
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [bookings, statusFilter, searchQuery, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedBookings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentBookings = filteredAndSortedBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, sortOrder]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/approve`);
      toast.success('Booking approved successfully!');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error approving booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/reject`);
      toast.success('Booking rejected successfully!');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error rejecting booking');
    }
  };

  const getStatusStyle = (status) => {
    if (status === "approved")
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    if (status === "rejected")
      return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      // Handle both HH:MM:SS and HH:MM formats
      const timeParts = timeString.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1] || '00';
      
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if parsing fails
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <AdminNavbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">All Bookings</h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View and manage all booking requests</p>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Bookings</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{statistics.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{statistics.pending}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Approved</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{statistics.approved}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Rejected</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600 dark:text-red-400">{statistics.rejected}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 mb-6 border border-gray-200 dark:border-gray-700">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-200 ${
                statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-200 ${
                statusFilter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-200 ${
                statusFilter === 'approved'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-colors duration-200 ${
                statusFilter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading bookings...</p>
            </div>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8 text-center border border-gray-200 dark:border-gray-700">
            <FiCalendar className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">
              {searchQuery || statusFilter !== 'all' ? 'No bookings match your filters.' : 'No bookings found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:space-y-4">
              {currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-4 sm:p-6 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex flex-col gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center mb-1">
                            <FiUser className="w-4 h-4 mr-1.5" />
                            User
                          </p>
                          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            {booking.user?.name || booking.user?.email || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center mb-1">
                            <FiCalendar className="w-4 h-4 mr-1.5" />
                            Date
                          </p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">
                            {formatDate(booking.date || booking.booking_date)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center mb-1">
                            <FiClock className="w-4 h-4 mr-1.5" />
                            Time Slot
                          </p>
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-center mb-1">
                            <FiClock className="w-4 h-4 mr-1.5" />
                            Booked On
                          </p>
                          <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Description:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {getBookingDescription(booking)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                      <span
                        className={`inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center shadow-md hover:shadow-lg"
                          >
                            <FiCheckCircle className="mr-1.5 w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium text-xs sm:text-sm flex items-center justify-center shadow-md hover:shadow-lg"
                          >
                            <FiXCircle className="mr-1.5 w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedBookings.length)} of {filteredAndSortedBookings.length} bookings
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg font-medium transition-colors duration-200 ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-gray-500 dark:text-gray-400"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
