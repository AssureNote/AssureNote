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

declare var io: any;

module AssureNote {
    export class WGSNSocket {
        constructor(public name: string, public WGSN: string) { }
    }
    export class SocketManager {
        private DefaultChatServer: string = Config.DefaultChatServer;
        private socket: any;
        private handler: { [key: string]: (any) => void };
        private UseOnScrollEvent: boolean = true;
        private ReceivedFoldEvent: boolean = false;
        private ClientsInfo:  any[] = [];//Store UserName and Mode(View/Edit)
        private LatestNodeView: NodeView;
        private EditStatus :  any[] = [];
        private EditNodeInfo: any[] = [];

        constructor(public App: AssureNoteApp) {
            if (!this.IsOperational()) {
                App.DebugP('socket.io not found')
            }

            App.PictgramPanel.Viewport.OnScroll = (Viewport: ViewportManager) => {
                if (this.IsConnected() && this.UseOnScrollEvent/* && (this.App.ModeManager.GetMode() == AssureNoteMode.Edit)*/) {
                    console.log('StartEmit');
                    var X = Viewport.GetCameraGX();
                    var Y = Viewport.GetCameraGY();
                    var Scale = Viewport.GetCameraScale();

                    this.Emit("sync", {"X": X, "Y": Y, "Scale": Scale});
                }
            };
            this.socket = null;
            this.handler = {};
        }

        RegisterSocketHandler(key: string, handler: (params: any) => void) {
            this.handler[key] = handler;
        }

        Emit(method: string, params: any) {
            if (!this.IsConnected()) {
                this.App.DebugP('Socket not enable.');
                return;
            }

            this.socket.emit(method, params);
        }

        EnableListeners(): void{
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.App.ModeManager.Disable();
                self.socket = null;

            });
            this.socket.on('close', function(data) {
                self.UpdateView("");
                self.UpdateWGSN();
//                self.UpdateUserList();
            });
            this.socket.on('join', function (data) {
                console.log('join');
                console.log(data);
            });

            this.socket.on('error', function (data) {
                (<any>$).notify('Cannot establish connection or connection closed', 'error');
                self.App.ModeManager.Disable();
            });

            this.socket.on('init', function (data) {
                if (data.WGSN != null && self.App.MasterRecord.HistoryList.length > 1) {
                    /* TODO: Make a choice  */
                    alert('Your changes will disappear. TODO: Make a choice.');
                }
                if (data.WGSN != null) {
                    self.App.LoadNewWGSN(data.name, data.WGSN);
                }
            });
            this.socket.on('fold', function (data: {IsFolded: boolean; UID: number}) {
                if (!self.ReceivedFoldEvent/* && (self.App.ModeManager.GetMode() == AssureNoteMode.View)*/) {
                    self.ReceivedFoldEvent = true;
                    var NodeView: NodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                    self.App.ExecDoubleClicked(NodeView);
                    self.ReceivedFoldEvent = false;
                }
            });
            this.socket.on('update', function (data: {name: string; WGSN: string}) {
                console.log('update');
                self.App.LoadNewWGSN(data.name, data.WGSN);
            });
            this.socket.on('sync', function (data: {X: number; Y: number; Scale: number}) {
//                if (self.App.ModeManager.GetMode() == AssureNoteMode.View) {
                    self.UseOnScrollEvent = false;
                    self.App.PictgramPanel.Viewport.SetCamera(data.X, data.Y, data.Scale);
                    self.UseOnScrollEvent = true;
//                }
            });
            this.socket.on('startedit', function(data : {Label: string; UID: number; IsRecursive: boolean; UserName: string; SID: number}) {
                console.log('edit');
                var CurrentNodeView: NodeView = self.App.PictgramPanel.GetNodeViewFromUID(data.UID);
                self.EditNodeInfo.push(data);
                self.UpdateFlags(CurrentNodeView);
                self.UpdateView("startedit");
                self.AddUserNameOn(CurrentNodeView, {User:data.UserName, IsRecursive:data.IsRecursive});
            });
            this.socket.on('finishedit', function(data: {Label: string; UID: number}) {
                console.log('finishedit');
                self.DeleteID(data.UID);
                self.UpdateView("finishedit");
                console.log('here is ID array after delete = ' + self.EditNodeInfo);
            });

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        }

        Connect(host: string) {
            if (host == null || host =='') {
                this.socket = io.connect(this.DefaultChatServer);
            } else {
                this.socket = io.connect(host);
            }
            this.App.ModeManager.Enable();
            this.EnableListeners();
            this.App.UserList.Show();
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

        DeleteID(UID:number) {
            for (var i:number = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i]["UID"] == UID) {
                    this.EditNodeInfo.splice(i, 1);
                    return;
                }
            }
        }

        UpdateParentStatus(NodeView: NodeView) {
            if (NodeView.Parent == null) return;
            NodeView.Parent.Status = EditStatus.SingleEditable;
            this.UpdateParentStatus(NodeView.Parent);
        }

        UpdateChildStatus(NodeView: NodeView) {
            if (NodeView.Children != null){
                for (var i: number = 0; i < NodeView.Children.length; i++) {
                    NodeView.Children[i].Status = EditStatus.Locked;
                    this.UpdateChildStatus(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null){
                for (var i: number = 0; i < NodeView.Left.length; i++) {
                    NodeView.Left[i].Status = EditStatus.Locked;
                    this.UpdateChildStatus(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null){
                for (var i: number = 0; i < NodeView.Right.length; i++) {
                    NodeView.Right[i].Status = EditStatus.Locked;
                    this.UpdateChildStatus(NodeView.Right[i]);
                }
            }
        }

        UpdateFlags(NodeView: NodeView) {
            NodeView.Status = EditStatus.Locked;
            this.UpdateParentStatus(NodeView);
            if (NodeView.Children == null && NodeView.Left == null && NodeView.Right == null) return;
            if (this.EditNodeInfo[this.EditNodeInfo.length - 1]["IsRecursive"]) {
                this.UpdateChildStatus(NodeView);
            }
        }

        UpdateView(Method: string) {
            var NewNodeView: NodeView = new NodeView(this.App.MasterRecord.GetLatestDoc().TopNode, true);
            NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
            if (Method == "finishedit") {
                this.SetDefaultFlags(NewNodeView);
            }
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw(this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel());
        }

        SetDefaultFlags(NodeView: NodeView) {
           NodeView.Status = EditStatus.TreeEditable;
            if (NodeView.Children != null) {
                for (var i: number = 0; i < NodeView.Children.length; i++) {
                    this.SetDefaultFlags(NodeView.Children[i]);
                }
            }
            if (NodeView.Left != null) {
                for (var i: number = 0; i < NodeView.Left.length; i++) {
                    this.SetDefaultFlags(NodeView.Left[i]);
                }
            }
            if (NodeView.Right != null) {
                for (var i: number = 0; i < NodeView.Right.length; i++) {
                    this.SetDefaultFlags(NodeView.Right[i]);
                }
            }
        }

        IsEditable(UID: number) {
            var index: number = 0;
            var CurrentView: NodeView = this.App.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditNodeInfo.length == 0) return true;
            for (var i:number = 0; i < this.EditNodeInfo.length; i++) {
                if (this.EditNodeInfo[i]["UID"] == UID) {
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i:number = 0; i < this.EditNodeInfo.length; i++) {
                    if (this.EditNodeInfo[i]["IsRecursive"] && this.EditNodeInfo[i]["UID"] == CurrentView.Model.UID) {
                        return false;
                    }
                }
                CurrentView = CurrentView.Parent;
            }
            return true;
        }

        AddUserNameOn(NodeView: NodeView, Data: {User: string; IsRecursive: boolean}) : void {
            var Label: string = NodeView.Label.replace(/\./g, "\\.");
            var topdist: string;
            var rightdist: string;
            switch (NodeView.Model.NodeType) {
                case GSNType.Goal:
                case GSNType.Context:
                    topdist = "5px"; rightdist = "5px";
                    break;
                case GSNType.Strategy:
                    topdist = "5px"; rightdist = "10px";
                    break;
                case GSNType.Evidence:
                    topdist = "19px"; rightdist = "40px";
                    break;
            }
            $("<div class=\"user_" + Data.User + "\">" + Data.User + "</div>").appendTo($('#' + Label)).css({position: "absolute", top: topdist, right: rightdist, "font-size": "12px", "text-decoration": "underline"});

            if (NodeView.Right != null && Data.IsRecursive) {
                this.AddUserNameOn(NodeView.Right[0], Data);
            }
            if (NodeView.Children == null || !Data.IsRecursive) return;

            for (var i: number = 0; i < NodeView.Children.length; i++) {
                this.AddUserNameOn(NodeView.Children[i], Data);
            }
        }

        StartEdit(data: {Label: string; UID: number; IsRecursive: boolean; UserName: string}) {
            if(this.IsConnected()) {
                this.Emit('startedit' ,data);
            }
        }

        FoldNode(data: {IsFolded: boolean; UID: number}) {
            if(this.IsConnected() && !this.ReceivedFoldEvent/* && (this.App.ModeManager.GetMode() == AssureNoteMode.Edit)*/) {
                this.Emit('fold', data);
            }
        }

        SyncScreenPos(Data: {X: number; Y: number; Scale: number}) {
            this.Emit("syncfocus", Data);
        }

        UpdateWGSN() {
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            var WGSN: string = Writer.toString();
            this.Emit('update', new WGSNSocket(this.App.WGSNName, WGSN));
        }
    }
}
