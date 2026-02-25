import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn, FiAlertCircle, FiArrowRight, FiShield } from 'react-icons/fi';
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

      setTimeout(() => {
        const userRole = localStorage.getItem('role');
        if (userRole === "admin") {
          navigate("/admin");
        } else {
          navigate("/user");
        }
      }, 500);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <PublicNavbar />
      <Toaster position="top-right" />
      
      <div className="flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl xl:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                Smart Scheduling
                <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mt-2">
                  Made Simple
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Transform how your organization manages time slots and appointments. 
                One platform for all your booking needs.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiShield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Protected & Private</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your data stays secure with advanced encryption</p>
                </div>
              </div>
              <div className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FiLogIn className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Quick & Intuitive</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Get started in seconds with our simple interface</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 sm:p-10">
              
              {/* Mobile Title */}
              <div className="lg:hidden text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30 mb-4">
                  <FiShield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Smart Scheduling
                </h2>
              </div>

              {/* Desktop Title */}
              <div className="hidden lg:block mb-8">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Login to Continue
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
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
