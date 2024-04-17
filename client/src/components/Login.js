import React, { useState, useContext} from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
import { useNavigate, Link } from "react-router-dom";
import {Box, FormControl, Button, Input, Image, Stack, InputGroup,  Text} from "@chakra-ui/react"
import PalmTreeSVG from "./palmtree.svg"

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] =useState(null);
  const {setToken} = useContext(AuthContext);
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      const response = await axios.post("/api/auth/login", {
        username,
        password
      });
      setToken(response.data.token);
      localStorage.setItem("token", response.data.token);
      navigate("/dashboard");
    } catch(error){ 
      console.error("Authentication failed:", error);
      setToken(null);
      localStorage.removeItem("token");
      if(error.response && error.response.data){
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage("An error occurred. Try again.");
      }
    }
  };

  return(
    <Box minHeight={"100vh"} display="flex" justifyContent="center" alignItems="center" flexDirection={"row"} backgroundColor={"#F9B572"}>
      <Box display={"flex"} alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
        <Box display={"flex"}>
          <Text fontSize="30px" fontWeight="bold" color="#748E63">Welcome to</Text>
          <Text fontSize="30px" fontWeight="bold" color="#99B080" marginLeft={10}>TravelMate</Text>
        </Box>
        <Image src={PalmTreeSVG} alt="Palm Tree" maxHeight={"80vh"} mt={4} color="#748E63" css={{ filter: "invert(50%) sepia(100%) saturate(1000%)" }} />
      </Box>
      <Box height={"100%"} width={"40%"} padding={"20px"} backgroundColor={"#99B080"} borderRadius={20} display={"flex"} justifyContent={"center"}>
          <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
            <Stack spacing={10} width={"100%"}>
              <FormControl isRequired>
                <InputGroup>
                  {/*<InputLeftElement children={<Icon name='info'/>}/>*/}
                  <Input type='text' placeholder='username' color={"#99B080"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} value={username} onChange={(e) => setUsername(e.target.value)} aria-label='Username' borderWidth={4} borderRadius={6} width={"100%"} padding={"7px"}/>
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <InputGroup>
                  {/*<InputLeftElement children={<Icon name='lock'/>}/>*/}
                  <Input type='password' placeholder='password' color={"#99B080"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} value={password} onChange={(e) => setPassword(e.target.value)} aria-label='Password' borderWidth={4} borderRadius={6} width={"100%"} padding={"7px"}/>
                </InputGroup>
              </FormControl>
              <Button type='submit' color={"green"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} borderWidth={4} borderRadius={6} padding={"7px"}> Sign in</Button>
              <Box alignSelf={"center"}>
                  <Link to={"/register"} style={{ textDecoration: "none" }}>
                    {/*<Button type='button' color={"green"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} borderWidth={4} borderRadius={6} padding={"7px"}> Go to Login</Button>*/}
                    <Text color={"#748E63"} fontSize={"16px"} fontWeight={"bold"}>Go to Register</Text>
                  </Link>
                </Box>
            </Stack>
          </form>
        </Box>
    </Box>
  );
};

export default Login;