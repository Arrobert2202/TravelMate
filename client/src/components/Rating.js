import React, { useContext, useState, useEffect} from 'react';
import { AuthContext } from './AuthContext';
import api from '../api';
import { LoggedHeader } from './Header';
import { Heading, Box, Input, Text, Flex, IconButton, Button, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader, useDisclosure, FormControl, FormLabel, Select } from '@chakra-ui/react';
import StarRating from './StarRating';
import { CloseIcon } from '@chakra-ui/icons';
import { FaStar } from "react-icons/fa";
import WordCloudComponent from "./WordCloud";

const RatingModal = ({ isOpen, onClose, token, handleTokenExpired }) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities]   = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [attractions, setAttractions] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState('');
  const [rating, setRating] = useState(0);
  const [adjective, setAdjective] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [descriptionList, setDescriptionList] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCountries = async () => {
      try{
        const response = await api.get('/destination/countries', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setCountries(response.data);
      } catch (error) {
        console.error("Error getting the countries: ", error);
        if(error.response && error.response.stats === 401){
          handleTokenExpired();
        }
      }
    };
    fetchCountries();
  }, [token, handleTokenExpired]);
  
  const fetchStates = async (country) => {
    try{
      const response = await api.post('/destination/states', { country }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStates(response.data);
    } catch (error) {
      console.error("Error getting the states: ", error);
      if(error.response && error.response.stats === 401){
        handleTokenExpired();
      }
    }
  };

  const fetchCities = async (country, state) => {
    try{
      const response = await api.post('/destination/cities', {country, state}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setCities(response.data);
    } catch (error) {
      console.error("Error getting the countries: ", error);
      if(error.response && error.response.stats === 401){
        handleTokenExpired();
      }
    }
  };

  const fetchAttractions = async (country, state, city) => {
    try{
      const response = await api.post('/destination/attractions/name', {city}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setAttractions(response.data);
    } catch (error) {
      console.error("Error getting the countries: ", error);
      if(error.response && error.response.stats === 401){
        handleTokenExpired();
      }
    }
  }

  const handleNewCountry = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedState('');
    setSelectedCity('');
    fetchStates(country);
  };

  const handleNewState = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity('');
    fetchCities(selectedCountry, state);
  };

  const handleNewCity = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
    fetchAttractions(selectedCountry, selectedState, city);
  };

  const handleNewAttraction = (e) => {
    console.log(e.target.value);
    setSelectedAttraction(e.target.value);
  }

  const handleClose = () => {
      setSelectedCountry('');
      setSelectedState('');
      setSelectedCity('');
      setSelectedAttraction('');
      setAdjective('');
      setDescriptionList([]);
      setDescriptionError('');
      setRating(0);
      setError('');
      onClose();
  };

  const handleAddDescription = () => {
   const trimmedAdjective = adjective.trim();
   if(trimmedAdjective === ''){
    setDescriptionError('Enter a word');
    return;
   } else if(trimmedAdjective.includes(' ')){
    setDescriptionError('Only one word allowed');
    return;
   }

   const alreadyExists = descriptionList.some(word => word === trimmedAdjective);
   if(alreadyExists){
    setDescriptionError('Word already added');
    return;
   }

   if(descriptionList.length === 5){
    setDescriptionError('You are allowed to give maximum 5 word');
    return;
   }

   setDescriptionList([...descriptionList, trimmedAdjective]);
   setAdjective('');
   setDescriptionError('');
  }

  const handleRemoveWord = (adjective) => {
    setDescriptionList(descriptionList.filter(word => word !== adjective));
  }

  const handleSubmit = async () => {
    if(selectedCountry === '' || selectedState === '' || selectedCity === '' || selectedAttraction === '' || descriptionList.length === 0 || rating === 0){
      console.log("All fields are required");
      return;
    }

    const newRating = {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity,
      attraction: selectedAttraction,
      description: descriptionList,
      rating: rating
    };
    try{
      const response = await api.post('/attraction/ratings', newRating, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      handleClose();
    } catch (error) {
      console.error("Error submitting rating: ", error);
      if (error.response && error.response.status === 401) {
        handleTokenExpired();
      } else if (error.response && error.response.status === 400) {
        setError(error.response.data.message);
        handleClose();
      }
    }
  };

  return(
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      motion
    >
      <ModalOverlay
        bg='blackAlpha.300'
        backdropFilter='blur(10px)'
      />
        <ModalContent maxHeight="90vh" overflow="auto">
          <ModalHeader>Rate attraction</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
                <FormLabel>Country</FormLabel>
                <Select placeholder='Select country' value={selectedCountry} onChange={handleNewCountry}>
                  {countries.map((country, index) => (
                    <option key={index} value={country}>{country}</option>
                  ))}
                </Select>
              </FormControl>
            <Box display="flex" justifyContent="space-around" mt={4}>
              <FormControl>
                <FormLabel>State</FormLabel>
                <Select placeholder='Select state' value={selectedState} onChange={handleNewState} isDisabled={!selectedCountry}>
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>City</FormLabel>
                <Select placeholder='Select city' value={selectedCity} onChange={handleNewCity} isDisabled={!selectedState}>
                  {cities.map((city, index) => (
                    <option key={index} value={city}>{city}</option>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <FormControl mt={4}>
              <FormLabel>Attractions</FormLabel>
              <Select placeholder='Select attraction' value={selectedAttraction} onChange={handleNewAttraction} isDisabled={!selectedCity}>
                  {attractions.map((attraction, index) => (
                    <option key={index} value={attraction.name}>{attraction.name}</option>
                  ))}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Select rating</FormLabel>
              <Box display="flex" justifyContent="center">
                <StarRating rating={rating} setRating={setRating} />
              </Box>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Add description</FormLabel>
              <Input placeholder='word that describes the attractions' value={adjective} onChange={(e) => setAdjective(e.target.value)} />
              <Button mt={2} onClick={handleAddDescription}>Add</Button>
              {descriptionError && <Text color="red">{descriptionError}</Text>}
            </FormControl>
            {descriptionList.length > 0 && (
              <Box mt={4}>
              <Text as='b'>Description</Text>
              <Flex wrap="wrap" maxWidth="100%">
                {descriptionList.map((word, index) => (
                  <Flex key={index} alignItems="center" m={1} p={2} borderWidth="1px" borderRadius="md">
                    <Text>{word}</Text>
                    <IconButton
                      icon={<CloseIcon />}
                      size="sm"
                      onClick={() => handleRemoveWord(word)}
                    />
                  </Flex>
                ))}
              </Flex>
            </Box>
            )}
            {error && <Text color="red" mt={4}>{error}</Text>}
            <Box display="flex" justifyContent="space-between">
              <Button colorScheme="blue" mr={3} onClick={handleSubmit} mt={4}>
                Save
              </Button>
              <Button onClick={handleClose} mt={4}>Cancel</Button>
            </Box>
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

function RatingPage() {
  const { token, handleTokenExpired } = useContext(AuthContext);
  const [ attraction, setAttraction ] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [searchResults, setSearchResults] = useState([]);
  const [selectedAttraction, setSelectedAttraction] = useState(null);
  const [searched, setSearched] = useState(false);
  const [isResponsive, setIsResponsive] = useState(window.innerWidth<=823);

  useEffect(() => {
    function handleResize() {
      setIsResponsive(window.innerWidth <= 823);
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return() => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleEnter = async (event) => {
    if(event.keyCode === 13){
      handleAttraction();   
    } 
  }

  const handleAttraction = async () => {
    try {
      const response = await api.post(`/attraction/search`, { attraction: attraction }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedAttraction(null);
      setSearchResults([]);
      console.log(response.data);
      setSearched(true);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching for attraction: ", error);
    }
  };

  const handleSelectAttraction = (selectedAttraction) => {
    setSelectedAttraction(selectedAttraction);
    console.log("Selected attraction: ", selectedAttraction);
  };

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh" maxH="100vh" overflowY="auto">
      <LoggedHeader />
      <Box display="flex" flexDirection="row" justifyContent="space-between" marginLeft="2rem" marginTop="2rem" marginRight="2rem">
        <Box display="flex" flexDirection="row">
          <Input placeholder="Attraction" color="#D8DFE9" marginRight="1rem" value={attraction} onChange={(e) => {setAttraction(e.target.value)}} onKeyDown={handleEnter}/>
          <Button 
            onClick={handleAttraction}
            _hover={{transform: "scale(1.05)"}}
            style={{transition: "transform 0.3s ease"}}
          >
            Search
          </Button>
        </Box>
        <Button
          onClick={onOpen}
          _hover={{transform: "scale(1.05)"}}
          style={{transition: "transform 0.3s ease"}}
          marginLeft="1rem"
        >
          Add rating
        </Button>
        <RatingModal isOpen={isOpen} onClose={onClose} token={token} handleTokenExpired={handleTokenExpired}/>
      </Box>
      <Box display="flex" flexDirection={isResponsive ? "column" : "row"} marginTop="3rem" marginLeft="2rem" marginRight="2rem">
        <Box flex="1" marginRight="2rem" maxWidth={isResponsive ? "100%" : "35%"} marginBottom={isResponsive ? "2rem" : "0"}>
          <Heading color="#D8DFE9" marginBottom="2rem">Search results</Heading>
          <Box maxHeight={isResponsive ? "calc(3*5em)" : "auto"} overflowY="auto">
            {searchResults.length > 0 ? (
              searchResults.map((result, index) => (
                <Box key={index} background="transparent" p="1rem" mb="1rem" borderRadius="0.5rem" border="1px solid #D8DFE9" cursor="pointer" onClick={() => handleSelectAttraction(result)}>
                  <Text color="#D8DFE9">{result.attraction}</Text>
                </Box>
              ))
            ) : (
              searched && <Text color="#D8DFE9">No results found</Text>
            )}
          </Box>
        </Box>
        {selectedAttraction && (
          <Box display="flex" flex="1" flexDirection="column">
            <Heading color="#D8DFE9" marginBottom="1rem">{selectedAttraction.attraction}</Heading>
            <Flex align="center" color="#D8DFE9" marginBottom="1rem">
              <Heading color="#D8DFE9" marginRight="0.5rem"><b>Rating:</b> {selectedAttraction.rating}</Heading>
              <FaStar color="#FFD700" size="2rem" />
            </Flex>
            <Box maxWidth="700px" width="100%" maxHeight="500px" height="100%" marginBottom="1rem">
              <WordCloudComponent wordMap={selectedAttraction.description}/>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default RatingPage;