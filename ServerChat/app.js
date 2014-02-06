///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');
var parser = require('./AssureNoteParser');

var UserStatus = (function () {
    function UserStatus(User, Mode, SID) {
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

var FocusedInfo = (function () {
    function FocusedInfo(SID, Label) {
        this.SID = SID;
        this.Label = Label;
    }
    return FocusedInfo;
})();
exports.FocusedInfo = FocusedInfo;

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        var _this = this;
        this.room = 'room';
        this.UsersInfo = [];
        this.EditNodeInfo = [];
        this.WGSNName = null;
        this.MasterRecord = null;
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            _this.EnableListeners(socket);
            socket.join(_this.room, null);
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
                if (_this.EditNodeInfo.length != 0) {
                    for (var i = 0; i < _this.EditNodeInfo.length; i++) {
                        if (_this.EditNodeInfo[i].SID == socket.id) {
                            socket.broadcast.emit('finishedit', { UID: _this.EditNodeInfo[i].UID });
                            _this.EditNodeInfo.splice(i, 1);
                        }
                    }
                }
                socket.broadcast.emit('close', socket.id);
                for (var i = 0; i < _this.UsersInfo.length; i++) {
                    if (_this.UsersInfo[i].SID == socket.id) {
                        _this.UsersInfo.splice(i, 1);
                    }
                }
            });
        });
    }
    AssureNoteServer.prototype.EnableListeners = function (socket) {
        var _this = this;
        socket.on('message', function (message) {
            socket.broadcast.emit('message', message);
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
            socket.broadcast.emit('update', data);
        });

        socket.on('adduser', function (data) {
            var Info = new UserStatus(data.User, data.Mode, socket.id);
            if (_this.UsersInfo.length != 0) {
                socket.broadcast.emit('adduser', Info);
                for (var i = 0; i < _this.UsersInfo.length; i++) {
                    socket.emit('adduser', _this.UsersInfo[i]);
                }
            }
            _this.UsersInfo.push(Info);
        });

        socket.on('focusednode', function (Label) {
            var FocusInfo = new FocusedInfo(socket.id, Label);
            socket.broadcast.emit('focusednode', FocusInfo);
        });

        socket.on('updateeditmode', function (data) {
            var Info = new UserStatus(data.User, data.Mode, socket.id);
            socket.broadcast.emit('updateeditmode', Info);
            for (var i = 0; i < _this.UsersInfo.length; i++) {
                if (socket.id == _this.UsersInfo[i].SID) {
                    _this.UsersInfo[i].Mode = data.Mode;
                }
            }
        });

        socket.on('sync', function (data) {
            socket.broadcast.emit('sync', data);
        });

        socket.on('fold', function (data) {
            socket.broadcast.emit('fold', data);
        });

        socket.on('startedit', function (data) {
            var datas = new EditNodeStatus(data.UserName, data.UID, data.IsRecursive, socket.id);
            socket.broadcast.emit('startedit', datas);
            _this.EditNodeInfo.push(datas);
            console.log("this is editing list" + _this.EditNodeInfo);
        });

        socket.on('finishedit', function (UID) {
            socket.broadcast.emit('finishedit', UID);
            for (var i = 0; i < _this.EditNodeInfo.length; i++) {
                if (_this.EditNodeInfo[i].UID == UID) {
                    _this.EditNodeInfo.splice(i, 1);
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
    return AssureNoteServer;
})();

new AssureNoteServer();
