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
            this.EditingNodes = [];
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
            this.socket.emit(method, params);
        };

        SocketManager.prototype.EnableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null;
            });
            this.socket.on('close', function (data) {
                self.UpdateView();
                self.UpdateWGSN();
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
            this.socket.on('sync', function (data) {
                console.log('sync');
                //    self.AssureNoteApp.PictgramPanel.Viewport.MoveTo(data.PosX, data.PosY, 1.0, 100);
            });
            this.socket.on('startedit', function (data) {
                console.log('edit');
                console.log(data);
                self.EditingNodes.push(data);
                self.UpdateView();

                var CurrentNodeView = self.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(data.UID);
                self.AddUserNameOn(CurrentNodeView, { User: data.UserName, IsRecursive: data.IsRecursive });
                console.log('here is ID array = ' + self.EditingNodes);
            });
            this.socket.on('finishedit', function (data) {
                console.log('finishedit');
                self.DeleteID(data.UID);
                self.UpdateView();

                console.log('here is ID array after delete = ' + self.EditingNodes);
            });

            $(window).on("beforeunload", function () {
                self.Emit("close", "");
                self.DisConnect();
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
            for (var i = 0; i < this.EditingNodes.length; i++) {
                if (this.EditingNodes[i]["UID"] == UID) {
                    this.EditingNodes.splice(i, 1);
                    return;
                }
            }
        };

        SocketManager.prototype.UpdateView = function () {
            var NewNodeView = new AssureNote.NodeView(this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode, true);
            NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
            this.AssureNoteApp.PictgramPanel.InitializeView(NewNodeView);
            this.AssureNoteApp.PictgramPanel.Draw(this.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel());
        };

        SocketManager.prototype.IsEditable = function (UID) {
            var index = 0;
            var CurrentView = this.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditingNodes.length == 0)
                return true;
            for (var i = 0; i < this.EditingNodes.length; i++) {
                if (this.EditingNodes[i]["UID"] == UID) {
                    this.CurrentUserName = this.EditingNodes[i]["UserName"];
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i = 0; i < this.EditingNodes.length; i++) {
                    if (this.EditingNodes[i]["IsRecursive"] && this.EditingNodes[i]["UID"] == CurrentView.Model.UID) {
                        this.CurrentUserName = this.EditingNodes[i]["UserName"];
                        return false;
                    }
                }
                CurrentView = CurrentView.Parent;
            }
            return true;
        };

        SocketManager.prototype.AddUserNameOn = function (NodeView, Data) {
            var Label = NodeView.Label.replace(/\./g, "\\.");
            var topdist;
            var rightdist;
            switch (NodeView.Model.NodeType) {
                case 0 /* Goal */:
                case 1 /* Context */:
                    topdist = "5px";
                    rightdist = "5px";
                    break;
                case 2 /* Strategy */:
                    topdist = "5px";
                    rightdist = "10px";
                    break;
                case 3 /* Evidence */:
                    topdist = "19px";
                    rightdist = "40px";
                    break;
            }
            $("<div class=\"user_" + Data.User + "\">" + Data.User + "</div>").appendTo($('#' + Label)).css({ position: "absolute", top: topdist, right: rightdist, "font-size": "12px", "text-decoration": "underline" });

            if (NodeView.Right != null && Data.IsRecursive) {
                this.AddUserNameOn(NodeView.Right[0], Data);
            }
            if (NodeView.Children == null || !Data.IsRecursive)
                return;

            for (var i = 0; i < NodeView.Children.length; i++) {
                this.AddUserNameOn(NodeView.Children[i], Data);
            }
        };

        SocketManager.prototype.GetCurrentUserName = function () {
            return this.GetCurrentUserName();
        };

        SocketManager.prototype.StartEdit = function (data) {
            this.Emit('startedit', data);
        };

        SocketManager.prototype.SyncScreenFocus = function (PosData) {
            this.Emit('sync', PosData);
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
