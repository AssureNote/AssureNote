var AssureNote;
(function (AssureNote) {
    //export class JsonRPCRequest {
    //    jsonrpc: string;
    //    method: string;
    //    id: number;
    //    params: any;
    //    constructor(method: string, params: any) {
    //        this.method = method;
    //        this.params = params;
    //        this.jsonrpc = '2.0';
    //        this.id = null;
    //    }
    //}
    //export class JsonRPCResponse {
    //    jsonrpc: string;
    //    id: number;
    //    result: any;
    //    error: any;
    //}
    var WGSNSocket = (function () {
        function WGSNSocket(name, WGSN) {
            this.name = name;
            this.WGSN = WGSN;
        }
        return WGSNSocket;
    })();
    AssureNote.WGSNSocket = WGSNSocket;

    var SocketManager = (function () {
        function SocketManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found');
            }
            this.socket = null;
            this.handler = {};
        }
        SocketManager.prototype.RegisterSocketHandler = function (key, handler) {
            this.handler[key] = handler;
        };

        SocketManager.prototype.Emit = function (method, params) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
                return;
            }
            this.socket.emit(method, params);
        };

        SocketManager.prototype.EnableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
            });
            this.socket.on('join', function (data) {
                console.log('join');
                console.log(data);
            });
            this.socket.on('init', function (data) {
                console.log('init');
                console.log(data);
            });
            this.socket.on('update', function (data) {
                console.log('update');
                self.AssureNoteApp.LoadNewWGSN(data.name, data.WGSN);
            });

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        };

        SocketManager.prototype.Connect = function (host) {
            if (host == null || host == '') {
                this.socket = io.connect('http://localhost:3002');
            } else {
                this.socket = io.connect(host);
            }
            this.EnableListeners();
        };

        SocketManager.prototype.DisConnect = function () {
            this.socket.disconnect();
            this.socket = null;
        };

        SocketManager.prototype.IsConnected = function () {
            /* Checks the connection */
            return this.socket != null;
        };

        SocketManager.prototype.IsOperational = function () {
            /* Checks the existence of socked.io.js */
            return io != null && io.connect != null;
        };

        SocketManager.prototype.UpdateWGSN = function () {
            var TopGoal = this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode;
            var Writer = new AssureNote.StringWriter();
            TopGoal.FormatSubNode(1, Writer);
            var WGSN = Writer.toString();
            this.Emit('update', new WGSNSocket(this.AssureNoteApp.WGSNName, WGSN));
        };
        return SocketManager;
    })();
    AssureNote.SocketManager = SocketManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Socket.js.map
