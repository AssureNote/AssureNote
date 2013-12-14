///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            console.log('id: ' + socket.id + ' connected');
            socket.broadcast.emit('join', { id: socket.id, list: this.GetUserList() });
        });

        this.io.sockets.on('disconnect', function (socket) {
            console.log('id: ' + socket.id + ' leave');
            socket.broadcast.emit('leave', { id: socket.id, list: this.GetUserList() });
        });
    }
    AssureNoteServer.prototype.GetUserList = function () {
        return [];
    };
    return AssureNoteServer;
})();

new AssureNoteServer();

//# sourceMappingURL=app.js.map
