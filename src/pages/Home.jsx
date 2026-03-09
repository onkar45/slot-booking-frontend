import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from "../components/PublicNavbar";
import CustomCalendar from "../components/CustomCalendar";
import PreLoginBookingModal from "../components/PreLoginBookingModal";
import BookingModal from "../components/BookingModal";
import toast, { Toaster } from 'react-hot-toast';
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';

function Home() {
  const [showPreLoginModal, setShowPreLoginModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('token');

  const handleOpenBookingModal = (date, time) => {
    console.log('🏠 Home page - Opening booking modal:', { date, time, isLoggedIn });
    setSelectedDate(date);
    setSelectedTime(time);
    
    if (isLoggedIn) {
      console.log('🏠 User is logged in, opening BookingModal');
      setShowBookingModal(true);
    } else {
      console.log('🏠 User not logged in, opening PreLoginBookingModal');
      setShowPreLoginModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowPreLoginModal(false);
    setShowBookingModal(false);
    setSelectedDate(null);
    setSelectedTime(null);
  };

  const handleBookingSuccess = () => {
    console.log('🏠 Booking successful from home page');
    toast.success(
      (t) => (
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Booking created successfully!</span>
          <span className="text-sm text-gray-600">Your booking is pending approval.</span>
          <button
            onClick={() => {
              toast.dismiss(t.id);
              navigate('/user-dashboard');
            }}
            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Dashboard
          </button>
        </div>
      ),
      {
        duration: 6000,
        icon: '✅',
        style: {
          maxWidth: '400px',
        },
      }
    );
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <Toaster position="top-right" />
      <PublicNavbar />

      {/* Calendar Section - Clean and Centered */}
      <div className="relative w-full max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 pt-4 lg:pt-8 pb-8 lg:pb-16">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl lg:rounded-3xl p-3 sm:p-4 lg:p-8 shadow-2xl border border-white/30 dark:border-gray-700/30 hover:shadow-3xl transition-all duration-300">
          <CustomCalendar onOpenBookingModal={handleOpenBookingModal} />
        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative bg-gradient-to-b from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 py-12 lg:py-32 border-y border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 lg:mb-20">
            <div className="inline-flex items-center px-3 py-1.5 lg:px-4 lg:py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-xs lg:text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-3 lg:mb-6">
              <FiCheckCircle className="mr-1.5 lg:mr-2 w-3 h-3 lg:w-4 lg:h-4" />
              Powerful Features
            </div>
            <h2 className="text-2xl lg:text-5xl font-black text-gray-900 dark:text-white mb-3 lg:mb-6">
              Everything You Need
            </h2>
            <p className="text-sm lg:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              Powerful features for simple, efficient booking management
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-4 lg:p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20 hover:border-blue-200/50 dark:hover:border-blue-700/50 overflow-hidden transform hover:-translate-y-2 hover:scale-105"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl lg:rounded-3xl"></div>
                
                {/* Floating orb effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl group-hover:animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 lg:w-20 lg:h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-600 text-white rounded-xl lg:rounded-2xl flex items-center justify-center mb-3 lg:mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl group-hover:shadow-3xl">
                    <div className="scale-75 lg:scale-100">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="text-base lg:text-2xl font-black text-gray-900 dark:text-white mb-2 lg:mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-xs lg:text-lg text-gray-600 dark:text-gray-400 leading-relaxed group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-2xl lg:rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-600 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
        </div>
      </div>



      {/* Enhanced Footer */}
      <footer className="relative bg-gray-900 text-gray-400 py-8 lg:py-16 border-t border-gray-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8 mb-8 lg:mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-4 lg:mb-6">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                  <FiCalendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <h3 className="text-xl lg:text-2xl font-black text-white">Slot Booking</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-lg mb-4 lg:mb-6 max-w-md">
                The most advanced booking platform designed for modern businesses. 
                Streamline your scheduling with intelligent automation.
              </p>
              <div className="flex space-x-3 lg:space-x-4">
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiUsers className="w-4 h-4 lg:w-5 lg:h-5 group-hover:text-white" />
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiTrendingUp className="w-4 h-4 lg:w-5 lg:h-5 group-hover:text-white" />
                </div>
                <div className="w-9 h-9 lg:w-10 lg:h-10 bg-gray-800 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiShield className="w-4 h-4 lg:w-5 lg:h-5 group-hover:text-white" />
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-base lg:text-lg mb-3 lg:mb-6">Quick Links</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li><a href="/login" className="hover:text-blue-400 transition-colors duration-300 text-sm lg:text-lg">Login</a></li>
                <li><a href="/about" className="hover:text-blue-400 transition-colors duration-300 text-sm lg:text-lg">About</a></li>
                <li><a href="#calendar-section" className="hover:text-blue-400 transition-colors duration-300 text-sm lg:text-lg">Book Now</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-base lg:text-lg mb-3 lg:mb-6">Support</h4>
              <ul className="space-y-2 lg:space-y-3">
                <li className="flex items-center text-sm lg:text-lg">
                  <FiClock className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-blue-400" />
                  24/7 Available
                </li>
                <li className="flex items-center text-sm lg:text-lg">
                  <FiShield className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-green-400" />
                  Secure Platform
                </li>
                <li className="flex items-center text-sm lg:text-lg">
                  <FiCheckCircle className="w-4 h-4 lg:w-5 lg:h-5 mr-2 text-purple-400" />
                  99.9% Uptime
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="border-t border-gray-800 pt-6 lg:pt-8 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-sm lg:text-lg text-gray-500 text-center md:text-left">
              &copy; 2026 Slot Booking System. All rights reserved.
            </p>
            <div className="flex items-center space-x-3 lg:space-x-6 text-sm lg:text-lg">
              <span className="text-gray-500">Made with</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-gray-400">for better scheduling</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Pre-Login Booking Modal */}
      <PreLoginBookingModal
        isOpen={showPreLoginModal}
        onClose={handleCloseModal}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      {/* Logged-in User Booking Modal */}
      {isLoggedIn && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={handleCloseModal}
          onBookingSuccess={handleBookingSuccess}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
        />
      )}

    </div>
  );
}

export default Home;
