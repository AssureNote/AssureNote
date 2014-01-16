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

        CreateCallback(Type: GSNType): (Event, NodeView) => void {
            return (event: Event, TargetView: NodeView) => {
                var Node = TargetView.Model;
                this.AssureNoteApp.MasterRecord.OpenEditor(this.AssureNoteApp.GetUserName(), "todo", null, "test");
                new GSNNode(Node.BaseDoc, Node, Type, null, AssureNoteUtils.GenerateUID(), null);
                var Doc = this.AssureNoteApp.MasterRecord.GetLatestDoc();
                Doc.RenumberAll();
                var TopGoal = Doc.TopNode;
                var NewNodeView: NodeView = new NodeView(TopGoal, true);
                NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
                this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
                this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel());
            };
        }

        CreateGoalMenu(View: NodeView): NodeMenuItem {
            return new NodeMenuItem("add-goal", "images/goal.png", "goal", this.CreateCallback(GSNType.Goal));
        }

        CreateContextMenu(View: NodeView): NodeMenuItem {
            return new NodeMenuItem("add-context", "images/context.png", "context", this.CreateCallback(GSNType.Context));
        }

        CreateStrategyMenu(View: NodeView): NodeMenuItem {
            return new NodeMenuItem("add-strategy", "images/strategy.png", "strategy", this.CreateCallback(GSNType.Strategy));
        }

        CreateEvidenceMenu(View: NodeView): NodeMenuItem {
            return new NodeMenuItem("add-evidence", "images/evidence.png", "evidence", this.CreateCallback(GSNType.Evidence));
        }

        CreateMenuBarButtons(View: NodeView): NodeMenuItem[]{
            var res = [];
            var NodeType = View.GetNodeType();
            switch (NodeType) {
                case GSNType.Goal:
                    res = res.concat([this.CreateContextMenu(View),
                        this.CreateStrategyMenu(View),
                        this.CreateEvidenceMenu(View)]);
                    break;
                case GSNType.Strategy:
                    res = res.concat([this.CreateContextMenu(View), this.CreateGoalMenu(View)]);
                    break;
                case GSNType.Context:
                    break;
                case GSNType.Evidence:
                    res.push(this.CreateContextMenu(View));
                    break;
                default:
                    break;
            }
            return res;
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var AddNodePlugin = new AssureNote.AddNodePlugin(App);
    App.PluginManager.SetPlugin("AddNode", AddNodePlugin);
});
