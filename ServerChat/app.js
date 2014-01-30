///<reference path='../AssureNote/src/AssureNoteParser.ts'/>
///<reference path='d.ts/socket.io/socket.io.d.ts' />
var socketio = require('socket.io');
var parser = require('./AssureNoteParser');

var AssureNoteServer = (function () {
    function AssureNoteServer() {
        var _this = this;
        this.room = 'room';
        this.EditingNodes = [];
        this.WGSNName = null;
        this.MasterRecord = null;
        this.io = socketio.listen(3002);
        this.io.sockets.on('connection', function (socket) {
            _this.EnableListeners(socket);
            socket.join(_this.room);
            console.log('id: ' + socket.id + ' connected');
            socket.emit('init', {
                id: socket.id,
                list: _this.GetUserList(),
                name: _this.WGSNName,
                WGSN: _this.GetLatestWGSN()
            });
            socket.broadcast.emit('join', { id: socket.id, list: _this.GetUserList() });

            socket.on('disconnect', function () {
                /* cast to any since d.ts does not support socket.leave */
                socket.leave(_this.room);

                console.log('id: ' + socket.id + ' leave');
                console.log('close');
                socket.broadcast.emit('leave', { id: socket.id, list: _this.GetUserList() });
                if (_this.EditingNodes.length != 0) {
                    for (var i = 0; i < _this.EditingNodes.length; i++) {
                        if (_this.EditingNodes[i]["SID"] == socket.id) {
                            socket.broadcast.emit('finishedit', { Label: _this.EditingNodes[i]['Label'], UID: _this.EditingNodes[i]['UID'] });
                            socket.broadcast.emit('close', "Window Closed");
                            _this.EditingNodes.splice(i, 1);
                        }
                    }
                } else {
                    socket.broadcast.emit('close', "Window closed: " + socket.id);
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

        socket.on('sync', function (data) {
            console.log('=================================syncfocus');
            socket.broadcast.emit('syncfocus', data);
        });

        socket.on('fold', function (data) {
            socket.broadcast.emit('fold', data);
        });

        socket.on('startedit', function (data) {
            var datas = {};
            datas['Label'] = data.Label;
            datas['UID'] = data.UID;
            datas['IsRecursive'] = data.IsRecursive;
            datas['UserName'] = data.UserName;
            datas['SID'] = socket.id;

            //            console.log('data\'s socketID is ' + datas['SID']);
            socket.broadcast.emit('startedit', datas);
            _this.EditingNodes.push(datas);
            console.log("this is editing list" + _this.EditingNodes);
        });

        socket.on('finishedit', function (data) {
            socket.broadcast.emit('finishedit', data);
            for (var i = 0; i < _this.EditingNodes.length; i++) {
                if (_this.EditingNodes[i]['Label'] == data.Label) {
                    _this.EditingNodes.splice(i, 1);
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
