import React from 'react'
import { FiLoader } from 'react-icons/fi'

const LoadingSpinner = () => {
  return (
<div className="min-h-screen flex items-center justify-center">
        <FiLoader className="animate-spin text-2xl" />
      </div>
  )
}

export default LoadingSpinner
