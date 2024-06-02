import { Box, Flex, Text, Button, Modal, ModalOverlay, ModalContent, ModalCloseButton, FormControl, FormLabel, ModalBody, ModalHeader, Input, Select, IconButton, useRangeSlider } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import api from '../api';
import React, { useContext, useEffect, useState } from 'react';

export const GroupModal = ({isOpen, onClose, isEditing, token, handleTokenExpired, addNewGroup, socket, group}) => {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [groupName, setGroupName] = useState('');
  const [memberName, setMemberName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [members, setMembers] = useState([]);
  const [memberError, setMemberError] = useState('');
  const [adminError, setAdminError] = useState('');
  const [admins, setAdmins] = useState([]);

  useEffect(() => {
    console.log(localStorage.getItem("username"));
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

  useEffect(() => {
    if(isEditing){
      setGroupName(group.name);
      setMembers(group.members);
      setSelectedCountry(group.destination.country);
      fetchStates(selectedCountry);
      setSelectedState(group.destination.state);
      fetchCities(selectedCountry, selectedState);
      setSelectedCity(group.destination.city);
      setAdmins(group.admins);
      setAdminError('');
      setMemberError('');
    }
  }, [isOpen, group]);

  const fetchStates = async (country) => {
    try{
      const response = await api.post('/destination/states', { country }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setStates(response.data);
      setCities([]);
      if(group){
        setSelectedState(group.destination.state);
      } else {
        setSelectedState('');
      }
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
      if(group) {
        setSelectedCity(group.destination.city);
      } else {
        setSelectedCity('');
      }
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
      const isMemberAlreadyAdded = members.some(member => member.username === memberName);
      if(isMemberAlreadyAdded || memberName === localStorage.getItem("username")){
        setMemberError('User already in the list');
        return;
      }

      const response = await api.post('/users/validate', {username: memberName}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if(response.data.exists) {
        setMembers([...members, { userId: response.data.userId, username: memberName}]);
        setMemberName('');
        setMemberError('');
      } else {
        setMemberError('User not found');
      }
    } catch(error) {
      console.error("Error validating the user: ", error);
      if(error.response && error.response.status === 401){
        handleTokenExpired();
      } else {
        setMemberError('An error occurred while validating the user');
      }
    }
  };

  const handleAddAdmin = async () => {
    try {
      const isAdminAlreadyAdded = admins.some(admin => admin.username === adminName);
      if(isAdminAlreadyAdded){
        setAdminError('Already an admin');
        return;
      }

      const response = await api.post('/users/validate', {username: memberName}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if(response.data.exists) {
        setAdmins([...admins, { id: response.data.userId, username: memberName}]);
        setAdminName('');
        setAdminError('');
      } else {
        setAdminError('User not found');
        return;
      }

      const isMember = members.some(member => member.username === adminName);
      if(!isMember){
        setAdminError('Not a member');
        return;
      }
    } catch(error) {
      console.error("Error validating the user: ", error);
      if(error.response && error.response.status === 401){
        handleTokenExpired();
      } else {
        setAdminError('An error occurred while validating the user');
      }
    }
  };
  
  const handleSubmit = async () => {
    try {
      console.log("members: ", members);
      const memberIds = members.map(member => member.userId);
      const newGroup = {
        name: groupName,
        country: selectedCountry,
        state: selectedState,
        city: selectedCity,
        members: [...members, { userId: localStorage.getItem("userId"), username: localStorage.getItem("username")}],
        message: "Welcome to your next trip!!",
        admins: [{ id: localStorage.getItem("userId"), username: localStorage.getItem("username")}]
      };
      const response = await api.post('/groups/create', newGroup, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const group = response.data;
      console.log('Group created:', group);
      socket.emit('receiveNewGroup', group);
      addNewGroup(response.data); 
      onClose();
    } catch (error) {
      console.error("Error creating the group: ", error);
    }
  };

  const handleRemoveMember = (username) => {
    setMembers(members.filter(member => member.username !== username));
  };

  const handleRemoveAdmin = (username) => {
    setAdmins(admins.filter(admin => admin.username !== username ));
  };

  const handleClose = () => {
    if(isEditing){
      onClose();
    } else {
      setGroupName('');
      setMemberName('');
      setAdminName('');
      setAdminError('');
      setMemberError('');
      setAdmins([]);
      setMembers([]);
      setSelectedCountry('');
      setSelectedState('');
      setSelectedCity('');
      onClose();
    }
  };

  return(
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      motionPreset="scale"
    >
      <ModalOverlay
      bg='blackAlpha.300'
      backdropFilter='blur(10px)'
      />
      <ModalContent maxHeight="90vh" overflow="auto">
        <ModalHeader>{isEditing ? "Edit group" : "Create a new group" }</ModalHeader>
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
            <FormLabel>Add member</FormLabel>
            <Input placeholder='Username' value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <Button mt={2} onClick={handleAddMember}>Add member</Button>
            {memberError && <Text color="red">{memberError}</Text>}
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
          {isEditing && (
            <div>
              <FormControl mt={4}>
                <FormLabel>Add admin</FormLabel>
                <Input placeholder='Username' value={adminName} onChange={(e) => setAdminName(e.target.value)} />
                <Button mt={2} onClick={handleAddAdmin}>Add admin</Button>
                {adminError && <Text color="red">{adminError}</Text>}
              </FormControl>
              <Box mt={4}>
                <Text as='b'>Admins:</Text>
                <Flex wrap="wrap" maxWidth="100%">
                  {admins.map((admin, index) => (
                    <Flex key={index} alignItems="center" m={1} p={2} borderWidth="1px" borderRadius="md">
                      <Text mr={2}>{admin.username}</Text>
                      <IconButton
                        aria-label="Remove admin"
                        icon={<CloseIcon />}
                        size="sm"
                        onClick={() => handleRemoveAdmin(admin.username)}
                      />
                    </Flex>
                  ))}
                </Flex>
              </Box>
            </div>
          )}
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

