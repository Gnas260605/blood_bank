import React from 'react';
import { User, Mail, Phone, Activity, ShieldCheck, Calendar, LogOut, Droplet } from 'lucide-react';

const DashboardPage = ({ user, onLogout }) => {
  return (
    <div className="auth-card" style={{ maxWidth: '600px' }}>
      <h2 className="brand-title">
        <Droplet className="brand-icon" size={32} fill="currentColor" /> Blood Bank
      </h2>
      <p className="subtitle">Hồ sơ người dùng của bạn</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} /> Họ và tên
          </span>
          <span style={{ fontWeight: '500' }}>{user.fullName}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={18} /> Email
          </span>
          <span style={{ fontWeight: '500' }}>{user.email}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} /> Số điện thoại
          </span>
          <span style={{ fontWeight: '500' }}>{user.phone}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Droplet size={18} /> Nhóm máu
          </span>
          <span style={{ fontWeight: '600', color: 'var(--primary)' }}>{user.bloodGroup || 'Chưa xác định'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} /> Trạng thái tài khoản
          </span>
          <span style={{ fontWeight: '600', color: '#10b981' }}>{user.status}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)', paddingBottom: '0.75rem' }}>
          <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={18} /> Ngày tạo tài khoản
          </span>
          <span style={{ fontWeight: '500' }}>{new Date(user.createdAt).toLocaleDateString('vi-VN')}</span>
        </div>
      </div>

      <button onClick={onLogout} className="submit-btn" style={{ background: '#475569', boxShadow: 'none' }}>
        <LogOut size={18} /> ĐĂNG XUẤT
      </button>
    </div>
  );
};

export default DashboardPage;
