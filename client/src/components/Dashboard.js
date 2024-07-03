import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { Navigate } from "react-router-dom";
import { Header, LoggedHeader } from "./Header";
import { Box, Heading, Text, ChakraProvider, Image, Tooltip} from "@chakra-ui/react";
import { Provider, Carousel, LeftButton, RightButton} from "chakra-ui-carousel";
import api from '../api';

function Dashboard() {
  const {token, loading, handleTokenExpired} = useContext(AuthContext);
  const [topDestinations, setTopDestinations] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/destination/top-destinations');
        setTopDestinations(response.data);
      } catch (error) {
        console.error("Error getting the top destinations: ", error);
        if (error.response && error.response.status === 401) {
          handleTokenExpired();
        }
      }
    };

    fetchData();
  }, [token, handleTokenExpired]);

  // if(loading){
  //   return null;
  // }

  // if(!token){ 
  //   return <Navigate to="/login" replace />;
  // }

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh">
      {token ? <LoggedHeader /> : <Header />}
      <Box display="flex" flexDirection="column" justifyContent="space-around" width="100%" maxW="100%" flexGrow={1}>
        <Box padding={"2rem"} marginTop={"2rem"} width="44%">
          <Heading as="h1" color="#D8DFE9">Welcome to ExploreTogether!</Heading>
          <Text paddingTop={"1rem"} color="#D8DFE9">Join us and discover amazing destinations, connect with fellow travelers, plan your next adventure, and create unforgettable memories. Start exploring today!</Text>
        </Box>
        <Box marginBottom="2rem">
          <Heading padding={"2rem"} as="h2" color="#D8DFE9">Top destinations arount the world</Heading>
          <Provider>
            <Box display="flex" justifyContent="space-between" alignItems={"center"}>
              <LeftButton backgroundColor="transparent" color="#B4D330" marginRight={"1rem"}/>
              <Carousel gap={30}>
                {topDestinations.map((destination, index) => (
                  <Box
                    p={1}
                    key={index}
                    w="100%"
                    h="100%"
                    color="#B4D330"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    position="relative"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    _hover={{
                      ".image": { 
                        filter: "blur(4px)",
                        transform: "scale(1.03)",
                      },
                      ".image-text": { opacity: "1" },
                    }}
                  >
                    <Image 
                      src={destination.image}
                      borderRadius="0.65rem"
                      width="100%"
                      maxH="15rem"
                      height="100%"
                      style={{
                        transition: "filter 0.3s ease, transform 0.3s ease",
                      }}
                      className="image"
                    />
                    <Text className="image-text" position="absolute" color="#D8DFE9" transition="opacity 0.3s ease" fontWeight="bold" opacity="0" textAlign="center">
                      {destination.city + "-" + destination.country}<br/>
                      {destination.attractions}
                    </Text>
                  </Box>
                ))}
              </Carousel>
              <RightButton backgroundColor="transparent" color="#B4D330" marginLeft={"1rem"}/>
            </Box>
          </Provider>
        </Box>
      </Box>
    </Box>
  );
}

export default Dashboard;