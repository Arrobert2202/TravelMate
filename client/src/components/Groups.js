import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';
import { LoggedHeader } from './Header';
import { Box, Heading, Flex, Text, Button, Center, useDisclosure } from '@chakra-ui/react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { SocketContext } from './SocketContext';
import { GroupModal } from './GroupModal';

const GroupBox = ({group}) => {
  const [lastMessage, setLastMessage] = useState(null);
  const [author, setAuthor] = useState(null);
  const navigate = useNavigate();
  const [unreadMessages, setUnreadMessages] = useState(null);

  useEffect(() => {
    if (group.messages.length > 0){
      const lastMsg = group.messages[group.messages.length-1];
      if(lastMsg.type === 'text'){
        setLastMessage(lastMsg.content);
      } else if(lastMsg.type === 'image'){
        setLastMessage('sent an image');
      }
      setAuthor(lastMsg.author);
      const member = group.members.find(member => member.userId === localStorage.getItem("userId"));
      setUnreadMessages(member.unreadMessages);
    }
  }, [group.messages]);

  const handleGroup = (groupId) => {
    navigate(`/group-chat/${groupId}`);
  }

  return(
    <Box
      flex={1}
      height="100%"
      p={4}
      flexDirection="row"
      justifyContent="space-between"
      border={unreadMessages === 0 ? "1px solid #D8DFE9" : "3px solid #04566E "} 
      borderRadius="8px"
      _hover={{
        transform: "scale(1.01)",
      }}
      style={{
        transition: "transform 0.3s ease",
      }}
      onClick={() => handleGroup(group._id)}
      cursor="pointer"
    >
      <Flex justify="space-between" align="center">
        <Box>
        <Text fontWeight="bold" color="#D8DFE9">{group.name}</Text>
        {lastMessage ? (
          <Text color="#D8DFE9">
            {author ? (
              author.id === localStorage.getItem("userId") ? (
                <>You: {lastMessage}</>
              ) : (
                <>{author.username}: {lastMessage}</>
              )
            ) : (
              <>{lastMessage}</>
            )}
          </Text>
        ) : (
          <Text color="#D8DFE9">No messages yet</Text>
        )}
      </Box>
      {unreadMessages !== 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          border="1px solid transparent"
          backgroundColor="#04566E"
          borderRadius="50%"
          color="#D8DFE9"
          width="2rem"
          height="2rem"
        >
          {unreadMessages}
        </Box>
      )}
      </Flex>
    </Box>
  );
};

function Groups() {
  const { token, handleTokenExpired } = useContext(AuthContext);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ groups,  setGroups ] = useState([]); 
  const socket = useContext(SocketContext);

  useEffect(() => {
    const fetchData = async() => {
      try{
        const response = await api.get('/groups/user-groups', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const sortedGroups = response.data.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
        setGroups(sortedGroups);
      } catch(error) {
        console.error("Error getting the groups: ", error);
        if(error.response && error.response.status === 401){
          handleTokenExpired();
        }
      }
    };
    fetchData();
  }, [token, handleTokenExpired]);

  useEffect(() => {
    if(socket){
    socket.on('newGroup', (newGroup) => {
      console.log("new group: ", newGroup);
      setGroups((prevGroups) => [...prevGroups, newGroup].sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)));
    });

    socket.on('newMessage', ({ groupId, newMessage }) => {
      console.log("New message received: ", newMessage);
      setGroups((prevGroups) => {
        const updatedGroups = prevGroups.map(group => {
          if (group._id === groupId) {
            const currentMember = group.members.find(member => member.userId === localStorage.getItem("userId"));
            return {
              ...group,
              messages: [...group.messages, newMessage],
              lastModified: new Date(),
              members: group.members.map(member => {
                if (member.userId === localStorage.getItem("userId")) {
                  return {
                    ...member,
                    unreadMessages: currentMember.unreadMessages + 1
                  };
                }
                return member;
              })
            };
          }
          return group;
        });
        return updatedGroups.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));
      });
    });

    return () => {
      socket.off('newGroup');
      socket.off('newMessage');
    };
    }
  }, [socket]);

  const addNewGroup = (newGroup) => {
    //setGroups([...groups, newGroup]);
  };

  return(
    <Box display="flex" flexDirection="column" bg="#022831" minH="100vh" maxH="100vh" overflow="hidden">
      <LoggedHeader />
      <Box display="flex" flexDirection="row" justifyContent="space-between" marginLeft="2rem" marginRight="2rem" marginTop="4rem" marginBottom="2rem">
        <Heading as="h3" color="#D8DFE9">Your groups</Heading>
        <Button 
          onClick={onOpen} 
          _hover={{
            transform: "scale(1.05)",
          }}
          style={{
            transition: "transform 0.3s ease",
          }}> Create group </Button>
        <GroupModal isOpen={isOpen} onClose={onClose} isEditing={false} token={token} handleTokenExpired={handleTokenExpired} addNewGroup={addNewGroup} socket={socket}/>
      </Box>
      <Box flex="1" display="flex" flexDirection="column" alignItems="center" justifyContent="space-around" justifySelf="center" alignSelf="center" width="96%" height="100%" maxH="90%" overflowY="auto" p={4} marginBottom="2rem" border="1px solid #D8DFE9" borderRadius="8px">
        {groups.length === 0 ? (
          <Center width="100%" height="100%">
            <Heading as="h4" color="#D8DFE9">
              No Groups Available
            </Heading>
          </Center>
        ) : (
            <Flex direction="column" gap={4} width="100%">
              {groups.map((group, index) => (
                <GroupBox key={index} group={group}/> 
              ))}
            </Flex>
        )}
      </Box>
    </ Box>
  );
};

export default Groups;