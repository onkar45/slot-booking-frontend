import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';
import API from '../services/api';

function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get('/bookings');
      setBookings(res.data);
      console.log(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/approve`);
      toast.success('Booking approved successfully!');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error approving booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/reject`);
      toast.success('Booking rejected successfully!');
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error rejecting booking');
    }
  };

  const getStatusStyle = (status) => {
    if (status === "approved")
      return "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300";
    if (status === "rejected")
      return "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300";
    return "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300";
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      <Toaster position="top-right" />
      <AdminNavbar />
      
      <div className="container mx-auto p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-gray-200">All Bookings</h2>
        
        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sm:p-8 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-base sm:text-lg">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">User</p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                          {booking.user?.name || booking.user?.email || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          📅 {booking.slot?.date || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time Slot</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          ⏰ {booking.slot?.start_time || 'N/A'} - {booking.slot?.end_time || 'N/A'}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Booked On</p>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    <span
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold ${getStatusStyle(
                        booking.status
                      )}`}
                    >
                      {booking.status.toUpperCase()}
                    </span>

                    {booking.status === 'pending' && (
                      <div className="flex gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 sm:flex-none bg-green-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 font-medium text-xs sm:text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="flex-1 sm:flex-none bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium text-xs sm:text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
