var AssureNote;
(function (AssureNote) {
    var JsonRPCRequest = (function () {
        function JsonRPCRequest() {
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
        SocketManager.prototype.enableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
            });
            this.socket.on('data', function (data) {
                self.handleData(data);
            });
        };

        SocketManager.prototype.handleData = function (data) {
        };

        SocketManager.prototype.Connect = function () {
            this.socket = io.connect('http://localhost:3002');
            this.enableListeners();
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
