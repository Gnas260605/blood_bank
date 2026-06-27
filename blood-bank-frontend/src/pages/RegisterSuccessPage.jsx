import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MailOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { resendVerification } from '../services/authService';

const RegisterSuccessPage = ({ email }) => {
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (!email) {
      setError('Không tìm thấy email đăng ký. Vui lòng đăng ký lại.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await resendVerification(email);
      setMessage(res.message || 'Email xác thực đã được gửi lại!');
      setCountdown(60);
    } catch (err) {
      setError(err.message || 'Gửi lại email thất bại. Thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      <div className="success-icon-container">
        <CheckCircle size={72} className="brand-icon" style={{ color: 'var(--success)' }} />
      </div>

      <h2 className="brand-title" style={{ color: '#10b981' }}>
        Đăng ký thành công!
      </h2>
      
      <p className="subtitle" style={{ marginBottom: '1.5rem' }}>
        Chúng tôi đã gửi một email xác thực đến địa chỉ:<br/>
        <span className="email-highlight" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
          <MailOpen size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
          {email || 'email của bạn'}
        </span>
      </p>

      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        Vui lòng kiểm tra hộp thư đến (hoặc thư rác) và nhấn vào đường link xác thực để kích hoạt tài khoản của bạn.
      </p>

      {message && <div className="alert-banner success" style={{ marginTop: '1rem' }}>{message}</div>}
      {error && <div className="alert-banner error" style={{ marginTop: '1rem' }}>{error}</div>}

      <div className="resend-section">
        <p className="resend-text">Không nhận được email?</p>
        <button 
          onClick={handleResend} 
          disabled={countdown > 0 || loading} 
          className="resend-btn"
        >
          {loading ? 'Đang gửi...' : countdown > 0 ? `Gửi lại email (đợi ${countdown}s)` : 'Gửi lại email'}
        </button>
      </div>

      <p className="link-action" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem' }}>
        <Link to="/login" className="submit-btn" style={{ textDecoration: 'none', color: '#fff', background: '#475569' }}>
          <ArrowLeft size={18} /> Về trang Đăng nhập
        </Link>
      </p>
    </div>
  );
};

export default RegisterSuccessPage;
