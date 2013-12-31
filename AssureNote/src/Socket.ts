///<reference path='./AssureNoteParser.ts'/>
declare var io: any;

module AssureNote {
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

    export class WGSNSocket {
        constructor(public name: string, public WGSN: string) { }
    }

    export class SocketManager {
        private socket: any;
        private handler: { [key: string]: (any) => void };

        constructor(public AssureNoteApp: AssureNoteApp) {
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found')
            }
            this.socket = null;
            this.handler = {};
        }

        RegisterSocketHandler(key: string, handler: (params: any) => void) {
            this.handler[key] = handler;
        }

        Emit(method: string, params: any) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
                return;
            }   
            this.socket.emit(method, params);
        }

        EnableListeners(): void{
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null
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
        }

        Connect(host: string) {
            if (host == null || host =='') {
                this.socket = io.connect('http://localhost:3002');
            } else {
                this.socket = io.connect(host);
            }
            this.EnableListeners();
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

        UpdateWGSN() {
            var TopGoal: GSNNode = this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode;
            var Writer = new StringWriter();
            TopGoal.FormatSubNode(1, Writer);
            var WGSN: string = Writer.toString();
            this.Emit('update', new WGSNSocket(this.AssureNoteApp.WGSNName, WGSN));
        }
    }
}
