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
    var MonitorNode = (function () {
        function MonitorNode(Node) {
            this.Node = Node;
            var GoalNode = Node.GetCloseGoal();

            var ContextNode = null;
            for (var i = 0; i < GoalNode.SubNodeList.length; i++) {
                var BroutherNode = GoalNode.SubNodeList[i];
                if (BroutherNode.NodeType == AssureNote.GSNType.Context) {
                    ContextNode = BroutherNode;
                    break;
                }
            }
            if (ContextNode == null) {
                return;
            }
            var TagMap = ContextNode.GetTagMap();
            this.Location = TagMap.get("Location");
            this.Condition = TagMap.get("Condition");
            this.ExtractTypeFromCondition();
        }
        MonitorNode.prototype.ExtractTypeFromCondition = function () {
            var text = this.Condition.replace(/\{|\}|\(|\)|==|<=|>=|<|>/g, " ");
            var words = text.split(" ");
            this.Type = null;
            for (var i = 0; i < words.length; i++) {
                if (words[i] != "" && !$.isNumeric(words[i])) {
                    this.Type = words[i];
                    break;
                }
            }
            console.log(this.Type);
        };

        MonitorNode.prototype.Validate = function () {
            return true;
        };
        return MonitorNode;
    })();
    AssureNote.MonitorNode = MonitorNode;

    var MonitorNodeManager = (function () {
        function MonitorNodeManager() {
            this.MonitorNodeMap = {};
        }
        return MonitorNodeManager;
    })();
    AssureNote.MonitorNodeManager = MonitorNodeManager;

    var MonitorCommand = (function (_super) {
        __extends(MonitorCommand, _super);
        function MonitorCommand(App) {
            _super.call(this, App);
        }
        MonitorCommand.prototype.GetCommandLineNames = function () {
            return ["monitor"];
        };

        MonitorCommand.prototype.GetDisplayName = function () {
            return "Monitor";
        };

        MonitorCommand.prototype.Invoke = function (CommandName, FocuseView, Params) {
            if (Params.length == 1) {
                var Param = Params[0];
                if (Param == "all") {
                    // TODO
                    // Start all monitors
                } else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if (View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    var Model = this.App.PictgramPanel.ViewMap[Label].Model;
                    var Monitor = new MonitorNode(Model);
                    if (!Monitor.Validate()) {
                        this.App.DebugP("This node is not monitor");
                        return;
                    }
                }
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };
        return MonitorCommand;
    })(AssureNote.Command);
    AssureNote.MonitorCommand = MonitorCommand;

    var MonitorNodePlugin = (function (_super) {
        __extends(MonitorNodePlugin, _super);
        function MonitorNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.AssureNoteApp.RegistCommand(new MonitorCommand(this.AssureNoteApp));
        }
        return MonitorNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.MonitorNodePlugin = MonitorNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
//# sourceMappingURL=MonitorNode.js.map
