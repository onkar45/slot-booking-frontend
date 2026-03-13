import { useEffect, useState, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';
import API from '../services/api';
import { FiCheckCircle, FiXCircle, FiClock, FiCalendar, FiUser, FiSearch, FiLock, FiTrash2 } from 'react-icons/fi';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('latest');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Block Date States
  const [blockedDates, setBlockedDates] = useState([]);
  const [blockDateInput, setBlockDateInput] = useState('');
  const [blockReasonInput, setBlockReasonInput] = useState('');
  const [blockingDate, setBlockingDate] = useState(false);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(false);
  const [showBlockDayModal, setShowBlockDayModal] = useState(false);
  
  const ITEMS_PER_PAGE = 3;

  useEffect(() => {
    fetchBookings();
    fetchBlockedDates();
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

  // Fetch blocked dates
  const fetchBlockedDates = async () => {
    try {
      setLoadingBlockedDates(true);
      const res = await API.get('/admin/blocked-dates');
      setBlockedDates(res.data || []);
    } catch (err) {
      console.error('Error fetching blocked dates:', err);
      toast.error('Failed to load blocked dates');
    } finally {
      setLoadingBlockedDates(false);
    }
  };

  // Block a date
  const handleBlockDate = async () => {
    if (!blockDateInput) {
      toast.error('Please select a date');
      return;
    }

    try {
      setBlockingDate(true);
      await API.post('/admin/block-date', {
        date: blockDateInput,
        reason: blockReasonInput || 'No reason provided'
      });
      toast.success('Date blocked successfully!');
      setBlockDateInput('');
      setBlockReasonInput('');
      fetchBlockedDates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error blocking date');
    } finally {
      setBlockingDate(false);
    }
  };

  // Unblock a date
  const handleUnblockDate = async (id) => {
    try {
      await API.delete(`/admin/unblock-date/${id}`);
      toast.success('Date unblocked successfully!');
      fetchBlockedDates();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error unblocking date');
    }
  };

  const getStatusStyle = (status) => {
    if (status === "approved")
      return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30";
    if (status === "rejected")
      return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30";
    return "bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-yellow-500/30";
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Toaster position="top-right" />
      <AdminNavbar />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">All Bookings</h2>
              <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">View and manage all booking requests</p>
            </div>
            <button
              onClick={() => setShowBlockDayModal(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <FiLock className="w-5 h-5" />
              Block Whole Day
            </button>
          </div>
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Total Bookings</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{statistics.total}</p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Pending</p>
            <p className="text-3xl font-black text-yellow-600 dark:text-yellow-400">{statistics.pending}</p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Approved</p>
            <p className="text-3xl font-black text-green-600 dark:text-green-400">{statistics.approved}</p>
          </div>
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Rejected</p>
            <p className="text-3xl font-black text-red-600 dark:text-red-400">{statistics.rejected}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
          {/* Status Filter Buttons */}
          <div className="flex flex-wrap gap-3 mb-6">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                statusFilter === 'pending'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-yellow-500/30'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('approved')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                statusFilter === 'approved'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              Approved
            </button>
            <button
              onClick={() => setStatusFilter('rejected')}
              className={`px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg transform hover:-translate-y-0.5 ${
                statusFilter === 'rejected'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30'
                  : 'bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-600/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-600/50'
              }`}
            >
              Rejected
            </button>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading bookings...</p>
            </div>
          </div>
        ) : filteredAndSortedBookings.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
            <FiCalendar className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">
              {searchQuery || statusFilter !== 'all' ? 'No bookings match your filters.' : 'No bookings found.'}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {currentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-4 sm:p-5 border border-white/20 dark:border-gray-700/20 transform hover:-translate-y-0.5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                            <FiUser className="w-4 h-4 mr-1.5" />
                            User
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white text-base">
                            {booking.user?.name || booking.user?.email || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                            <FiCalendar className="w-4 h-4 mr-1.5" />
                            Date
                          </p>
                          <p className="font-bold text-gray-900 dark:text-white text-base">
                            {formatDate(booking.date || booking.booking_date)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                            <FiClock className="w-4 h-4 mr-1.5" />
                            Time Slot
                          </p>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-base">
                            {formatTime(booking.start_time)} - {formatTime(booking.end_time)}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                            <FiClock className="w-4 h-4 mr-1.5" />
                            Booked On
                          </p>
                          <p className="font-bold text-gray-800 dark:text-gray-200 text-base">
                            {new Date(booking.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Company Information Section - Extra Compact */}
                      {booking.company_name && (
                        <div className="mt-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">Company:</p>
                          <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/50 rounded-md px-2.5 py-1.5">
                            {booking.company_name}
                          </p>
                        </div>
                      )}

                      {/* Description */}
                      <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Description:</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                          {booking.description || 'No description provided'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                          Duration: {getBookingDescription(booking)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
                      <span
                        className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black shadow-md ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status.toUpperCase()}
                      </span>

                      {booking.status === 'pending' && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => handleApprove(booking.id)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-xs flex items-center justify-center shadow-md shadow-green-500/30 hover:shadow-lg hover:shadow-green-500/40 transform hover:-translate-y-0.5"
                          >
                            <FiCheckCircle className="mr-1.5 w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(booking.id)}
                            className="flex-1 sm:flex-none bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-bold text-xs flex items-center justify-center shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 transform hover:-translate-y-0.5"
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
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredAndSortedBookings.length)} of {filteredAndSortedBookings.length} bookings
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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

      {/* Block Day Modal */}
      {showBlockDayModal && (
        <div 
          className="fixed w-screen h-screen z-[9999] bg-black/50"
          onClick={() => setShowBlockDayModal(false)}
          style={{ 
            top: 0,
            left: 0,
            margin: 0,
            padding: 0
          }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '56rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FiLock className="w-6 h-6 text-red-600 dark:text-red-400" />
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Block Whole Day</h3>
                </div>
                <button
                  onClick={() => setShowBlockDayModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={blockDateInput}
                    onChange={(e) => setBlockDateInput(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium shadow-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={blockReasonInput}
                    onChange={(e) => setBlockReasonInput(e.target.value)}
                    placeholder="e.g., Holiday, Maintenance"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium shadow-lg"
                  />
                </div>
              </div>

              <button
                onClick={handleBlockDate}
                disabled={blockingDate || !blockDateInput}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
              >
                <FiLock className="w-4 h-4" />
                {blockingDate ? 'Blocking...' : 'Block Day'}
              </button>

              {/* Blocked Dates Table */}
              <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Blocked Dates</h4>
                
                {loadingBlockedDates ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-red-600 border-t-transparent"></div>
                  </div>
                ) : blockedDates.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No blocked dates
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Reason</th>
                          <th className="text-left py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Created At</th>
                          <th className="text-center py-3 px-4 text-sm font-bold text-gray-700 dark:text-gray-300">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blockedDates.map((blocked) => (
                          <tr key={blocked.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                              {formatDate(blocked.date)}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {blocked.reason || 'No reason'}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                              {formatDate(blocked.created_at)}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => handleUnblockDate(blocked.id)}
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-xs shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 mx-auto"
                              >
                                <FiTrash2 className="w-3 h-3" />
                                Unblock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
