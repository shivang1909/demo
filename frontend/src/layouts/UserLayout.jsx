import React from 'react'
import { Outlet } from 'react-router-dom'

const UserLayout =()=> {
  return (
    <>
      <div className=''>
        <Outlet /> {/* this is where child routes render */}
      </div>
    </>
  )
}

export default UserLayout