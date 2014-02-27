///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />

import socketio = require('socket.io');
import parser = require('./AssureNoteParser');

export class UserStatus {
    constructor (public User: string, public Mode: number, public SID: string, Room: string) { }
}

export class EditNodeStatus {
    constructor (public UserName: string, public UID: number, public IsRecursive: boolean, public SID: string) { }
}

export class FocusedStatus {
    constructor (public SID: string, public Label: string) { }
}

export class RoomStatus {
    constructor(public UserStatus: UserStatus[], public EditNodeStatus: EditNodeStatus[], FocusedStatus: FocusedStatus[]) { }
}

class AssureNoteServer {
    io: SocketManager;
    room: string = 'room';
    RoomStatus: { [room: string]: RoomStatus } = {};
    WGSNName: string = null;
    MasterRecord: parser.GSNRecord = null;

    constructor() {
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', (socket: Socket) => {
            this.EnableListeners(socket);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', {
                id   : socket.id,
                list : this.GetUserList(),
                name : this.WGSNName,
                WGSN : this.GetLatestWGSN()
            });
            socket.on('disconnect', () => {
                socket.leave(this.room, null);

                var RoomStatus = this.GetRoomStatus(socket.id);
                var RoomEditNodeStatus = this.GetRoomStatus(socket.id).EditNodeStatus;
                console.log(RoomStatus);
                if (RoomEditNodeStatus.length != 0) {
                    for (var i:number = 0; i < RoomEditNodeStatus.length; i++) {
                        if (RoomEditNodeStatus[i].SID == socket.id) {
                            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('finishedit', {UID:RoomEditNodeStatus[i].UID});
                            RoomEditNodeStatus.splice(i, 1);
                        }
                    }
                }
                console.log('disconnect');
                console.log(RoomStatus);
                socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('close', socket.id);
                var RoomUserStatus: UserStatus[] = RoomStatus.UserStatus;
                for (var i: number = 0; i< RoomUserStatus.length; i++){
                    if (RoomUserStatus[i].SID == socket.id) {
                        RoomUserStatus.splice(i, 1);
                    }
                }
            });
        });
    }

    EnableListeners(socket: Socket) {
        socket.on('message', (message: string) => {
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('message', message);
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
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('update', data);
        });

        socket.on('adduser', (data: {User: string; Mode: number; Room: string}) => {
            console.log(data);
            var room: string = null;
            if (data.Room != null) {
                socket.join(data.Room, null);
                room = data.Room;
            } else {
                socket.join(this.room, null);
                room = this.room;
            }
            var Info: UserStatus = new UserStatus(data.User, data.Mode, socket.id, room);
            var RoomUserStatus: UserStatus[] = this.GetRoomStatus(this.GetJoinedRoom(socket.id)).UserStatus;
            if (RoomUserStatus.length != 0) {
                socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('adduser', Info);
                for (var i:number = 0; i< RoomUserStatus.length; i++) {
                    socket.emit('adduser', RoomUserStatus[i]);
                }
                socket.emit('update', {
                    name: (this.WGSNName) ? this.WGSNName : "Default",
                    WGSN: this.GetLatestWGSN(),
                });
            }
            RoomUserStatus.push(Info);
        });

        socket.on('focusednode', (Label: string) => {
            var FocusInfo: FocusedStatus = new FocusedStatus(socket.id, Label);
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('focusednode', FocusInfo);
        });

        socket.on('updateeditmode', (data: {User: string; Mode: number}) => {
            var Info: UserStatus = new UserStatus(data.User, data.Mode, socket.id, this.GetJoinedRoom(socket.id));
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('updateeditmode', Info);
            var RoomUserStatus: UserStatus[] = this.GetRoomStatus(this.GetJoinedRoom(socket.id)).UserStatus;
            for (var i: number = 0; i < RoomUserStatus.length; i++) {
                if (socket.id == RoomUserStatus[i].SID) {
                    RoomUserStatus[i].Mode = data.Mode;
                }
            }
        });

        socket.on('sync', (data: {X: number; Y: number; Scale: number}) => {
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('sync', data);
        });

        socket.on('fold', (data: {IsFolded: boolean; UID: number}) => {
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('fold', data);
        });

        socket.on('startedit', (data: {UID: number; IsRecursive: boolean; UserName: string}) => {
            var datas = new EditNodeStatus(data.UserName, data.UID, data.IsRecursive, socket.id);
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('startedit', datas);
            var RoomEditNodeStatus: EditNodeStatus[] = this.GetRoomStatus(this.GetJoinedRoom(socket.id)).EditNodeStatus;
            RoomEditNodeStatus.push(datas);
            console.log("this is editing list" + RoomEditNodeStatus);
        });

        socket.on('finishedit', (UID: number) => {
            socket.broadcast.to(this.GetJoinedRoom(socket.id)).emit('finishedit', UID);
            var RoomEditNodeStatus: EditNodeStatus[] = this.GetRoomStatus(this.GetJoinedRoom(socket.id)).EditNodeStatus;
            for (var i: number = 0; i < RoomEditNodeStatus.length; i++) {
                if (RoomEditNodeStatus[i].UID == UID) {
                    RoomEditNodeStatus.splice(i, 1);
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

    GetJoinedRoom(id: string): string {
        /*
           From https://github.com/LearnBoost/socket.io/wiki/Rooms:
           ` You can get a dictionary of rooms a particular client socket has joined by looking in io.sockets.manager.roomClients[socket.id].
           ` Again, the room name will have a leading / character, but the name with and without the leading '/' will be in the dictionary, and their values will be true.
        */
        var room = (<any>this.io.sockets).manager.roomClients[id];
        var keys = Object.keys(room);
        console.log(keys);
        for (var key in keys) {
            console.log('key: ' + keys[key]);
            if ((<string>keys[key]).indexOf('/') == 0) {
                return (<string>keys[key]).substr(1);
            }
        }
    }

    GetRoomStatus(room: string): RoomStatus {
        if (this.RoomStatus[room] == null) {
            this.RoomStatus[room] = new RoomStatus([], [], []);
        }
        return this.RoomStatus[room];
    }

    GetRoomU
}

new AssureNoteServer();
