///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');
var parser = require('./AssureNoteParser');

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        this.room = 'room';
        this.EditingNodes = [];
        this.MasterWGSN = '';
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

        socket.on('close', function (message) {
            console.log('close');
            if (self.EditingNodes.length != 0) {
                for (var i = 0; i < self.EditingNodes.length; i++) {
                    if (self.EditingNodes[i]["SID"] == socket.id) {
                        socket.broadcast.emit('finishedit', { Label: self.EditingNodes[i]['Label'], UID: self.EditingNodes[i]['UID'] });
                        self.EditingNodes.splice(i, 1);
                    }
                }
            } else {
                socket.broadcast.emit('close', "Window closed: " + socket.id);
            }
        });

        socket.on('sync', function (data) {
            socket.broadcast.emit('sync', data);
        });

        socket.on('startedit', function (data) {
            var datas = {};
            datas['Label'] = data.Label;
            datas['UID'] = data.UID;
            datas['IsRecursive'] = data.IsRecursive;
            datas['UserName'] = data.UserName;
            datas['SID'] = socket.id;
            console.log('data\'s socketID is ' + datas['SID']);
            socket.broadcast.emit('startedit', datas);
            self.EditingNodes.push(datas);
            console.log("this is editing list" + self.EditingNodes);
        });

        socket.on('finishedit', function (data) {
            socket.broadcast.emit('finishedit', data);
            for (var i = 0; i < self.EditingNodes.length; i++) {
                if (self.EditingNodes[i]['Label'] == data.Label) {
                    self.EditingNodes.splice(i, 1);
                }
            }
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
