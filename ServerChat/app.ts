///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');
import parser = require('./AssureNoteParser');

class AssureNoteServer {
    io: SocketManager;
    room: string = 'room';
    EditingNodes: any[] = [];
    WGSNName: string = null;
    MasterRecord: parser.GSNRecord = null;

    constructor() {
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', (socket: Socket) => {
            this.EnableListeners(socket);
            socket.join(this.room);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', {
                id   : socket.id,
                list : this.GetUserList(),
                name : this.WGSNName,
                WGSN : this.GetLatestWGSN()
            });
            socket.broadcast.emit('join', {id: socket.id, list: this.GetUserList()});

            socket.on('disconnect', () => {
                /* cast to any since d.ts does not support socket.leave */
                (<any>socket).leave(this.room);

                console.log('id: ' + socket.id + ' leave');
                console.log('close');
                socket.broadcast.emit('leave', {id: socket.id, list: this.GetUserList()});
                if (this.EditingNodes.length != 0) {
                    for (var i:number = 0; i < this.EditingNodes.length; i++) {
                        if (this.EditingNodes[i]["SID"] == socket.id) {
                            socket.broadcast.emit('finishedit', {Label:this.EditingNodes[i]['Label'], UID:this.EditingNodes[i]['UID']});
                            socket.broadcast.emit('close', "Window Closed");
                            this.EditingNodes.splice(i, 1);
                        }
                    }
                } else {
                    socket.broadcast.emit('close', "Window closed: " + socket.id);
                }
            });
        });
    }

    EnableListeners(socket: Socket) {
        socket.on('message', (message: string) => {
            socket.broadcast.emit('message', message);
        });

        socket.on('update', (data: {name: string; WGSN: string}) => {
            if (this.WGSNName == null) this.WGSNName = data.name;
            var NewRecord: parser.GSNRecord  = new parser.GSNRecord();
            NewRecord.Parse(data.WGSN);
            if (this.MasterRecord == null) {
                this.MasterRecord = NewRecord;
            } else {
                this.MasterRecord.Merge(NewRecord);
            }
            data.WGSN = this.GetLatestWGSN();
            socket.broadcast.emit('update', data);
        });

        socket.on('sync', (data: {X: number; Y: number; Scale: number}) => {
            console.log('=================================syncfocus');
            socket.broadcast.emit('syncfocus', data);
        });

        socket.on('fold', (data: {IsFolded: boolean; UID: number}) => {
            socket.broadcast.emit('fold', data);
        });

        socket.on('startedit', (data: {Label: string; UID: number; IsRecursive: boolean; UserName: string}) => {
            var datas = {};
            datas['Label'] = data.Label;
            datas['UID']   = data.UID;
            datas['IsRecursive'] = data.IsRecursive;
            datas['UserName']    = data.UserName;
            datas['SID']    = socket.id;
//            console.log('data\'s socketID is ' + datas['SID']);
            socket.broadcast.emit('startedit', datas);
            this.EditingNodes.push(datas);
            console.log("this is editing list" + this.EditingNodes);
        });

        socket.on('finishedit', (data: {Label: string; UID: number}) => {
            socket.broadcast.emit('finishedit', data);
            for (var i: number = 0; i < this.EditingNodes.length; i++) {
                if (this.EditingNodes[i]['Label'] == data.Label) {
                    this.EditingNodes.splice(i, 1);
                }
            }
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

    GetLatestWGSN() {
        if (!this.MasterRecord) return null;
        var Writer: parser.StringWriter = new parser.StringWriter();
        this.MasterRecord.FormatRecord(Writer);
        return Writer.toString();
    }

    Parse(WGSN: string) : parser.GSNNode {
        var Reader: parser.StringReader  = new parser.StringReader(WGSN);
        var Parser: parser.ParserContext = new parser.ParserContext(null);
        var GSNNode: parser.GSNNode      = Parser.ParseNode(Reader);
        return GSNNode;
    }
}

new AssureNoteServer();
