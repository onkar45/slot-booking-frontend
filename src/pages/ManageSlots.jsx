import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import API from '../services/api';
import { FiTrash2, FiUnlock, FiCalendar, FiUser, FiClock, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function ManageSlots() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('latest');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'last30'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFreeSlotModal, setShowFreeSlotModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchApprovedBookings();
  }, []);

  const fetchApprovedBookings = async () => {
    try {
      // Fetch all bookings and filter for approved ones
      const res = await API.get('/super-admin/user-bookings');
      console.log('📊 All Bookings:', res.data);
      const approvedBookings = res.data.filter(b => b.status === 'approved');
      console.log('✅ Approved Bookings:', approvedBookings);
      setBookings(approvedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      await API.delete(`/super-admin/bookings/${selectedBooking.id}`);
      toast.success('Booking deleted successfully!');
      setShowDeleteModal(false);
      setSelectedBooking(null);
      fetchApprovedBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to delete booking');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFreeSlot = async () => {
    if (!selectedBooking) return;
    
    try {
      setActionLoading(true);
      await API.put(`/super-admin/free-slot/${selectedBooking.id}`);
      toast.success('Slot freed successfully!');
      setShowFreeSlotModal(false);
      setSelectedBooking(null);
      fetchApprovedBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to free slot');
    } finally {
      setActionLoading(false);
    }
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return { start: monthStart, end: monthEnd };
      }
      case 'last30': {
        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 30);
        return { start: last30Start, end: now };
      }
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      booking.user?.name?.toLowerCase().includes(query) ||
      booking.user?.email?.toLowerCase().includes(query) ||
      booking.company_name?.toLowerCase().includes(query)
    );

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const bookingDate = new Date(booking.date || booking.booking_date || booking.slot_date);
        matchesDate = bookingDate >= dateRange.start && bookingDate <= dateRange.end;
      }
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => {
    // Sort by created_at or id (latest first by default)
    const dateA = new Date(a.created_at || a.id);
    const dateB = new Date(b.created_at || b.id);
    return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
  });

  // Pagination
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, sortOrder]);

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
      return dateString;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const timeParts = timeString.split(':');
      const hours = parseInt(timeParts[0]);
      const minutes = timeParts[1] || '00';
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const hour12 = hours % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString;
    }
  };

  // Check if booking is within the manageable date range (today to +15 days)
  const isManageable = (bookingDateString) => {
    if (!bookingDateString) return false;
    
    try {
      const bookingDate = new Date(bookingDateString);
      bookingDate.setHours(0, 0, 0, 0);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get 15 days from today
      const fifteenDaysFromNow = new Date(today);
      fifteenDaysFromNow.setDate(today.getDate() + 15);
      fifteenDaysFromNow.setHours(23, 59, 59, 999);
      
      // Booking must be >= today AND <= 15 days from today
      return bookingDate >= today && bookingDate <= fifteenDaysFromNow;
    } catch (error) {
      console.error('Error checking manageable date:', error);
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Toaster position="top-right" />
      <SuperAdminNavbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">Manage Slots</h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Delete bookings and free up slots</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by user name, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium shadow-lg"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium shadow-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last30">Last 30 Days</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium shadow-lg"
            >
              <option value="latest">Latest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Bookings List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading bookings...</p>
            </div>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/20">
            <FiCalendar className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No approved bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-5 border border-white/20 dark:border-gray-700/20"
              >
                <div className="flex flex-col gap-4">
                  {/* Main Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                        <FiUser className="w-4 h-4 mr-1.5" />
                        User
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {booking.user?.name || booking.user?.email || 'N/A'}
                      </p>
                      {booking.user?.email && booking.user?.name && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{booking.user.email}</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                        <FiCalendar className="w-4 h-4 mr-1.5" />
                        Date
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatDate(booking.date || booking.booking_date || booking.slot_date)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center mb-1.5 font-medium">
                        <FiClock className="w-4 h-4 mr-1.5" />
                        Time Slot
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {booking.start_time && booking.end_time 
                          ? `${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}`
                          : booking.slot_time || 'Time not specified'}
                      </p>
                    </div>
                  </div>

                  {/* Company Information Section */}
                  {(booking.company_name || booking.hr_name || booking.mobile_number || booking.email_id) && (
                    <div className="pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-semibold">Company Details:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {booking.company_name && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Company</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {booking.company_name}
                            </p>
                          </div>
                        )}
                        {booking.hr_name && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">HR Name</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {booking.hr_name}
                            </p>
                          </div>
                        )}
                        {booking.mobile_number && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Mobile</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                              {booking.mobile_number}
                            </p>
                          </div>
                        )}
                        {booking.email_id && (
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Email</p>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                              {booking.email_id}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {booking.description && (
                    <div className="pt-3 border-t border-gray-200/50 dark:border-gray-600/50">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1.5 font-medium">Description:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        {booking.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons - Only show for bookings from today to +15 days */}
                  {isManageable(booking.date || booking.booking_date || booking.slot_date) && (
                    <div className="pt-3 border-t border-gray-200/50 dark:border-gray-600/50 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowFreeSlotModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <FiUnlock className="w-4 h-4" />
                        Free Slot
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowDeleteModal(true);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        Delete Booking
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl shadow-xl p-4 border border-white/20 dark:border-gray-700/20 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredBookings.length)} of {filteredBookings.length} bookings
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedBooking && (
        <div 
          className="fixed w-screen h-screen z-[9999] bg-black/50"
          onClick={() => !actionLoading && setShowDeleteModal(false)}
          style={{ top: 0, left: 0, margin: 0, padding: 0 }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full p-6"
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '28rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <FiTrash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Booking</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this booking? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteBooking}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="w-4 h-4" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Free Slot Confirmation Modal */}
      {showFreeSlotModal && selectedBooking && (
        <div 
          className="fixed w-screen h-screen z-[9999] bg-black/50"
          onClick={() => !actionLoading && setShowFreeSlotModal(false)}
          style={{ top: 0, left: 0, margin: 0, padding: 0 }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full p-6"
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '28rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                <FiUnlock className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Free Slot</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                This will mark the slot as available for rebooking. The booking will be cancelled.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFreeSlotModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFreeSlot}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiUnlock className="w-4 h-4" />
                      Free Slot
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageSlots;
