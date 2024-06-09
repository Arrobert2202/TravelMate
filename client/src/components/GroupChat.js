import React, { useContext, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { SocketContext } from './SocketContext';
import { Header } from './Header';
import api from '../api';
import { Box, Heading, Text, Card, CardBody, Input, Button, useDisclosure, Modal, ModalOverlay, ModalContent, ModalCloseButton, ModalBody, ModalHeader, Image } from '@chakra-ui/react';
import { GroupModal } from './GroupModal';

const MessageBox = ( message, index) =>{
  //console.log(message);
  return(
    <div key={index}>
      { message.author ? (
        message.author.username === localStorage.getItem("username") ? (
        <Box display="flex" justifyContent="flex-end">
          <Card maxW="45%" width="fit-content" borderRadius="20px" marginY="3px">
            <CardBody>
              <Text fontWeight="bold">You</Text>
              {message.type === 'image' ? (
                  <Image src={message.imageUrl} alt="Sent image"/>
                ) : (
                  <Text>{message.content}</Text>
                )}
            </CardBody>
          </Card>
        </Box>
        ) : (
          <Box display="flex" justifyContent="flex-start">
            <Card maxW="45%" width="fit-content" borderRadius="20px" marginY="3px">
              <CardBody>
                <Text fontWeight="bold">{message.author.username}</Text>
                {message.type === 'image' ? (
                  <Image src={message.imageUrl} alt="Sent image"/>
                ) : (
                  <Text>{message.content}</Text>
                )}
              </CardBody>
            </Card>
          </Box>
        )
      ): (
        <Box key={index} display="flex" justifyContent="center">
          <Card maxW="45%" width="fit-content" borderRadius="20px" marginY="3px">
            <CardBody>
              <Text>{message.content}</Text>
            </CardBody>
          </Card>
        </Box>
      )}
    </div>
  );
};

const AttractionsModal = ({city, isOpen, onClose, token, handleTokenExpired}) => {
  const [ atttractions, setAttractions ] = useState([]);

  useEffect(() => {
    const fetchAttractions = async () => {
      try{
        const response = await api.post('/destination/attractions', { city }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAttractions(response.data);
      } catch(error) {
        console.error("Error getting attractions: ", error);
        if(error.response && error.response.stats === 401){
          handleTokenExpired();
        }
      }
    };
    fetchAttractions();
  }, [token, handleTokenExpired]);

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
          <ModalHeader>Tourist attractions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {atttractions.map((attraction, index) => (
              <Box key={index} display="flex" flexDirection="row">
                <Image src={attraction.photoUrl} alt={attraction.name} width="50px" height="50px" borderRadius="full" mr={4} />
                <Box display="flex" flexDirection="column">
                  <Text>{attraction.name}</Text>
                  <Text>{attraction.address}</Text>
                  <Text>Rating: {attraction.rating}({attraction.user_ratings_total} reviews)</Text>
                </Box>
              </Box>
            ))}
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

const AttractionsRouteModal = ({city, isOpen, onClose, token, handleTokenExpired}) => {
  const [ attractions, setAttractions ] = useState([]);

  useEffect(() => {
    const fetchAttractions = async () => {
      try{
        const response = await api.post('/destination/attractions/route', { city }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setAttractions(response.data);
        console.log("attractions: ", response.data);
      } catch(error) {
        console.error("Error getting attractions: ", error);
        if(error.response && error.response.stats === 401){
          handleTokenExpired();
        }
      }
    };
    fetchAttractions();
  }, [token, handleTokenExpired]);

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
          <ModalHeader>Tourist attractions</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {attractions.map((attraction, index) => (
              <Box key={index} display="flex" flexDirection="row" marginBottom="1rem">
                <Image src={attraction.photoUrl} alt={attraction.name} width="50px" height="50px" borderRadius="full" mr={4} objectFit="cover"/>
                <Box display="flex" flexDirection="column">
                  <Text>{attraction.name}</Text>
                  <Text>{attraction.address}</Text>
                </Box>
              </Box>
            ))}
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

const MembersModal = ({members, isOpen, onClose}) => {
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
          <ModalHeader>Members</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {members.map((member, index) => (
              <Box key={index}>{member.username}</Box>
            ))}
          </ModalBody>
        </ModalContent>
    </Modal>
  );
};

function GroupChat() {
  const { id: groupId } = useParams();  
  const { token, handleTokenExpired } = useContext(AuthContext);
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [existMoreMessages, setExitMoreMessages] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [ image, setImage ] = useState(null);
  const socket = useContext(SocketContext);
  const { isOpen: isOpenAttractionsModal, onOpen: onOpenAttractionsModal, onClose: onCloseAttractionsModal } = useDisclosure();
  const { isOpen: isOpenAttractionsRouteModal, onOpen: onOpenAttractionsRouteModal, onClose: onCloseAttractionsRouteModal } = useDisclosure();
  const { isOpen: isOpenEditModal, onOpen: onOpenEditModal, onClose: onCloseEditModal } = useDisclosure();
  const [ unreadMessages, setUnreadMessages ] = useState(false);
  const [ isAdmin, setIsAdmin] = useState(false);
  const { isOpen: isOpenMemberModal, onOpen: onOpenMemberModal, onClose: onCloseMemberModal } = useDisclosure();

  useEffect(() => {
    const fetchData = async() => {
      try{
        const response = await api.get(`/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        //console.log(response.data);
        setGroup(response.data);
        setMessages(response.data.messages);
        if(response.data.messages.length<20){
          setExitMoreMessages(false);
        }
        const member = response.data.members.find(member => member.userId.toString() === localStorage.getItem("userId").toString());
        if(member.unreadMessages > 0){
          console.log("there are unread messages ");
          setUnreadMessages(true);
        }
        //console.log(messages);
        if(unreadMessages){
          console.log("marked as read");
          markMessagesAsRead();
          setUnreadMessages(false);
        } else {
          scrollToBottom();
        }

        const admin = response.data.admins.find(admin => admin.id.toString() === localStorage.getItem("userId").toString());
        if(admin){
          setIsAdmin(true);
        }
      } catch(error){
        console.error("Error getting the group: ", error);
        if(error.response && error.response.status === 401){
          handleTokenExpired();
        }
      }
    };
    fetchData();
  }, [groupId, token, handleTokenExpired]);

  useEffect(() => {
    if(socket){
      socket.on('newMessage', ({groupId, newMessage}) => {
        console.log('Received new message: ', newMessage);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        if(newMessage.author.id.toString() === localStorage.getItem("userId")){
          scrollToBottom();
        } else {
          console.log("unread messages");
          setUnreadMessages(true);
        }
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [socket]);

  useEffect(() => {
    if (unreadMessages) {
      markMessagesAsRead();
      setUnreadMessages(false);
    } else {
      scrollToBottom();
    }
  }, [messages, unreadMessages]);

  const fetchMoreMessages = async() => {
    if (!existMoreMessages) return;

    try{
      const response = await api.get(`/groups/${groupId}/messages`, {
        params: {
          skip: messages.length,
          limit: 20
        }
      });

      const moreMessages = response.data;
      setMessages(prevMessages => [...moreMessages, ...prevMessages]);
      if( moreMessages.length < 20){
        setExitMoreMessages(false);
      }
    } catch (error){
      console.error('Error fetching more messages', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = (e) => {
    if(e.target.scrollTop === 0 && existMoreMessages){
      fetchMoreMessages();
    }

    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight && unreadMessages) {
      console.log("messages read");
      setUnreadMessages(false);
      markMessagesAsRead();
    }
  }

  const markMessagesAsRead = async () => {
    try{
      console.log("marcam citire");
      const response = await api.post(`/groups/${groupId}/messages/read`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if(response.status === 201) {
        console.log("Messages read successfully");
      }
    } catch (error) {
      console.error("Error marking messages as read: ", error);
    }
  }
  
  const handleNewMessage = async () => {
    if(newMessage.trim() !== ""){
      try{
        const response = await api.post(`/groups/${groupId}/message`, {
          content: newMessage,
          type: 'text',
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setNewMessage('');
        console.log("mesaj de trimis: ", response.data);
        socket.emit('sendNewMessage', { groupId, newMessage: response.data });
      } catch (error){
        console.error("Error sending message: ", error);
      }
    } else if(image) {
      try{
        const formData = new FormData();
        formData.append("image", image);

        const response = await api.post(`/groups/${groupId}/message/image`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        const imageUrl = response.data.imageUrl;
        console.log(imageUrl);
        socket.emit('sendNewMessage', { groupId, newMessage: response.data });
        setImage(null);
      } catch (error){
        console.error(error.message);
      }
    }
  };

  const handleEnter = async (event) => {
    if(event.keyCode === 13){
      handleNewMessage();
    } 
  }

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh" maxH="100vh" overflow="hidden">
        <Header />
        {group ? (
          <>
            <Box display="flex" flexDirection="row" justifyContent="space-between" marginLeft="2rem" marginTop="2rem" marginRight="2rem">
              <Box display="flex" flexDirection="row">
                <Heading as="h3" color="#D8DFE9" marginRight="1rem">{group.name}</Heading>
                <Button
                  onClick={onOpenAttractionsModal}
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                  marginRight="1rem"
                >
                  Attractions
                </Button>
                <Button
                  onClick={onOpenAttractionsRouteModal}
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                >
                  Attractions Route
                </Button>
                <AttractionsModal city = {group.destination.city} isOpen = {isOpenAttractionsModal} onClose={onCloseAttractionsModal} token={token} handleTokenExpired={handleTokenExpired}/>
                <AttractionsRouteModal city = {group.destination.city} isOpen = {isOpenAttractionsRouteModal} onClose={onCloseAttractionsRouteModal} token={token} handleTokenExpired={handleTokenExpired}/>
              </Box>
              <Box display="flex" flexDirection="row">
                <Button
                  onClick={onOpenMemberModal}
                  _hover={{
                    transform: "scale(1.05)",
                  }}
                  style={{
                    transition: "transform 0.3s ease",
                  }}
                  marginRight="1rem"
                >
                  Members
                </Button>
                <MembersModal members={group.members} isOpen={isOpenMemberModal} onClose={onCloseMemberModal}/>
                { isAdmin && (
                  <div>
                    <Button
                      onClick={onOpenEditModal}
                      _hover={{
                        transform: "scale(1.05)",
                      }}
                      style={{
                        transition: "transform 0.3s ease",
                      }}
                    >
                      Edit group
                    </Button>
                    <GroupModal isOpen={isOpenEditModal} onClose={onCloseEditModal} isEditing={true} token={token} handleTokenExpired={handleTokenExpired} socket={socket} group={group}/>
                </div>
                )}
              </Box>
            </Box>
            <Box id="chatbox" flex={1} p="2rem" m="2rem" marginTop="2rem" border="1px solid #D8DFE9" borderRadius="8px" overflowY="auto" onScroll={handleScroll}>
              {messages.map((message, index) => MessageBox(message, index))}
              <div ref={messagesEndRef} />
            </Box>
            <Box display="flex" flexDirection="row" p="2rem">
              <Input placeholder='Message' color="#D8DFE9" value={newMessage} onChange={(e) => {setNewMessage(e.target.value)}} onKeyDown={handleEnter}/>
              <Input type="file" accept="image/*" onChange={(e) => {setImage(e.target.files[0])}} color="#D8DFE9"/>
              <Button onClick={() => handleNewMessage()}>Send</Button>
            </Box>
          </>
        ) : (
          <Text color="#D8DFE9">Loading...</Text>
        )}
    </Box>
  );
};

export default GroupChat;