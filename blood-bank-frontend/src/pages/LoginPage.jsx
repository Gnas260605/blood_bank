import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Droplet } from 'lucide-react';
import { login } from '../services/authService';

const LoginPage = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = await login(formData);
      setSuccess('Đăng nhập thành công!');
      if (onLoginSuccess) {
        onLoginSuccess(data.data);
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="brand-title">
        <Droplet className="brand-icon" size={32} fill="currentColor" /> Blood Bank
      </h2>
      <p className="subtitle">Đăng nhập để tiếp tục</p>

      {error && <div className="alert-banner error">{error}</div>}
      {success && <div className="alert-banner success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Mail size={18} />
            </span>
            <input
              type="email"
              name="email"
              className="form-input form-input-with-icon"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Lock size={18} />
            </span>
            <input
              type="password"
              name="password"
              className="form-input form-input-with-icon"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? <div className="spinner"></div> : 'ĐĂNG NHẬP'}
        </button>
      </form>

      <p className="link-action">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
};

export default LoginPage;
