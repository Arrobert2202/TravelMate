import { Box, Flex, Text, Button, Modal, ModalOverlay, ModalContent, ModalCloseButton, FormControl, FormLabel, ModalBody, ModalHeader, Input, Select, IconButton, useRangeSlider, useDisclosure } from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';
import api from '../api';
import React, { useContext, useEffect, useState } from 'react';
import { GoogleMap, useLoadScript, Marker } from '@react-google-maps/api';
import { isEditable } from '@testing-library/user-event/dist/utils';

const MapModal = ({isOpen, onClose, city, onSelectLocation, setAccomodationAddress, isEditing, markerCoords}) => {
  const [ cityCoords, setCityCoords] = useState({ lat: 0, lng: 0});
  const [ marker, setMarker ] = useState(null);

  const mapContainerStyle = {
    width: '100%',
    height: '60vh',
  };

  const libraries = ['places'];
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyCXflpLy4A5tOC85UW5hYv_AEmfN3ZVmtI',
    libraries: libraries,
  });

  useEffect(() => {
    const fetchCityCoords = async () => {
    if ( isLoaded && city) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const results = await geocoder.geocode({ address: city });
      if (results.results && results.results.length>0) {
        console.log("salcf");
        const lat = results.results[0].geometry.location.lat();
        const lng = results.results[0].geometry.location.lng();
        setCityCoords({ lat, lng });

        if(isEditing && markerCoords && !marker){
          setMarker({
            lat: markerCoords.lat,
            lng: markerCoords.lng,
          });
          console.log("marker edit: ", marker);
        }
      }
    } catch(error) {
      console.error("Geocoding was not successful:", error);
      }
    }
    };

    fetchCityCoords();
  }, [city, isLoaded, isEditing, markerCoords]);

  const handleMapClick = (e) => {
    console.log(e.latLng.lat());
    setMarker({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
    console.log(marker);
  };

  const handleSelectLocation = async () => {
    if (marker) {
      const geocoder = new window.google.maps.Geocoder();
      const latlng = { lat: marker.lat, lng: marker.lng };
  
      try {
        const response = await geocoder.geocode({ location: latlng });
        if (response && response.results && response.results.length > 0) {
          const address = response.results[0].formatted_address;
          console.log("new address ", address);
          setAccomodationAddress(address);
          onSelectLocation(latlng);
          onClose();
        } else {
          console.error("No address found for selected location");
        }
      } catch (error) {
        console.error("Error geocoding location:", error);
      }
    }
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading maps</div>;
  }

  return(
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      motion
    >
      <ModalOverlay
        bg='blackAlpha.300'
        backdropFilter='blur(10px)'
      />
        <ModalContent overflow="auto">
          <ModalHeader>Choose accomodation location</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={10}
              center={cityCoords}
              onClick={handleMapClick}
            >
              {marker ? <Marker position={marker} /> : null}
              <Button colorScheme="blue" onClick={handleSelectLocation} mt={4}>
                Select Location
              </Button>
            </GoogleMap>
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

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
  const [accomodationLocation, setAccomodationLocation] = useState(null);
  const [accomodationAddress, setAccomodationAddress] = useState(null);
  const { isOpen: isOpenMap, onOpen: onOpenMap, onClose: onCloseMap } = useDisclosure();

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
    if(isEditing && group){
      console.log(group);
      setGroupName(group.name);
      setMembers(group.members);
      setSelectedCountry(group.destination.country);
      fetchStates(selectedCountry);
      setSelectedState(group.destination.state);
      fetchCities(selectedCountry, selectedState);
      setSelectedCity(group.destination.city);
      setAccomodationAddress(group.location.address);
      setAccomodationLocation(group.location.coordinates);
      console.log("effect");
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
      if(isEditing && group){
        setSelectedState(group.destination.state);
        fetchCities(country, group.destination.state);
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
      if(isEditing && group) {
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
    setSelectedCity(e.target.value);
  };

  const handleAddMember = async () => {
    try {
      const isMemberAlreadyAdded = members.some(member => member.username === memberName);
      if(isMemberAlreadyAdded || memberName === localStorage.getItem("username")){
        setMemberError('User already in the list');
        return;
      }

      const response = await api.post('/user/validate', {username: memberName}, {
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
      setAdminError('');
      const isAdminAlreadyAdded = admins.some(admin => admin.username === adminName);
      if(isAdminAlreadyAdded){
        setAdminError('Already an admin');
        return;
      }

      const isMember = members.some(member => member.username === adminName);
      if(!isMember){
        setAdminError('Not a member');
        return;
      }

      const response = await api.post('/user/validate', {username: adminName}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log("saluti: ", response.data.exists); 
      if(response.data.exists) {
        console.log("saluti: ", response.data); 
        setAdmins([...admins, { id: response.data.userId, username: adminName}]);
        setAdminName('');
        setAdminError('');
      } else {
        setAdminError('User not found');
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
    console.log(group);
    try {
      if(isEditing && group){
        group.name = groupName;
        group.destination.country = selectedCountry;
        group.destination.state = selectedState;
        group.destination.city = selectedCity;
        group.members = members;
        group.admins = admins;
        group.location.address = accomodationAddress;
        group.location.coordinates = accomodationLocation;

        const updatedGroup = {
          name: groupName,
          destination: {
            country: selectedCountry,
            state: selectedState,
            city: selectedCity
          },
          location: {
            address: accomodationAddress,
            coordinates: accomodationLocation
          },
          members: members,
          admins: admins
        };
        const response = await api.post(`/groups/${group._id}/update`, updatedGroup, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const newGroup = response.data;
        console.log('Group created:', newGroup);
        onClose();
      } else {
        const newGroup = {
          name: groupName,
          country: selectedCountry,
          state: selectedState,
          city: selectedCity,
          address: accomodationAddress,
          coordinates: accomodationLocation,
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
      }
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

  const handleSelectLocation = (coords) => {
    console.log("coords: ", coords);
    setAccomodationLocation(coords);
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
              <FormLabel>Accomodation location</FormLabel>
              <Button
                  onClick={onOpenMap}
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                  marginRight="1rem"
                  isDisabled={!selectedCity}
                >
                  Select on map
                </Button>
                {accomodationAddress && (
                  <Text mt={4} fontWeight="bold">Accommodation Address: {accomodationAddress}</Text>
                )}
                <MapModal isOpen={isOpenMap} onClose={onCloseMap} city={selectedCity} onSelectLocation={handleSelectLocation} setAccomodationAddress={setAccomodationAddress} isEditing={isEditing} markerCoords={isEditing && group ? group.location.coordinates : null}/>
          </FormControl>
          <FormControl mt={4}>
            <FormLabel>Add member</FormLabel>
            <Input placeholder='Username' value={memberName} onChange={(e) => setMemberName(e.target.value)} />
            <Button mt={2} onClick={handleAddMember}>Add member</Button>
            {memberError && <Text color="red">{memberError}</Text>}
          </FormControl>
          <Box mt={4}>
            <Text as='b'>Members:</Text>
            <Flex wrap="wrap" maxWidth="100%">
              {members.filter((member) => member.username !== localStorage.getItem("username"))
                .map((member, index) => (
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
                  {admins.filter((admin) => admin.username !== localStorage.getItem("username"))
                    .map((admin, index) => (
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

