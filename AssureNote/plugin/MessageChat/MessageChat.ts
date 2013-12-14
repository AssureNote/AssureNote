///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

declare var io: any;

module AssureNote {
    export class MessageChatPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
        }

        ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
			$.notify(Args.join(" "), "info");
		}
	}

    export class ConnectServerPlugin extends Plugin {
        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }
        ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
            /* Check the existence of socked.io.js */
            if (!io || !io.connect) return;

            var socket = io.connect('http://localhost:443');
        }
    }
}
