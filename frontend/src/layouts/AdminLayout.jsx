import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/admin/Navbar';

const AdminLayout = ({role,setrole}) => {
  return (
    <>
    <div  className='overflow-hidden'>

      <Navbar  role={role}setrole={setrole} />
      <div className="">
        <Outlet /> {/* this is where child routes render */}
      </div>
    </div>
      
    </>
  );
};

export default AdminLayout;
