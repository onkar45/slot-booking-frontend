import { useEffect, useState, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import AdminNavbar from '../components/AdminNavbar';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { FiUser, FiMail, FiShield, FiCheckCircle, FiXCircle, FiAlertTriangle, FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

function AdminUsers() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const ITEMS_PER_PAGE = 10;
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    is_active: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error(err.response?.data?.detail || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  const validateName = (name) => {
    if (!name) return 'Name is required';
    if (name.length < 3) return 'Name must be at least 3 characters';
    return '';
  };

  const validateEmail = (email) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Invalid email format';
    return '';
  };

  const validatePassword = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (formTouched[name]) {
      let error = '';
      if (name === 'name') error = validateName(value);
      else if (name === 'email') error = validateEmail(value);
      else if (name === 'password') error = validatePassword(value);
      setFormErrors({ ...formErrors, [name]: error });
    }
  };

  const handleInputBlur = (field) => {
    setFormTouched({ ...formTouched, [field]: true });
    
    let error = '';
    if (field === 'name') error = validateName(formData.name);
    else if (field === 'email') error = validateEmail(formData.email);
    else if (field === 'password') error = validatePassword(formData.password);
    
    setFormErrors({ ...formErrors, [field]: error });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (nameError || emailError || passwordError) {
      setFormErrors({
        name: nameError,
        email: emailError,
        password: passwordError,
      });
      setFormTouched({ name: true, email: true, password: true });
      toast.error('Please fix the validation errors');
      return;
    }

    setSubmitting(true);

    try {
      await API.post('/admin/users', formData);
      toast.success('User created successfully!');
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'user'
      });
      setFormErrors({});
      setFormTouched({});
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Create user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || 'Error creating user';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/deactivate`);
      toast.success('User deactivated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Deactivate user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || 'Error deactivating user';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const handleActivate = async (userId) => {
    try {
      await API.put(`/admin/users/${userId}/activate`);
      toast.success('User activated successfully!');
      fetchUsers();
    } catch (err) {
      console.error('Activate user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || 'Error activating user';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const canModifyUser = (targetUser) => {
    if (targetUser.role === 'admin') return false;
    if (targetUser.id === currentUser?.id) return false;
    return true;
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name,
      email: user.email,
      is_active: user.is_active
    });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditSubmitting(true);

    try {
      await API.patch(`/admin/users/${selectedUser.id}`, editFormData);
      toast.success('User updated successfully!');
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Edit user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || 'Error updating user';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await API.delete(`/admin/users/${selectedUser.id}`);
      toast.success('User deleted successfully!');
      setShowDeleteModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err) {
      console.error('Delete user error:', err.response?.data);
      const errorMessage = err.response?.data?.detail 
        || err.response?.data?.error 
        || err.response?.data?.message
        || 'Error deleting user';
      toast.error(errorMessage, {
        duration: 4000,
        style: {
          maxWidth: '500px',
        },
      });
    }
  };

  const handleCreateModalClose = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setFormErrors({});
    setFormTouched({});
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    // Apply search filter
    const matchesSearch = searchQuery.trim() === '' || 
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);

    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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

      <Toaster position="top-right" />
      <AdminNavbar />

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all border border-white/20 dark:border-gray-700/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Create New User</h3>
              <button
                onClick={handleCreateModalClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiUser className="mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('name')}
                  className={`w-full border rounded-2xl px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium ${
                    formErrors.name && formTouched.name
                      ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                      : 'border-white/20 dark:border-gray-600/20 focus:ring-blue-500'
                  }`}
                  placeholder="Enter name"
                />
                {formErrors.name && formTouched.name && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMail className="mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('email')}
                  className={`w-full border rounded-2xl px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium ${
                    formErrors.email && formTouched.email
                      ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                      : 'border-white/20 dark:border-gray-600/20 focus:ring-blue-500'
                  }`}
                  placeholder="Enter email"
                />
                {formErrors.email && formTouched.email && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiShield className="mr-2" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={() => handleInputBlur('password')}
                  className={`w-full border rounded-2xl px-4 py-3 focus:ring-2 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium ${
                    formErrors.password && formTouched.password
                      ? 'border-red-500 focus:ring-red-500 dark:border-red-500'
                      : 'border-white/20 dark:border-gray-600/20 focus:ring-blue-500'
                  }`}
                  placeholder="Enter password"
                />
                {formErrors.password && formTouched.password && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1 flex items-center">
                    <FiAlertTriangle className="w-4 h-4 mr-1" />
                    {formErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiShield className="mr-2" />
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full border border-white/20 dark:border-gray-600/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium"
                >
                  <option value="user">User</option>
                  <option value="admin" disabled>Admin (disabled)</option>
                </select>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={handleCreateModalClose}
                  className="flex-1 px-6 py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-300 border border-white/20 dark:border-gray-600/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.name || !formData.email || !formData.password}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all border border-white/20 dark:border-gray-700/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100">Edit User</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiXCircle className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiUser className="mr-2" />
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-white/20 dark:border-gray-600/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium"
                  placeholder="Enter name"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiMail className="mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditChange}
                  required
                  className="w-full border border-white/20 dark:border-gray-600/20 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200 text-gray-700 dark:text-gray-300 dark:bg-gray-700/50 backdrop-blur-sm font-medium"
                  placeholder="Enter email"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FiShield className="mr-2" />
                  Status
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editFormData.is_active}
                    onChange={handleEditChange}
                    className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-6 py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-300 border border-white/20 dark:border-gray-600/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:-translate-y-0.5"
                >
                  {editSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md w-full p-8 transform transition-all border border-white/20 dark:border-gray-700/20">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100/80 dark:bg-red-900/30 backdrop-blur-sm rounded-full mb-6 shadow-lg">
              <FiTrash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 text-center mb-3">
              Delete User?
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-center mb-8 text-lg">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>

            {selectedUser && (
              <div className="bg-gradient-to-r from-red-50/80 to-red-100/80 dark:from-red-900/30 dark:to-red-800/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-red-200/50 dark:border-red-700/50 shadow-lg">
                <div className="flex items-center mb-3">
                  <FiUser className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                  <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">{selectedUser.name}</span>
                </div>
                <div className="flex items-center">
                  <FiMail className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{selectedUser.email}</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-4 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-white/80 dark:hover:bg-gray-600/80 transition-all duration-300 border border-white/20 dark:border-gray-600/20 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2">User Management</h2>
            <p className="text-gray-600 dark:text-gray-300 font-medium text-lg">Create and manage user accounts</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 text-base transform hover:-translate-y-0.5"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Create User
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl p-6 mb-8 border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Status Filter Dropdown */}
            <div className="w-full sm:w-48">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Search Bar */}
            <div className="flex-1 relative">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Search
              </label>
              <div className="relative">
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-white/20 dark:border-gray-700/20 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* User List Table */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/20 hover:shadow-3xl transition-all duration-500">
          <div className="p-6 border-b border-white/20 dark:border-gray-700/20 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm rounded-t-3xl">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Users</h3>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
                <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">Loading users...</p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <FiUser className="w-20 h-20 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
              <p className="text-gray-900 dark:text-white text-2xl font-black mb-3">
                {searchQuery || statusFilter !== 'all' 
                  ? 'No users match your filters.' 
                  : 'No users found.'}
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/20 dark:divide-gray-700/20">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 dark:from-gray-800/80 dark:to-gray-700/80 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm divide-y divide-white/20 dark:divide-gray-700/20">
                  {currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-white/70 dark:hover:bg-gray-700/70 transition-all duration-300 transform hover:-translate-y-0.5">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                          {user.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-xs font-black shadow-lg ${
                          user.role === 'admin'
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-purple-500/30'
                            : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-500/30'
                        }`}>
                          {user.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-xs font-black shadow-lg ${
                          user.is_active
                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                            : 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-red-500/30'
                        }`}>
                          {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700 dark:text-gray-300">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canModifyUser(user) ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleEditClick(user)}
                              className="group relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-0.5 hover:scale-110"
                              title="Edit user"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>

                            {user.is_active ? (
                              <button
                                onClick={() => handleDeactivate(user.id)}
                                className="group relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transform hover:-translate-y-0.5 hover:scale-110"
                                title="Deactivate user"
                              >
                                <FiXCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleActivate(user.id)}
                                className="group relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transform hover:-translate-y-0.5 hover:scale-110"
                                title="Activate user"
                              >
                                <FiCheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              onClick={() => handleDeleteClick(user)}
                              className="group relative inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 transform hover:-translate-y-0.5 hover:scale-110"
                              title="Delete user"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500 italic font-medium">
                            {user.role === 'admin' ? 'Admin user' : 'Current user'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-6 pb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredUsers.length)} of {filteredUsers.length} users
                  {(searchQuery || statusFilter !== 'all') && (
                    <span className="ml-1">(filtered from {users.length} total)</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className="px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Previous
                  </button>

                  <div className="flex gap-1 sm:gap-2">
                    {[...Array(totalPages)].map((_, index) => {
                      const page = index + 1;
                      // Show first page, last page, current page, and pages around current
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-10 h-10 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                                : 'bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span
                            key={page}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 dark:text-gray-400 font-medium"
                          >
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className="px-4 py-3 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-600/20 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
