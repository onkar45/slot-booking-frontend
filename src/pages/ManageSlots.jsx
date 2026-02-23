import { useEffect, useState } from "react";
import API from "../services/api";
import AdminNavbar from "../components/AdminNavbar";
import toast, { Toaster } from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiCheckCircle, FiXCircle, FiAlertTriangle, FiCalendar, FiClock, FiPlus } from 'react-icons/fi';

function ManageSlots() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });
  const [createFormData, setCreateFormData] = useState({
    date: '',
    start_time: '',
    end_time: ''
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [createErrors, setCreateErrors] = useState({});
  const [createTouched, setCreateTouched] = useState({});

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await API.get("/slots");
      setSlots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isPastSlot = (slotDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const slot = new Date(slotDate);
    return slot < today;
  };

  const deactivateSlot = async (id) => {
    try {
      await API.put(`/slots/${id}/deactivate`);
      toast.success("Slot deactivated successfully!");
      fetchSlots();
      setShowConfirmModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Deactivate slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error deactivating slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const handleDeactivateClick = (slot) => {
    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const handleCancelDeactivate = () => {
    setShowConfirmModal(false);
    setSelectedSlot(null);
  };

  const activateSlot = async (id) => {
    try {
      await API.put(`/slots/${id}/activate`);
      toast.success("Slot activated successfully!");
      fetchSlots();
    } catch (err) {
      console.error('Activate slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error activating slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const handleEditClick = (slot) => {
    setSelectedSlot(slot);
    setEditFormData({
      date: slot.date,
      start_time: slot.start_time,
      end_time: slot.end_time
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/slots/${selectedSlot.id}`, editFormData);
      toast.success("Slot updated successfully!");
      fetchSlots();
      setShowEditModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Edit slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error updating slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const handleDeleteClick = (slot) => {
    setSelectedSlot(slot);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/slots/${selectedSlot.id}`);
      toast.success("Slot deleted successfully!");
      fetchSlots();
      setShowDeleteModal(false);
      setSelectedSlot(null);
    } catch (err) {
      console.error('Delete slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error deleting slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  // Create Slot Functions
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

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData({
      ...createFormData,
      [name]: value,
    });

    if (createTouched[name]) {
      let error = '';
      if (name === 'date') error = validateDate(value);
      else if (name === 'start_time') error = validateStartTime(value);
      else if (name === 'end_time') error = validateEndTime(value, createFormData.start_time);
      
      setCreateErrors({ ...createErrors, [name]: error });
    }

    if (name === 'start_time' && createTouched.end_time) {
      const endTimeError = validateEndTime(createFormData.end_time, value);
      setCreateErrors({ ...createErrors, start_time: '', end_time: endTimeError });
    }
  };

  const handleCreateBlur = (field) => {
    setCreateTouched({ ...createTouched, [field]: true });
    
    let error = '';
    if (field === 'date') error = validateDate(createFormData.date);
    else if (field === 'start_time') error = validateStartTime(createFormData.start_time);
    else if (field === 'end_time') error = validateEndTime(createFormData.end_time, createFormData.start_time);
    
    setCreateErrors({ ...createErrors, [field]: error });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    const dateError = validateDate(createFormData.date);
    const startTimeError = validateStartTime(createFormData.start_time);
    const endTimeError = validateEndTime(createFormData.end_time, createFormData.start_time);

    if (dateError || startTimeError || endTimeError) {
      setCreateErrors({
        date: dateError,
        start_time: startTimeError,
        end_time: endTimeError,
      });
      setCreateTouched({ date: true, start_time: true, end_time: true });
      toast.error('Please fix the validation errors');
      return;
    }

    setCreateLoading(true);

    try {
      await API.post("/slots", createFormData);
      toast.success("Slot created successfully!");
      setCreateFormData({
        date: "",
        start_time: "",
        end_time: "",
      });
      setCreateErrors({});
      setCreateTouched({});
      setShowCreateModal(false);
      fetchSlots();
    } catch (err) {
      console.error('Create slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error creating slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setCreateFormData({
      date: "",
      start_time: "",
      end_time: "",
    });
    setCreateErrors({});
    setCreateTouched({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <AdminNavbar />

      {/* Create Slot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create New Slot</h3>
              <button
                onClick={handleCreateModalClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiCalendar className="mr-2" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={createFormData.date}
                  onChange={handleCreateChange}
                  onBlur={() => handleCreateBlur('date')}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 ${
                    createErrors.date && createTouched.date
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {createErrors.date && createTouched.date && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {createErrors.date}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2" />
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={createFormData.start_time}
                  onChange={handleCreateChange}
                  onBlur={() => handleCreateBlur('start_time')}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 ${
                    createErrors.start_time && createTouched.start_time
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {createErrors.start_time && createTouched.start_time && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {createErrors.start_time}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiClock className="mr-2" />
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={createFormData.end_time}
                  onChange={handleCreateChange}
                  onBlur={() => handleCreateBlur('end_time')}
                  className={`w-full border rounded-lg px-4 py-2.5 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600 ${
                    createErrors.end_time && createTouched.end_time
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                />
                {createErrors.end_time && createTouched.end_time && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {createErrors.end_time}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCreateModalClose}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !createFormData.date || !createFormData.start_time || !createFormData.end_time}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {createLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create Slot'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Edit Slot</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={editFormData.date}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Time
                </label>
                <input
                  type="time"
                  name="start_time"
                  value={editFormData.start_time}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Time
                </label>
                <input
                  type="time"
                  name="end_time"
                  value={editFormData.end_time}
                  onChange={handleEditChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
              <FiTrash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Delete Slot?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to delete this slot? This action cannot be undone.
            </p>

            {selectedSlot && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">📅</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{selectedSlot.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-2">⏰</span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 dark:bg-gray-900/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-orange-900/30 rounded-full mb-4">
              <FiAlertTriangle className="w-6 h-6 text-red-600 dark:text-orange-400" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Deactivate Slot?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to deactivate this slot? This action will make it unavailable for booking.
            </p>

            {selectedSlot && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">📅</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{selectedSlot.date}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xl mr-2">⏰</span>
                    <span className="text-gray-600 dark:text-gray-400">{selectedSlot.start_time} - {selectedSlot.end_time}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCancelDeactivate}
                className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => deactivateSlot(selectedSlot.id)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors duration-200 shadow-lg hover:shadow-xl"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Manage Slots
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">View and manage all time slots</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            <FiPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Create Slot
          </button>
        </div>

        {/* Stats Cards */}
        {!loading && slots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Slots</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{slots.length}</p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FiCalendar className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Active Slots</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {slots.filter(slot => slot.is_active).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 sm:col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Inactive Slots</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {slots.filter(slot => !slot.is_active).length}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <FiXCircle className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">Loading slots...</p>
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <div className="text-6xl mb-4">📅</div>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">No slots created yet.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Create your first slot to get started!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Time Slot
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {slots.map((slot) => {
                    const isPast = isPastSlot(slot.date);
                    return (
                      <tr key={slot.id} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${isPast ? 'opacity-60' : ''}`}>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg sm:text-2xl mr-2 sm:mr-3">📅</span>
                            <div>
                              <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-gray-100">
                                {slot.date}
                              </span>
                              {isPast && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  Past
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg sm:text-2xl mr-2 sm:mr-3">⏰</span>
                            <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                              {slot.start_time} - {slot.end_time}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {slot.is_active ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                              Inactive
                            </span>
                          )}
                        </td>

                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          {isPast ? (
                            <span className="text-xs sm:text-sm text-gray-400 dark:text-gray-500 italic">No actions available</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditClick(slot)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                                title="Edit slot"
                              >
                                <FiEdit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>

                              {slot.is_active ? (
                                <button
                                  onClick={() => handleDeactivateClick(slot)}
                                  className="group relative inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                                  title="Deactivate slot"
                                >
                                  <FiXCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => activateSlot(slot.id)}
                                  className="group relative inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-full hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                                  title="Activate slot"
                                >
                                  <FiCheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteClick(slot)}
                                className="group relative inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                                title="Delete slot"
                              >
                                <FiTrash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageSlots;