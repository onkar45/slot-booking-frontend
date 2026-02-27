# Design Document

## Overview

The Multi-Slot Booking Display feature redesigns the calendar slot availability detection system to properly handle bookings that span multiple hours. Instead of the current exact-match approach, the system will implement overlap detection to ensure all hourly slots covered by a multi-hour booking are correctly displayed as "booked".

## Architecture

### Current System Flow
```
1. Fetch approved bookings from API
2. Create Map with exact time keys (YYYY-MM-DD_HH:MM:SS)
3. For each hourly slot, check if exact key exists in Map
4. Generate calendar events based on exact matches
```

### New System Flow
```
1. Fetch approved bookings from API
2. Parse bookings into time range objects
3. For each hourly slot, check for overlaps with all booking ranges
4. Generate calendar events based on overlap detection
5. Cache results for performance optimization
```

## Components and Interfaces

### 1. Enhanced WeeklyCalendar Component

**Location:** `src/components/WeeklyCalendar.jsx`

**Key Changes:**
- Replace exact-match Map lookup with overlap detection
- Implement efficient time range intersection algorithm
- Add caching layer for performance optimization
- Maintain existing FullCalendar integration

### 2. Booking Time Range Parser

**New Utility Functions:**
```javascript
// Parse booking into time range object
function parseBookingTimeRange(booking) {
  return {
    id: booking.id,
    start: new Date(`${booking.booking_date}T${booking.start_time}`),
    end: new Date(`${booking.booking_date}T${booking.end_time || calculateEndTime(booking)}`),
    date: booking.booking_date
  };
}

// Calculate end time from start time and duration
function calculateEndTime(booking) {
  const start = new Date(`${booking.booking_date}T${booking.start_time}`);
  const end = new Date(start.getTime() + (booking.duration_minutes * 60 * 1000));
  return end.toTimeString().slice(0, 8); // HH:MM:SS format
}
```

### 3. Overlap Detection Algorithm

**Core Algorithm:**
```javascript
function checkSlotOverlap(slotStart, slotEnd, bookingRanges) {
  return bookingRanges.some(booking => {
    // Two time ranges overlap if:
    // booking.start < slotEnd AND booking.end > slotStart
    return booking.start < slotEnd && booking.end > slotStart;
  });
}
```

**Time Complexity:** O(n) where n = number of bookings
**Space Complexity:** O(n) for booking range objects

### 4. Performance Optimization Layer

**Caching Strategy:**
```javascript
class BookingOverlapCache {
  constructor() {
    this.cache = new Map();
    this.bookingRanges = [];
  }
  
  updateBookings(bookings) {
    this.bookingRanges = bookings.map(parseBookingTimeRange);
    this.cache.clear(); // Invalidate cache when bookings change
  }
  
  isSlotBooked(slotStart, slotEnd) {
    const key = `${slotStart.getTime()}-${slotEnd.getTime()}`;
    
    if (this.cache.has(key)) {
      return this.cache.get(key);
    }
    
    const isBooked = checkSlotOverlap(slotStart, slotEnd, this.bookingRanges);
    this.cache.set(key, isBooked);
    return isBooked;
  }
}
```

## Data Models

### Booking Time Range Object
```javascript
interface BookingTimeRange {
  id: number;           // Booking ID for reference
  start: Date;          // Booking start datetime
  end: Date;            // Booking end datetime  
  date: string;         // Booking date (YYYY-MM-DD)
}
```

### Slot Time Range Object
```javascript
interface SlotTimeRange {
  start: Date;          // Slot start datetime
  end: Date;            // Slot end datetime
  date: string;         // Slot date (YYYY-MM-DD)
  hour: number;         // Hour of the slot (9-21)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Multi-Hour Booking Coverage
*For any* approved booking with duration greater than 60 minutes, all hourly slots that intersect with the booking time range should be marked as "booked"
**Validates: Requirements 1.1, 1.5**

### Property 2: Comprehensive Overlap Detection
*For any* hourly slot and booking time range, the overlap detection should correctly identify intersections including partial overlaps, complete encompassing, and boundary conditions
**Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.6**

### Property 3: Visual Consistency Across Covered Slots
*For any* booking that covers multiple slots, all affected slots should have identical visual styling, state, and tooltip information while maintaining the standard color scheme
**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 4: Performance Within Bounds
*For any* calendar refresh with up to 100 bookings, the overlap detection and event generation should complete within 500ms
**Validates: Requirements 4.1**

### Property 5: Booking Conflict Prevention
*For any* user interaction with slots that are partially or fully covered by existing bookings, the system should prevent booking attempts and show appropriate error messages
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

### Property 6: Flexible Duration and Timing Handling
*For any* booking with unusual durations, non-hour boundary times, or edge cases like midnight spanning, the system should calculate slot coverage accurately
**Validates: Requirements 6.1, 6.2, 6.3, 6.5**

### Property 7: Backward Compatibility and Error Resilience
*For any* existing booking data including legacy formats, missing fields, or invalid data, the system should process gracefully while maintaining compatibility with current API responses
**Validates: Requirements 6.4, 7.1, 7.2, 7.3, 7.4**

## Error Handling

### 1. Invalid Booking Data
- **Scenario:** Booking missing `end_time` or `duration_minutes`
- **Handling:** Calculate missing field from available data, log warning
- **Fallback:** Use default 30-minute duration if calculation fails

### 2. Date Parsing Errors
- **Scenario:** Invalid date/time format in booking data
- **Handling:** Skip invalid booking, log error, continue processing
- **User Impact:** Invalid booking won't affect calendar display

### 3. Performance Degradation
- **Scenario:** Large number of bookings causing slow rendering
- **Handling:** Implement progressive loading, show loading indicator
- **Threshold:** If processing takes >500ms, show "Loading calendar..." message

### 4. Memory Constraints
- **Scenario:** Cache growing too large with many unique slot queries
- **Handling:** Implement LRU cache with maximum size limit
- **Limit:** Maximum 1000 cached slot results

## Testing Strategy

### Unit Tests
- **Overlap Detection Algorithm:** Test all intersection scenarios
- **Time Range Parsing:** Validate booking data transformation
- **Cache Functionality:** Verify cache hits/misses and invalidation
- **Edge Cases:** Test boundary conditions and invalid data

### Property-Based Tests
Each property test should run a minimum of 100 iterations and be tagged with:
**Feature: multi-slot-booking-display, Property {number}: {property_text}**

**Property Test 1: Multi-Hour Booking Coverage**
- Generate random bookings with durations 60-300 minutes at various start times
- Verify all intersecting hourly slots are marked as booked
- **Feature: multi-slot-booking-display, Property 1: Multi-Hour Booking Coverage**

**Property Test 2: Comprehensive Overlap Detection**
- Generate random slot and booking time ranges including edge cases
- Verify overlap detection correctly handles all intersection scenarios
- **Feature: multi-slot-booking-display, Property 2: Comprehensive Overlap Detection**

**Property Test 3: Visual Consistency Across Covered Slots**
- Generate bookings covering multiple slots with various durations
- Verify all covered slots have identical styling and state
- **Feature: multi-slot-booking-display, Property 3: Visual Consistency Across Covered Slots**

**Property Test 4: Performance Within Bounds**
- Generate up to 100 random bookings with various durations
- Measure overlap detection and calendar generation completion time
- **Feature: multi-slot-booking-display, Property 4: Performance Within Bounds**

**Property Test 5: Booking Conflict Prevention**
- Generate scenarios with existing bookings and attempted new bookings
- Verify conflict detection and appropriate user feedback
- **Feature: multi-slot-booking-display, Property 5: Booking Conflict Prevention**

**Property Test 6: Flexible Duration and Timing Handling**
- Generate bookings with unusual durations, non-hour boundaries, and edge cases
- Verify accurate slot coverage calculation in all scenarios
- **Feature: multi-slot-booking-display, Property 6: Flexible Duration and Timing Handling**

**Property Test 7: Backward Compatibility and Error Resilience**
- Generate various booking data formats including legacy and invalid data
- Verify graceful handling while maintaining API compatibility
- **Feature: multi-slot-booking-display, Property 7: Backward Compatibility and Error Resilience**

### Integration Tests
- **Calendar Rendering:** Verify correct visual display of multi-hour bookings
- **User Interaction:** Test clicking on slots covered by multi-hour bookings
- **API Integration:** Validate with real booking data from backend
- **Performance:** Measure end-to-end calendar load time

### Visual Regression Tests
- **Multi-Hour Booking Display:** Screenshot comparison of calendar with various booking durations
- **Color Consistency:** Verify all covered slots use same "booked" styling
- **Responsive Design:** Test calendar appearance across different screen sizes