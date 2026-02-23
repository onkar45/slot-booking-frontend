import { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import Navbar from "../components/Navbar";

function UserDashboard() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await API.get("/slots/available");
      // Filter out past slots on the frontend
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const futureSlots = res.data.filter(slot => {
        const slotDate = new Date(slot.date);
        return slotDate >= today;
      });
      
      setSlots(futureSlots);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slotId) => {
    try {
      await API.post("/bookings", { slot_id: slotId });
      toast.success("Booking request sent successfully!");
      fetchSlots();
    } catch (err) {
      console.error('Book slot error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || "Error booking slot";
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
      <Toaster position="top-right" />
      <Navbar />

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-700 dark:text-gray-200 mb-6 sm:mb-8">
          Available Slots
        </h2>

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading slots...</p>
        ) : slots.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">No slots available.</p>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 border border-gray-100 dark:border-gray-700"
              >
                <div className="space-y-2 mb-4 sm:mb-5">
                  <p className="text-base sm:text-lg font-semibold text-gray-800 dark:text-gray-200">
                    📅 {slot.date}
                  </p>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                    ⏰ {slot.start_time} - {slot.end_time}
                  </p>
                </div>

                <button
                  onClick={() => bookSlot(slot.id)}
                  className="w-full bg-blue-600 text-white py-2 sm:py-2.5 rounded-lg font-medium hover:bg-blue-700 transition duration-200 text-sm sm:text-base"
                >
                  Book Slot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;