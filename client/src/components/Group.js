import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { Header } from './Header';
import { Box, Heading, Flex, Text, Button, Center, Modal, ModalOverlay, ModalContent, ModalCloseButton, FormControl, FormLabel, ModalBody, ModalHeader, Input, Select, useDisclosure, IconButton } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import api from '../api';
import axios from 'axios';

const GroupModal = ({isOpen, onClose, token, handleTokenExpired}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [members, setMembers] = useState([]);
  const [error, setError] = useState('');

  const { user } = useContext(AuthContext);

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
      setCities([]);
      setSelectedState('');
      setSelectedCity('');
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
      setSelectedCity('');
    } catch (error) {
      console.error("Error getting the countries: ", error);
      if(error.response && error.response.stats === 401){
        handleTokenExpired();
      }
    }
  };

  const handleCountryChange = (e) => {
    const country = e.target.value;
    setSelectedCountry(country);
    setSelectedState('');
    setSelectedCity('');
    fetchStates(country);
  };

  const handleStateChange = (e) => {
    const state = e.target.value;
    setSelectedState(state);
    setSelectedCity('');
    fetchCities(selectedCountry, state);
  };

  const handleCityChange = (e) => {
    const city = e.target.value;
    setSelectedCity(city);
  };

  const handleAddMember = async () => {
    try {
      const response = await api.post('/users/validate', {username: memberName}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if(response.data.exists) {
        setMembers([...members, { user: response.data.userId, username: memberName}]);
        setMemberName('');
        setError('');
      } else {
        setError('User not found');
      }
    } catch(error) {
      console.error("Error validating the user: ", error);
      if(error.response && error.response.status === 401){
        handleTokenExpired();
      } else {
        setError('An error occurred while validating the user');
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const newGroup = {
        name: groupName,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        members: members.map(member => ({ user: member.user, unreadMessages: 0})),
        admins: [user._id]
      };
      const response = await api.post('/groups/create', newGroup, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Group created:', response.data);
      onClose();
    } catch (error) {
      console.error("Error creating the group: ", error);
    }
  };

  const handleRemoveMember = (username) => {
    setMembers(members.filter(member => member.username != username));
  }

  return(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motionPreset="scale"
    >
      <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px)'
      />
      <ModalContent>
        <ModalHeader>Create a new group</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl mt={4}>
            <FormLabel>Group name</FormLabel>
            <Input placeholder=' Group name' value={groupName} onChange={(e) => setGroupName(e.target.value)}/>
          </FormControl>
          {/* <Text as="h2" mt={4}>Destination</Text> */}
          <FormControl mt={4}>
              <FormLabel>Country</FormLabel>
              <Select placeholder='Select country' value={selectedCountry} onChange={handleCountryChange}>
                {countries.map((country, index) => (
                  <option key={index} value={country}>{country}</option>
                ))}
              </Select>
            </FormControl>
          <Box display="flex" justifyContent="space-around" mt={4}>
            <FormControl>
              <FormLabel>State</FormLabel>
              <Select placeholder='Select state' value={selectedState} onChange={handleStateChange} isDisabled={!selectedCountry}>
                {states.map((state, index) => (
                  <option key={index} value={state}>{state}</option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>City</FormLabel>
              <Select placeholder='Select city' value={selectedCity} onChange={handleCityChange} isDisabled={!selectedState}>
                {cities.map((city, index) => (
                  <option key={index} value={city}>{city}</option>
                ))}
              </Select>
            </FormControl>
          </Box>
          <FormControl mt={4}>
            <FormLabel>Add Members</FormLabel>
            <Input placeholder='Username' value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <Button mt={2} onClick={handleAddMember}>Add Member</Button>
            {error && <Text color="red">{error}</Text>}
          </FormControl>
          <Box mt={4}>
            <Text as='b'>Members:</Text>
            <Flex wrap="wrap" maxWidth="100%">
              {members.map((member, index) => (
                <Flex key={index} alignItems="center" m={1} p={2} borderWidth="1px" borderRadius="md">
                <Text mr={2}>{member.username}</Text>
                <IconButton
                  aria-label="Remove member"
                  icon={<CloseIcon />}
                  size="sm"
                  onClick={() => handleRemoveMember(member.username)}
                />
              </Flex>
              ))}
            </Flex>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Button colorScheme="blue" mr={3} onClick={handleSubmit} mt={4}>
              Save
            </Button>
            <Button onClick={onClose} mt={4}>Cancel</Button>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

function Groups() {
  const { token, loading, handleTokenExpired } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ groups,  setGroups ] = useState([]); 

  useEffect(() => {
    const fetchData = async() => {
      try{
        const response = await api.get('/groups/user-groups', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setGroups(response.data);
      } catch(error) {
        console.error("Error getting the groups: ", error);
        if(error.response && error.response.status === 401){
          handleTokenExpired();
        }
      }
    };
    fetchData();
  }, [token, handleTokenExpired]);

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh">
      <Header />
      <Box display="flex" flexDirection="row" justifyContent="space-between" marginLeft="2rem" marginRight="2rem" marginTop="4rem">
        <Heading as="h3" color="#D8DFE9">Your groups</Heading>
        <Button onClick={onOpen}> Create group </Button>
        <GroupModal isOpen={isOpen} onClose={onClose} token={token} handleTokenExpired={handleTokenExpired}/>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        {groups.length === 0 ? (
          <Center width="100%" height="100%">
            <Heading as="h4" color="#D8DFE9">
              No Groups Available
            </Heading>
          </Center>
        ) : (
          <Flex direction="row" minWidth="max-content" gap={4}>
            {groups.map((group, index) => (
              <Box
                key={index}
                p={4}
              >
                <Text>group.name</Text>
              </Box> 
            ))}
          </Flex>
        )}
      </Box>
    </ Box>
  );
};

export default Groups;