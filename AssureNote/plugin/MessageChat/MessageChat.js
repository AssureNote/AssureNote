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
            console.log(Args.join(" "));
            $.notify(Args.join(" "));
        };
        return MessageChatPlugin;
    })(AssureNote.Plugin);
    AssureNote.MessageChatPlugin = MessageChatPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=MessageChat.js.map
