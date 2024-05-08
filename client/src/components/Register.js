import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {Box, FormControl, Button, Input, Stack, InputGroup, Heading, Flex} from "@chakra-ui/react"
import {LoginHeader} from "./Header";
import styled from "styled-components";

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
  padding: 7px;
`;

const StyledButton = styled(Button)`
  color: #04566E;
  font-size: 16px;
  font-weight: bold;
  background-color: transparent;
  border: 2px solid #04566E;
  border-radius: 40px;
  padding: 7px;
  width: 100%;
`;

const Register = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmpassword, setConfirmPaswword] = useState('');
  const [message, setMessage] =useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmpassword){
      console.log("Password doesn't match.");
      setMessage("Password doesn't match.");
      return;
    }
    try{
      const response = await axios.post("/api/auth/register", {
        email,
        username,
        password
      });
      setMessage(response.data.message);
    } catch(error){ 
      console.error("Registration failed:", error.response.data.error);
      setMessage(error.response.data.error);
    }
  };

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh">
      <LoginHeader />
      <StyledFlex>
        <Heading ml="1rem" as="h1" size="lg" color="#B4D330">Register</Heading>
          <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
            <Stack spacing={10} width={"100%"}>
              <FormControl isRequired>
                <InputGroup>
                  <StyledInput type='email' placeholder='email' value={email} onChange={(e) => setEmail(e.target.value)} aria-label='Email'/>
                </InputGroup>
              </FormControl>
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
              <FormControl isRequired>
                <InputGroup>
                  <StyledInput type='password' placeholder='confirm password' value={confirmpassword} onChange={(e) => setConfirmPaswword(e.target.value)} aria-label='ConfirmPassword'/>
                </InputGroup>
              </FormControl>
            <Flex justifyContent="space-evenly">
              <StyledButton type="submit"> Sign up </StyledButton>
              <Box alignSelf="center" width="100%">
                <Link to="/login" style={{ textDecoration: "none" }}>
                  <StyledButton> Sign in </StyledButton>
                </Link>
              </Box>
            </Flex>
          </Stack>
        </form>
      </StyledFlex>
  </Box>
);
};

export default Register;