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
var AssureNote;
(function (AssureNote) {
    var AddNodePlugin = (function (_super) {
        __extends(AddNodePlugin, _super);
        function AddNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetMenuBarButton(true);
            //this.AssureNoteApp.RegistCommand(new AddNodeCommand(this.AssureNoteApp));
        }
        AddNodePlugin.prototype.CreateCallback = function (Type) {
            var _this = this;
            return function (event, TargetView) {
                var Node = TargetView.Model;
                new AssureNote.GSNNode(Node.BaseDoc, Node, Type, null, AssureNote.AssureNoteUtils.GenerateUID(), null);
                var Doc = _this.AssureNoteApp.MasterRecord.GetLatestDoc();
                Doc.RenumberAll();
                var TopGoal = Doc.TopNode;
                var NewNodeView = new AssureNote.NodeView(TopGoal, true);
                NewNodeView.SaveFoldedFlag(_this.AssureNoteApp.PictgramPanel.ViewMap);
                _this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
                _this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel());
            };
        };

        AddNodePlugin.prototype.CreateGoalMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-goal", "images/goal.png", "goal", this.CreateCallback(AssureNote.GSNType.Goal));
        };

        AddNodePlugin.prototype.CreateContextMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-context", "images/context.png", "context", this.CreateCallback(AssureNote.GSNType.Context));
        };

        AddNodePlugin.prototype.CreateStrategyMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-strategy", "images/strategy.png", "strategy", this.CreateCallback(AssureNote.GSNType.Strategy));
        };

        AddNodePlugin.prototype.CreateEvidenceMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-evidence", "images/evidence.png", "evidence", this.CreateCallback(AssureNote.GSNType.Evidence));
        };

        AddNodePlugin.prototype.CreateMenuBarButtons = function (View) {
            var res = [];
            var NodeType = View.GetNodeType();
            switch (NodeType) {
                case AssureNote.GSNType.Goal:
                    res = res.concat([
                        this.CreateContextMenu(View),
                        this.CreateStrategyMenu(View),
                        this.CreateEvidenceMenu(View)
                    ]);
                    break;
                case AssureNote.GSNType.Strategy:
                    res = res.concat([this.CreateContextMenu(View), this.CreateGoalMenu(View)]);
                    break;
                case AssureNote.GSNType.Context:
                    break;
                case AssureNote.GSNType.Evidence:
                    res.push(this.CreateContextMenu(View));
                    break;
                default:
                    break;
            }
            return res;
        };
        return AddNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.AddNodePlugin = AddNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var AddNodePlugin = new AssureNote.AddNodePlugin(App);
    App.PluginManager.SetPlugin("AddNode", AddNodePlugin);
});
//# sourceMappingURL=AddNode.js.map
