import { Link, useLocation } from "react-router-dom";

function PublicNavbar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <h1 className="text-lg sm:text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
            Slot Booking System
          </h1>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link
            to="/"
            className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
              isActive('/')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            Home
          </Link>

          <Link
            to="/about"
            className={`text-sm sm:text-base font-medium transition-colors px-3 py-2 rounded-lg ${
              isActive('/about')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            About
          </Link>

          <Link
            to="/login"
            className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-sm sm:text-base shadow-md hover:shadow-lg"
          >
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;