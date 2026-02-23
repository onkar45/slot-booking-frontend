import { useEffect, useState } from "react";
import API from "../services/api";
import { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await API.get("/bookings/my-bookings");
      setBookings(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <Navbar />

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 sm:mb-8">
          My Bookings
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8 text-center border border-gray-100 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">No bookings found.</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">Book a slot to see it here!</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">📅</span>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-base sm:text-lg">
                          {booking.slot?.date || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Date</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">⏰</span>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                          {booking.slot?.start_time || 'N/A'} - {booking.slot?.end_time || 'N/A'}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Time Slot</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                      <span className="text-lg sm:text-xl">📝</span>
                      <div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Booked on: {new Date(booking.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold self-start ${getStatusStyle(
                      booking.status
                    )}`}
                  >
                    {booking.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyBookings;