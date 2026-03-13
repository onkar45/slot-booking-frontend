import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import API from '../services/api';
import { FiUsers, FiCalendar, FiCheckCircle, FiClock, FiTrendingUp, FiActivity } from 'react-icons/fi';

function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_bookings: 0,
    approved_bookings: 0,
    pending_bookings: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch bookings data - super admin has access to this
      const bookingsRes = await API.get('/super-admin/user-bookings');
      const bookings = bookingsRes.data || [];

      // Calculate unique users from bookings
      const uniqueUsers = new Set();
      bookings.forEach(booking => {
        if (booking.user?.id) {
          uniqueUsers.add(booking.user.id);
        } else if (booking.user?.email) {
          uniqueUsers.add(booking.user.email);
        }
      });

      setStats({
        total_users: uniqueUsers.size,
        total_bookings: bookings.length,
        approved_bookings: bookings.filter(b => b.status === 'approved').length,
        pending_bookings: bookings.filter(b => b.status === 'pending').length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: FiUsers,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Total Bookings',
      value: stats.total_bookings,
      icon: FiCalendar,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Approved Bookings',
      value: stats.approved_bookings,
      icon: FiCheckCircle,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Pending Bookings',
      value: stats.pending_bookings,
      icon: FiClock,
      color: 'from-yellow-500 to-orange-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      iconColor: 'text-yellow-600 dark:text-yellow-400'
    }
  ];

  const quickLinks = [
    {
      title: 'User Booking History',
      description: 'View all candidate booking records',
      icon: FiCalendar,
      link: '/super-admin/user-bookings',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      title: 'Company Analytics',
      description: 'Track company-wise booking statistics',
      icon: FiTrendingUp,
      link: '/super-admin/company-analytics',
      color: 'from-purple-500 to-pink-600'
    },
    {
      title: 'Login Activity',
      description: 'Monitor user login history and activity',
      icon: FiActivity,
      link: '/super-admin/login-activity',
      color: 'from-green-500 to-teal-600'
    },
    {
      title: 'Manage Slots',
      description: 'Delete bookings and free up slots',
      icon: FiCheckCircle,
      link: '/super-admin/manage-slots',
      color: 'from-orange-500 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden pt-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <Toaster position="top-right" />
      <SuperAdminNavbar />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">Super Admin Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">System overview and management</p>
        </div>

        {/* Statistics Cards */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading statistics...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">{stat.title}</p>
                  <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 dark:border-gray-700/20">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Quick Access</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickLinks.map((link, index) => (
                  <Link
                    key={index}
                    to={link.link}
                    className="group bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${link.color} text-white`}>
                        <link.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {link.title}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{link.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default SuperAdminDashboard;
