import React, { useState, useContext} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {Box, FormControl, FormErrorMessage, Button, Input, Stack, InputGroup, Flex, Heading, Text} from "@chakra-ui/react"
import { LoginHeader } from "./Header";
import styled from "styled-components";
import { SocketContext } from './SocketContext';

const StyledFlex = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 400px;
  width: 100%;
  height: 100%;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledInput = styled(Input)`
  color: #99B080;
  background-color: #D8DFE9;
  border: 2px solid #04566E;
  border-width: 4px;
  border-radius: 6px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  color: #04566E;
  font-size: 16px;
  font-weight: bold;
  background-color: ;
  border: 2px solid #04566E;
  border-radius: 40px;
  padding: 7px;
  width: 100%;
`;

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] =useState(null);
  const {setToken} = useContext(AuthContext);
  const navigate = useNavigate();
  const socket = useContext(SocketContext);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post("/api/auth/login", {
        username,
        password
      });
      const token = response.data.token;
      setToken(token);
      localStorage.setItem("token", token);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("username", response.data.username);
      console.log("Token set: ", token);
      navigate("/dashboard");
    } catch(error){ 
      console.error("Authentication failed:", error);
      setToken(null);
      localStorage.removeItem("token");
      if(error.response && error.response.data){
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("An error occurred. Try again.");
      }
    }
  };

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh">
      <LoginHeader />
      <StyledFlex>
        <Heading mb="1rem" ml="1rem" as="h1" size="lg" color="#B4D330">Login</Heading>
        <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
          <Stack spacing={5} width={"100%"}>
            <FormControl isRequired>
              <InputGroup>
                <StyledInput type='text' placeholder='username' value={username} onChange={(e) => setUsername(e.target.value)} aria-label='Username'/>
              </InputGroup>
            </FormControl>
            <FormControl isRequired>
              <InputGroup>
                <StyledInput type='password' placeholder='password' value={password} onChange={(e) => setPassword(e.target.value)} aria-label='Password'/>
              </InputGroup>
            </FormControl>
            {errorMessage && <Text color="red">{errorMessage}</Text>}
            <Flex justifyContent="space-evenly">
              <StyledButton type="submit"> Sign in </StyledButton>
              <Box alignSelf="center" width="100%">
                <Link to="/register" style={{ textDecoration: "none" }}>
                  <StyledButton> Sign up </StyledButton>
                </Link>
              </Box>
            </Flex>
          </Stack>
        </form>
      </StyledFlex>
    </Box>
  );
};

export default Login;