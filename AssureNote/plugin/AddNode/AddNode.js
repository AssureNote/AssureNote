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
    var AddNodeCommand = (function (_super) {
        __extends(AddNodeCommand, _super);
        function AddNodeCommand(App) {
            _super.call(this, App);
            this.Text2NodeTypeMap = {
                "goal": 0 /* Goal */,
                "strategy": 2 /* Strategy */,
                "context": 1 /* Context */,
                "assumption": 6 /* Assumption */,
                "exception": 7 /* Exception */,
                "Justification": 5 /* Justification */,
                "evidence": 3 /* Evidence */
            };
        }
        AddNodeCommand.prototype.GetCommandLineNames = function () {
            return ["addnode", "add-node"];
        };

        AddNodeCommand.prototype.GetHelpHTML = function () {
            return "<code>add-node node type</code><br>Add new node.";
        };

        AddNodeCommand.prototype.Invoke = function (CommandName, Params) {
            var _this = this;
            var Type = this.Text2NodeTypeMap[Params[1].toLowerCase()];
            var TargetView = this.App.GetNodeFromLabel(Params[0]);
            if (TargetView) {
                this.App.EditDocument("todo", "test", function () {
                    var Node = _this.App.MasterRecord.EditingDoc.GetNode(TargetView.Model.UID);
                    new AssureNote.GSNNode(Node.BaseDoc, Node, Type, null, AssureNote.AssureNoteUtils.GenerateUID(), null);
                });
            }
        };
        return AddNodeCommand;
    })(AssureNote.Command);
    AssureNote.AddNodeCommand = AddNodeCommand;

    var AddNodePlugin = (function (_super) {
        __extends(AddNodePlugin, _super);
        function AddNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetHasMenuBarButton(true);
            this.AssureNoteApp.RegistCommand(new AddNodeCommand(this.AssureNoteApp));
        }
        AddNodePlugin.prototype.CreateCallback = function (Type) {
            var _this = this;
            return function (event, TargetView) {
                var Command = _this.AssureNoteApp.FindCommandByCommandLineName("add-node");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label, Type]);
                }
            };
        };

        AddNodePlugin.prototype.CreateGoalMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-goal", "/images/goal.png", "goal", this.CreateCallback("goal"));
        };

        AddNodePlugin.prototype.CreateContextMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-context", "/images/context.png", "context", this.CreateCallback("context"));
        };

        AddNodePlugin.prototype.CreateStrategyMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-strategy", "/images/strategy.png", "strategy", this.CreateCallback("strategy"));
        };

        AddNodePlugin.prototype.CreateEvidenceMenu = function (View) {
            return new AssureNote.NodeMenuItem("add-evidence", "/images/evidence.png", "evidence", this.CreateCallback("evidence"));
        };

        AddNodePlugin.prototype.CreateMenuBarButtons = function (View) {
            var res = [];
            var NodeType = View.GetNodeType();
            switch (NodeType) {
                case 0 /* Goal */:
                    res = [
                        this.CreateContextMenu(View),
                        this.CreateStrategyMenu(View),
                        this.CreateEvidenceMenu(View)];
                    break;
                case 2 /* Strategy */:
                    res = [this.CreateContextMenu(View), this.CreateGoalMenu(View)];
                    break;
                case 1 /* Context */:
                    break;
                case 3 /* Evidence */:
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
