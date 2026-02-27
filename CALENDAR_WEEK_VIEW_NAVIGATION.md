# WeeklyCalendar.jsx - Week View with Navigation

## Overview
Calendar displays one week at a time using `timeGridWeek` view. Users can navigate through weeks using prev/next buttons, but navigation is restricted to TODAY + 15 days range.

## Key Configuration

### FullCalendar Setup
```javascript
<FullCalendar
  plugins={[timeGridPlugin, interactionPlugin]}
  initialView="timeGridWeek"
  initialDate={todayStr}
  validRange={{
    start: todayStr,
    end: endDateStr
  }}
  slotMinTime="09:00:00"
  slotMaxTime="22:00:00"
  eventOverlap={false}
  slotEventOverlap={false}
  height="auto"
/>
```

### Key Points
- ✅ Uses `timeGridWeek` (NOT `timeGridDay`)
- ✅ NO `dayCount` property
- ✅ NO `visibleRange` property
- ✅ Only `validRange` to restrict navigation
- ✅ Clean, responsive layout

## Visual Layout

### Week View
```
┌─────────────────────────────────────────────────────┐
│  Sun 3/15  Mon 3/16  Tue 3/17  Wed 3/18  ...  Sat  │
├─────────────────────────────────────────────────────┤
│ 9:00 AM  │ [Green] │ [Green] │ [Red]   │ [Green]  │
│ 10:00 AM │ [Red]   │ [Green] │ [Green] │ [Grey]   │
│ 11:00 AM │ [Green] │ [Green] │ [Green] │ [Green]  │
│ ...      │   ...   │   ...   │   ...   │   ...    │
│ 9:00 PM  │ [Green] │ [Green] │ [Green] │ [Green]  │
└─────────────────────────────────────────────────────┘
```

### Features
- Shows 7 days per week (standard week view)
- Clean, familiar layout
- Easy to read and navigate
- Responsive design

## Date Range Logic

### Calculate Range
```javascript
// TODAY (start of day)
const today = new Date();
today.setHours(0, 0, 0, 0);

// TODAY + 15 days (end of day)
const endDate = new Date(today);
endDate.setDate(today.getDate() + 15);
endDate.setHours(23, 59, 59, 999);

const todayStr = formatDate(today);      // "2024-03-15"
const endDateStr = formatDate(endDate);  // "2024-03-30"
```

### Valid Range
```javascript
validRange={{
  start: todayStr,  // Cannot go before today
  end: endDateStr   // Cannot go beyond today + 15
}}
```

## Navigation Behavior

### Initial View
- Opens showing the week that contains TODAY
- If today is Wednesday, shows Sun-Sat of current week
- First visible day might be before today (but greyed out as expired)

### Next Button
- Advances to next week
- Stops when reaching the week containing day 15
- Button becomes disabled when no more future weeks available

### Previous Button
- Goes back to previous week
- Stops at the week containing TODAY
- Button becomes disabled when at the earliest valid week

### Today Button
- Jumps back to the week containing today
- Always available unless already viewing that week

## Example Navigation Flow

### Scenario: Today is March 15, 2024 (Friday)

**Week 1 (Initial View):**
```
Sun 3/10 | Mon 3/11 | Tue 3/12 | Wed 3/13 | Thu 3/14 | Fri 3/15 | Sat 3/16
[Expired] [Expired] [Expired] [Expired] [Expired] [Available] [Available]
```

**Click "Next" → Week 2:**
```
Sun 3/17 | Mon 3/18 | Tue 3/19 | Wed 3/20 | Thu 3/21 | Fri 3/22 | Sat 3/23
[Available] [Available] [Available] [Available] [Available] [Available] [Available]
```

**Click "Next" → Week 3:**
```
Sun 3/24 | Mon 3/25 | Tue 3/26 | Wed 3/27 | Thu 3/28 | Fri 3/29 | Sat 3/30
[Available] [Available] [Available] [Available] [Available] [Available] [Available]
                                                                          ↑ Day 15
```

**Click "Next" → Disabled**
- Cannot go beyond March 30 (day 15)
- Next button becomes disabled

**Click "Previous" → Back to Week 2**
**Click "Previous" → Back to Week 1**
**Click "Previous" → Disabled**
- Cannot go before the week containing today

## Slot Generation

### Loop Structure
```javascript
// Generate slots for all 16 days (today + 15)
for (let dayOffset = 0; dayOffset <= 15; dayOffset++) {
  const currentDate = new Date(today);
  currentDate.setDate(today.getDate() + dayOffset);
  const dateStr = formatDate(currentDate);
  
  // For each day, generate 13 hourly slots (9 AM to 9 PM)
  for (let hour = 9; hour <= 21; hour++) {
    // Generate slot...
  }
}
```

### Total Slots
- Days: 16 (today + 15)
- Hours per day: 13 (9 AM to 9 PM)
- Total: 16 × 13 = 208 slots

### FullCalendar Filtering
- All 208 slots are generated
- FullCalendar automatically shows only slots within current week view
- When user navigates, different slots become visible
- No need to regenerate events on navigation

## Slot Types

### 1. BOOKED (Red)
```javascript
{
  title: 'Booked',
  backgroundColor: '#ef4444',
  borderColor: '#ef4444',
  textColor: '#ffffff',
  extendedProps: { type: 'booked' }
}
```

**Behavior:**
- Shows "Booked" text
- Red background
- Not clickable
- Toast: "Slot is already booked"

### 2. AVAILABLE (Green)
```javascript
{
  title: '9:00 AM',  // 12-hour format
  backgroundColor: '#22c55e',
  borderColor: '#22c55e',
  textColor: '#ffffff',
  extendedProps: { type: 'available' }
}
```

**Behavior:**
- Shows time in 12-hour format
- Green background
- Clickable
- Opens booking modal

### 3. EXPIRED (Grey)
```javascript
{
  title: 'Expired',
  backgroundColor: '#e5e7eb',
  borderColor: '#d1d5db',
  textColor: '#9ca3af',
  extendedProps: { type: 'expired' }
}
```

**Behavior:**
- Shows "Expired" text
- Grey background with opacity
- Not clickable
- Toast: "This time slot has expired"

## Time Format Handling

### Backend (24-hour)
- Storage: `09:00:00`, `14:00:00`, `21:00:00`
- Map keys: `"2024-03-15_09:00:00"`
- Matching: Always 24-hour format

### Display (12-hour)
- Available slots: `9:00 AM`, `2:00 PM`, `9:00 PM`
- Conversion: Only for display

### Conversion Function
```javascript
function formatTo12Hour(time24) {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}
```

## Advantages of Week View

### User Experience
1. **Familiar Layout**: Standard week view everyone knows
2. **Easy Navigation**: Simple prev/next buttons
3. **Not Overwhelming**: Shows 7 days at a time
4. **Responsive**: Works great on all screen sizes
5. **Clean Design**: No horizontal scrolling needed

### Technical Benefits
1. **Standard FullCalendar View**: Uses built-in functionality
2. **No Custom Layout**: Leverages FullCalendar's responsive design
3. **Automatic Filtering**: FullCalendar handles which events to show
4. **Simple Configuration**: Minimal custom code
5. **Maintainable**: Easy to understand and modify

### Business Benefits
1. **Enforces 15-Day Limit**: Navigation restricted
2. **Prevents Past Bookings**: Cannot navigate before today
3. **Clear Boundaries**: Users understand the booking window
4. **Professional Look**: Standard calendar interface

## Comparison with Other Views

### timeGridDay with dayCount={16}
- ❌ Shows all 16 days in one row
- ❌ Requires horizontal scrolling
- ❌ Can be overwhelming
- ❌ Harder to read on mobile

### timeGridWeek (Current)
- ✅ Shows 7 days at a time
- ✅ No horizontal scrolling
- ✅ Clean, familiar layout
- ✅ Great on all devices
- ✅ Easy navigation with prev/next

## Responsive Design

### Desktop (> 1024px)
- Full week view (7 days)
- All columns clearly visible
- Easy to read and interact

### Tablet (768px - 1024px)
- Week view adapts
- Columns may be narrower
- Still fully functional

### Mobile (< 768px)
- FullCalendar automatically adjusts
- May show fewer days or stack vertically
- Touch-friendly navigation

## Click Interactions

### Booked Slot
```javascript
if (type === 'booked') {
  toast.error('Slot is already booked');
  return; // Do NOT open modal
}
```

### Expired Slot
```javascript
if (type === 'expired') {
  toast.error('This time slot has expired');
  return; // Do NOT open modal
}
```

### Available Slot
```javascript
if (type === 'available') {
  const startTime = time.substring(0, 5); // "09:00:00" → "09:00"
  onOpenBookingModal(date, startTime);
  toast.success('Please fill in your booking details');
}
```

## Performance

### Event Generation
- All 208 events generated once on load
- Cached in state
- No regeneration on navigation

### Navigation
- FullCalendar handles view changes
- Fast and smooth
- No API calls needed

### Memory Usage
- 208 events in memory
- Minimal overhead
- Efficient rendering

## Testing Scenarios

### Test 1: Initial Load
- Opens showing week containing today
- Today's date highlighted
- Past days (if any) show as expired

### Test 2: Next Navigation
- Click "Next" button
- View advances to next week
- All slots within 15-day range visible

### Test 3: Navigation Limit
- Navigate to last week (containing day 15)
- Try clicking "Next"
- Button disabled or does nothing

### Test 4: Previous Navigation
- Click "Previous" button
- View goes back to previous week
- Cannot go before week containing today

### Test 5: Today Button
- Navigate to future week
- Click "Today" button
- Returns to week containing today

### Test 6: Expired Slots
- View week containing today
- Past time slots show as grey "Expired"
- Future slots show as green or red

### Test 7: Booking Flow
- Click available (green) slot
- Modal opens with date and time pre-filled
- Submit booking
- Slot turns red on refresh

## Browser Compatibility

### Desktop Browsers
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support

### Mobile Browsers
- iOS Safari: ✅ Touch navigation works
- Android Chrome: ✅ Touch navigation works
- Responsive: ✅ Adapts to screen size

## Configuration Summary

### What We Use
```javascript
initialView="timeGridWeek"  // Standard week view
initialDate={todayStr}      // Start from today
validRange={{               // Restrict navigation
  start: todayStr,
  end: endDateStr
}}
slotMinTime="09:00:00"      // 9 AM start
slotMaxTime="22:00:00"      // 9 PM end
eventOverlap={false}        // No overlapping
slotEventOverlap={false}    // No overlapping
height="auto"               // Responsive height
```

### What We DON'T Use
- ❌ `dayCount` - Not needed for week view
- ❌ `visibleRange` - validRange is sufficient
- ❌ `duration` - Week view handles this
- ❌ Custom view - Standard view works perfectly

## Implementation Complete

✅ Week view with clean layout
✅ Navigation with prev/next buttons
✅ Restricted to TODAY + 15 days
✅ Cannot navigate to past dates
✅ Cannot navigate beyond 15 days
✅ Booked slots in red
✅ Available slots in green
✅ Expired slots in grey
✅ 24-hour backend format
✅ 12-hour display format
✅ No duplicate events
✅ Responsive design
✅ No horizontal scrolling
✅ Professional appearance
✅ Easy to maintain
