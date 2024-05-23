import React, {useEffect, useState} from 'react';
import Login from './components/Login';
import Register from './components/Register'
import Dashboard from './components/Dashboard';
import Groups from './components/Group';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import io from 'socket.io-client';

const socket = io.connect("http://localhost:5000")

function App(){
  return(
    <ChakraProvider>
      <AuthProvider>
        <Router>
          <Routes>
          <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/groups" element={<Groups />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ChakraProvider>
  )
}

export default App