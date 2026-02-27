import PublicNavbar from "../components/PublicNavbar";
import { FiCheckCircle, FiCode, FiDatabase, FiUsers, FiTrendingUp, FiShield, FiClock } from 'react-icons/fi';

function About() {
  const technologies = [
    { name: "React", description: "Modern UI framework" },
    { name: "FastAPI", description: "High-performance backend" },
    { name: "MySQL", description: "Reliable database" },
    { name: "Tailwind CSS", description: "Utility-first styling" }
  ];

  const features = [
    "Admin-controlled slot management",
    "Real-time booking system",
    "User authentication & authorization",
    "Responsive design for all devices",
    "Dark mode support",
    "Booking approval workflow"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <PublicNavbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        {/* Header Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 mb-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-6">
              <FiTrendingUp className="mr-2 w-4 h-4" />
              About Our Platform
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight">
              Smart Booking
              <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Platform
              </span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto rounded-full"></div>
          </div>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6 font-medium">
            This Slot Booking System is a full-stack web application 
            built using modern technologies. It provides a comprehensive 
            solution for managing time slots, allowing administrators to 
            create and manage availability while users can book slots and 
            track their booking status in real-time.
          </p>

          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed font-medium">
            The system features a clean, intuitive interface with role-based 
            access control, ensuring that administrators have full control 
            over slot management while users enjoy a seamless booking experience.
          </p>
        </div>

        {/* Features Section */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 sm:p-12 mb-8 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500/10 to-emerald-600/10 text-green-600 dark:text-green-400 rounded-full text-sm font-semibold shadow-lg border border-green-200/50 dark:border-green-800/50 backdrop-blur-sm mb-6">
              <FiCheckCircle className="mr-2 w-4 h-4" />
              Platform Features
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
              Everything You Need
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Powerful features designed for modern scheduling needs
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group relative p-6 bg-gradient-to-br from-gray-50/80 to-white/80 dark:from-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl hover:from-blue-50/80 hover:to-indigo-50/80 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-200/50 dark:hover:border-blue-700/50 hover:shadow-xl transform hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full -mr-10 -mt-10 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl"></div>
                <div className="relative z-10 flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiCheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">{feature}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles Section */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 rounded-3xl shadow-2xl p-8 sm:p-12 text-white overflow-hidden">
          {/* Animated background patterns */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20 animate-pulse"></div>
          
          {/* Floating elements */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-bounce delay-1000"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-bounce delay-500"></div>
          
          <div className="relative z-10">
            <div className="mb-8">
              <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full text-lg font-bold shadow-2xl border border-white/30 mb-6">
                <FiUsers className="mr-3 w-6 h-6" />
                User Access Levels
              </div>
              <h2 className="text-4xl font-black mb-4">
                Role-Based Access Control
              </h2>
              <p className="text-blue-50 text-xl leading-relaxed font-medium">
                Designed with security and usability in mind for different user types
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <FiShield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-6 group-hover:text-yellow-200 transition-colors duration-300">Administrator</h3>
                  <ul className="space-y-4 text-blue-100">
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Create and manage time slots</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Approve or reject booking requests</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">View all bookings and user activity</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Activate/deactivate slots</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="group relative bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-2xl">
                    <FiUsers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-6 group-hover:text-yellow-200 transition-colors duration-300">User</h3>
                  <ul className="space-y-4 text-blue-100">
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Browse available time slots</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Book slots instantly</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">Track booking status</span>
                    </li>
                    <li className="flex items-start group-hover:text-white transition-colors duration-300">
                      <FiCheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="font-medium">View booking history</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-90">
              <div className="flex items-center text-white/90 text-lg font-semibold">
                <FiShield className="mr-2 w-6 h-6" />
                Enterprise Security
              </div>
              <div className="flex items-center text-white/90 text-lg font-semibold">
                <FiCheckCircle className="mr-2 w-6 h-6" />
                99.9% Uptime
              </div>
              <div className="flex items-center text-white/90 text-lg font-semibold">
                <FiClock className="mr-2 w-6 h-6" />
                24/7 Support
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;