const socketIO = require('socket.io');

const handleSocketEvents = (server) => {
    const io = socketIO(server);

    io.on('connection', (socket) => {
        console.log('User connected:', socket.id);

        // Join a room (note) when requested by the client
        socket.on('joinRoom', (room) => {
            console.log('User joining room:', room);
            socket.join(room);
        });

        // Listen for note updates from the client
        socket.on('updateNote', (room, updatedNote) => {
            console.log('Note updated in room:', room);
            // Emit the updated note to all clients in the room
            io.to(room).emit('noteUpdated', updatedNote);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log('User disconnnection:', socket.id);
        });
    });
};

module.exports = handleSocketEvents;

