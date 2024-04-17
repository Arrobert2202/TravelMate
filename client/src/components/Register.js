import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {Box, FormControl, Button, Input, Image, Stack, InputGroup ,Text} from "@chakra-ui/react"
import PalmTreeSVG from "./palmtree.svg"

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
    <Box minHeight={"100vh"} display="flex" justifyContent="center" alignItems="center" flexDirection={"row"} backgroundColor={"#F9B572"}>
      <Box display={"flex"} alignItems={"center"} justifyContent={"center"} flexDirection={"column"}>
        <Box display={"flex"}>
          <Text fontSize="30px" fontWeight="bold" color="#748E63">Welcome to</Text>
          <Text fontSize="30px" fontWeight="bold" color="#99B080" marginLeft={10}>TravelMate</Text>
        </Box>
        <Image src={PalmTreeSVG} alt="Palm Tree" maxHeight={"80vh"} mt={4} color="#748E63" css={{ filter: "invert(50%) sepia(100%) saturate(1000%)" }} />
      </Box>
      <Box height={"100%"} width={"40%"} padding={"20px"} backgroundColor={"#99B080"} borderRadius={20} display={"flex"} alignContent={"center"} justifyContent={"center"}>
          <form onSubmit={handleSubmit} style={{ maxWidth: "300px", width: "100%" }}>
            <Stack spacing={10} width={"100%"}>
              <FormControl isRequired>
                  <InputGroup>
                    {/*<InputLeftElement children={<Icon name='info'/>}/>*/}
                    <Input type='email' placeholder='email' color={"#99B080"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} value={email} onChange={(e) => setEmail(e.target.value)} aria-label='Email' borderWidth={4} borderRadius={6} width={"100%"} padding={"7px"}/>
                  </InputGroup>
                </FormControl>
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
                <FormControl isRequired>
                  <InputGroup>
                    {/*<InputLeftElement children={<Icon name='lock'/>}/>*/}
                    <Input type='password' placeholder='confirm password' color={"#99B080"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} value={confirmpassword} onChange={(e) => setConfirmPaswword(e.target.value)} aria-label='ConfirmPassword' borderWidth={4} borderRadius={6} width={"100%"} padding={"7px"}/>
                  </InputGroup>
                </FormControl>
                <Button type='submit' color={"green"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} borderWidth={4} borderRadius={6} padding={"7px"}> Sign up</Button>
                <Box alignSelf={"center"}>
                  <Link to={"/login"} style={{ textDecoration: "none" }}>
                    {/*<Button type='button' color={"green"} backgroundColor={"#FAF8ED"} borderColor={"#748E63"} borderWidth={4} borderRadius={6} padding={"7px"}> Go to Login</Button>*/}
                    <Text color={"#748E63"} fontSize={"16px"} fontWeight={"bold"}>Go to Login</Text>
                  </Link>
                </Box>
            </Stack>
          </form>
        </Box>
    </Box>
  );
};

export default Register;