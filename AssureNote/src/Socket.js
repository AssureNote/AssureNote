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
        function SocketManager(App) {
            var _this = this;
            this.App = App;
            this.UseOnScrollEvent = true;
            this.ReceivedFoldEvent = false;
            this.ClientsInfo = [];
            this.EditStatus = [];
            this.EditNodeInfo = [];
            if (!this.IsOperational()) {
                App.DebugP('socket.io not found');
            }

            App.PictgramPanel.Viewport.OnScroll = function (Viewport) {
                if (_this.IsConnected() && _this.UseOnScrollEvent) {
                    console.log('StartEmit');
                    var X = Viewport.GetCameraGX();
                    var Y = Viewport.GetCameraGY();
                    var Scale = Viewport.GetCameraScale();

                    _this.Emit("sync", { "X": X, "Y": Y, "Scale": Scale });
                }
            };
            this.socket = null;
            this.handler = {};
        }
        SocketManager.prototype.RegisterSocketHandler = function (key, handler) {
            this.handler[key] = handler;
        };

        SocketManager.prototype.Emit = function (method, params) {
            if (!this.IsConnected()) {
                this.App.DebugP('Socket not enable.');
                return;
            }

            this.socket.emit(method, params);
        };

        SocketManager.prototype.EnableListeners = function () {
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.App.ModeManager.Disable();
                self.socket = null;
            });
            this.socket.on('close', function (data) {
                self.UpdateView("");
                self.UpdateWGSN();
                //                self.UpdateUserList();
            });
            this.socket.on('join', function (data) {
                console.log('join');
                console.log(data);
            });

            this.socket.on('init', function (data) {
                console.log('init');
                console.log(data);
            });
            this.socket.on('fold', function (data) {
                if (!self.ReceivedFoldEvent) {
                    self.ReceivedFoldEvent = true;
                    var NodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                    self.App.ExecDoubleClicked(NodeView);
                    self.ReceivedFoldEvent = false;
                }
            });
            this.socket.on('update', function (data) {
                console.log('update');
                self.App.LoadNewWGSN(data.name, data.WGSN);
            });
            this.socket.on('sync', function (data) {
                //                if (self.App.ModeManager.GetMode() == AssureNoteMode.View) {
                self.UseOnScrollEvent = false;
                self.App.PictgramPanel.Viewport.SetCamera(data.X, data.Y, data.Scale);
                self.UseOnScrollEvent = true;
                //                }
            });
            this.socket.on('startedit', function (data) {
                console.log('edit');
                var CurrentNodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                self.EditNodeInfo.push(data);
                self.UpdateFlags(CurrentNodeView);
                self.UpdateView("startedit");
                self.AddUserNameOn(CurrentNodeView, { User: data.UserName, IsRecursive: data.IsRecursive });
            });
            this.socket.on('finishedit', function (data) {
                console.log('finishedit');
                self.DeleteID(data.UID);
                self.UpdateView("finishedit");
                console.log('here is ID array after delete = ' + self.EditNodeInfo);
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
            if (this.IsConnected()) {
                this.App.ModeManager.Enable();
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
            for (var i = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i]["UID"] == UID) {
                    this.EditNodeInfo.splice(i, 1);
                    return;
                }
            }
        };

        SocketManager.prototype.UpdateParentStatus = function (NodeView) {
            if (NodeView.Parent == null)
                return;
            NodeView.Parent.Status = 1 /* SingleEditable */;
            this.UpdateParentStatus(NodeView.Parent);
        };

        SocketManager.prototype.UpdateChildStatus = function (NodeView) {
            if (NodeView.Children != null) {
                for (var i = 0; i < NodeView.Children.length; i++) {
                    NodeView.Children[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null) {
                for (var i = 0; i < NodeView.Left.length; i++) {
                    NodeView.Left[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null) {
                for (var i = 0; i < NodeView.Right.length; i++) {
                    NodeView.Right[i].Status = 2 /* Locked */;
                    this.UpdateChildStatus(NodeView.Right[i]);
                }
            }
        };

        SocketManager.prototype.UpdateFlags = function (NodeView) {
            NodeView.Status = 2 /* Locked */;
            this.UpdateParentStatus(NodeView);
            if (NodeView.Children == null && NodeView.Left == null && NodeView.Right == null)
                return;
            if (this.EditNodeInfo[this.EditNodeInfo.length - 1]["IsRecursive"]) {
                this.UpdateChildStatus(NodeView);
            }
        };

        SocketManager.prototype.UpdateView = function (Method) {
            var NewNodeView = new AssureNote.NodeView(this.App.MasterRecord.GetLatestDoc().TopNode, true);
            NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
            if (Method == "finishedit") {
                this.SetDefaultFlags(NewNodeView);
            }
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw(this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel());
        };

        SocketManager.prototype.SetDefaultFlags = function (NodeView) {
            NodeView.Status = 0 /* TreeEditable */;
            if (NodeView.Children != null) {
                for (var i = 0; i < NodeView.Children.length; i++) {
                    this.SetDefaultFlags(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null) {
                for (var i = 0; i < NodeView.Left.length; i++) {
                    this.SetDefaultFlags(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null) {
                for (var i = 0; i < NodeView.Right.length; i++) {
                    this.SetDefaultFlags(NodeView.Right[i]);
                }
            }
        };

        SocketManager.prototype.IsEditable = function (UID) {
            var index = 0;
            var CurrentView = this.App.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditNodeInfo.length == 0)
                return true;
            for (var i = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i]["UID"] == UID) {
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i = 0; i < this.EditNodeInfo.length; i++) {
                    if (this.EditNodeInfo[i]["IsRecursive"] && this.EditNodeInfo[i]["UID"] == CurrentView.Model.UID) {
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

        SocketManager.prototype.StartEdit = function (data) {
            if (this.IsConnected()) {
                this.Emit('startedit', data);
            }
        };

        SocketManager.prototype.FoldNode = function (data) {
            if (this.IsConnected() && !this.ReceivedFoldEvent) {
                this.Emit('fold', data);
            }
        };

        SocketManager.prototype.SyncScreenPos = function (Data) {
            this.Emit("syncfocus", Data);
        };

        SocketManager.prototype.UpdateWGSN = function () {
            var Writer = new AssureNote.StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            var WGSN = Writer.toString();
            this.Emit('update', new WGSNSocket(this.App.WGSNName, WGSN));
        };
        return SocketManager;
    })();
    AssureNote.SocketManager = SocketManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Socket.js.map
