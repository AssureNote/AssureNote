///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />


module AssureNote {
    export class MessageChatPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp) {
            super();
            this.AssureNoteApp.SocketManager.RegisterSocketHandler('message', function (data) {
                    console.log(data);
                $.notify(data);
            });
        }

        ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
            if (AssureNoteApp.SocketManager.IsConnected()) {
                this.AssureNoteApp.SocketManager.Emit('message', Args.join(' '));
                $.notify(Args.join(' '), 'info');
            }
        }
	}

    export class ConnectServerPlugin extends Plugin {
        socket: any;
        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }
        ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
            if (AssureNoteApp.SocketManager.IsOperational()) {
                AssureNoteApp.SocketManager.Connect();
            }
        }
    }
}
