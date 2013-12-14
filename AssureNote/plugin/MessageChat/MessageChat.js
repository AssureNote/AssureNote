///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var MessageChatPlugin = (function (_super) {
        __extends(MessageChatPlugin, _super);
        function MessageChatPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        MessageChatPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            $.notify(Args.join(" "), "info");
        };
        return MessageChatPlugin;
    })(AssureNote.Plugin);
    AssureNote.MessageChatPlugin = MessageChatPlugin;

    var ConnectServerPlugin = (function (_super) {
        __extends(ConnectServerPlugin, _super);
        function ConnectServerPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
        }
        ConnectServerPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            if (AssureNoteApp.SocketManager.IsOperational()) {
                AssureNoteApp.SocketManager.Connect();
            }
        };
        return ConnectServerPlugin;
    })(AssureNote.Plugin);
    AssureNote.ConnectServerPlugin = ConnectServerPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=MessageChat.js.map
