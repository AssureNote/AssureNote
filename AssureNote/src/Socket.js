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

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        };

        SocketManager.prototype.Connect = function () {
            this.socket = io.connect('http://localhost:3002');
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
        return SocketManager;
    })();
    AssureNote.SocketManager = SocketManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Socket.js.map
