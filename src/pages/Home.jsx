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

      {/* Hero Section */}
      <div className="relative max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="grid lg:grid-cols-12 gap-12 items-stretch">

          {/* Left Section - Enhanced with glassmorphism */}
          <div className="lg:col-span-4 flex flex-col justify-between">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col justify-between">
              <div className="space-y-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                  <FiTrendingUp className="mr-2 w-4 h-4" />
                  Smart Booking Solution
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white leading-tight">
                    Simplify Your
                  </h1>
                  <h1 className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent leading-tight">
                    Slot Booking
                  </h1>
                </div>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                  Experience the future of scheduling with our intelligent booking platform. 
                  Seamlessly manage time slots, streamline approvals, and organize schedules with unprecedented ease.
                </p>

                <div className="flex flex-col gap-4 pt-4">
                  <a
                    href="#calendar-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                    className="group relative inline-flex items-center justify-center bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 text-white px-8 py-4 rounded-2xl transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <span className="relative z-10">Get Started</span>
                    <svg className="relative z-10 ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>

                  <a
                    href="/about"
                    className="group inline-flex items-center justify-center border-2 border-gray-200/50 dark:border-gray-600/50 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm px-8 py-4 rounded-2xl hover:bg-white/80 dark:hover:bg-gray-700/80 hover:border-gray-300/80 dark:hover:border-gray-500/80 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Learn More
                    <FiShield className="ml-2 w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  </a>
                </div>
              </div>

              {/* Enhanced Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-gradient-to-r from-gray-200/50 to-gray-300/50 dark:from-gray-600/50 dark:to-gray-700/50">
                <div className="text-center group">
                  <div className="text-4xl font-black bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">99%</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-semibold">Uptime</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black bg-gradient-to-r from-blue-500 to-cyan-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">24/7</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-semibold">Support</div>
                </div>
                <div className="text-center group">
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">Fast</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-semibold">Setup</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Enhanced Calendar Container */}
          <div id="calendar-section" className="lg:col-span-8 scroll-mt-16">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 h-full flex flex-col">
              <div className="flex-1">
                <CustomCalendar onOpenBookingModal={handleOpenBookingModal} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced Features Section */}
      <div className="relative bg-gradient-to-b from-white/50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-900/50 py-24 sm:py-32 border-y border-white/20 dark:border-gray-700/20 backdrop-blur-sm">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-br from-cyan-400/10 to-blue-600/10 rounded-full blur-2xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-6">
              <FiCheckCircle className="mr-2 w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Discover powerful features designed to make booking management simple, efficient, and delightful
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/20 dark:border-gray-700/20 hover:border-blue-200/50 dark:hover:border-blue-700/50 overflow-hidden transform hover:-translate-y-2 hover:scale-105"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-3xl"></div>
                
                {/* Floating orb effect */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-all duration-700 blur-xl group-hover:animate-pulse"></div>
                
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-purple-600 to-cyan-600 text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-2xl group-hover:shadow-3xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>

                {/* Hover border effect */}
                <div className="absolute inset-0 rounded-3xl border-2 border-transparent group-hover:border-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-600 transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 py-24 sm:py-32 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-bounce delay-1000"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce delay-500"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-bounce delay-2000"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold shadow-2xl border border-white/30 mb-8">
            <FiUsers className="mr-3 w-6 h-6" />
            Join Thousands of Happy Users
          </div>
          
          <h2 className="text-5xl sm:text-6xl font-black text-white mb-8 drop-shadow-2xl leading-tight">
            Ready to Get Started?
          </h2>
          <p className="text-2xl text-blue-50 mb-16 max-w-3xl mx-auto drop-shadow-lg leading-relaxed font-medium">
            Transform your scheduling experience with our cutting-edge booking platform. 
            Contact your administrator to unlock the full potential.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <a
              href="/login"
              className="group relative inline-flex items-center justify-center bg-white text-blue-600 px-12 py-6 rounded-2xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl font-black text-xl transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              <span className="relative z-10">Go to Login</span>
              <svg className="relative z-10 ml-3 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            
            <a
              href="/about"
              className="group inline-flex items-center justify-center border-2 border-white/50 text-white bg-white/10 backdrop-blur-sm px-12 py-6 rounded-2xl hover:bg-white/20 hover:border-white/80 transition-all duration-300 font-black text-xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              Learn More
              <FiShield className="ml-3 w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            </a>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-80">
            <div className="flex items-center text-white/80 text-lg font-semibold">
              <FiShield className="mr-2 w-6 h-6" />
              Enterprise Security
            </div>
            <div className="flex items-center text-white/80 text-lg font-semibold">
              <FiCheckCircle className="mr-2 w-6 h-6" />
              99.9% Uptime
            </div>
            <div className="flex items-center text-white/80 text-lg font-semibold">
              <FiClock className="mr-2 w-6 h-6" />
              24/7 Support
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="relative bg-gray-900 text-gray-400 py-16 border-t border-gray-800 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900"></div>
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            {/* Brand Section */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <FiCalendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white">Slot Booking</h3>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-6 max-w-md">
                The most advanced booking platform designed for modern businesses. 
                Streamline your scheduling with intelligent automation.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiUsers className="w-5 h-5 group-hover:text-white" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-purple-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiTrendingUp className="w-5 h-5 group-hover:text-white" />
                </div>
                <div className="w-10 h-10 bg-gray-800 hover:bg-cyan-600 rounded-lg flex items-center justify-center transition-colors duration-300 cursor-pointer group">
                  <FiShield className="w-5 h-5 group-hover:text-white" />
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="/login" className="hover:text-blue-400 transition-colors duration-300 text-lg">Login</a></li>
                <li><a href="/about" className="hover:text-blue-400 transition-colors duration-300 text-lg">About</a></li>
                <li><a href="#calendar-section" className="hover:text-blue-400 transition-colors duration-300 text-lg">Book Now</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6">Support</h4>
              <ul className="space-y-3">
                <li className="flex items-center text-lg">
                  <FiClock className="w-5 h-5 mr-2 text-blue-400" />
                  24/7 Available
                </li>
                <li className="flex items-center text-lg">
                  <FiShield className="w-5 h-5 mr-2 text-green-400" />
                  Secure Platform
                </li>
                <li className="flex items-center text-lg">
                  <FiCheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                  99.9% Uptime
                </li>
              </ul>
            </div>
          </div>
          
          {/* Bottom section */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-lg text-gray-500 mb-4 md:mb-0">
              &copy; 2026 Slot Booking System. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 text-lg">
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
