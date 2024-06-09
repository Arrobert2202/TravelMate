import React, { useEffect, useContext} from 'react';
import Login from './components/Login';
import Register from './components/Register'
import Dashboard from './components/Dashboard';
import Groups from './components/Groups';
import GroupChat from './components/GroupChat';
import RatingPage from './components/Rating';
import { AuthContext, AuthProvider } from './components/AuthContext';
import { SocketContext, SocketProvider } from './components/SocketContext';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';

function App(){
  return(
    <ChakraProvider>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path='/groups' element={<Groups />} />
              <Route path='/group-chat/:id' element={<GroupChat />} />
              <Route path='/attraction-rating' element={<RatingPage />}/>
            </Routes>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;