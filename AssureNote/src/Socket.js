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
///<reference path='./AssureNoteParser.ts'/>

var AssureNote;
(function (AssureNote) {
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
    var WGSNSocket = (function () {
        function WGSNSocket(name, WGSN) {
            this.name = name;
            this.WGSN = WGSN;
        }
        return WGSNSocket;
    })();
    AssureNote.WGSNSocket = WGSNSocket;

    var SocketManager = (function () {
        function SocketManager(AssureNoteApp) {
            this.AssureNoteApp = AssureNoteApp;
            this.EditingNodesID = [];
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found');
            }
            this.socket = null;
            this.handler = {};
        }
        SocketManager.prototype.RegisterSocketHandler = function (key, handler) {
            this.handler[key] = handler;
        };

        SocketManager.prototype.Emit = function (method, params) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
                return;
            }

            //            if (method == 'startedit' && !this.IsEditable(params.UID)) {
            //                (<any>$).notify("Warning:Other user edits this Node!", "warn");
            //                return;
            //            }
            this.socket.emit(method, params);
        };

        SocketManager.prototype.EnableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
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
            this.socket.on('startedit', function (data) {
                console.log('edit');
                self.EditingNodesID.push(data);
                this.AssureNoteApp.PictgramPanel.Draw(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel());
                console.log('here is ID array = ' + self.EditingNodesID);
            });
            this.socket.on('finishedit', function (data) {
                console.log('finishedit');
                self.DeleteID(data.UID);
                this.AssureNoteApp.PictgramPanel.Draw(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel());
                console.log('here is ID array after delete = ' + self.EditingNodesID);
            });

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        };

        SocketManager.prototype.Connect = function (host) {
            if (host == null || host == '') {
                this.socket = io.connect('http://localhost:3002');
            } else {
                this.socket = io.connect(host);
            }
            this.EnableListeners();
        };

        SocketManager.prototype.DisConnect = function () {
            this.socket.disconnect();
            this.socket = null;
        };

        SocketManager.prototype.IsConnected = function () {
            /* Checks the connection */
            return this.socket != null;
        };

        SocketManager.prototype.IsOperational = function () {
            /* Checks the existence of socked.io.js */
            return io != null && io.connect != null;
        };

        SocketManager.prototype.DeleteID = function (UID) {
            for (var i = 0; i < this.EditingNodesID.length; i++) {
                if (this.EditingNodesID[i]["UID"] == UID) {
                    this.EditingNodesID.splice(i, 1);
                    return;
                }
            }
        };

        SocketManager.prototype.IsEditable = function (UID) {
            var index = 0;
            var CurrentView = this.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditingNodesID.length == 0)
                return true;
            for (var i = 0; i < this.EditingNodesID.length; i++) {
                if (this.EditingNodesID[i]["UID"] == UID) {
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i = 0; i < this.EditingNodesID.length; i++) {
                    if (this.EditingNodesID[i]["EditorFlag"] && this.EditingNodesID[i]["UID"] == CurrentView.Model.UID) {
                        return false;
                    }
                }
                CurrentView = CurrentView.Parent;
            }
            return true;
        };

        SocketManager.prototype.SetColor = function (data) {
            var CurrentView = this.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(data.UID);
            CurrentView.ChangeColorStyle(AssureNote.ColorStyle.Editing);
            if (!Flag) {
                return;
            }
            for (var i = 0; i < CurrentView.Children.length; i++) {
                Current.ChangeColorStyle(AssureNote.ColorStyle.Editing);
                ChangeColor(CurrentNodeView, AssureNote.ColorStyle);
            }
        };

        SocketManager.prototype.SetDefaultColor = function (UID) {
        };

        SocketManager.prototype.StartEdit = function (data) {
            this.Emit('startedit', data);
        };

        SocketManager.prototype.UpdateWGSN = function () {
            var Writer = new AssureNote.StringWriter();
            this.AssureNoteApp.MasterRecord.FormatRecord(Writer);
            var WGSN = Writer.toString();
            this.Emit('update', new WGSNSocket(this.AssureNoteApp.WGSNName, WGSN));
        };
        return SocketManager;
    })();
    AssureNote.SocketManager = SocketManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Socket.js.map
