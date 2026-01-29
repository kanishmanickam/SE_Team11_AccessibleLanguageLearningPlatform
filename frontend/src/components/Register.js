import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    learningCondition: 'none',
    age: '',
    isMinor: false,
    parentEmail: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.learningCondition === 'none') {
      setError('Please select your learning condition');
      return false;
    }

    const age = parseInt(formData.age);
    if (age && (age < 3 || age > 100)) {
      setError('Please enter a valid age (3-100)');
      return false;
    }

    if (age && age < 13 && !formData.isMinor) {
      setError('If you are under 13, please check the under 13 box (parental approval required)');
      return false;
    }

    if (formData.isMinor && !formData.parentEmail) {
      setError('Parent email is required for minor accounts');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const { confirmPassword, ...registrationData } = formData;
    registrationData.age = parseInt(registrationData.age) || undefined;

    if (!registrationData.isMinor) {
      delete registrationData.parentEmail;
    }

    const result = await register(registrationData);

    if (result.success) {
      // Redirect to accessibility setup
      navigate('/accessibility-setup');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1 className="register-title">Create Your Account</h1>
        <p className="register-subtitle">
          Join our accessible learning community
        </p>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              aria-required="true"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password * <span className="help-text">(Minimum 6 characters)</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              aria-required="true"
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              aria-required="true"
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="learningCondition">
              Learning Condition * <span className="help-text">(This helps us customize your experience)</span>
            </label>
            <select
              id="learningCondition"
              name="learningCondition"
              value={formData.learningCondition}
              onChange={handleChange}
              required
              aria-required="true"
            >
              <option value="none">Select your learning condition</option>
              <option value="dyslexia">Dyslexia</option>
              <option value="adhd">ADHD</option>
              <option value="autism">Autism Spectrum</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="age">Age (optional)</label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              min="3"
              max="100"
            />
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isMinor"
                checked={formData.isMinor}
                onChange={handleChange}
              />
              <span>I am under 13 years old (requires parental approval)</span>
            </label>
          </div>

          {formData.isMinor && (
            <div className="form-group">
              <label htmlFor="parentEmail">Parent/Guardian Email *</label>
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                required={formData.isMinor}
                autoComplete="email"
              />
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="link-primary">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
