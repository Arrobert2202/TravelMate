export const navigateTo = (path) => {
  window.location.href = path;
};

export const socketAuth = async (socket, token) => {
  try{
    socket.emit('authenticate', token);
  } catch (error){
    console.error('Error sending the token');
  }
};