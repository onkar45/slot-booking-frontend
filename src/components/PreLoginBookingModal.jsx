import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCalendar, FiClock, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';

function PreLoginBookingModal({ isOpen, onClose, selectedDate, selectedTime }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: selectedDate || '',
    start_time: selectedTime || '',
    duration: 30,
    description: ''
  });
  const [errors, setErrors] = useState({});

  const durationOptions = [
    { value: 30, label: '30 minutes' },
    { value: 60, label: '60 minutes (1 hour)' },
    { value: 90, label: '90 minutes (1.5 hours)' },
    { value: 120, label: '120 minutes (2 hours)' }
  ];

  useEffect(() => {
    if (selectedDate && selectedTime) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        start_time: selectedTime
      }));
    }
  }, [selectedDate, selectedTime]);

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
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Minimum 10 characters required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Save booking data to localStorage
    localStorage.setItem('pendingBooking', JSON.stringify({
      date: formData.date,
      startTime: formData.start_time,
      duration: formData.duration,
      description: formData.description.trim()
    }));

    toast.success('Please login to complete your booking', {
      duration: 3000,
      icon: <FiCalendar />
    });

    // Redirect to login after a short delay
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  const handleClose = () => {
    setFormData({
      date: '',
      start_time: '',
      duration: 30,
      description: ''
    });
    setErrors({});
    onClose();
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
              {/* Date Field (Readonly) */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiCalendar className="mr-2 flex-shrink-0" />
                  Date
                </label>
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
                  {formatDateToReadable(formData.date) || 'Select a date'}
                </div>
              </div>

              {/* Start Time Field (Readonly) */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2 flex-shrink-0" />
                  Start Time
                </label>
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
                  {formatTimeTo12Hour(formData.start_time)}
                </div>
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
                Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the purpose of your booking..."
                rows="4"
                className={`w-full border rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 resize-none ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-sm mt-2 flex items-center">
                  <FiAlertTriangle className="w-4 h-4 mr-1 flex-shrink-0" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Minimum 10 characters required
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Continue to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PreLoginBookingModal;
