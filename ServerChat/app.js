///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');
var parser = require('./AssureNoteParser');

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        this.room = 'room';
        this.EditingNodes = [];
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
        var self = this;
        socket.on('message', function (message) {
            socket.broadcast.emit('message', message);
        });
        socket.on('update', function (data) {
            socket.broadcast.emit('update', data);
        });
        socket.on('startedit', function (data) {
            data['socketId'] = socket.id;
            self.EditingNodes.push(data);
            console.log("this is editing list" + this.EditingNodes);
            socket.broadcast.emit('startedit', data);
        });
        socket.on('finishedit', function (data) {
            socket.broadcast.emit('finishedit', data);
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

    AssureNoteServer.prototype.Parse = function (WGSN) {
        var Reader = new parser.StringReader(WGSN);
        var Parser = new parser.ParserContext(null);
        var GSNNode = Parser.ParseNode(Reader);
        return GSNNode;
    };
    return AssureNoteServer;
})();

new AssureNoteServer();
