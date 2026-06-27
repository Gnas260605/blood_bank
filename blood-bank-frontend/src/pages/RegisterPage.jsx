import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, Droplet, ArrowRight } from 'lucide-react';
import { register } from '../services/authService';

const RegisterPage = ({ setRegisteredEmail }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    bloodGroup: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  // Password strength checker logic
  useEffect(() => {
    const pw = formData.password;
    if (!pw) {
      setPasswordStrength('');
      return;
    }
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 2) {
      setPasswordStrength('weak');
    } else if (score === 3) {
      setPasswordStrength('medium');
    } else {
      setPasswordStrength('strong');
    }
  }, [formData.password]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'fullName') {
      if (!value) error = 'Họ và tên không được để trống';
      else if (value.length < 2 || value.length > 100) error = 'Họ và tên phải từ 2 đến 100 ký tự';
    }
    if (name === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email không được để trống';
      else if (!emailRegex.test(value)) error = 'Định dạng email không hợp lệ';
    }
    if (name === 'phone') {
      const phoneRegex = /^0[0-9]{8,10}$/;
      if (!value) error = 'Số điện thoại không được để trống';
      else if (!phoneRegex.test(value)) error = 'Số điện thoại phải từ 9 đến 11 chữ số và bắt đầu bằng 0';
    }
    if (name === 'password') {
      if (!value) error = 'Mật khẩu không được để trống';
      else if (value.length < 8) error = 'Mật khẩu phải tối thiểu 8 ký tự';
      else if (!/(?=.*[0-9])(?=.*[A-Z])/.test(value)) error = 'Mật khẩu phải chứa ít nhất 1 chữ hoa và 1 chữ số';
    }
    if (name === 'confirmPassword') {
      if (!value) error = 'Vui lòng xác nhận mật khẩu';
      else if (value !== formData.password) error = 'Mật khẩu xác nhận không khớp';
    }
    return error;
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    
    // Clear errors on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    // Run final validation
    const tempErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== 'termsAccepted' && key !== 'bloodGroup') {
        const err = validateField(key, formData[key]);
        if (err) tempErrors[key] = err;
      }
    });

    if (!formData.termsAccepted) {
      tempErrors.termsAccepted = 'Bạn phải đồng ý với Điều khoản sử dụng';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setLoading(true);

    try {
      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        bloodGroup: formData.bloodGroup || null,
      });

      setRegisteredEmail(formData.email);
      navigate('/success');
    } catch (err) {
      if (err.status === 'VALIDATION_ERROR') {
        setErrors(err.data || {});
      } else {
        setServerError(err.message || 'Có lỗi xảy ra trong quá trình đăng ký.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="brand-title">
        <Droplet className="brand-icon" size={32} fill="currentColor" /> Blood Bank
      </h2>
      <p className="subtitle">Tạo tài khoản mới</p>

      {serverError && <div className="alert-banner error">{serverError}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Họ và tên *</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <User size={18} />
            </span>
            <input
              type="text"
              name="fullName"
              className={`form-input form-input-with-icon ${errors.fullName ? 'error-border' : ''}`}
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Nguyen Van A"
              disabled={loading}
            />
          </div>
          {errors.fullName && <div className="error-text">{errors.fullName}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Email *</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Mail size={18} />
            </span>
            <input
              type="email"
              name="email"
              className={`form-input form-input-with-icon ${errors.email ? 'error-border' : ''}`}
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="example@gmail.com"
              disabled={loading}
            />
          </div>
          {errors.email && <div className="error-text">{errors.email}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Số điện thoại *</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Phone size={18} />
            </span>
            <input
              type="tel"
              name="phone"
              className={`form-input form-input-with-icon ${errors.phone ? 'error-border' : ''}`}
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0987654321"
              disabled={loading}
            />
          </div>
          {errors.phone && <div className="error-text">{errors.phone}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu *</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Lock size={18} />
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              className={`form-input form-input-with-icon ${errors.password ? 'error-border' : ''}`}
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              disabled={loading}
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.password && <div className="error-text">{errors.password}</div>}

          {passwordStrength && (
            <div className="strength-bar-container">
              <span className="strength-label">
                Độ mạnh: {passwordStrength === 'weak' ? 'Yếu' : passwordStrength === 'medium' ? 'Trung bình' : 'Mạnh'}
              </span>
              <div className="strength-bar">
                <div className={`strength-fill ${passwordStrength}`}></div>
              </div>
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Xác nhận mật khẩu *</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Lock size={18} />
            </span>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              className={`form-input form-input-with-icon ${errors.confirmPassword ? 'error-border' : ''}`}
              value={formData.confirmPassword}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="••••••••"
              disabled={loading}
              style={{ paddingRight: '2.75rem' }}
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {errors.confirmPassword && <div className="error-text">{errors.confirmPassword}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Nhóm máu (Tùy chọn)</label>
          <div className="input-wrapper">
            <span className="input-icon-left">
              <Droplet size={18} />
            </span>
            <select
              name="bloodGroup"
              className="form-input form-input-with-icon"
              value={formData.bloodGroup}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Chọn nhóm máu</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="AB">AB</option>
              <option value="O">O</option>
            </select>
          </div>
        </div>

        <label className="checkbox-group">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={formData.termsAccepted}
            onChange={handleChange}
            disabled={loading}
          />
          <span>
            Tôi đồng ý với <Link to="#">Điều khoản sử dụng</Link> và <Link to="#">Chính sách bảo mật</Link>
          </span>
        </label>
        {errors.termsAccepted && <div className="error-text" style={{ marginBottom: '1rem' }}>{errors.termsAccepted}</div>}

        <button type="submit" className="submit-btn" disabled={loading || !formData.termsAccepted}>
          {loading ? <div className="spinner"></div> : <>ĐĂNG KÝ NGAY <ArrowRight size={18} /></>}
        </button>
      </form>

      <p className="link-action">
        Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
      </p>
    </div>
  );
};

export default RegisterPage;
