'use client';
import { useState } from 'react';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';
import Link from 'next/link';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  mobile: string;
  role: 'student' | 'educator' | '';
}

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username must be less than 20 characters')
    .required('Username is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number')
    .required('Mobile number is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase, one lowercase, one number and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['student', 'educator'], 'Please select your role')
    .required('Role is required')
});

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (
    values: RegisterValues,
    { setSubmitting, resetForm }: FormikHelpers<RegisterValues>
  ) => {
    try {
      const {...userData } = values;
      
      const response = await axios.post('/api/auth/signup', userData);
      
      if (response.data.success) {
        showNotification('Registration successful!', 'success');
        resetForm();
        
        if(userData.role === "educator"){
         return router.push('/educator/bio');
        }
        else{
         return router.push('/user/bio');
        }

      } else {
        showNotification(response.data.msg || 'Registration failed', 'error');
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred during registration';
      
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.msg || 
                      error.response?.data?.message || 
                      error.message || 
                      errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      showNotification(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden border border-rose-100 mt-14">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-white/90">Join our learning community today</p>
        </div>

        {/* Form */}
        <div className="p-6">
          <Formik
            initialValues={{
              username: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: '', 
              mobile: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-rose-800 mb-1">
                    Username
                  </label>
                  <Field
                    name="username"
                    type="text"
                    placeholder="Enter your username"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.username && touched.username ? 'border-red-500' : 'border-rose-200'
                    } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                  />
                  {errors.username && touched.username && (
                    <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-rose-800 mb-1">
                    Email
                  </label>
                  <Field
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.email && touched.email ? 'border-red-500' : 'border-rose-200'
                    } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                  />
                  {errors.email && touched.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-rose-800 mb-1">
                    Mobile
                  </label>
                  <Field
                    name="mobile"
                    type="text"
                    placeholder="Enter your Mobile"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.mobile && touched.mobile ? 'border-red-500' : 'border-rose-200'
                    } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                  />
                  {errors.mobile && touched.mobile && (
                    <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-rose-800 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.password && touched.password ? 'border-red-500' : 'border-rose-200'
                      } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-rose-800 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Field
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-rose-200'
                      } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-rose-400 hover:text-rose-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && touched.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Role Selection */}
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-rose-800 mb-1">
                    I am a
                  </label>
                  <Field
                    as="select"
                    name="role"
                    className={`w-full px-4 py-2 rounded-lg border ${
                      errors.role && touched.role ? 'border-red-500' : 'border-rose-200'
                    } focus:outline-none focus:ring-2 focus:ring-rose-300/50 transition text-rose-900`}
                  >
                    <option value="">Select your role</option>
                    <option value="student">Student</option>
                    <option value="educator">Educator</option>
                  </Field>
                  {errors.role && touched.role && (
                    <p className="mt-1 text-sm text-red-500">{errors.role}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-lg font-medium hover:to-rose-600 transition shadow-md disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>

                {/* Login Link */}
                <p className="text-center text-sm text-rose-700/80">
                  Already have an account?{' '}
                  <Link href="/login" className="text-rose-600 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}