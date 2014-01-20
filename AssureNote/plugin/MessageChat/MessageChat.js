// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var AssureNote;
(function (AssureNote) {
    var MessageCommand = (function (_super) {
        __extends(MessageCommand, _super);
        function MessageCommand() {
            _super.apply(this, arguments);
        }
        MessageCommand.prototype.GetCommandLineNames = function () {
            return ["message"];
        };

        MessageCommand.prototype.GetHelpHTML = function () {
            return "<code>message msg</code><br>Send message to the chat server.";
        };

        MessageCommand.prototype.Invoke = function (CommandName, Params) {
            if (this.App.SocketManager.IsConnected()) {
                this.App.SocketManager.Emit('message', Params.join(' '));
                $.notify(Params.join(' '), 'info');
            }
        };
        return MessageCommand;
    })(AssureNote.Command);
    AssureNote.MessageCommand = MessageCommand;

    var ConnectCommand = (function (_super) {
        __extends(ConnectCommand, _super);
        function ConnectCommand() {
            _super.apply(this, arguments);
        }
        ConnectCommand.prototype.GetCommandLineNames = function () {
            return ["connect"];
        };

        ConnectCommand.prototype.GetHelpHTML = function () {
            return "<code>connect [uri]</code><br>Connect to the chat server.";
        };

        ConnectCommand.prototype.Invoke = function (CommandName, Params) {
            console.log(Params);
            if (Params.length > 1) {
                this.App.DebugP('Invalid parameter: ' + Params);
                return;
            }
            if (this.App.SocketManager.IsOperational()) {
                this.App.SocketManager.Connect(Params[0]);
            }
        };
        return ConnectCommand;
    })(AssureNote.Command);
    AssureNote.ConnectCommand = ConnectCommand;

    var MessageChatPlugin = (function (_super) {
        __extends(MessageChatPlugin, _super);
        function MessageChatPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.SocketManager.RegisterSocketHandler('message', function (data) {
                console.log(data);
                $.notify(data);
            });
            this.AssureNoteApp.RegistCommand(new MessageCommand(this.AssureNoteApp));
        }
        return MessageChatPlugin;
    })(AssureNote.Plugin);
    AssureNote.MessageChatPlugin = MessageChatPlugin;

    var ConnectServerPlugin = (function (_super) {
        __extends(ConnectServerPlugin, _super);
        function ConnectServerPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.RegistCommand(new ConnectCommand(this.AssureNoteApp));
        }
        return ConnectServerPlugin;
    })(AssureNote.Plugin);
    AssureNote.ConnectServerPlugin = ConnectServerPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MessageChatPlugin = new AssureNote.MessageChatPlugin(App);
    App.PluginManager.SetPlugin("message", MessageChatPlugin);
    var ConnectserverPlugin = new AssureNote.ConnectServerPlugin(App);
    App.PluginManager.SetPlugin("connect", ConnectserverPlugin);
});
//# sourceMappingURL=MessageChat.js.map
