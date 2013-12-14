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
            /* Check the existence of socked.io.js */
            if (!io || !io.connect) {
                AssureNoteApp.DebugP('socket.io not found');
            };

            this.socket = io.connect('http://localhost:3002');
            this.enableListeners();
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
    }
}