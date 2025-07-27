// app/restricted/page.tsx
'use client';

import { PageLoading } from '@/components/PageLoading';
import { useUser } from '@/context/userContext';
import { Mail, Lock, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RestrictedPage() {
  const { user , userLoading } = useUser();
  const [ restricted , setRestricted] = useState(false)
  const [loading , setLoading] = useState(true)
  const  router  = useRouter(); 
  useEffect(() => {

    if(userLoading) return setLoading(true)
    if(!userLoading && user)
      if(user.status === 1){
        setRestricted(true)
        setLoading(false)
      }
  }, [user , userLoading])

  if(loading){
   return <PageLoading></PageLoading>
  }

  if(!restricted && !loading){
    router.back()
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-rose-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mt-13">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-rose-100 mb-4">
            <Lock className="h-10 w-10 text-rose-600" />
          </div>
          <h1 className="text-3xl font-bold text-rose-900 mb-2">Account Restricted</h1>
          <p className="text-lg text-rose-700">
            Your account access has been temporarily limited
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-rose-200">
          {/* Status Section */}
          <div className="bg-rose-50 p-6 border-b border-rose-200">
            <div className="flex items-start">
              <ShieldAlert className="h-6 w-6 text-rose-500 mt-1 mr-3 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold text-rose-900 mb-2">Account Status</h2>
                <p className="text-rose-700">
                  Your account was restricted due to
                  violations of our community guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Reasons Section */}
          <div className="p-6 border-b border-rose-200">
            <h2 className="text-xl font-semibold text-rose-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 text-rose-500 mr-2" />
              Possible Reasons
            </h2>
            <ul className="space-y-3">
              {[
                "Violation of community guidelines",
                "Suspicious activity detected",
                "Multiple policy violations",
                "Inappropriate content sharing",
                "Copyright infringement",
                "Spam or misleading information"
              ].map((reason, index) => (
                <li key={index} className="flex items-start">
                  <div className={`h-2 w-2 rounded-full mt-2 mr-3 flex-shrink-0 ${index % 2 === 0 ? 'bg-pink-500' : 'bg-rose-500'}`} />
                  <span className="text-rose-800">{reason}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Resolution Section */}
          <div className="p-6">
            <h2 className="text-xl font-semibold text-rose-900 mb-4">How to Regain Access</h2>
            
            <div className="space-y-4">
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-100">
                <h3 className="font-medium text-pink-800 mb-2 flex items-center">
                  <ChevronRight className="h-5 w-5 mr-2 text-pink-500" />
                  Contact Support
                </h3>
                <p className="text-pink-700 text-sm mb-3">
                  If you believe this was a mistake, please contact our support team with details about your account.
                </p>
                <a
                  href="mailto:engkushpatel24811@gmail.com?subject=Account Restriction Appeal&body=Username: ${user?.username}%0D%0A%0D%0APlease explain why you believe your account should be unrestricted:"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-md hover:to-rose-600 transition-all text-sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Support Team
                </a>
              </div>

              <div className="bg-rose-50 p-4 rounded-lg border border-rose-100">
                <h3 className="font-medium text-rose-800 mb-2 flex items-center">
                  <ChevronRight className="h-5 w-5 mr-2 text-rose-500" />
                  Review Community Guidelines
                </h3>
                <p className="text-rose-700 text-sm mb-3">
                  Familiarize yourself with our community standards to prevent future restrictions.
                </p>
        <Link
                  href="#"
                  className="inline-flex items-center px-4 py-2 bg-white text-rose-700 border border-rose-200 rounded-md hover:bg-rose-50 transition-all text-sm"
                >
                  View Guidelines
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-rose-600">
          <p>Restriction ID: {user?._id || 'N/A'}</p>
          <p className="mt-1">Our team typically responds to appeals within 2-3 business days.</p>
        </div>
      </div>
    </div>
  );
}