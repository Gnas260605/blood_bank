import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Mail } from 'lucide-react';
import { verifyEmail, resendVerification } from '../services/authService';

const EmailVerifiedPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    const doVerification = async () => {
      if (!token) {
        setError('Không tìm thấy mã xác thực token.');
        setLoading(false);
        return;
      }

      try {
        await verifyEmail(token);
        setVerified(true);
      } catch (err) {
        setError(err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn.');
      } finally {
        setLoading(false);
      }
    };

    doVerification();
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setError('');
    setResendMessage('');

    try {
      const res = await resendVerification(resendEmail);
      setResendMessage(res.message || 'Email xác thực mới đã được gửi đi!');
    } catch (err) {
      setError(err.message || 'Gửi lại email thất bại. Thử lại sau.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-card" style={{ textAlign: 'center' }}>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '2rem 0' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', borderTopColor: 'var(--primary)' }}></div>
          <p style={{ color: 'var(--text-muted)' }}>Đang xác thực tài khoản của bạn...</p>
        </div>
      ) : verified ? (
        <>
          <div className="success-icon-container">
            <CheckCircle2 size={72} style={{ color: 'var(--success)' }} />
          </div>
          <h2 className="brand-title" style={{ color: '#10b981' }}>
            Xác thực thành công!
          </h2>
          <p className="subtitle">Tài khoản của bạn đã được kích hoạt.</p>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Bây giờ bạn đã có thể đăng nhập và sử dụng đầy đủ các tính năng của hệ thống Blood Bank.
          </p>
          <Link to="/login" className="submit-btn" style={{ textDecoration: 'none', color: '#fff' }}>
            ĐĂNG NHẬP NGAY
          </Link>
        </>
      ) : (
        <>
          <div className="success-icon-container">
            <AlertTriangle size={72} style={{ color: 'var(--error)' }} />
          </div>
          <h2 className="brand-title" style={{ color: '#ef4444' }}>
            Xác thực thất bại
          </h2>
          <p className="subtitle" style={{ marginBottom: '1.5rem' }}>{error}</p>

          {resendMessage && <div className="alert-banner success">{resendMessage}</div>}

          {/* Form to resend verification if token is expired */}
          <div className="resend-section" style={{ borderTop: 'none', paddingTop: 0 }}>
            <form onSubmit={handleResend} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
              <div className="input-wrapper">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-input form-input-with-icon"
                  placeholder="Nhập email để nhận link mới"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  required
                  disabled={resendLoading}
                />
              </div>
              <button type="submit" className="submit-btn" style={{ padding: '0.75rem' }} disabled={resendLoading || !resendEmail}>
                {resendLoading ? <div className="spinner"></div> : 'GỬI LẠI EMAIL XÁC THỰC'}
              </button>
            </form>
          </div>

          <p className="link-action" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '1.5rem', marginTop: '1.5rem' }}>
            <Link to="/login">Quay lại trang Đăng nhập</Link>
          </p>
        </>
      )}
    </div>
  );
};

export default EmailVerifiedPage;
