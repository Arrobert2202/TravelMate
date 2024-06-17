import React, { createContext, useState, useEffect } from "react";
import api from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({children}) => {
  const [token, setToken] = useState(null);
  const[loading, setLoading] = useState(true);

  useEffect(()=> {
    const storedToken = localStorage.getItem("token");
    console.log("Stored token:", storedToken);
    setToken(storedToken);
    setLoading(false);
  }, []);
  
  const handleTokenExpired = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  const logout = async () => {
    try{
      await api.post('/logout', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setToken(null);
      localStorage.removeItem('token');
    } catch(error){
      console.error('Logout failed: ', error);
    }
  };

  return (
    <AuthContext.Provider value={{token, setToken, loading, handleTokenExpired, logout}}>
      {children}
    </AuthContext.Provider>
  );
};