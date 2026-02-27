import { useEffect, useState, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiClock, FiCalendar, FiPlus } from 'react-icons/fi';

function WeeklyCalendar({ onOpenBookingModal }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);
  const isLoggedIn = !!localStorage.getItem('token');

  // Performance optimization cache for overlap detection
  const [overlapCache] = useState(() => new Map());

  // Date range: TODAY + next 15 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 15);
  endDate.setHours(23, 59, 59, 999);

  const todayStr = formatDate(today);
  const endDateStr = formatDate(endDate);

  useEffect(() => {
    fetchBookingsAndGenerateSlots();
    
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(() => {
      fetchBookingsAndGenerateSlots();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  /**
   * Format date to YYYY-MM-DD
   */
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Convert 24-hour time to 12-hour format for display
   * @param {string} time24 - Time in HH:MM:SS format
   * @returns {string} - Time in 12-hour format (e.g., "9:00 AM")
   */
  function formatTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  /**
   * Check if a datetime is in the past
   */
  function isPastSlot(dateStr, timeStr) {
    const slotDateTime = new Date(`${dateStr}T${timeStr}`);
    const now = new Date();
    return slotDateTime < now;
  }

  /**
   * Calculate end time from start time and duration in minutes
   * @param {Object} booking - Booking object with booking_date, start_time, and duration_minutes
   * @returns {string} - End time in HH:MM:SS format
   */
  function calculateEndTime(booking) {
    try {
      const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const durationMs = (booking.duration_minutes || 30) * 60 * 1000; // Default to 30 minutes
      const endDateTime = new Date(startDateTime.getTime() + durationMs);
      return endDateTime.toTimeString().slice(0, 8); // HH:MM:SS format
    } catch (error) {
      console.warn('⚠️ Error calculating end time for booking:', booking, error);
      // Fallback: assume 30 minutes duration
      const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + (30 * 60 * 1000));
      return endDateTime.toTimeString().slice(0, 8);
    }
  }

  /**
   * Parse booking into time range object for overlap detection
   * @param {Object} booking - Booking object from API
   * @returns {Object} - Time range object with start, end, id, and date
   */
  function parseBookingTimeRange(booking) {
    try {
      const startDateTime = new Date(`${booking.booking_date}T${booking.start_time}`);
      const endTime = booking.end_time || calculateEndTime(booking);
      const endDateTime = new Date(`${booking.booking_date}T${endTime}`);
      
      return {
        id: booking.id,
        start: startDateTime,
        end: endDateTime,
        date: booking.booking_date,
        originalBooking: booking
      };
    } catch (error) {
      console.warn('⚠️ Error parsing booking time range:', booking, error);
      // Return null for invalid bookings - they will be filtered out
      return null;
    }
  }

  /**
   * Check if a time slot overlaps with any booking ranges
   * @param {Date} slotStart - Start time of the slot
   * @param {Date} slotEnd - End time of the slot  
   * @param {Array} bookingRanges - Array of booking time range objects
   * @returns {boolean} - True if slot overlaps with any booking
   */
  function checkSlotOverlap(slotStart, slotEnd, bookingRanges) {
    return bookingRanges.some(booking => {
      // Two time ranges overlap if: booking.start < slotEnd AND booking.end > slotStart
      return booking.start < slotEnd && booking.end > slotStart;
    });
  }

  /**
   * Cached version of slot overlap check for performance optimization
   * @param {Date} slotStart - Start time of the slot
   * @param {Date} slotEnd - End time of the slot
   * @param {Array} bookingRanges - Array of booking time range objects
   * @returns {boolean} - True if slot overlaps with any booking
   */
  function checkSlotOverlapCached(slotStart, slotEnd, bookingRanges) {
    const cacheKey = `${slotStart.getTime()}-${slotEnd.getTime()}-${bookingRanges.length}`;
    
    if (overlapCache.has(cacheKey)) {
      return overlapCache.get(cacheKey);
    }
    
    const isBooked = checkSlotOverlap(slotStart, slotEnd, bookingRanges);
    
    // Implement simple LRU by clearing cache if it gets too large
    if (overlapCache.size > 1000) {
      overlapCache.clear();
    }
    
    overlapCache.set(cacheKey, isBooked);
    return isBooked;
  }

  /**
   * Main function to fetch bookings and generate calendar slots
   */
  async function fetchBookingsAndGenerateSlots() {
    const startTime = performance.now(); // Performance timing
    
    try {
      setLoading(true);
      setError(null);

      // Clear cache when fetching new bookings
      overlapCache.clear();

      console.log('🚀 WeeklyCalendar: Starting to fetch bookings...');

      // Step 1: Fetch approved bookings from backend
      const response = await API.get('/bookings/approved-public');
      const approvedBookings = response.data || [];
      
      console.log('📥 Fetched approved bookings:', approvedBookings.length);
      console.log('🔍 RAW BOOKING DATA:', JSON.stringify(approvedBookings, null, 2));

      // Step 2: Parse bookings into time range objects for overlap detection
      const bookingRanges = approvedBookings
        .map(parseBookingTimeRange)
        .filter(range => range !== null); // Remove invalid bookings
      
      console.log('🗺️ Parsed booking ranges:', bookingRanges.length);
      console.log('📊 Booking coverage details:', bookingRanges.map(b => ({
        id: b.id,
        date: b.date,
        start: b.start.toTimeString().slice(0, 8),
        end: b.end.toTimeString().slice(0, 8),
        duration: Math.round((b.end - b.start) / (60 * 1000)) + ' minutes',
        originalBooking: {
          start_time: b.originalBooking.start_time,
          end_time: b.originalBooking.end_time,
          duration_minutes: b.originalBooking.duration_minutes
        }
      })));

      // Debug: Check for 120-minute bookings specifically
      const longBookings = bookingRanges.filter(b => {
        const durationMinutes = Math.round((b.end - b.start) / (60 * 1000));
        return durationMinutes >= 120;
      });
      
      if (longBookings.length > 0) {
        console.log('🔍 Found long bookings (120+ minutes):', longBookings.map(b => ({
          id: b.id,
          date: b.date,
          start: b.start.toTimeString().slice(0, 8),
          end: b.end.toTimeString().slice(0, 8),
          duration: Math.round((b.end - b.start) / (60 * 1000)) + ' minutes'
        })));
      }

      // Step 3: Generate calendar slots for TODAY + next 15 days
      const allEvents = [];

      // Loop through each day from today to today + 15 days
      for (let dayOffset = 0; dayOffset <= 15; dayOffset++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + dayOffset);
        const dateStr = formatDate(currentDate);

        // Filter bookings for current date to optimize overlap checks
        const dayBookingRanges = bookingRanges.filter(booking => booking.date === dateStr);

        // Generate hourly slots from 9:00 AM to 9:00 PM
        for (let hour = 9; hour <= 21; hour++) {
          const startTime24 = `${String(hour).padStart(2, '0')}:00:00`;
          const endHour = hour + 1;
          const endTime24 = `${String(endHour).padStart(2, '0')}:00:00`;

          // Create slot time range for overlap detection
          const slotStart = new Date(`${dateStr}T${startTime24}`);
          const slotEnd = new Date(`${dateStr}T${endTime24}`);

          // Check if this slot overlaps with any booking (using cached version)
          const isBooked = checkSlotOverlapCached(slotStart, slotEnd, dayBookingRanges);

          // Debug logging for multi-hour bookings
          if (dayBookingRanges.length > 0 && hour >= 15 && hour <= 17) { // Focus on 3-5 PM range
            console.log(`🔍 Slot ${hour}:00-${hour+1}:00 on ${dateStr}:`, {
              isBooked,
              slotStart: slotStart.toTimeString().slice(0, 8),
              slotEnd: slotEnd.toTimeString().slice(0, 8),
              dayBookings: dayBookingRanges.map(b => ({
                id: b.id,
                start: b.start.toTimeString().slice(0, 8),
                end: b.end.toTimeString().slice(0, 8),
                overlaps: b.start < slotEnd && b.end > slotStart
              }))
            });
          }

          // Check if this slot is in the past
          const isExpired = isPastSlot(dateStr, startTime24);

          // Create event start and end times for FullCalendar
          const eventStart = `${dateStr}T${startTime24}`;
          const eventEnd = `${dateStr}T${endTime24}`;

          if (isBooked) {
            // BOOKED SLOT (RED)
            allEvents.push({
              id: `booked-${dateStr}-${hour}`,
              title: 'Booked',
              start: eventStart,
              end: eventEnd,
              backgroundColor: '#ef4444', // red-500
              borderColor: '#ef4444',
              textColor: '#ffffff',
              classNames: ['booked-slot'],
              extendedProps: {
                type: 'booked',
                date: dateStr,
                time: startTime24,
                hour: hour
              }
            });
          } else if (isExpired) {
            // EXPIRED SLOT (GREY)
            allEvents.push({
              id: `expired-${dateStr}-${hour}`,
              title: 'Expired',
              start: eventStart,
              end: eventEnd,
              backgroundColor: '#e5e7eb', // gray-200
              borderColor: '#d1d5db', // gray-300
              textColor: '#9ca3af', // gray-400
              classNames: ['expired-slot'],
              extendedProps: {
                type: 'expired',
                date: dateStr,
                time: startTime24,
                hour: hour
              }
            });
          } else {
            // AVAILABLE SLOT (GREEN)
            const displayTime = formatTo12Hour(startTime24);
            
            allEvents.push({
              id: `available-${dateStr}-${hour}`,
              title: displayTime,
              start: eventStart,
              end: eventEnd,
              backgroundColor: '#22c55e', // green-500
              borderColor: '#22c55e',
              textColor: '#ffffff',
              classNames: ['available-slot'],
              extendedProps: {
                type: 'available',
                date: dateStr,
                time: startTime24,
                hour: hour
              }
            });
          }
        }
      }

      const endTime = performance.now();
      const processingTime = Math.round(endTime - startTime);

      console.log('📅 Generated', allEvents.length, 'calendar events');
      console.log('🔴 Booked slots:', allEvents.filter(e => e.extendedProps.type === 'booked').length);
      console.log('🟢 Available slots:', allEvents.filter(e => e.extendedProps.type === 'available').length);
      console.log('⏰ Expired slots:', allEvents.filter(e => e.extendedProps.type === 'expired').length);
      console.log('⚡ Processing time:', processingTime + 'ms');
      console.log('💾 Cache size:', overlapCache.size, 'entries');

      setEvents(allEvents);
    } catch (err) {
      console.error('❌ Error fetching bookings:', err);
      setError('Failed to load calendar. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  /**
   * Handle event click
   */
  function handleEventClick(info) {
    const { type, date, time, hour } = info.event.extendedProps;

    if (type === 'booked') {
      // Booked slot - show toast and prevent action
      toast.error('Slot is already booked', {
        duration: 2000,
        icon: <FiClock />,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
      return;
    }

    if (type === 'expired') {
      // Expired slot - show toast and prevent action
      toast.error('This time slot has expired', {
        duration: 2000,
        icon: <FiClock />,
        style: {
          background: '#9ca3af',
          color: '#fff',
        },
      });
      return;
    }

    if (type === 'available') {
      // Available slot - open booking modal with pre-filled date and time
      if (onOpenBookingModal) {
        const startTime = time.substring(0, 5); // Convert HH:MM:SS to HH:MM
        onOpenBookingModal(date, startTime);
      }
      
      toast.success('Please fill in your booking details', {
        duration: 2000,
        icon: <FiCalendar />,
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
    }
  }

  if (loading) {
    return (
      <div className="weekly-calendar-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 font-medium">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weekly-calendar-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">{error}</p>
            <button 
              onClick={fetchBookingsAndGenerateSlots}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="weekly-calendar-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      {/* Header with Legend and Book Button */}
      <div className="flex items-center justify-between mb-2 py-2 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-gray-700 dark:text-gray-300">Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-green-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Available</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
            <span className="text-gray-600 dark:text-gray-400">Booked</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-gray-300"></span>
            <span className="text-gray-600 dark:text-gray-400">Expired</span>
          </div>
        </div>

        {/* Book Button */}
        {isLoggedIn && user?.role === 'user' && (
          <button
            onClick={() => {
              if (onOpenBookingModal) {
                onOpenBookingModal(null, null); // No date or time pre-selected
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium rounded-lg hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiPlus className="w-3.5 h-3.5" />
            Book Slot
          </button>
        )}
      </div>

      {/* Calendar - Week View with Navigation */}
      <div className="calendar-card-premium bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-[20px] shadow-2xl shadow-gray-200/50 dark:shadow-gray-900/50 border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <FullCalendar
          plugins={[timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          initialDate={todayStr}
          headerToolbar={{
            left: 'title',
            center: '',
            right: 'today,prev,next'
          }}
          validRange={{
            start: todayStr,
            end: endDateStr
          }}
          visibleRange={{
            start: todayStr,
            end: endDateStr
          }}
          slotMinTime="09:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          height="auto"
          contentHeight="auto"
          events={events}
          eventClick={handleEventClick}
          eventOverlap={false}
          slotEventOverlap={false}
          dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
          nowIndicator={true}
          slotDuration="01:00:00"
          slotLabelInterval="01:00"
          expandRows={true}
          stickyHeaderDates={true}
          firstDay={new Date(todayStr).getDay()}
          slotLabelFormat={{
            hour: 'numeric',
            minute: '2-digit',
            omitZeroMinute: false,
            meridiem: 'short',
            hour12: true
          }}
          eventDidMount={(info) => {
            const { type } = info.event.extendedProps;
            
            // Add tooltip
            let tooltipText = '';
            if (type === 'booked') {
              tooltipText = 'This slot is already booked';
            } else if (type === 'expired') {
              tooltipText = 'This time slot has expired';
            } else if (type === 'available') {
              tooltipText = 'Click to book this slot';
            }
            info.el.setAttribute('title', tooltipText);
            
            // Set cursor style
            if (type === 'available') {
              info.el.style.cursor = 'pointer';
            } else {
              info.el.style.cursor = 'not-allowed';
            }
            
            // Force styling for booked slots (RED)
            if (type === 'booked') {
              info.el.style.setProperty('background-color', '#ef4444', 'important');
              info.el.style.setProperty('border-color', '#ef4444', 'important');
              info.el.style.setProperty('color', '#ffffff', 'important');
            }
            
            // Force styling for available slots (GREEN)
            if (type === 'available') {
              info.el.style.setProperty('background-color', '#22c55e', 'important');
              info.el.style.setProperty('border-color', '#22c55e', 'important');
              info.el.style.setProperty('color', '#ffffff', 'important');
            }
            
            // Force styling for expired slots (GREY)
            if (type === 'expired') {
              info.el.style.setProperty('background-color', '#e5e7eb', 'important');
              info.el.style.setProperty('border-color', '#d1d5db', 'important');
              info.el.style.setProperty('color', '#9ca3af', 'important');
              info.el.style.opacity = '0.6';
            }
          }}
          eventContent={(eventInfo) => {
            return (
              <div className="fc-event-content-wrapper">
                <div className="fc-event-title font-semibold text-center">
                  {eventInfo.event.title}
                </div>
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}

export default WeeklyCalendar;
