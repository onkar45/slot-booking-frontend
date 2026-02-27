import { useEffect, useState, useContext } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../calendar-premium.css';

function CustomCalendar({ onOpenBookingModal }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(0); // Offset from today
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!localStorage.getItem('token');

  // Date range: TODAY + next 15 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    fetchBookingsAndGenerateSlots();
    
    const intervalId = setInterval(() => {
      fetchBookingsAndGenerateSlots();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function formatTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  function isPastSlot(dateStr, timeStr) {
    const slotDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    return slotDateTime < now;
  }

  async function fetchBookingsAndGenerateSlots() {
    try {
      setLoading(true);
      const response = await API.get('/bookings/approved-public');
      const approvedBookings = response.data || [];
      
      const approvedBookingsMap = new Map();
      approvedBookings.forEach(booking => {
        const key = `${booking.booking_date}_${booking.start_time}`;
        approvedBookingsMap.set(key, true);
      });

      const allSlots = [];
      
      for (let dayOffset = 0; dayOffset <= 15; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        const dateStr = formatDate(currentDate);

        for (let hour = 9; hour <= 21; hour++) {
          const startTime24 = `${String(hour).padStart(2, '0')}:00:00`;
          const lookupKey = `${dateStr}_${startTime24}`;
          const isBooked = approvedBookingsMap.has(lookupKey);
          const isExpired = isPastSlot(dateStr, startTime24);

          let status = 'available';
          if (isBooked) status = 'booked';
          else if (isExpired) status = 'expired';

          allSlots.push({
            date: dateStr,
            dateObj: currentDate,
            time: startTime24,
            hour: hour,
            status: status
          });
        }
      }

      setEvents(allSlots);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  }

  function handleSlotClick(slot) {
    if (slot.status === 'booked') {
      toast.error('Slot is already booked');
      return;
    }
    if (slot.status === 'expired') {
      toast.error('This time slot has expired');
      return;
    }
    if (slot.status === 'available') {
      const startTime = slot.time.substring(0, 5);
      onOpenBookingModal(slot.date, startTime);
    }
  }

  function getVisibleDays() {
    const days = [];
    for (let i = currentWeekStart; i < currentWeekStart + 7 && i <= 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        offset: i,
        date: date,
        dateStr: formatDate(date)
      });
    }
    return days;
  }

  function handlePrevWeek() {
    if (currentWeekStart > 0) {
      setCurrentWeekStart(Math.max(0, currentWeekStart - 7));
    }
  }

  function handleNextWeek() {
    if (currentWeekStart + 7 <= 15) {
      setCurrentWeekStart(currentWeekStart + 7);
    }
  }

  function formatDateHeader(date) {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayName = days[date.getDay()];
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return { dayName, dateStr: `${month}/${day}` };
  }

  const visibleDays = getVisibleDays();
  const hours = Array.from({ length: 13 }, (_, i) => i + 9); // 9 to 21

  const dateRangeText = visibleDays.length > 0 
    ? `${visibleDays[0].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${visibleDays[visibleDays.length - 1].date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-card-premium p-4 calendar-animate">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Available Time Slots</h2>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          View and select available booking slots for the next 15 days
        </p>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs mt-3">
          <span className="font-semibold text-gray-700 dark:text-gray-300 text-xs">Legend:</span>
          <div className="legend-item">
            <div className="legend-dot bg-gradient-success"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot bg-gradient-warning"></div>
            <span>Pending</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot bg-gradient-danger"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot bg-gray-400"></div>
            <span>Inactive</span>
          </div>
        </div>
      </div>

      {/* Date Range Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevWeek}
          disabled={currentWeekStart === 0}
          className="nav-button"
        >
          <FiChevronLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          {dateRangeText}
        </span>
        <button
          onClick={handleNextWeek}
          disabled={currentWeekStart + 7 > 15}
          className="nav-button bg-gradient-info text-white border-0"
        >
          <FiChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto calendar-scroll -mx-4 px-4">
        <div className="inline-block min-w-full">
          {/* Header Row */}
          <div className="grid gap-1.5 mb-2" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, minmax(100px, 1fr))` }}>
            <div></div>
            {visibleDays.map((day) => {
              const header = formatDateHeader(day.date);
              return (
                <div key={day.offset} className="day-header">
                  {header.dayName}, {header.dateStr}
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="space-y-1.5">
            {hours.map((hour) => {
              const time24 = `${String(hour).padStart(2, '0')}:00:00`;
              const time12 = formatTo12Hour(time24);

              return (
                <div key={hour} className="grid gap-1.5" style={{ gridTemplateColumns: `70px repeat(${visibleDays.length}, minmax(100px, 1fr))` }}>
                  {/* Time Label */}
                  <div className="time-label flex items-center justify-end">
                    {time12}
                  </div>

                  {/* Slots for each day */}
                  {visibleDays.map((day) => {
                    const slot = events.find(
                      e => e.date === day.dateStr && e.time === time24
                    );

                    if (!slot) return <div key={day.offset} className="h-8"></div>;

                    let slotClass = 'slot-available';
                    let displayText = time12;

                    if (slot.status === 'booked') {
                      slotClass = 'slot-booked';
                      displayText = 'Booked';
                    } else if (slot.status === 'expired') {
                      slotClass = 'slot-expired';
                      displayText = 'Expired';
                    }

                    return (
                      <button
                        key={day.offset}
                        onClick={() => handleSlotClick(slot)}
                        className={`${slotClass} h-8 text-xs`}
                      >
                        {displayText}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomCalendar;
