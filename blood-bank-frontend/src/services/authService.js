import apiClient from '../api/apiClient';

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'ERROR', message: 'Không thể kết nối đến máy chủ.' };
  }
};

export const verifyEmail = async (token) => {
  try {
    const response = await apiClient.get(`/auth/verify?token=${token}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'ERROR', message: 'Không thể kết nối đến máy chủ.' };
  }
};

export const resendVerification = async (email) => {
  try {
    const response = await apiClient.post('/auth/resend-verification', { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'ERROR', message: 'Không thể kết nối đến máy chủ.' };
  }
};

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  } catch (error) {
    throw error.response?.data || { status: 'ERROR', message: 'Không thể kết nối đến máy chủ.' };
  }
};
