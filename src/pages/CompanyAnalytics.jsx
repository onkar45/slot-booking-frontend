import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SuperAdminNavbar from '../components/SuperAdminNavbar';
import API from '../services/api';
import { FiTrendingUp, FiBarChart2, FiPieChart } from 'react-icons/fi';

function CompanyAnalytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanyAnalytics();
  }, []);

  const fetchCompanyAnalytics = async () => {
    try {
      const res = await API.get('/super-admin/company-analytics');
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching company analytics:', err);
      toast.error('Failed to load company analytics');
    } finally {
      setLoading(false);
    }
  };

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
            <FiTrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">Company Analytics</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Track company-wise booking statistics</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-6"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading analytics...</p>
            </div>
          </div>
        ) : analytics.length === 0 ? (
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 text-center border border-white/20 dark:border-gray-700/20">
            <FiBarChart2 className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
            <p className="text-gray-500 dark:text-gray-400 text-xl font-medium">No company data available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analytics.map((company, index) => (
              <div
                key={index}
                className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                    <FiPieChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate flex-1">
                    {company.company_name || 'Unknown Company'}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Total Bookings</span>
                    <span className="text-2xl font-black text-gray-900 dark:text-white">{company.total_bookings || 0}</span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Approved</span>
                    <span className="text-lg font-bold text-green-600 dark:text-green-400">{company.approved_bookings || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Pending</span>
                    <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{company.pending_bookings || 0}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Rejected</span>
                    <span className="text-lg font-bold text-red-600 dark:text-red-400">{company.rejected_bookings || 0}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-2">
                    <span>Approval Rate</span>
                    <span className="font-bold">
                      {company.total_bookings > 0 
                        ? Math.round((company.approved_bookings / company.total_bookings) * 100) 
                        : 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${company.total_bookings > 0 
                          ? (company.approved_bookings / company.total_bookings) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CompanyAnalytics;
