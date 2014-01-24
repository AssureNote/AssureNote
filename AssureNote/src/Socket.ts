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
        private socket: any;
        private handler: { [key: string]: (any) => void };
        EditingNodes: any[] = [];
        CurrentUserName: string;

        constructor(public AssureNoteApp: AssureNoteApp) {
            if (!this.IsOperational()) {
                AssureNoteApp.DebugP('socket.io not found')
            }
            this.socket = null;
            this.handler = {};
        }

        RegisterSocketHandler(key: string, handler: (params: any) => void) {
            this.handler[key] = handler;
        }

        Emit(method: string, params: any) {
            if (!this.IsConnected()) {
                this.AssureNoteApp.DebugP('Socket not enable.');
                return;
            }
            this.socket.emit(method, params);
        }

        EnableListeners(): void{
            var self = this;
            this.socket.on('disconnect', function (data) {
                self.socket = null
            });
            this.socket.on('join', function (data) {
                console.log('join');
                console.log(data);
            });
            this.socket.on('init', function (data) {
                console.log('init');
                console.log(data);
            });
            this.socket.on('update', function (data: {name: string; WGSN: string}) {
                console.log('update');
                self.AssureNoteApp.LoadNewWGSN(data.name, data.WGSN);
            });
            this.socket.on('sync', function (data: {PosX: number; PosY: number}) {
                console.log('sync');
                self.AssureNoteApp.PictgramPanel.Viewport.MoveTo(data.PosX, data.PosY, 1.0, 100);
            });
            this.socket.on('startedit', function(data: {Label: string; UID: number; IsRecursive: boolean; UserName: string}) {
                console.log('edit');
                self.EditingNodes.push(data);
                var NewNodeView: NodeView = new NodeView(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode, true);
                NewNodeView.SaveFoldedFlag(self.AssureNoteApp.PictgramPanel.ViewMap);
                self.AssureNoteApp.PictgramPanel.InitializeView(NewNodeView);
                self.AssureNoteApp.PictgramPanel.Draw(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel());

                var CurrentNodeView: NodeView = self.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(data.UID);
                self.AddUserNameOn(CurrentNodeView, {User:data.UserName, IsRecursive:data.IsRecursive});
                console.log('here is ID array = ' + self.EditingNodes);
            });
            this.socket.on('finishedit', function(data: {Label: string; UID: number}) {
                console.log('finishedit');
                self.DeleteID(data.UID);
                var NewNodeView: NodeView = new NodeView(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode, true);
                NewNodeView.SaveFoldedFlag(self.AssureNoteApp.PictgramPanel.ViewMap);
                self.AssureNoteApp.PictgramPanel.InitializeView(NewNodeView);
                self.AssureNoteApp.PictgramPanel.Draw(self.AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel());
                console.log('here is ID array after delete = ' + self.EditingNodes);
            });

            for (var key in this.handler) {
                this.socket.on(key, this.handler[key]);
            }
        }

        Connect(host: string) {
            if (host == null || host =='') {
                this.socket = io.connect('http://localhost:3002');
            } else {
                this.socket = io.connect(host);
            }
            this.EnableListeners();
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
            for (var i:number = 0; i < this.EditingNodes.length; i++) {
                if (this.EditingNodes[i]["UID"] == UID) {
                    this.EditingNodes.splice(i, 1);
                    return;
                }
            }
        }

        IsEditable(UID: number) {
            var index: number = 0;
            var CurrentView: NodeView = this.AssureNoteApp.PictgramPanel.GetNodeViewFromUID(UID).Parent;

            if (this.EditingNodes.length == 0) return true;
            for (var i:number = 0; i < this.EditingNodes.length; i++) {
                if (this.EditingNodes[i]["UID"] == UID) {
                    this.CurrentUserName = this.EditingNodes[i]["UserName"];
                    return false;
                }
            }

            while (CurrentView != null) {
                for (var i:number = 0; i < this.EditingNodes.length; i++) {
                    if (this.EditingNodes[i]["IsRecursive"] && this.EditingNodes[i]["UID"] == CurrentView.Model.UID) {
                        this.CurrentUserName = this.EditingNodes[i]["UserName"];
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

        GetCurrentUserName() : string {
            return this.GetCurrentUserName();
        }

        StartEdit(data: {Label: string; UID: number}) {
            this.Emit('startedit' ,data);
        }

        SyncScreenFocus (PosData: {PosX: number; PosY: number})  {
            this.Emit('sync', PosData);
        }

        UpdateWGSN() {
            var Writer = new StringWriter();
            this.AssureNoteApp.MasterRecord.FormatRecord(Writer);
            var WGSN: string = Writer.toString();
            this.Emit('update', new WGSNSocket(this.AssureNoteApp.WGSNName, WGSN));
        }
    }
}
