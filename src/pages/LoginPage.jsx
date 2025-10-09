import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import axios from 'axios';
 
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Shield,
} from 'lucide-react';
import Modal from '../components/Modal';
import TermsContent from '../components/TermsContent';
import PrivacyContent from '../components/PrivacyContent';
 
const API_BASE_URL = 'http://localhost:9092';
 
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
 
  useEffect(() => {
    if (location.state?.registeredSuccess) {
      navigate('/login', { replace: true, state: { registeredEmail: location.state.registeredEmail } });
    }
  }, [location.state, navigate]);
 
  const { login } = useAuth();
 
  const [formData, setFormData] = useState(() => ({
    email: (location.state && location.state.registeredEmail) || '',
    password: ''
  }));
 
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
   
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
 
  const validateForm = () => {
    const newErrors = {};
 
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
 
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
 
    return newErrors;
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
 
    setLoading(true);
 
    try {
      const response = await fetch(`${API_BASE_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        })
      });
 
      if (response.ok) {
        const { token, id, name, email, password, phno, region,pincode,location,skill, role } = await response.json();
        localStorage.setItem('authToken', token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
       
        const user = { id, name, email, password, phno, region,pincode,location,skill, role, token };
        // console.log('User object:', user);
        login(user);
       
        if (role === "supervisor") {
          navigate('/supervisor-dashboard');
        } else if (role === 'technician') {
          navigate('/technician-dashboard');
        } else if( role === 'user' ){
          navigate('/dashboard');
        }else {
          navigate('/register');
        }
      } else {
        setErrors({ email: 'Invalid email or password. Please try again.' });
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrors({ email: 'Could not connect to the server. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="auth-layout">
      <div className="auth-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-card"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="auth-header"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="auth-logo"
            >
              <LogIn size={36} className="text-white" />
            </motion.div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">
              Sign in to your Utility Asset Management System
            </p>
          </motion.div>
 
          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="form-group"
            >
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-group">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`form-input input-with-icon ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  <AlertCircle size={16} />
                  {errors.email}
                </motion.div>
              )}
            </motion.div>
 
            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="form-group"
            >
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input input-with-icon input-with-icon-right ${errors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-icon-right"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="form-error"
                >
                  <AlertCircle size={16} />
                  {errors.password}
                </motion.div>
              )}
            </motion.div>
 
            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? (
                <>
                  <div className="spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>
 
            {/* Register Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.4 }}
              className="text-center"
            >
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.95rem' }}>
                Don&apos;t have an account?{' '}
                <Link to="/register" className="link">
                  Create one here
                </Link>
              </p>
            </motion.div>
          </form>
        </motion.div>
 
        {/* Demo Credentials Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="alert alert-info"
        >
          <Shield size={20} />
          <div>
            <p className="font-semibold mb-2">For technician initial password is <strong>Demo@uamt123</strong></p>

          </div>
        </motion.div>
 
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
            Enterprise Asset Management • Role-Based Access • Secure & Compliant
          </p>
        </motion.div>
 
        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="text-center mt-4"
        >
          <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem' }}>
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="link"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              Terms & Conditions
            </button>
            {' • '}
            <button
              type="button"
              onClick={() => setShowPrivacyModal(true)}
              className="link"
              style={{ background: 'none', border: 'none', padding: 0 }}
            >
              Privacy Policy
            </button>
          </p>
        </motion.div>
      </div>
 
      {/* Terms Modal */}
      <Modal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        title="Terms & Conditions"
      >
        <TermsContent />
      </Modal>
 
      {/* Privacy Modal */}
      <Modal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        title="Privacy Policy"
      >
        <PrivacyContent />
      </Modal>
    </div>
  );
};
 
export default LoginPage;