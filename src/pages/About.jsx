import PublicNavbar from "../components/PublicNavbar";
import { FiCheckCircle, FiCode, FiDatabase, FiUsers } from 'react-icons/fi';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PublicNavbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              About Our Project
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto rounded-full"></div>
          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-6">
            This Slot Booking System is a full-stack web application 
            built using modern technologies. It provides a comprehensive 
            solution for managing time slots, allowing administrators to 
            create and manage availability while users can book slots and 
            track their booking status in real-time.
          </p>

          <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            The system features a clean, intuitive interface with role-based 
            access control, ensuring that administrators have full control 
            over slot management while users enjoy a seamless booking experience.
          </p>
        </div>

        

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 sm:p-12 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 flex items-center">
            <FiDatabase className="mr-3 text-blue-600 dark:text-blue-400" />
            Key Features
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="flex items-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors duration-200"
              >
                <FiCheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 flex-shrink-0" />
                <span className="text-gray-700 dark:text-gray-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* User Roles Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-8 sm:p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 flex items-center">
            <FiUsers className="mr-3" />
            User Roles
          </h2>

          <div className="grid sm:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4">Administrator</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Create and manage time slots</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Approve or reject booking requests</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>View all bookings and user activity</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Activate/deactivate slots</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h3 className="text-2xl font-semibold mb-4">User</h3>
              <ul className="space-y-2 text-blue-100">
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Browse available time slots</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Book slots instantly</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Track booking status</span>
                </li>
                <li className="flex items-start">
                  <FiCheckCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>View booking history</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default About;