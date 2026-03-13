import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import API from '../services/api';
import { FiActivity, FiUser, FiClock, FiMonitor, FiMapPin, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

function LoginActivity() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchLoginActivity();
  }, []);

  const fetchLoginActivity = async () => {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      
      if (!token) {
        toast.error('No authentication token found. Please log in.');
        setTimeout(() => navigate('/login'), 1500);
        setLoading(false);
        return;
      }

      if (role !== 'super_admin') {
        toast.error('Super Admin access required');
        setTimeout(() => navigate('/'), 1500);
        setLoading(false);
        return;
      }

      const res = await API.get('/super-admin/login-activity');
      console.log('🔐 Login Activity Data:', res.data);
      
      const activitiesData = res.data || [];
      
      // Check if the response includes user data directly
      if (activitiesData.length > 0 && activitiesData[0].user) {
        console.log('✅ User data included in response');
        setActivities(activitiesData);
      } else {
        console.log('⚠️ User data not included, fetching separately');
        setActivities(activitiesData);
        
        // Fallback: Fetch user details separately
        const uniqueUserIds = [...new Set(activitiesData.map(a => a.user_id).filter(Boolean))];
        
        if (uniqueUserIds.length > 0) {
          try {
            const bookingsRes = await API.get('/super-admin/user-bookings');
            const usersMap = {};
            
            bookingsRes.data.forEach(booking => {
              if (booking.user && booking.user.id) {
                usersMap[booking.user.id] = booking.user;
              }
            });
            
            console.log('👥 Users Map from bookings:', usersMap);
            setUsers(usersMap);
          } catch (err) {
            console.error('Error fetching user details:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching login activity:', err);
      
      if (err.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        setTimeout(() => {
          localStorage.clear();
          navigate('/login');
        }, 1500);
      } else if (err.response?.status === 403) {
        toast.error('Access denied: Super Admin role required');
        setTimeout(() => navigate('/'), 1500);
      } else if (err.response?.status === 404) {
        toast.error('Login activity endpoint not found');
      } else {
        toast.error('Failed to load login activity');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const getBrowserFromUserAgent = (userAgent) => {
    if (!userAgent) return 'Unknown Browser';
    const ua = userAgent.toLowerCase();
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
    return 'Other Browser';
  };

  const getDateRange = (filter) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch(filter) {
      case 'today':
        return { start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week': {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return { start: weekStart, end: weekEnd };
      }
      case 'month': {
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        return { start: monthStart, end: monthEnd };
      }
      case 'last30': {
        const last30Start = new Date(today);
        last30Start.setDate(today.getDate() - 30);
        return { start: last30Start, end: now };
      }
      default:
        return null;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const user = activity.user || users[activity.user_id];
    const query = searchQuery.toLowerCase();
    
    const matchesSearch = (
      user?.name?.toLowerCase().includes(query) ||
      user?.email?.toLowerCase().includes(query) ||
      activity.ip_address?.toLowerCase().includes(query)
    );

    // Date filter
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const dateRange = getDateRange(dateFilter);
      if (dateRange) {
        const loginDate = new Date(activity.login_time);
        matchesDate = loginDate >= dateRange.start && loginDate <= dateRange.end;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter]);

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
          <div className="flex items-center gap-3 mb-2">
            <FiActivity className="w-8 h-8 text-green-600 dark:text-green-400" />
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Login Activity</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Monitor user login history and activity</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 dark:border-gray-700/20">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or IP address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-lg"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-6 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm font-medium shadow-lg"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="last30">Last 30 Days</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading activity...</p>
            </div>
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/20">
            <FiActivity className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium mb-2">No login activity found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              Login activity will appear here once the backend endpoint is properly configured.
            </p>
          </div>
        ) : (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4 h-4" />
                        User
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="w-4 h-4" />
                        IP Address
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiMonitor className="w-4 h-4" />
                        Browser
                      </div>
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-2">
                        <FiClock className="w-4 h-4" />
                        Login Time
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedActivities.map((activity, index) => {
                    // Use user data from activity if available, otherwise from users map
                    const user = activity.user || users[activity.user_id];
                    return (
                      <tr
                        key={`activity-${activity.id}-${index}`}
                        className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div>
                            {user ? (
                              <>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  {user.name || user.username || 'No Name'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {user.email || 'No Email'}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-bold text-gray-900 dark:text-white text-sm">
                                  User ID: {activity.user_id}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Details not available
                                </p>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {activity.ip_address || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                            {getBrowserFromUserAgent(activity.user_agent)}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDateTime(activity.login_time)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of {filteredActivities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                  >
                    <FiChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                  <span className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                  >
                    Next
                    <FiChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginActivity;
