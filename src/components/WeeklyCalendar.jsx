import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';

function WeeklyCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, available: 0, reserved: 0, booked: 0 });
  const navigate = useNavigate();
  const { role } = useContext(AuthContext);
  const isLoggedIn = !!localStorage.getItem('token');

  // Calculate date range: today to today + 15 days (in local timezone)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDateString = today.toISOString().split('T')[0];
  
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + 15);
  const endDateString = endDate.toISOString().split('T')[0];

  useEffect(() => {
    fetchSlots();
    
    // Auto-refresh every 5 minutes to update expired slots
    const intervalId = setInterval(() => {
      fetchSlots();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/slots/public');
      
      // Filter slots within the valid range (today to today + 15 days)
      const validSlots = res.data.filter(slot => {
        return slot.date >= todayDateString && slot.date <= endDateString;
      });

      // Calculate stats
      let availableCount = 0;
      let reservedCount = 0;
      let bookedCount = 0;

      // Convert slots to FullCalendar events with color coding
      const calendarEvents = validSlots.map(slot => {
        let backgroundColor, borderColor, textColor, title, tooltip;
        
        // Check if slot time has passed
        const slotDateTime = new Date(`${slot.date}T${slot.end_time}`);
        const now = new Date();
        const isPast = slotDateTime < now;
        
        // Determine color based on slot status from backend
        const status = slot.status || 'inactive';
        
        if (isPast) {
          // Past slot - Lighter Gray
          backgroundColor = '#9ca3af';
          borderColor = '#6b7280';
          textColor = '#ffffff';
          title = 'Expired';
          tooltip = 'This slot has expired';
        } else if (status === 'booked' || slot.is_booked) {
          // Booked slot - Red
          backgroundColor = '#ef4444';
          borderColor = '#dc2626';
          textColor = '#ffffff';
          title = 'Booked';
          tooltip = 'Already booked';
          bookedCount++;
        } else if (status === 'pending') {
          // Reserved/Pending slot - Yellow
          backgroundColor = '#eab308';
          borderColor = '#ca8a04';
          textColor = '#ffffff';
          title = 'Reserved';
          tooltip = 'Awaiting approval';
          reservedCount++;
        } else if (status === 'available' && slot.is_active) {
          // Available slot - Green
          backgroundColor = '#22c55e';
          borderColor = '#16a34a';
          textColor = '#ffffff';
          title = 'Available';
          tooltip = 'Click to book this slot';
          availableCount++;
        } else {
          // Inactive slot - Gray
          backgroundColor = '#6b7280';
          borderColor = '#4b5563';
          textColor = '#ffffff';
          title = 'Inactive';
          tooltip = 'Not available';
        }

        return {
          id: slot.id,
          title: `${title}`,
          start: `${slot.date}T${slot.start_time}`,
          end: `${slot.date}T${slot.end_time}`,
          backgroundColor,
          borderColor,
          textColor,
          classNames: [
            isPast || !slot.is_active ? 'expired-slot' : 'active-slot',
            status === 'available' && slot.is_active && !isPast ? 'available-slot' : ''
          ],
          extendedProps: {
            slotId: slot.id,
            isActive: slot.is_active && !isPast,
            isBooked: slot.is_booked,
            status: isPast ? 'expired' : status,
            startTime: slot.start_time,
            endTime: slot.end_time,
            isPast: isPast,
            tooltip: tooltip
          }
        };
      });

      setStats({
        total: validSlots.length,
        available: availableCount,
        reserved: reservedCount,
        booked: bookedCount
      });

      setEvents(calendarEvents);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load calendar. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (info) => {
    const { isActive, isBooked, status, startTime, endTime, isPast } = info.event.extendedProps;
    const slotDate = new Date(info.event.start).toLocaleDateString();
    
    // Prevent clicking on expired or inactive slots
    if (isPast || !isActive) {
      return;
    }

    // If slot is available and user is not logged in, redirect to login
    if (status === 'available' && !isBooked && !isLoggedIn) {
      toast('Please login to book this slot', {
        duration: 2000,
        icon: '🔐',
        style: {
          background: '#3b82f6',
          color: '#fff',
        },
      });
      setTimeout(() => {
        navigate('/login');
      }, 800);
      return;
    }
    
    // Show slot details for logged-in users
    if (status === 'available' && isActive && !isBooked) {
      toast(`Available Slot\n\nDate: ${slotDate}\nTime: ${startTime} - ${endTime}\n\nPlease proceed to book this slot.`, {
        duration: 3000,
        icon: '✅',
        style: {
          background: '#22c55e',
          color: '#fff',
        },
      });
    } else if (status === 'booked' || isBooked) {
      toast(`This slot is already booked.\n\nDate: ${slotDate}\nTime: ${startTime} - ${endTime}`, {
        duration: 3000,
        icon: '❌',
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    } else if (status === 'pending') {
      toast(`This slot is reserved (pending approval).\n\nDate: ${slotDate}\nTime: ${startTime} - ${endTime}`, {
        duration: 3000,
        icon: '⏳',
        style: {
          background: '#eab308',
          color: '#fff',
        },
      });
    }
  };

  const dayCellClassNames = (arg) => {
    const cellDate = new Date(arg.date);
    cellDate.setHours(0, 0, 0, 0);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);
    
    // Highlight current day
    if (cellDate.getTime() === todayDate.getTime()) {
      return ['current-day-highlight'];
    }
    
    // Disable past dates
    if (cellDate < todayDate) {
      return ['past-date-disabled'];
    }
    
    return [];
  };

  if (loading) {
    return (
      <div className="weekly-calendar-container">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Loading calendar...</p>
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
            <p className="text-gray-700 font-medium mb-2">{error}</p>
            <button 
              onClick={fetchSlots}
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
    <div className="weekly-calendar-container">
      {/* Stats Summary - Inline */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600 dark:text-gray-400">Total:</span>
          <span className="font-bold text-gray-900 dark:text-gray-100">{stats.total}</span>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Available:</span>
          <span className="font-bold text-green-600 dark:text-green-400">{stats.available}</span>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Reserved:</span>
          <span className="font-bold text-yellow-600 dark:text-yellow-400">{stats.reserved}</span>
        </div>
        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600"></div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span className="text-gray-600 dark:text-gray-400">Booked:</span>
          <span className="font-bold text-red-600 dark:text-red-400">{stats.booked}</span>
        </div>
      </div>

      {/* Badge showing availability period */}
      <div className="mb-4 flex items-center justify-center">
        <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold shadow-sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Showing availability for next 15 days
        </div>
      </div>

      <FullCalendar
        plugins={[timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        initialDate={todayDateString}
        timeZone="local"
        headerToolbar={{
          left: 'title',
          center: '',
          right: 'today,prev,next'
        }}
        validRange={{
          start: todayDateString,
          end: endDateString
        }}
        slotMinTime="09:00:00"
        slotMaxTime="21:00:00"
        allDaySlot={false}
        height="auto"
        contentHeight="auto"
        events={events}
        eventClick={handleEventClick}
        nowIndicator={true}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        expandRows={true}
        stickyHeaderDates={true}
        dayCellClassNames={dayCellClassNames}
        dayHeaderFormat={{ weekday: 'short', month: 'numeric', day: 'numeric' }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short'
        }}
        eventContent={(eventInfo) => {
          const { isPast, isActive, tooltip } = eventInfo.event.extendedProps;
          return (
            <div 
              className={`fc-event-content-wrapper ${isPast || !isActive ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              title={tooltip}
            >
              <div className="fc-event-title">{eventInfo.event.title}</div>
            </div>
          );
        }}
      />
    </div>
  );
}

export default WeeklyCalendar;
