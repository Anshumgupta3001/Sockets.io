const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let users = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('user_connected', (userId) => {
        users.push({ id: userId, socketId: socket.id });
        io.emit('user_list', users);
        io.emit('message', { userId: userId, message: 'User connected', color: 'green' });
    });

    socket.on('disconnect', () => {
        const disconnectedUser = users.find(user => user.socketId === socket.id);
        if (disconnectedUser) {
            io.emit('message', { userId: disconnectedUser.id, message: 'User disconnected', color: 'yellow' });
            setTimeout(() => {
                io.emit('message', { userId: disconnectedUser.id, message: 'User disconnected', color: 'red' });
                users = users.filter(user => user.socketId !== socket.id);
                io.emit('user_list', users);
            }, 5000);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
