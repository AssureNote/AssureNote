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
    var MessageChatPlugin = (function (_super) {
        __extends(MessageChatPlugin, _super);
        function MessageChatPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.SocketManager.RegisterSocketHandler('message', function (data) {
                console.log(data);
                $.notify(data);
            });
        }
        MessageChatPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            if (AssureNoteApp.SocketManager.IsConnected()) {
                this.AssureNoteApp.SocketManager.Emit('message', Args.join(' '));
                $.notify(Args.join(' '), 'info');
            }
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
            console.log(Args);
            if (Args.length > 1) {
                AssureNoteApp.DebugP('Invalid parameter: ' + Args);
                return;
            }
            if (AssureNoteApp.SocketManager.IsOperational()) {
                AssureNoteApp.SocketManager.Connect(Args[0]);
            }
        };
        return ConnectServerPlugin;
    })(AssureNote.Plugin);
    AssureNote.ConnectServerPlugin = ConnectServerPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=MessageChat.js.map
