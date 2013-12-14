///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');

var io: SocketManager = socketio.listen(3002);

io.sockets.on('connection', function (socket) {
    console.log('connection');
    socket.emit('news', { hello: 'world' });
    socket.on('my other event', function (data) {
        console.log(data);
    });
});
