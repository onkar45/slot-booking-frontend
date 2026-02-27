import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiArrowRight, FiShield, FiTrendingUp } from 'react-icons/fi';
import PublicNavbar from "../components/PublicNavbar";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email is required';
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (touched.email) {
      setErrors({ ...errors, email: validateEmail(value) });
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (touched.password) {
      setErrors({ ...errors, password: validatePassword(value) });
    }
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    if (field === 'email') {
      setErrors({ ...errors, email: validateEmail(email) });
    } else if (field === 'password') {
      setErrors({ ...errors, password: validatePassword(password) });
    }
  };

  const processPendingBooking = async () => {
    const pendingBookingData = localStorage.getItem('pendingBooking');
    if (!pendingBookingData) return;

    try {
      const bookingData = JSON.parse(pendingBookingData);
      console.log('📝 Processing pending booking:', bookingData);

      // Convert the data to match the API format
      const apiBookingData = {
        date: bookingData.date,
        start_time: bookingData.startTime + ':00', // Add seconds if not present
        duration_minutes: bookingData.duration
      };

      console.log('📝 Sending pending booking to API:', apiBookingData);
      const response = await API.post('/bookings', apiBookingData);
      
      console.log('✅ Pending booking created successfully:', response.data);
      
      // Remove the pending booking from localStorage
      localStorage.removeItem('pendingBooking');
      
      toast.success('Your pre-login booking has been created successfully!', {
        duration: 5000,
        icon: '✅',
      });

    } catch (err) {
      console.error('❌ Failed to process pending booking:', err);
      console.error('❌ Error details:', err.response?.data);
      
      // Keep the pending booking in localStorage for manual retry
      toast.error('Failed to create your pre-login booking. Please try booking again from your dashboard.', {
        duration: 6000,
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      setTouched({ email: true, password: true });
      toast.error('Please fix the validation errors');
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');

      // Process any pending booking after successful login
      setTimeout(async () => {
        await processPendingBooking();
        
        const userRole = localStorage.getItem('role');
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      }, 1000); // Give time for the success toast to show

    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        ? (typeof err.response.data.detail === 'string' 
            ? err.response.data.detail 
            : 'Invalid credentials')
        : 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <PublicNavbar />
      <Toaster position="top-right" />
      
      <div className="relative flex items-center justify-center px-4 pt-8 pb-20">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
              <div className="space-y-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl shadow-2xl shadow-blue-500/30">
                  <FiShield className="w-10 h-10 text-white" />
                </div>
                <div className="space-y-4">
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                    <FiTrendingUp className="mr-2 w-4 h-4" />
                    Smart Booking Solution
                  </div>
                  <h1 className="text-4xl xl:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                    Smart Scheduling
                    <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                      Made Simple
                    </span>
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                    Transform how your organization manages time slots and appointments. 
                    One platform for all your booking needs.
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-4 mt-8">
                <div className="group flex items-start gap-4 p-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-lg hover:border-blue-200/50 dark:hover:border-blue-700/50 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiShield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">Protected & Private</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Your data stays secure with advanced encryption</p>
                  </div>
                </div>
                <div className="group flex items-start gap-4 p-4 bg-gradient-to-br from-white/50 to-gray-50/50 dark:from-gray-700/50 dark:to-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 shadow-sm hover:shadow-lg hover:border-purple-200/50 dark:hover:border-purple-700/50 transition-all duration-300 transform hover:-translate-y-1">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <FiLogIn className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">Quick & Intuitive</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Get started in seconds with our simple interface</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 p-8 sm:p-10 hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1">
              
              {/* Mobile Title */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600 rounded-2xl shadow-2xl shadow-blue-500/30 mb-4">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                  Smart Scheduling
                </h2>
              </div>

              {/* Desktop Title */}
              <div className="hidden lg:block mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-600/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold shadow-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm mb-4">
                  <FiLogIn className="mr-2 w-4 h-4" />
                  Welcome Back
                </div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                  Login to Continue
                </h2>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Access your dashboard and manage bookings
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="you@company.com"
                      className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:outline-none transition-all dark:bg-gray-900 dark:text-white ${
                        errors.email && touched.email
                          ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      value={email}
                      onChange={handleEmailChange}
                      onBlur={() => handleBlur('email')}
                    />
                    <FiMail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      errors.email && touched.email ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  {errors.email && touched.email && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1.5" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter your password"
                      className={`w-full px-4 py-3 pl-11 border rounded-xl focus:ring-2 focus:outline-none transition-all dark:bg-gray-900 dark:text-white ${
                        errors.password && touched.password
                          ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500'
                          : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
                      }`}
                      value={password}
                      onChange={handlePasswordChange}
                      onBlur={() => handleBlur('password')}
                    />
                    <FiLock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                      errors.password && touched.password ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'
                    }`} />
                  </div>
                  {errors.password && touched.password && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center">
                      <FiAlertCircle className="w-4 h-4 mr-1.5" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading || !email || !password}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:shadow-none group"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <FiArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Don't have access? Reach out to your admin team
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Login;