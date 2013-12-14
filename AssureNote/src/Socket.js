var AssureNote;
(function (AssureNote) {
    var JsonRPCRequest = (function () {
        function JsonRPCRequest(method, params) {
            this.method = method;
            this.params = params;
            this.jsonrpc = '2.0';
            this.id = null;
        }
        return JsonRPCRequest;
    })();
    AssureNote.JsonRPCRequest = JsonRPCRequest;

    var JsonRPCResponse = (function () {
        function JsonRPCResponse() {
        }
        return JsonRPCResponse;
    })();
    AssureNote.JsonRPCResponse = JsonRPCResponse;

    var SocketManager = (function () {
        function SocketManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found');
            }
            this.socket = null;
        }
        SocketManager.prototype.RegisterSocketHandler = function (key, handler) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable');
            }

            this.socket.on(key, handler);
        };

        SocketManager.prototype.EmitMessage = function (method, params) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
            }
            var Request = new JsonRPCRequest(method, params);
            this.socket.emit(method, Request);
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
        };

        SocketManager.prototype.ReceiveData = function (data) {
            if (data.jsonrpc != '2.0') {
                this.AssureNoteApp.DebugP('invalid rpc format');
            }
        };

        SocketManager.prototype.Connect = function () {
            this.socket = io.connect('http://localhost:3002');
            this.EnableListeners();
            console.log(this.socket);
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
