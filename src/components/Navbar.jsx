import { useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import toast from 'react-hot-toast';
import { FiSun, FiMoon } from 'react-icons/fi';

function Navbar() {
  const { logout, user, role } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Debug: Check user data in detail
  console.log('User Navbar - User data:', user, 'Role:', role);
  console.log('User Navbar - User.name:', user?.name);
  console.log('User Navbar - User.email:', user?.email);
  console.log('User Navbar - User keys:', user ? Object.keys(user) : 'no user');

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setTimeout(() => navigate("/"), 500);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md px-4 sm:px-8 py-4 transition-colors duration-200">
      <div className="flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white tracking-wide">
          Slot Booking
        </h1>
        
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/user"
            className={`text-sm sm:text-lg font-medium transition-colors ${
              isActive('/user')
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/my-bookings"
            className={`text-sm sm:text-lg font-medium transition-colors ${
              isActive('/my-bookings')
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            <span className="hidden sm:inline">My Bookings</span>
            <span className="sm:hidden">Bookings</span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 text-yellow-500 dark:text-blue-400"
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? <FiMoon className="w-4 h-4 sm:w-5 sm:h-5" /> : <FiSun className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 
               user?.username ? user.username.charAt(0).toUpperCase() :
               user?.email ? user.email.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 leading-tight truncate max-w-[100px] sm:max-w-[150px]">
                {user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'User')}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 capitalize">
                {role || 'user'}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 sm:px-5 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium text-sm sm:text-base"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
