declare var io: any;

module AssureNote {
    export class JsonRPCRequest {
        jsonrpc: string;
        method: string;
        id: number;
        params: any;
        constructor(method: string, params: any) {
            this.method = method;
            this.params = params;
            this.jsonrpc = '2.0';
            this.id = null;
        }
    }

    export class JsonRPCResponse {
        jsonrpc: string;
        id: number;
        result: any;
        error: any;
    }

    export class SocketManager {
        private socket: any;

        constructor(public AssureNoteApp: AssureNoteApp) {
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found');
            }
            this.socket = null;
        }

        RegisterSocketHandler(key: string, handler: (data: JsonRPCResponse) => void) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable');
            }

            this.socket.on(key, handler);
        }

        EmitMessage(method: string, params: any) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
            }
            var Request = new JsonRPCRequest(method, params);
            this.socket.emit(method, Request);
        }

        EnableListeners(): void{
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
            });
        }

        ReceiveData (data: JsonRPCResponse): void{
            if (data.jsonrpc != '2.0') {
                this.AssureNoteApp.DebugP('invalid rpc format');
            }
        }

        Connect() {
            this.socket = io.connect('http://localhost:3002');
            this.EnableListeners();
            console.log(this.socket);
        }

        DisConnect() {
            this.socket.disconnect();
            this.socket = null;
        }

        IsConnected() {
            /* Checks the connection */
            return this.socket != null;
        }

        IsOperational() {
            /* Checks the existence of socked.io.js */
            return io != null && io.connect != null;
        }
    }
}