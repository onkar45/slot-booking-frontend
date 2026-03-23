import { useNavigate, useLocation, Link } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { useOrg } from "../context/OrgContext";
import toast from 'react-hot-toast';
import {
  FiSun, FiMoon, FiMenu, FiX, FiLogOut,
  FiGrid, FiUsers, FiCalendar
} from 'react-icons/fi';

const navLinks = [
  { path: '/admin',       label: 'Dashboard', icon: FiGrid },
  { path: '/admin/users', label: 'Users',      icon: FiUsers },
];

function AdminNavbar() {
  const { logout, user, role } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { org } = useOrg();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully!');
    setShowLogoutModal(false);
    setTimeout(() => navigate("/"), 500);
  };

  const isActive = (path) => location.pathname === path;

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <Link to="/admin" onClick={onLinkClick} className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <FiCalendar className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-black text-lg tracking-tight truncate">
            {org?.name || 'SlotBook'}
          </span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navLinks.map(({ path, label, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={onLinkClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive(path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
            {isActive(path) && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 pt-3 border-t border-white/5 space-y-2">
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name ? user.name.charAt(0).toUpperCase() :
             user?.email ? user.email.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white leading-tight truncate">
              {user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Admin')}
            </p>
            <p className="text-xs text-slate-400 capitalize">{role || 'admin'}</p>
          </div>
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title={theme === 'light' ? 'Dark mode' : 'Light mode'}
          >
            {theme === 'light' ? <FiMoon className="w-3.5 h-3.5" /> : <FiSun className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-transparent border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-sm font-medium"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-56 z-40 shadow-2xl"
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
      >
        <SidebarContent onLinkClick={() => {}} />
      </aside>

      {/* Mobile top bar */}
      <div
        className="lg:hidden fixed top-0 left-0 right-0 z-40 shadow-lg"
        style={{ background: '#0f172a' }}
      >
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <FiCalendar className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-black text-base">{org?.name || 'SlotBook'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              {theme === 'light' ? <FiMoon className="w-4 h-4" /> : <FiSun className="w-4 h-4" />}
            </button>
            <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/10 text-white transition-colors">
              <FiMenu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div
            className="relative w-64 h-full shadow-2xl flex flex-col"
            style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <span className="text-white font-bold">Menu</span>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 transition-colors">
                <FiX className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SidebarContent onLinkClick={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                <FiLogOut className="h-7 w-7 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Logout</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to logout?
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
    </>
  );
}

export default AdminNavbar;
