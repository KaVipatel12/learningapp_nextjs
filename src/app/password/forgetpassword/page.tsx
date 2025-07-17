'use client';

import { useNotification } from "@/components/NotificationContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgetPassword() {
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [pageLoading, setPageLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const { showNotification } = useNotification();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResendOTP = async () => {
    try {
      setPageLoading(true);
      const response = await fetch('/api/auth/password/resendotp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to resend OTP');
      
      showNotification('New OTP sent successfully!', "success");
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'Failed to resend OTP', "error");
    } finally {
      setPageLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setPageLoading(true);
      
      let endpoint, body;
      if (!otpSent) {
        endpoint = '/api/auth/password/sendemail';
        body = { email: formData.email };
      } else if (!otpVerified) {
        endpoint = '/api/auth/password/verifyotp';
        body = { email: formData.email, otp: formData.otp };
      } else {
        endpoint = '/api/auth/password/reset';
        body = { 
          email: formData.email, 
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.msg || 'An error occurred');
      }

      if (!otpSent) {
        showNotification('OTP has been sent to your email', "success");
        setOtpSent(true);
      } else if (!otpVerified) {
        showNotification('OTP verified successfully', "success");
        setOtpVerified(true);
      } else {
        showNotification('Password reset successfully!', "success");
        router.push('/login');
      }
      
    } catch (error) {
      showNotification(error instanceof Error ? error.message : 'An error occurred', "error");
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          {otpVerified ? 'Reset Password' : otpSent ? 'Verify OTP' : 'Forgot Password'}
        </h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {!otpVerified && (
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter your email"
                required
                disabled={otpSent}
              />
            </div>
          )}

          {otpSent && !otpVerified && (
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">
                OTP Code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                pattern="\d{6}"
              />
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={pageLoading}
                className="text-sm text-pink-600 hover:text-pink-500 font-medium"
              >
                Resend OTP
              </button>
            </div>
          )}

          {otpVerified && (
            <>
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border-2 border-pink-300 rounded-lg focus:outline-none focus:border-pink-500 transition-colors"
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
            </>
          )}
          
          <button
            type="submit"
            disabled={pageLoading || (otpSent && !otpVerified && formData.otp.length !== 6)}
            className={`px-6 py-2 bg-pink-500 hover:bg-pink-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 ${
              pageLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {pageLoading 
              ? 'Processing...' 
              : otpVerified 
                ? 'Reset Password' 
                : otpSent 
                  ? 'Verify OTP' 
                  : 'Send OTP'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <a href="/login" className="font-medium text-pink-600 hover:text-pink-500">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}