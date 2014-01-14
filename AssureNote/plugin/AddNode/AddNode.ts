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

///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />

module AssureNote {
    export class AddNodePlugin extends Plugin {

        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
            this.SetMenuBarButton(true);
            //this.AssureNoteApp.RegistCommand(new AddNodeCommand(this.AssureNoteApp));
        }

        CreateMenuBarButtons(View: NodeView): NodeMenuItem[]{
            return null;
        }
        CreateMenuBarButton(View: NodeView): NodeMenuItem {
            return null;
            //var App = this.AssureNoteApp;
            //return new NodeMenuItem("remove-id", "images/remove.png", "remove", (event: Event, TargetView: NodeView) => {
            //    var Node = TargetView.Model;
            //    var Parent = Node.ParentNode;
            //    if (Parent.SubNodeList == null) {
            //        App.DebugP("Node not Found");
            //        return;
            //    }
            //    for (var i = 0; i < Parent.SubNodeList.length; i++) {
            //        var it = Parent.SubNodeList[i];
            //        if (Node == it) {
            //            Parent.SubNodeList.splice(i, 1);
            //        }
            //    }

            //    RemoveCommand.RemoveDescendantsRecursive(Node);

            //    var TopGoal = App.MasterRecord.GetLatestDoc().TopNode;
            //    var NewNodeView: NodeView = new NodeView(TopGoal, true);
            //    NewNodeView.SaveFoldedFlag(App.PictgramPanel.ViewMap);
            //    App.PictgramPanel.SetView(NewNodeView);
            //    App.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);
            //});
        }

    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var AddNodePlugin = new AssureNote.AddNodePlugin(App);
    App.PluginManager.SetPlugin("AddNode", AddNodePlugin);
});
