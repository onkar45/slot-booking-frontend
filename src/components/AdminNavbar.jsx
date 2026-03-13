import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import toast from 'react-hot-toast';
import { FiSun, FiMoon, FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import Logo from './Logo';

function AdminNavbar() {
  const { logout, user, role } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setShowLogoutModal(false);
    setTimeout(() => navigate("/"), 500);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 dark:bg-gray-950/95 text-white backdrop-blur-md shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/admin" className="flex items-center hover:opacity-80 transition-opacity">
            <Logo size="md" showText={true} />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/admin"
              className={`text-base font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/admin')
                  ? 'text-blue-400 bg-blue-500/20 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              className={`text-base font-medium transition-all px-4 py-2 rounded-lg ${
                isActive('/admin/users')
                  ? 'text-blue-400 bg-blue-500/20 border-b-2 border-blue-400'
                  : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
              }`}
            >
              Users
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-800 dark:bg-gray-900 hover:bg-gray-700 dark:hover:bg-gray-800 transition-all duration-200 text-yellow-400 dark:text-blue-400"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>

            {/* User Info */}
            <div className="flex items-center gap-3 px-3 py-2 bg-gray-800 dark:bg-black rounded-lg border border-gray-700 dark:border-gray-800">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 
                 user?.username ? user.username.charAt(0).toUpperCase() :
                 user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left min-w-0">
                <p className="text-sm font-semibold text-white leading-tight truncate max-w-[150px]">
                  {user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Admin')}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {role || 'admin'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600 transition duration-200 font-medium flex items-center gap-2"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200 text-yellow-400 dark:text-blue-400"
            >
              {theme === 'light' ? <FiMoon className="w-5 h-5" /> : <FiSun className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-all duration-200"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2 border-t border-gray-800 pt-4">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-800 rounded-lg mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 
                 user?.username ? user.username.charAt(0).toUpperCase() :
                 user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className="text-sm font-semibold text-white leading-tight truncate">
                  {user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Admin')}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {role || 'admin'}
                </p>
              </div>
            </div>

            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium transition-all px-4 py-3 rounded-lg ${
                isActive('/admin')
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/users"
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-base font-medium transition-all px-4 py-3 rounded-lg ${
                isActive('/admin/users')
                  ? 'text-blue-400 bg-blue-500/20'
                  : 'text-gray-300 hover:text-blue-400 hover:bg-gray-800'
              }`}
            >
              Users
            </Link>

            <button
              onClick={() => {
                setShowLogoutModal(true);
                setMobileMenuOpen(false);
              }}
              className="w-full bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition duration-200 font-medium flex items-center justify-center gap-2"
            >
              <FiLogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="fixed w-screen h-screen z-[9999] bg-black/50"
          onClick={() => setShowLogoutModal(false)}
          style={{ 
            top: 0,
            left: 0,
            margin: 0,
            padding: 0
          }}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full p-6"
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              maxWidth: '28rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <FiLogOut className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Confirm Logout
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to logout? You will need to login again to access your dashboard.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default AdminNavbar;