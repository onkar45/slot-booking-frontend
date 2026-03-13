import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiCalendar, FiClock, FiAlertTriangle, FiBriefcase, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import toast from 'react-hot-toast';

function PreLoginBookingModal({ isOpen, onClose, selectedDate, selectedTime }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: selectedDate || '',
    start_time: selectedTime || '',
    duration: 30,
    companyName: '',
    hrName: '',
    mobileNumber: '',
    emailId: '',
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

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.hrName.trim()) {
      newErrors.hrName = 'HR name is required';
    }

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email ID is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId.trim())) {
      newErrors.emailId = 'Please enter a valid email address';
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
      companyName: formData.companyName.trim(),
      hrName: formData.hrName.trim(),
      mobileNumber: formData.mobileNumber.trim(),
      emailId: formData.emailId.trim(),
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
      companyName: '',
      hrName: '',
      mobileNumber: '',
      emailId: '',
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
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4 lg:mb-6">
            <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100">Book a Time Slot</h3>
            <button
              onClick={handleClose}
              type="button"
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          {/* Business Hours Info */}
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-xs lg:text-sm text-blue-800 dark:text-blue-200 font-medium flex items-center">
              <FiCalendar className="mr-2 flex-shrink-0 w-4 h-4" />
              Business Hours: 9:00 AM - 9:00 PM
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Field (Readonly) */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiCalendar className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Date
                </label>
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {formatDateToReadable(formData.date) || 'Select a date'}
                </div>
              </div>

              {/* Start Time Field (Readonly) */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiClock className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Start Time
                </label>
                <div className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300 font-medium">
                  {formatTimeTo12Hour(formData.start_time)}
                </div>
              </div>
            </div>

            {/* Duration Dropdown */}
            <div>
              <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <FiClock className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Duration
              </label>
              <select
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 font-medium cursor-pointer"
              >
                {durationOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* New Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company Name */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiBriefcase className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Company Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Enter company name"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 ${
                    errors.companyName
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.companyName && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
                    <FiAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {errors.companyName}
                  </p>
                )}
              </div>

              {/* HR Name */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiUser className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  HR Name <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  name="hrName"
                  value={formData.hrName}
                  onChange={handleChange}
                  placeholder="Enter HR name"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 ${
                    errors.hrName
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.hrName && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
                    <FiAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {errors.hrName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Mobile Number */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiPhone className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Mobile Number <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  maxLength="10"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 ${
                    errors.mobileNumber
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
                    <FiAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {errors.mobileNumber}
                  </p>
                )}
              </div>

              {/* Email ID */}
              <div>
                <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  <FiMail className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                  Email ID <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="email"
                  name="emailId"
                  value={formData.emailId}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 ${
                    errors.emailId
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
                {errors.emailId && (
                  <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
                    <FiAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                    {errors.emailId}
                  </p>
                )}
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="flex items-center text-xs lg:text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                <FiAlertTriangle className="mr-1.5 flex-shrink-0 w-3.5 h-3.5 lg:w-4 lg:h-4" />
                Description <span className="text-red-500 ml-1">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Please describe the purpose of your booking..."
                rows="3"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:ring-2 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 resize-none ${
                  errors.description
                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {errors.description && (
                <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center">
                  <FiAlertTriangle className="w-3 h-3 mr-1 flex-shrink-0" />
                  {errors.description}
                </p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Minimum 10 characters required
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2.5 text-sm lg:text-base border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2.5 text-sm lg:text-base bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
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
