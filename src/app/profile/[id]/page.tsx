import React from 'react'

type ProfileProps = {
  params: {
    id : string
  }
}

const Profile = ({ params }: ProfileProps) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-screen py-2'>
      <h1>Profile</h1>
      <p>Welcome {params.id}</p>
    </div>
  )
}

export default Profile