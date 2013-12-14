///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');

class AssureNoteServer {
    io: SocketManager;
    constructor() {
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            console.log('id: ' + socket.id + ' connected');
            socket.broadcast.emit('join', {id: socket.id, list: this.GetUserList()});
        });
        
        this.io.sockets.on('disconnect', function (socket) {
            console.log('id: ' + socket.id + ' leave');
            socket.broadcast.emit('leave', {id: socket.id, list: this.GetUserList()});
        });
    }

    GetUserList() {
        return [];
    }
}

new AssureNoteServer();
