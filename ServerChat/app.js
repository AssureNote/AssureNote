///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');
var parser = require('./AssureNoteParser');

var UserStatus = (function () {
    function UserStatus(User, Mode, SID, Room) {
        this.User = User;
        this.Mode = Mode;
        this.SID = SID;
    }
    return UserStatus;
})();
exports.UserStatus = UserStatus;

var EditNodeStatus = (function () {
    function EditNodeStatus(UserName, UID, IsRecursive, SID) {
        this.UserName = UserName;
        this.UID = UID;
        this.IsRecursive = IsRecursive;
        this.SID = SID;
    }
    return EditNodeStatus;
})();
exports.EditNodeStatus = EditNodeStatus;

var FocusedStatus = (function () {
    function FocusedStatus(SID, Label) {
        this.SID = SID;
        this.Label = Label;
    }
    return FocusedStatus;
})();
exports.FocusedStatus = FocusedStatus;

var RoomStatus = (function () {
    function RoomStatus(UserStatus, EditNodeStatus, FocusedStatus) {
        this.UserStatus = UserStatus;
        this.EditNodeStatus = EditNodeStatus;
    }
    return RoomStatus;
})();
exports.RoomStatus = RoomStatus;

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        var _this = this;
        this.room = 'room';
        this.RoomStatus = {};
        this.WGSNName = null;
        this.MasterRecord = null;
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            _this.EnableListeners(socket);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', {
                id: socket.id,
                list: _this.GetUserList(),
                name: _this.WGSNName,
                WGSN: _this.GetLatestWGSN()
            });
            socket.on('disconnect', function () {
                socket.leave(_this.room, null);

                console.log('id: ' + socket.id + ' leave');
                console.log('close');
                var RoomStatus = _this.GetRoomStatus(socket.id);
                var RoomEditNodeStatus = _this.GetRoomStatus(socket.id).EditNodeStatus;
                if (RoomEditNodeStatus.length != 0) {
                    for (var i = 0; i < RoomEditNodeStatus.length; i++) {
                        if (RoomEditNodeStatus[i].SID == socket.id) {
                            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('finishedit', { UID: RoomEditNodeStatus[i].UID });
                            RoomEditNodeStatus.splice(i, 1);
                        }
                    }
                }
                socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('close', socket.id);
                var RoomUserStatus = RoomStatus.UserStatus;
                for (var i = 0; i < RoomUserStatus.length; i++) {
                    if (RoomUserStatus[i].SID == socket.id) {
                        RoomUserStatus.splice(i, 1);
                    }
                }
            });
        });
    }
    AssureNoteServer.prototype.EnableListeners = function (socket) {
        var _this = this;
        socket.on('message', function (message) {
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('message', message);
        });

        socket.on('update', function (data) {
            if (_this.WGSNName == null)
                _this.WGSNName = data.name;
            var NewRecord = new parser.GSNRecord();
            NewRecord.Parse(data.WGSN);
            if (_this.MasterRecord == null) {
                _this.MasterRecord = NewRecord;
            } else {
                _this.MasterRecord.Merge(NewRecord);
            }
            data.WGSN = _this.GetLatestWGSN();
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('update', data);
        });

        socket.on('adduser', function (data) {
            console.log(data);
            var room = null;
            if (data.Room != null) {
                socket.join(data.Room, null);
                room = data.Room;
            } else {
                socket.join(_this.room, null);
                room = _this.room;
            }
            var Info = new UserStatus(data.User, data.Mode, socket.id, room);
            var RoomUserStatus = _this.GetRoomStatus(_this.GetJoinedRoom(socket.id)).UserStatus;
            if (RoomUserStatus.length != 0) {
                socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('adduser', Info);
                for (var i = 0; i < RoomUserStatus.length; i++) {
                    socket.emit('adduser', RoomUserStatus[i]);
                }
            }
            RoomUserStatus.push(Info);
        });

        socket.on('focusednode', function (Label) {
            var FocusInfo = new FocusedStatus(socket.id, Label);
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('focusednode', FocusInfo);
        });

        socket.on('updateeditmode', function (data) {
            var Info = new UserStatus(data.User, data.Mode, socket.id, _this.GetJoinedRoom(socket.id));
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('updateeditmode', Info);
            var RoomUserStatus = _this.GetRoomStatus(_this.GetJoinedRoom(socket.id)).UserStatus;
            for (var i = 0; i < RoomUserStatus.length; i++) {
                if (socket.id == RoomUserStatus[i].SID) {
                    RoomUserStatus[i].Mode = data.Mode;
                }
            }
        });

        socket.on('sync', function (data) {
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('sync', data);
        });

        socket.on('fold', function (data) {
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('fold', data);
        });

        socket.on('startedit', function (data) {
            var datas = new EditNodeStatus(data.UserName, data.UID, data.IsRecursive, socket.id);
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('startedit', datas);
            var RoomEditNodeStatus = _this.GetRoomStatus(_this.GetJoinedRoom(socket.id)).EditNodeStatus;
            RoomEditNodeStatus.push(datas);
            console.log("this is editing list" + RoomEditNodeStatus);
        });

        socket.on('finishedit', function (UID) {
            socket.broadcast.to(_this.GetJoinedRoom(socket.id)).emit('finishedit', UID);
            var RoomEditNodeStatus = _this.GetRoomStatus(_this.GetJoinedRoom(socket.id)).EditNodeStatus;
            for (var i = 0; i < RoomEditNodeStatus.length; i++) {
                if (RoomEditNodeStatus[i].UID == UID) {
                    RoomEditNodeStatus.splice(i, 1);
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

    AssureNoteServer.prototype.GetLatestWGSN = function () {
        if (!this.MasterRecord)
            return null;
        var Writer = new parser.StringWriter();
        this.MasterRecord.FormatRecord(Writer);
        return Writer.toString();
    };

    AssureNoteServer.prototype.Parse = function (WGSN) {
        var Reader = new parser.StringReader(WGSN);
        var Parser = new parser.ParserContext(null);
        var GSNNode = Parser.ParseNode(Reader);
        return GSNNode;
    };

    AssureNoteServer.prototype.GetJoinedRoom = function (id) {
        var room = this.io.sockets.manager.roomClients[id];
        var keys = Object.keys(room);
        console.log(keys);
        for (var key in keys) {
            console.log('key: ' + keys[key]);
            if (keys[key].indexOf('/') == 0) {
                return keys[key].substr(1);
            }
        }
    };

    AssureNoteServer.prototype.GetRoomStatus = function (room) {
        if (this.RoomStatus[room] == null) {
            this.RoomStatus[room] = new RoomStatus([], [], []);
        }
        return this.RoomStatus[room];
    };
    return AssureNoteServer;
})();

new AssureNoteServer();
