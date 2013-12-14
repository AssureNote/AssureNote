declare var io: any;

module AssureNote {
    export class JsonRPCRequest {
        jsonrpc: string;
        method: string;
        id: number;
        params: any;
    }

    export class JsonRPCResponse {
        jsonrpc: string;
        id: number;
        result: any;
        error: any;
    }

    export class SocketManager {
        socket: any;
        constructor(public AssureNoteApp: AssureNoteApp) {
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found');
            }
            this.socket = null;
        }

        enableListeners(): void{
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
            });
            this.socket.on('data', function (data: JsonRPCResponse) {
                self.handleData(data);
            });
        }

        handleData (data: JsonRPCResponse): void{

        }

        Connect() {
            this.socket = io.connect('http://localhost:3002');
            this.enableListeners();
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