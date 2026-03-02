import { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import API from '../services/api';

function BookingModal({ isOpen, onClose, onBookingSuccess, selectedDate, selectedTime }) {
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    duration: 30,
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '60 minutes (1 hour)' },
    { value: 90, label: '90 minutes (1.5 hours)' },
    { value: 120, label: '120 minutes (2 hours)' }
  ];

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Set default date to today or use selectedDate
  useEffect(() => {
    if (isOpen) {
      console.log('📝 BookingModal opened with:', { selectedDate, selectedTime });
      if (selectedDate && selectedTime) {
        // Pre-fill with selected date and time
        console.log('📝 Pre-filling form with selected data');
        console.log('📝 Selected date format:', selectedDate);
        console.log('📝 Selected time format:', selectedTime);
        setFormData(prev => ({ 
          ...prev, 
          date: selectedDate,
          start_time: selectedTime
        }));
      } else if (!formData.date) {
        // Set default date to today if no date is selected
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        console.log('📝 Setting default date to today:', dateStr);
        setFormData(prev => ({ ...prev, date: dateStr }));
      }
    }
  }, [isOpen, selectedDate, selectedTime]);

  const formatDateToReadable = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const formatTimeTo12Hour = (time24) => {
    if (!time24) return '--:-- --';
    const [hours, minutes] = time24.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' ? parseInt(value) : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Check if date is not in the past
      const selectedDate = new Date(formData.date + 'T00:00:00');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Cannot book slots for past dates';
      }
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    } else {
      // Validate business hours (9:00 AM to 9:00 PM)
      const [hours] = formData.start_time.split(':').map(Number);
      if (hours < 9 || hours >= 21) {
        newErrors.start_time = 'Time must be between 9:00 AM and 9:00 PM';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData = {
        date: formData.date,
        start_time: formData.start_time + ':00',
        duration_minutes: formData.duration,
        description: formData.description.trim() || null
      };

      console.log('📝 BookingModal - Submitting booking:', bookingData);
      console.log('📝 Raw form data:', formData);
      console.log('📝 API Base URL:', import.meta.env.VITE_API_URL);
      console.log('📝 Current token:', localStorage.getItem('token') ? 'Present' : 'Missing');
      console.log('📝 Full API URL:', import.meta.env.VITE_API_URL + '/bookings');
      
      // Validate the data before sending
      console.log('📝 Data validation:');
      console.log('📝 - Date format:', formData.date, 'Valid:', /^\d{4}-\d{2}-\d{2}$/.test(formData.date));
      console.log('📝 - Time format:', formData.start_time, 'Valid:', /^\d{2}:\d{2}$/.test(formData.start_time));
      console.log('📝 - Duration:', formData.duration, 'Type:', typeof formData.duration);
      console.log('📝 - Final start_time:', bookingData.start_time, 'Valid:', /^\d{2}:\d{2}:\d{2}$/.test(bookingData.start_time));

      const response = await API.post('/bookings', bookingData);
      
      console.log('✅ BookingModal - Booking created successfully:', response.data);
      console.log('✅ Response status:', response.status);
      console.log('✅ Response headers:', response.headers);
      
      toast.success('Booking request submitted successfully!', {
        duration: 4000,
        icon: '✅',
      });

      handleClose();
      
      // Call success callback to refresh data
      if (onBookingSuccess) {
        console.log('📝 Calling onBookingSuccess callback...');
        onBookingSuccess();
      }

    } catch (err) {
      console.error('❌ BookingModal - Booking error:', err);
      console.error('❌ Error response:', err.response);
      console.error('❌ Error status:', err.response?.status);
      console.error('❌ Error data:', err.response?.data);
      
      let errorMessage = "Error creating booking";
      
      if (err.response?.data?.detail) {
        console.error('❌ Validation errors:', err.response.data.detail);
        
        // Handle FastAPI validation errors (array of error objects)
        if (Array.isArray(err.response.data.detail)) {
          const validationErrors = err.response.data.detail.map(error => {
            if (typeof error === 'object' && error.msg) {
              return `${error.loc?.join(' → ') || 'Field'}: ${error.msg}`;
            }
            return String(error);
          });
          errorMessage = "Validation errors:\n" + validationErrors.join('\n');
        } else if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        }
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage, {
        duration: 6000,
        style: {
          maxWidth: '500px',
          whiteSpace: 'pre-line', // Allow line breaks
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      start_time: '',
      duration: 30,
      description: ''
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  // Get min date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get max date (15 days from today)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);
    return maxDate.toISOString().split('T')[0];
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Book a Time Slot</h3>
            <button
              onClick={handleClose}
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Business Hours Info */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center">
              <FiCalendar className="mr-2 flex-shrink-0" />
              Business Hours: 9:00 AM - 9:00 PM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date Field */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiCalendar className="mr-2 flex-shrink-0" />
                  Date <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  min={getMinDate()}
                  max={getMaxDate()}
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 font-medium cursor-pointer ${
                    errors.date
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.date}
                  </p>
                )}
              </div>

              {/* Start Time Field */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2 flex-shrink-0" />
                  Start Time <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleChange}
                  min="09:00"
                  max="21:00"
                  className={`w-full border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 font-medium cursor-pointer ${
                    errors.start_time
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.start_time && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                    {errors.start_time}
                  </p>
                )}
              </div>
            </div>

            {/* Duration Dropdown */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FiClock className="mr-2 flex-shrink-0" />
                Duration
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 font-medium cursor-pointer"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                <FiAlertTriangle className="mr-2 flex-shrink-0" />
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the purpose of your booking..."
                rows="4"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Optional: Add any additional details about your booking
              </p>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center">
                <FiAlertTriangle className="mr-2 flex-shrink-0" />
                Your booking will be pending until approved by an admin
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.date || !formData.start_time}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  'Book Time Slot'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default BookingModal;