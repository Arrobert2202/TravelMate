import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { Header } from "./Header";

function Dashboard() {
  const {token, loading} = useContext(AuthContext);
  if(loading){
    return null;
  }

  if(!token){ 
    return <Navigate to="/login" replace />;
  }

  return(
    <Header />
  );
}

export default Dashboard;