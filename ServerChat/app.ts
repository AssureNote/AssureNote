///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');
import parser = require('./AssureNoteParser');

class AssureNoteServer {
    io: SocketManager;
    room: string = 'room';
    EditingNodes: any[] = [];
    MasterWGSN  : string = '';

    constructor() {
        var self = this;
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket: Socket) {
            self.EnableListeners(socket);
            socket.join(self.room);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', {id: socket.id, list: self.GetUserList()});
            socket.broadcast.emit('join', {id: socket.id, list: self.GetUserList()});
        });

        this.io.sockets.on('disconnect', function (socket: Socket) {
            socket.unjoin(self.room);
            console.log('id: ' + socket.id + ' leave');
            socket.broadcast.emit('leave', {id: socket.id, list: self.GetUserList()});
        });
    }

    EnableListeners(socket: Socket) {
        var self = this;
        socket.on('message', function(message: string) {
            socket.broadcast.emit('message', message);
        });
        socket.on('update', function(data: {name: string; WGSN: string}) {
            socket.broadcast.emit('update', data);
        });
        socket.on('startedit', function(data: {Label: string; UID: number}) {
            self.EditingNodes.push(data);
            console.log("this is the data we receive" + data);
            console.log("this is editing list" + this.EditingNodes);
            socket.broadcast.emit('startedit', data);
            data['socketId'] = socket.id;
        });
        socket.on('finishedit', function(data: {Label: string; UID: number}) {
            socket.broadcast.emit('finishedit', data);
        });
    }

    GetUserList() {
        var res = [];
        var Clients: Socket[] = this.io.sockets.clients(this.room);
        for (var i in Clients) {
            res.push(Clients[i].id);
        }
        return res;
    }

    Parse(WGSN: string) : parser.GSNNode {
        var Reader: parser.StringReader  = new parser.StringReader(WGSN);
        var Parser: parser.ParserContext = new parser.ParserContext(null);
        var GSNNode: parser.GSNNode      = Parser.ParseNode(Reader);
        return GSNNode;
    }
}

new AssureNoteServer();
