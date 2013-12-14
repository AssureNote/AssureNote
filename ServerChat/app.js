///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        this.room = 'room';
        var self = this;
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            self.EnableListeners(socket);
            socket.join(self.room);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', { id: socket.id, list: self.GetUserList() });
            socket.broadcast.emit('join', { id: socket.id, list: self.GetUserList() });
        });

        this.io.sockets.on('disconnect', function (socket) {
            socket.unjoin(self.room);
            console.log('id: ' + socket.id + ' leave');
            socket.broadcast.emit('leave', { id: socket.id, list: self.GetUserList() });
        });
    }
    AssureNoteServer.prototype.EnableListeners = function (socket) {
        socket.on('message', function (message) {
            socket.broadcast.emit('message', message);
        });
    };

    AssureNoteServer.prototype.GetUserList = function () {
        var res = [];
        var Clients = this.io.sockets.clients(this.room);
        for (var i in Clients) {
            res.push(Clients[i].id);
        }
        return res;
    };
    return AssureNoteServer;
})();

new AssureNoteServer();

//# sourceMappingURL=app.js.map
