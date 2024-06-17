import React, { useContext, useState, useEffect} from 'react';
import { AuthContext } from './AuthContext';
import api from '../api';
import { LoggedHeader } from './Header';
import { Heading, Box, Input, Text, Flex, IconButton, Button, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader, useDisclosure, FormControl, FormLabel, Select } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const ChanePasswordModal = ({ isOpen, onClose, token, handleTokenExpired }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    onClose();
  };

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError('Confirm password has to match with the new password');
      return;
    }

    try{
      const response = await api.post('/user/change-password', {currentPassword, newPassword}, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      handleClose();
      alert(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpired();
      } else {
        console.error('Error changing password:', error);
        setError(error.response ? error.response.data.message : 'Error changing password');
      }
    }
  }

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
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl mt={4}>
              <FormLabel>Current Password</FormLabel>
              <Input type='password' placeholder='current password' value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              {error && <Text color="red">{error}</Text>}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>New Password</FormLabel>
              <Input type='password' placeholder='new password' value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              {error && <Text color="red">{error}</Text>}
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Confirm Password</FormLabel>
              <Input type='password' placeholder='confirm password' value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              {error && <Text color="red">{error}</Text>}
            </FormControl>
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

const DeleteAccountModal = ({ isOpen, onClose, token, handleTokenExpired, handleLogout }) => {
  const [error, setError] = useState('');

  const handleDeleteAccount = async () => {
    try{
      const response = await api.delete('/user/delete-account', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log(response.data);
      alert(response.data);
      handleLogout();
    } catch (error) {
      if (error.response && error.response.status === 401) {
        handleTokenExpired();
      } else {
        console.error('Error deleting the account:', error);
        setError(error.response ? error.response.data.message : 'Error deleting the account');
      }
    }
  };

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
        <ModalContent maxHeight="90vh" overflow="auto">
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Text color="black">Are you sure you want to delete this account?</Text>
            {error && <Text color="red">{error}</Text>}
            <Box display="flex" justifyContent="space-between">
              <Button colorScheme="blue" mr={3} onClick={handleDeleteAccount} mt={4}>
                Delete
              </Button>
              <Button onClick={onClose} mt={4}>Cancel</Button>
            </Box>
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

function Profile() {
  const { token, handleTokenExpired, logout } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const { isOpen: isChangePasswordOpen, onOpen: onChangePasswordOpen, onClose: onChangePasswordClose } = useDisclosure();
  const { isOpen: isDeleteAccountOpen, onOpen: onDeleteAccountOpen, onClose: onDeleteAccountClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try{
        const response = await api.get('/user', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUser(response.data);
      } catch(error){
        console.error("Error getting the user: ", error);
        if(error.response && error.response.status === 401){
          handleTokenExpired();
        }
      }
    };

    if(token){
      fetchUser();
    }
  }, [token, handleTokenExpired]);

  const handleLogout = async () => {
    await logout();
    localStorage.removeItem('token');
    navigate('/login');
  }

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh" maxH="100vh" overflow="hidden">
      <LoggedHeader />
      <Box display="flex" flexDirection="row" p={4}>
        <Box mb={4} maxWidth="50%" width="100%" justifyContent="center" alignItems="center">
          {user && (
            <>
              <Text color="#D8DFE9">Username: {user.username}</Text>
              <Text color="#D8DFE9">Email: {user.email}</Text>
            </>
          )}
        </Box>
        <Box display="flex" flexDirection="column" gap={3}>
          <Button
            onClick={onChangePasswordOpen}
            _hover={{
              transform: "scale(1.05)",
            }}
            style={{
              transition: "transform 0.3s ease",
            }}
          >Change Password</Button>
          <ChanePasswordModal isOpen={isChangePasswordOpen} onClose={onChangePasswordClose} token={token} handleTokenExpired={handleTokenExpired}/>
          <Button
            onClick={onDeleteAccountOpen}
            _hover={{
              transform: "scale(1.05)",
            }}
            style={{
              transition: "transform 0.3s ease",
            }}
          >Delete Account</Button>
          <DeleteAccountModal isOpen={isDeleteAccountOpen} onClose={onDeleteAccountClose} token={token} handleTokenExpired={handleTokenExpired} handleLogout={handleLogout} />
          <Button
            onClick={handleLogout}
            _hover={{
              transform: "scale(1.05)",
            }}
            style={{
              transition: "transform 0.3s ease",
            }}
          >Logout</Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Profile;