'use client';
import { Formik, Form, Field, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';

interface RegisterValues {
  mobile: string;
  role: 'student' | 'educator' | '';
}

const RegisterSchema = Yup.object().shape({
  mobile: Yup.string()
    .matches(/^[0-9]{10}$/, 'Must be a valid 10-digit mobile number')
    .required('Mobile number is required'),
  role: Yup.string()
    .oneOf(['student', 'educator'], 'Please select your role')
    .required('Role is required')
});

export default function RegisterPage() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const handleSubmit = async (
    values: RegisterValues,
    { setSubmitting, resetForm }: FormikHelpers<RegisterValues>
  ) => {
    try {
      const {...userData } = values;
      
      const response = await axios.patch('/api/user/additionaldetails', userData);
      
      if (response.data.success) {
        showNotification('Details Saved Successfully!', 'success');
        resetForm();
        
        if(userData.role === "educator"){
         return router.push('/educator/bio');
        }
        else{
         return router.push('/user/bio');
        }

      } else {
        showNotification(response.data.msg || 'Failed to save', 'error');
      }
    } catch (error: unknown) {
      let errorMessage = 'An error occurred during saving the details';
      
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
          <h1 className="text-2xl font-bold">Additional Details</h1>
        </div>


        {/* Form */}
        <div className="p-6">
          <Formik
            initialValues={{
              mobile: '',
              role: ''
            }}
            validationSchema={RegisterSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="space-y-4">

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
                      Saving Details
                    </span>
                  ) : (
                    'Save Details'
                  )}
                </button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}