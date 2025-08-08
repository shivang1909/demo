import axios from "axios";
import { useEffect } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ProtectedRoute = ({children,setrole,role}) => {

  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
     
    const res = axios.get(`http://localhost:5000/api/auth/getadmin`, {
      withCredentials: true
    }).then(res => {
        setrole(res.data.role);
    }).catch((err) => {
        
        setrole(null);
         return navigate('/', { replace: true });
    });
  }, [location.pathname]);


  
  return children;
};
