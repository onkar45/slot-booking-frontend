import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";
import { FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiX, FiFilter } from 'react-icons/fi';

function UserDashboard() {
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [activeBookingsCount, setActiveBookingsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingSlotId, setBookingSlotId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'available', 'booked'
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
    
    // Auto-refresh expired slots every 60 seconds
    const intervalId = setInterval(() => {
      recalculateExpiredSlots();
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [slotsRes, bookingsRes, activeRes] = await Promise.all([
        API.get("/slots/available"),
        API.get("/bookings/my-bookings"),
        API.get("/bookings/active")
      ]);
      
      // Filter out past slots and check if slot time has passed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureSlots = slotsRes.data.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= today;
      }).map(slot => {
        const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
        const now = new Date();
        const isPast = slotDateTime < now;
        
        return {
          ...slot,
          isPast: isPast
        };
      });
      
      setSlots(futureSlots);
      setBookings(bookingsRes.data || []);
      setActiveBookingsCount(activeRes.data?.active_count || 0);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load data");
      setActiveBookingsCount(0);
    } finally {
      setLoading(false);
    }
  };

  const recalculateExpiredSlots = () => {
    setSlots(prevSlots => 
      prevSlots.map(slot => {
        const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
        const now = new Date();
        const isPast = slotDateTime < now;
        
        return {
          ...slot,
          isPast: isPast
        };
      })
    );
  };

  const handleBookClick = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const confirmBooking = async () => {
    if (!selectedSlot) return;
    
    try {
      setBookingSlotId(selectedSlot.id);
      await API.post("/bookings", { slot_id: selectedSlot.id });
      toast.success("Booking request sent successfully!", {
        duration: 3000,
        icon: '✅',
      });
      setShowConfirmModal(false);
      setSelectedSlot(null);
      fetchData();
    } catch (err) {
      console.error('Book slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error booking slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    } finally {
      setBookingSlotId(null);
    }
  };

  const cancelBooking = () => {
    setShowConfirmModal(false);
    setSelectedSlot(null);
  };

  // Get slot status
  const getSlotStatus = (slot) => {
    if (slot.isPast) return 'expired';
    
    const userBooking = bookings.find(b => b.slot_id === slot.id);
    if (userBooking) {
      return userBooking.status;
    }
    
    if (slot.is_booked) return 'booked';
    return 'available';
  };

  // Check if user has booked this slot
  const isUserBooked = (slot) => {
    return bookings.some(b => b.slot_id === slot.id);
  };

  // Filter slots
  const filteredSlots = slots.filter(slot => {
    const status = getSlotStatus(slot);
    if (filter === 'available') {
      return status === 'available';
    } else if (filter === 'booked') {
      return status === 'pending' || status === 'approved';
    }
    return true; // 'all'
  });

  // Group slots by date
  const groupedSlots = filteredSlots.reduce((groups, slot) => {
    const date = slot.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(slot);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedSlots).sort();

  // Calculate stats
  const totalAvailable = slots.filter(s => !s.isPast && !s.is_booked).length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isToday = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const renderSlotButton = (slot) => {
    const status = getSlotStatus(slot);
    const isProcessing = bookingSlotId === slot.id;

    switch (status) {
      case 'expired':
        return (
          <button
            disabled
            className="w-full bg-gray-400 text-white py-2.5 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base flex items-center justify-center opacity-60"
          >
            <FiAlertCircle className="mr-2" />
            Expired
          </button>
        );
      
      case 'pending':
        return (
          <button
            disabled
            className="w-full bg-yellow-500 text-white py-2.5 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
          >
            <FiClock className="mr-2" />
            Pending Approval
          </button>
        );
      
      case 'approved':
        return (
          <button
            disabled
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
          >
            <FiCheckCircle className="mr-2" />
            Booked
          </button>
        );
      
      case 'booked':
        return (
          <button
            disabled
            className="w-full bg-red-500 text-white py-2.5 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base flex items-center justify-center"
          >
            <FiCheckCircle className="mr-2" />
            Booked
          </button>
        );
      
      default:
        return (
          <button
            onClick={() => handleBookClick(slot)}
            disabled={isProcessing}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition duration-200 text-sm sm:text-base flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Booking...
              </>
            ) : (
              <>
                <FiCheckCircle className="mr-2" />
                Book Slot
              </>
            )}
          </button>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6">
          Available Slots
        </h2>

        {/* Enhanced Summary Section */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-lg border border-blue-100 dark:border-gray-600">
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <FiCalendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{totalAvailable}</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Available Slots</p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-14 bg-gray-300 dark:bg-gray-600"></div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-green-500 rounded-xl flex items-center justify-center shadow-md">
                <FiCheckCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{activeBookingsCount}</p>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Your Active Bookings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <FiFilter className="w-5 h-5" />
            <span className="font-semibold">Filter:</span>
          </div>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'all'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'available'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter('booked')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === 'booked'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Booked
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading slots...</p>
            </div>
          </div>
        ) : filteredSlots.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-100 dark:border-gray-700">
            <FiAlertCircle className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">No slots available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map((date) => (
              <div key={date}>
                {/* Date Heading with TODAY badge */}
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-3">
                  <FiCalendar className="text-blue-600 dark:text-blue-400" />
                  {formatDate(date)}
                  {isToday(date) && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                      TODAY
                    </span>
                  )}
                </h3>

                {/* Slots Grid */}
                <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groupedSlots[date].map((slot) => {
                    const status = getSlotStatus(slot);
                    const isExpired = status === 'expired';
                    const userBooked = isUserBooked(slot);
                    
                    return (
                      <div
                        key={slot.id}
                        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md transition-all duration-200 p-5 border ${
                          userBooked 
                            ? 'border-red-300 dark:border-red-700' 
                            : 'border-gray-100 dark:border-gray-700'
                        } ${
                          isExpired 
                            ? 'opacity-50' 
                            : 'hover:shadow-xl hover:scale-103'
                        }`}
                      >
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center">
                            <FiClock className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                            <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                              {slot.start_time} - {slot.end_time}
                            </p>
                          </div>
                        </div>

                        {renderSlotButton(slot)}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && selectedSlot && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                Confirm Booking
              </h3>
              <button
                onClick={cancelBooking}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 space-y-3">
              <p className="text-gray-700 dark:text-gray-300 text-base">
                Are you sure you want to book this slot?
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 space-y-2">
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiCalendar className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">{formatDate(selectedSlot.date)}</span>
                </div>
                <div className="flex items-center text-gray-800 dark:text-gray-200">
                  <FiClock className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold">{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelBooking}
                className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookingSlotId === selectedSlot.id}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {bookingSlotId === selectedSlot.id ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Booking...
                  </>
                ) : (
                  'Confirm'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
