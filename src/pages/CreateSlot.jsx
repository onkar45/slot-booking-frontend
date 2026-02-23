import { useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import toast, { Toaster } from 'react-hot-toast';

function CreateSlot() {
  const [formData, setFormData] = useState({
    date: "",
    start_time: "",
    end_time: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateDate = (date) => {
    if (!date) return 'Date is required';
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return 'Date cannot be in the past';
    return '';
  };

  const validateStartTime = (startTime) => {
    if (!startTime) return 'Start time is required';
    return '';
  };

  const validateEndTime = (endTime, startTime) => {
    if (!endTime) return 'End time is required';
    if (startTime && endTime <= startTime) {
      return 'End time must be after start time';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (touched[name]) {
      let error = '';
      if (name === 'date') error = validateDate(value);
      else if (name === 'start_time') error = validateStartTime(value);
      else if (name === 'end_time') error = validateEndTime(value, formData.start_time);
      
      setErrors({ ...errors, [name]: error });
    }

    // Also revalidate end_time when start_time changes
    if (name === 'start_time' && touched.end_time) {
      const endTimeError = validateEndTime(formData.end_time, value);
      setErrors({ ...errors, start_time: '', end_time: endTimeError });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    
    let error = '';
    if (field === 'date') error = validateDate(formData.date);
    else if (field === 'start_time') error = validateStartTime(formData.start_time);
    else if (field === 'end_time') error = validateEndTime(formData.end_time, formData.start_time);
    
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dateError = validateDate(formData.date);
    const startTimeError = validateStartTime(formData.start_time);
    const endTimeError = validateEndTime(formData.end_time, formData.start_time);

    if (dateError || startTimeError || endTimeError) {
      setErrors({
        date: dateError,
        start_time: startTimeError,
        end_time: endTimeError,
      });
      setTouched({ date: true, start_time: true, end_time: true });
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      await API.post("/slots", formData);
      toast.success("Slot created successfully!");
      setFormData({
        date: "",
        start_time: "",
        end_time: "",
      });
      setErrors({});
      setTouched({});
    } catch (err) {
      toast.error(err.response?.data?.detail || "Error creating slot");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" />
      <AdminNavbar />

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            Create New Slot
          </h2>
          <p className="text-gray-600">Add a new time slot for booking</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Date Field */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="text-2xl mr-2">📅</span>
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                onBlur={() => handleBlur('date')}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 ${
                  errors.date && touched.date
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.date && touched.date && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.date}
                </p>
              )}
            </div>

            {/* Start Time Field */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="text-2xl mr-2">🕐</span>
                Start Time
              </label>
              <input
                type="time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                onBlur={() => handleBlur('start_time')}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 ${
                  errors.start_time && touched.start_time
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.start_time && touched.start_time && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.start_time}
                </p>
              )}
            </div>

            {/* End Time Field */}
            <div>
              <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                <span className="text-2xl mr-2">🕐</span>
                End Time
              </label>
              <input
                type="time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                onBlur={() => handleBlur('end_time')}
                className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 ${
                  errors.end_time && touched.end_time
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
              />
              {errors.end_time && touched.end_time && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.end_time}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !formData.date || !formData.start_time || !formData.end_time}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Slot...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Slot
                </>
              )}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-800">Quick Tip</p>
                <p className="text-sm text-blue-700 mt-1">
                  Make sure the end time is after the start time. Slots will be available for users to book once created.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateSlot;