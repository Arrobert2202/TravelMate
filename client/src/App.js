import React, {useEffect, useState} from 'react';
import Login from './components/Login';
import Register from './components/Register'
import Dashboard from './components/Dashboard';
import { AuthProvider } from './components/AuthContext';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';

function App(){

  const [backendData, setBackendData] = useState([{}])

  useEffect(() => {
    fetch("/api/auth")
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setBackendData(data);
      })
      .catch(error => {
        if (error.response && error.response.status === 404) {
          console.error("Ruta API nu a fost găsită");
        } else {
          console.error("Eroare la obținerea datelor:", error);
        }
      });
  }, []);

  return(
   <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" exact Component={Login}/>
        <Route path="/login" Component={Login}/>
        <Route path='/register' Component={Register}/>
        <Route path="/dashboard" Component={Dashboard}/>
      </Routes>
    </Router>
   </AuthProvider>
  )
}

export default App