import { useState } from 'react';
import PublicNavbar from "../components/PublicNavbar";
import CustomCalendar from "../components/CustomCalendar";
import PreLoginBookingModal from "../components/PreLoginBookingModal";
import toast, { Toaster } from 'react-hot-toast';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';

function Home() {
  const [showPreLoginModal, setShowPreLoginModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const handleOpenBookingModal = (date, time) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setShowPreLoginModal(true);
  };

  const handleCloseModal = () => {
    setShowPreLoginModal(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const features = [
    {
      icon: <FiCalendar className="w-8 h-8" />,
      title: "Easy Scheduling",
      description: "Intuitive calendar interface for seamless slot management"
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Real-time Updates",
      description: "Instant booking confirmations and status notifications"
    },
    {
      icon: <FiCheckCircle className="w-8 h-8" />,
      title: "Smart Approval",
      description: "Admin-controlled booking approval system"
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "User Management",
      description: "Comprehensive user and booking tracking"
    },
    {
      icon: <FiTrendingUp className="w-8 h-8" />,
      title: "Analytics",
      description: "Track bookings and optimize your schedule"
    },
    {
      icon: <FiShield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Enterprise-grade security for your data"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-slate-50 to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Toaster position="top-right" />
      <PublicNavbar />

      {/* Hero Section */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">

          {/* Left Section - No Card, Just Content */}
          <div className="lg:col-span-3 flex flex-col justify-between p-8 ml-8">
            <div className="space-y-6">
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-semibold shadow-sm border border-blue-200 dark:border-blue-800">
                <FiTrendingUp className="mr-1.5 w-3.5 h-3.5" />
                Smart Booking Solution
              </div>

              <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight mb-2">
                  Simplify Your
                </h1>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 dark:text-blue-400 leading-tight">
                  Slot Booking
                </h1>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Streamline your scheduling process with our intelligent booking platform. 
                Manage time slots, approve bookings, and organize schedules effortlessly.
              </p>

              <div className="flex flex-col gap-3 pt-2">
                <a
                  href="#calendar-section"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className="group inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-all duration-200 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Get Started
                  <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>

                <a
                  href="/about"
                  className="inline-flex items-center justify-center border-2 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-6 py-3 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-500 transition-all duration-200 font-semibold text-sm shadow-sm"
                >
                  Learn More
                </a>
              </div>
            </div>

            {/* Stats - Bottom aligned */}
            <div className="grid grid-cols-3 gap-6 pt-8 mt-6 border-t border-gray-300 dark:border-gray-700">
              <div className="text-center">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">99%</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">24/7</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">Fast</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">Setup</div>
              </div>
            </div>
          </div>

          {/* Right Section - Calendar - Increased width */}
          <div id="calendar-section" className="lg:col-span-9 scroll-mt-16 mr-8">
            <CustomCalendar onOpenBookingModal={handleOpenBookingModal} />
          </div>

        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 py-20 sm:py-28 border-y border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to make booking management simple and efficient
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-700 overflow-hidden transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full -mr-20 -mt-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 drop-shadow-lg">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-50 mb-12 max-w-2xl mx-auto drop-shadow">
            Contact your administrator to get access to our booking platform
          </p>
          <a
            href="/login"
            className="inline-flex items-center justify-center bg-white text-blue-600 px-10 py-5 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl font-bold text-lg transform hover:-translate-y-1 hover:scale-105"
          >
            Go to Login
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2026 Slot Booking System. All rights reserved.</p>
        </div>
      </footer>

      {/* Pre-Login Booking Modal */}
      <PreLoginBookingModal
        isOpen={showPreLoginModal}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

    </div>
  );
}

export default Home;
