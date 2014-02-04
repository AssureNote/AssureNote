///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');
import parser = require('./AssureNoteParser');

export class UserStatus {
    constructor (public User: string, public Mode: number, public SID: string) { }
}

class AssureNoteServer {
    io: SocketManager;
    room: string = 'room';
    UsersInfo: any[] = [];
    EditNodeInfo: any[] = [];
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
                if (this.EditNodeInfo.length != 0) {
                    for (var i:number = 0; i < this.EditNodeInfo.length; i++) {
                        if (this.EditNodeInfo[i]["SID"] == socket.id) {
                            socket.broadcast.emit('finishedit', {Label:this.EditNodeInfo[i]['Label'], UID:this.EditNodeInfo[i]['UID']});
                            this.EditNodeInfo.splice(i, 1);
                        }
                    }
                }
                socket.broadcast.emit('close', socket.id);
                for (var i: number = 0; i< this.UsersInfo.length; i++){
                    if (this.UsersInfo[i]["SID"] == socket.id) {
                        this.UsersInfo.splice(i, 1);
                    }
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

        socket.on('adduser', (data: {User: string; Mode: number}) => {
            var Info: UserStatus = new UserStatus(data.User, data.Mode, socket.id);
            socket.broadcast.emit('adduser', Info);
            if (this.UsersInfo.length != 0) {
                for (var i:number = 0; i< this.UsersInfo.length; i++) {
                    socket.emit('adduser', this.UsersInfo[i]);
                }
            }
            this.UsersInfo.push(Info);
        });

        socket.on('updateeditmode', (data: {User: string; Mode: number}) => {
            var Info: UserStatus = new UserStatus(data.User, data.Mode, socket.id);
            socket.broadcast.emit('updateeditmode', Info);
            for (var i: number = 0; i < this.UsersInfo.length; i++) {
                if (socket.id == this.UsersInfo[i].SID) {
                    this.UsersInfo[i].Mode = data.Mode;
                }
            }
            this.UsersInfo.push(Info);
        });

        socket.on('sync', (data: {X: number; Y: number; Scale: number}) => {
            socket.broadcast.emit('sync', data);
        });

        socket.on('fold', (data: {IsFolded: boolean; UID: number}) => {
            socket.broadcast.emit('fold', data);
        });

        socket.on('startedit', (data: {UID: number; IsRecursive: boolean; UserName: string}) => {
            var datas = {};
            datas['UID']    = data.UID;
            datas['IsRecursive'] = data.IsRecursive;
            datas['UserName']    = data.UserName;
            datas['SID']    = Number(socket.id);
            socket.broadcast.emit('startedit', datas);
            this.EditNodeInfo.push(datas);
            console.log("this is editing list" + this.EditNodeInfo);
        });

        socket.on('finishedit', (UID: number) => {
            socket.broadcast.emit('finishedit', UID);
            for (var i: number = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i]['UID'] == UID) {
                    this.EditNodeInfo.splice(i, 1);
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
