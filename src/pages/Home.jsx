import PublicNavbar from "../components/PublicNavbar";
import WeeklyCalendar from "../components/WeeklyCalendar";
import { FiCalendar, FiClock, FiCheckCircle, FiUsers, FiTrendingUp, FiShield } from 'react-icons/fi';

function Home() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">

          {/* Left Section */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8 lg:pt-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold shadow-sm">
              <FiTrendingUp className="mr-2" />
              Smart Booking Solution
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              Simplify Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2">
                Slot Booking
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
              Streamline your scheduling process with our intelligent booking platform. 
              Manage time slots, approve bookings, and organize schedules effortlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#calendar-section"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('calendar-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="group inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold text-lg transform hover:-translate-y-0.5"
              >
                Get Started
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </a>

              <a
                href="/about"
                className="inline-flex items-center justify-center border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl hover:bg-white hover:border-blue-300 hover:text-blue-600 transition-all duration-300 font-semibold text-lg shadow-sm hover:shadow-md"
              >
                Learn More
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">99%</div>
                <div className="text-sm text-gray-600 mt-1">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">24/7</div>
                <div className="text-sm text-gray-600 mt-1">Support</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Fast</div>
                <div className="text-sm text-gray-600 mt-1">Setup</div>
              </div>
            </div>
          </div>

          {/* Right Section - Weekly Calendar */}
          <div id="calendar-section" className="lg:col-span-3 relative scroll-mt-20">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 rounded-3xl opacity-20 blur-3xl"></div>
            <div className="relative bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-2xl border border-white/50">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Available Time Slots</h3>
                <p className="text-sm text-gray-600">View and select available booking slots for the next 15 days</p>
              </div>
              <div className="calendar-wrapper-large">
                <WeeklyCalendar />
              </div>
              <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-bold text-gray-800 flex items-center">
                    <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                    Legend:
                  </p>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-3 h-3 rounded-sm mr-1.5 shadow-sm" style={{ backgroundColor: '#22c55e' }}></div>
                      <span className="font-medium">Available</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-3 h-3 rounded-sm mr-1.5 shadow-sm" style={{ backgroundColor: '#eab308' }}></div>
                      <span className="font-medium">Reserved</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-3 h-3 rounded-sm mr-1.5 shadow-sm" style={{ backgroundColor: '#ef4444' }}></div>
                      <span className="font-medium">Booked</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-700">
                      <div className="w-3 h-3 rounded-sm mr-1.5 shadow-sm" style={{ backgroundColor: '#6b7280' }}></div>
                      <span className="font-medium">Inactive</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white/50 backdrop-blur-sm py-16 sm:py-24 border-y border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed to make booking management simple and efficient
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-8 bg-white rounded-2xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-blue-200 overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-md">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of users who trust our platform for their booking needs
          </p>
          <a
            href="/register"
            className="inline-flex items-center justify-center bg-white text-blue-600 px-10 py-5 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-2xl hover:shadow-3xl font-bold text-lg transform hover:-translate-y-1"
          >
            Create Free Account
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; 2026 Slot Booking System. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}

export default Home;
