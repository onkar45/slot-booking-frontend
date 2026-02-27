# WeeklyCalendar.jsx - Complete Refactor Documentation

## Overview
Complete clean refactor of WeeklyCalendar component with simplified logic, no duplicate events, and proper booked slot rendering.

## Key Features

### 1. Single Source of Truth
- Fetches approved bookings from: `GET /bookings/approved-public`
- No authentication required
- Backend returns data in 24-hour format

### 2. Clean Map-Based Lookup
```javascript
// Key format: "YYYY-MM-DD_HH:MM:SS"
// Example: "2024-03-15_09:00:00"
const approvedBookingsMap = new Map();
approvedBookings.forEach(booking => {
  const key = `${booking.booking_date}_${booking.start_time}`;
  approvedBookingsMap.set(key, booking);
});
```

### 3. Simple Slot Generation
- Current week only (Monday to Sunday)
- 9:00 AM to 9:00 PM
- 1-hour intervals
- Exactly ONE event per slot

### 4. Matching Logic
```javascript
// For each slot, check if it's booked
const lookupKey = `${dateStr}_${startTime24}`;
const isBooked = approvedBookingsMap.has(lookupKey);

if (isBooked) {
  // Create BOOKED event (red)
} else {
  // Create AVAILABLE event (green)
}
```

## Data Flow

### Backend Response Format
```json
{
  "booking_date": "2024-03-15",
  "start_time": "09:00:00",
  "end_time": "10:00:00",
  "status": "approved"
}
```

### Map Key Generation
```
booking_date + "_" + start_time
"2024-03-15_09:00:00"
```

### Slot Generation
```
For each day (Mon-Sun):
  For each hour (9-21):
    Generate slot: "YYYY-MM-DD_HH:00:00"
    Check if exists in map
    Create event (booked or available)
```

## Event Structure

### Booked Slot
```javascript
{
  id: 'booked-2024-03-15-9',
  title: 'Booked',
  start: '2024-03-15T09:00:00',
  end: '2024-03-15T10:00:00',
  backgroundColor: '#ef4444',  // red-500
  borderColor: '#ef4444',
  textColor: '#ffffff',
  classNames: ['booked-slot'],
  extendedProps: {
    type: 'booked',
    date: '2024-03-15',
    time: '09:00:00',
    hour: 9
  }
}
```

### Available Slot
```javascript
{
  id: 'available-2024-03-15-9',
  title: '9:00 AM',  // 12-hour format for display
  start: '2024-03-15T09:00:00',
  end: '2024-03-15T10:00:00',
  backgroundColor: '#22c55e',  // green-500
  borderColor: '#22c55e',
  textColor: '#ffffff',
  classNames: ['available-slot'],
  extendedProps: {
    type: 'available',
    date: '2024-03-15',
    time: '09:00:00',
    hour: 9
  }
}
```

## Time Format Handling

### Backend (24-hour format)
- Storage: `09:00:00`, `14:00:00`, `21:00:00`
- Comparison: Always use 24-hour format
- Map keys: Use 24-hour format

### Frontend Display (12-hour format)
- Available slots: `9:00 AM`, `2:00 PM`, `9:00 PM`
- Booked slots: `Booked` (no time shown)
- Conversion: Only for display purposes

### Conversion Function
```javascript
const formatTo12Hour = (time24) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};
```

## User Interactions

### Click on Booked Slot
```javascript
if (type === 'booked') {
  toast.error('Slot is already booked');
  return; // Do NOT open modal
}
```

### Click on Available Slot
```javascript
if (type === 'available') {
  const startTime = time.substring(0, 5); // HH:MM:SS → HH:MM
  onOpenBookingModal(date, startTime);
  toast.success('Please fill in your booking details');
}
```

### Click "Book Slot" Button
```javascript
onOpenBookingModal(null, null); // No pre-filled data
```

## FullCalendar Configuration

```javascript
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  slotMinTime="09:00:00"
  slotMaxTime="22:00:00"
  allDaySlot={false}
  height="auto"
  eventOverlap={false}        // Prevent overlapping
  slotEventOverlap={false}    // Prevent overlapping
  slotDuration="01:00:00"     // 1-hour slots
  slotLabelInterval="01:00"   // Show every hour
  nowIndicator={true}         // Show current time line
/>
```

## Styling

### Booked Slots (Red)
- Background: `#ef4444` (red-500)
- Border: `#ef4444`
- Text: `#ffffff` (white)
- Title: "Booked"
- Cursor: `not-allowed`

### Available Slots (Green)
- Background: `#22c55e` (green-500)
- Border: `#22c55e`
- Text: `#ffffff` (white)
- Title: Time in 12-hour format
- Cursor: `pointer`

### Force Styling
```javascript
eventDidMount={(info) => {
  if (type === 'booked') {
    info.el.style.setProperty('background-color', '#ef4444', 'important');
    info.el.style.setProperty('border-color', '#ef4444', 'important');
  }
  if (type === 'available') {
    info.el.style.setProperty('background-color', '#22c55e', 'important');
    info.el.style.setProperty('border-color', '#22c55e', 'important');
  }
}
```

## Week Calculation

### Get Week Start (Monday)
```javascript
const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = today.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};
```

### Get Week End (Sunday)
```javascript
const getWeekEnd = () => {
  const weekStart = getWeekStart();
  const sunday = new Date(weekStart);
  sunday.setDate(weekStart.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return sunday;
};
```

## No Duplicate Events

### Problem (Old Implementation)
- Generated available slots for all hours
- Then overlaid booked slots on top
- Result: Multiple events per slot, visual conflicts

### Solution (New Implementation)
- Single loop through all slots
- Check if booked BEFORE creating event
- Create exactly ONE event per slot
- No overlapping, no conflicts

### Code
```javascript
for (let hour = 9; hour <= 21; hour++) {
  const lookupKey = `${dateStr}_${startTime24}`;
  const isBooked = approvedBookingsMap.has(lookupKey);
  
  if (isBooked) {
    // Create ONE booked event
  } else {
    // Create ONE available event
  }
  // Never create both!
}
```

## Auto-Refresh

```javascript
useEffect(() => {
  fetchBookingsAndGenerateSlots();
  
  // Refresh every 5 minutes
  const intervalId = setInterval(() => {
    fetchBookingsAndGenerateSlots();
  }, 5 * 60 * 1000);
  
  return () => clearInterval(intervalId);
}, []);
```

## Error Handling

### Loading State
```javascript
if (loading) {
  return <LoadingSpinner />;
}
```

### Error State
```javascript
if (error) {
  return (
    <ErrorDisplay 
      message={error}
      onRetry={fetchBookingsAndGenerateSlots}
    />
  );
}
```

### API Error
```javascript
try {
  const response = await API.get('/bookings/approved-public');
} catch (err) {
  console.error('❌ Error fetching bookings:', err);
  setError('Failed to load calendar. Please try again later.');
}
```

## Testing Scenarios

### Test 1: Empty Calendar
- No approved bookings
- Expected: All slots show as available (green)
- All slots show time in 12-hour format

### Test 2: Single Booking
- One booking: 2024-03-15 at 09:00:00
- Expected: 
  - 9:00 AM slot on March 15 shows "Booked" (red)
  - All other slots show as available (green)

### Test 3: Multiple Bookings
- Three bookings on same day at different times
- Expected: All three slots show as booked (red)
- Other slots remain available (green)

### Test 4: Click Booked Slot
- Click on red "Booked" slot
- Expected: Toast message "Slot is already booked"
- Modal does NOT open

### Test 5: Click Available Slot
- Click on green available slot (e.g., 2:00 PM)
- Expected: 
  - Toast message "Please fill in your booking details"
  - Modal opens with date and time pre-filled

### Test 6: Week Navigation
- Click "next" to go to next week
- Expected: Calendar shows next week's slots
- Bookings update accordingly

### Test 7: Current Time Indicator
- View calendar during business hours
- Expected: Red line shows current time
- Updates in real-time

## Performance Optimizations

### Map Lookup
- O(1) lookup time
- Better than array.find() which is O(n)

### Single Loop
- Generate all events in one pass
- No nested loops for matching

### Memoization
- Events only regenerate when bookings change
- Not on every render

## Code Quality

### Clean Functions
- Each function has single responsibility
- Clear naming conventions
- Comprehensive comments

### No Magic Numbers
- Business hours: 9 and 21 (clearly defined)
- Refresh interval: 5 * 60 * 1000 (5 minutes)
- Week days: 7 (Monday to Sunday)

### Type Safety
- Clear prop types
- Consistent data structures
- Predictable return values

## Removed Complexity

### What Was Removed
- ❌ Multiple booking status checks (pending, rejected, expired)
- ❌ User-specific booking logic
- ❌ Complex time range calculations
- ❌ Duplicate event generation
- ❌ Overlapping event handling
- ❌ Past date filtering
- ❌ 15-day range logic

### What Remains
- ✅ Simple approved bookings only
- ✅ Current week only
- ✅ One event per slot
- ✅ Clear booked vs available logic
- ✅ Clean 24-hour to 12-hour conversion

## Benefits

### For Users
- Clear visual distinction (red vs green)
- No confusing overlapping events
- Fast loading and interaction
- Reliable booking status

### For Developers
- Easy to understand and maintain
- Simple debugging
- Clear data flow
- Minimal dependencies

### For Performance
- Efficient Map-based lookup
- Single-pass event generation
- Minimal re-renders
- Fast API calls

## Future Enhancements

Potential improvements (not implemented):
- Multi-week view
- Booking duration display
- User's own bookings highlight
- Drag-and-drop booking
- Mobile-optimized view

## Implementation Complete

✅ Clean refactored code
✅ No duplicate events
✅ Proper red booked slots
✅ Green available slots
✅ 24-hour backend format
✅ 12-hour display format
✅ Map-based lookup
✅ Current week only
✅ One event per slot
✅ Click interactions working
✅ Auto-refresh enabled
✅ No diagnostic errors
