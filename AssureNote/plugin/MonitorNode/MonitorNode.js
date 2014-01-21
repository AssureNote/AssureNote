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
///<reference path="../../src/RecApi.ts" />
var AssureNote;
(function (AssureNote) {
    var MonitorNode = (function () {
        function MonitorNode(App, Label) {
            this.App = App;
            this.Label = Label;
            this.Data = null;
            this.Status = true;
            this.PastLogs = [];

            var ThisModel = this.GetModel();
            var GoalModel = ThisModel.GetCloseGoal();
            var ContextModel = null;
            for (var i = 0; i < GoalModel.SubNodeList.length; i++) {
                var BroutherModel = GoalModel.SubNodeList[i];
                if (BroutherModel.IsContext()) {
                    ContextModel = BroutherModel;
                    break;
                }
            }
            if (ContextModel == null) {
                return;
            }
            var TagMap = ContextModel.GetTagMap();
            this.Location = TagMap.get("Location");
            this.Condition = TagMap.get("Condition");
            this.ExtractTypeFromCondition();
        }
        MonitorNode.prototype.GetView = function () {
            return this.App.PictgramPanel.ViewMap[this.Label];
        };

        MonitorNode.prototype.GetModel = function () {
            return this.GetView().Model;
        };

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
        };

        MonitorNode.prototype.IsValid = function () {
            if (this.Location && this.Type && this.Condition) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.IsDead = function () {
            if (this.GetView() == null) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.UpdateModel = function () {
            var Model = this.GetModel();
            if (Model.TagMap == null) {
                Model.TagMap = new AssureNote.HashMap();
            }
            var Value = this.Data ? this.Data + "" : "";
            Model.TagMap.put(this.Type, Value);
            Model.HasTag = true;

            var NodeDoc = Model.NodeDoc + AssureNote.Lib.LineFeed;
            ;
            var Regex = new RegExp(this.Type + "\\s*::.*\\n", "g");
            if (NodeDoc.match(Regex)) {
                NodeDoc = NodeDoc.replace(Regex, this.Type + "::" + Value + AssureNote.Lib.LineFeed);
                NodeDoc = NodeDoc.slice(0, -1);
            } else {
                if (NodeDoc == AssureNote.Lib.LineFeed) {
                    NodeDoc = "";
                }
                NodeDoc += this.Type + "::" + Value;
            }
            Model.NodeDoc = NodeDoc;
        };

        MonitorNode.prototype.Update = function (Rec, ErrorCallback) {
            // Get latest data from REC
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if (LatestLog == null) {
                return;
            }

            // update past logs
            if (!(this.PastLogs.length < 20)) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);

            // update status
            this.Data = LatestLog.data;
            var script = "var " + this.Type + "=" + this.Data + ";";
            script += this.Condition + ";";
            this.Status = eval(script); // TODO Don't use eval()

            // update model
            this.UpdateModel();
        };
        return MonitorNode;
    })();
    AssureNote.MonitorNode = MonitorNode;

    var MonitorNodeManager = (function () {
        function MonitorNodeManager(App) {
            this.App = App;
            this.MonitorNodeMap = {};
            this.NodeCount = 0;
            this.IsRunning = false;
            this.Rec = new AssureNote.RecApi("http://localhost:3001/api/3.0/"); // FIXME make it configurable
            this.RedNodeMap = {};
        }
        MonitorNodeManager.prototype.SetMonitorNode = function (MNode) {
            if (!(MNode.Label in this.MonitorNodeMap)) {
                this.NodeCount += 1;
            }
            this.MonitorNodeMap[MNode.Label] = MNode;

            MNode.UpdateModel();
        };

        MonitorNodeManager.prototype.DeleteMonitorNode = function (Label) {
            if (Label in this.MonitorNodeMap) {
                this.NodeCount -= 1;
                delete this.MonitorNodeMap[Label];
            }
        };

        MonitorNodeManager.prototype.DeleteDeadMonitorNodes = function () {
            for (var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                if (MNode.IsDead()) {
                    this.DeleteMonitorNode(Label);
                    if (this.NodeCount < 1 && this.IsRunning) {
                        this.StopMonitoring();
                        break;
                    }
                }
            }
        };

        MonitorNodeManager.prototype.DeleteAllMonitorNodes = function () {
            for (var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                this.DeleteMonitorNode(Label);
                if (this.NodeCount < 1 && this.IsRunning) {
                    this.StopMonitoring();
                    break;
                }
            }
        };

        MonitorNodeManager.prototype.InitializeView = function (Doc) {
            var Panel = this.App.PictgramPanel;
            Doc.RenumberAll();
            var NewView = new AssureNote.NodeView(Doc.TopNode, true);
            NewView.SaveFoldedFlag(Panel.ViewMap);
            Panel.InitializeView(NewView);
        };

        MonitorNodeManager.prototype.UpdateView = function (Doc) {
            this.App.PictgramPanel.Draw(Doc.TopNode.GetLabel());
        };

        MonitorNodeManager.prototype.StartMonitoring = function (Interval) {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function () {
                console.log("Monitoring...");

                // Initialize red node map
                self.RedNodeMap = {};

                for (var Label in self.MonitorNodeMap) {
                    var MNode = self.MonitorNodeMap[Label];
                    if (MNode.IsDead()) {
                        self.DeleteMonitorNode(Label);
                        if (self.NodeCount < 1 && self.IsRunning) {
                            self.StopMonitoring();
                            break;
                        }
                        continue;
                    }

                    // Check red nodes
                    MNode.Update(self.Rec, function (Request, Status, Error) {
                        self.StopMonitoring();
                    } /* error handler */ );

                    if (!self.IsRunning)
                        break;

                    if (MNode.Status == false) {
                        var View = MNode.GetView();
                        while (View != null) {
                            self.RedNodeMap[View.Label] = true;
                            View = View.Parent;
                        }
                    }
                }

                // Update view
                var Doc = self.App.MasterRecord.GetLatestDoc();
                self.InitializeView(Doc);
                self.UpdateView(Doc);
            }, Interval);
        };

        MonitorNodeManager.prototype.StopMonitoring = function () {
            this.IsRunning = false;
            console.log("Stop monitoring...");
            clearTimeout(this.Timer);
        };
        return MonitorNodeManager;
    })();
    AssureNote.MonitorNodeManager = MonitorNodeManager;

    var MNodeManager = null;

    var MonitorStartCommand = (function (_super) {
        __extends(MonitorStartCommand, _super);
        function MonitorStartCommand(App) {
            _super.call(this, App);
        }
        MonitorStartCommand.prototype.GetCommandLineNames = function () {
            return ["monitor-start"];
        };

        MonitorStartCommand.prototype.GetHelpHTML = function () {
            return "<code>monitor-start</code><br>Start monitoring.";
        };

        MonitorStartCommand.prototype.Invoke = function (CommandName, Params) {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];

                // check params
                if (Param == "all") {
                    // Start all monitors
                    var IsFirst = true;
                    for (var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if (!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(this.App, Label);
                        if (!MNode.IsValid()) {
                            continue;
                        }

                        if (IsFirst) {
                            this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                            IsFirst = false;
                        }
                        MNodeManager.SetMonitorNode(MNode);
                    }
                } else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if (View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    var MNode = new MonitorNode(this.App, Label);
                    if (!MNode.IsValid()) {
                        this.App.DebugP("This node is not monitor");
                        return;
                    }

                    this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                    MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                    MNodeManager.SetMonitorNode(MNode);
                }

                MNodeManager.UpdateView(this.App.MasterRecord.EditingDoc);
                this.App.MasterRecord.CloseEditor();

                if (MNodeManager.NodeCount > 0 && !MNodeManager.IsRunning) {
                    MNodeManager.StartMonitoring(5000);
                }
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };
        return MonitorStartCommand;
    })(AssureNote.Command);
    AssureNote.MonitorStartCommand = MonitorStartCommand;

    var MonitorStopCommand = (function (_super) {
        __extends(MonitorStopCommand, _super);
        function MonitorStopCommand(App) {
            _super.call(this, App);
        }
        MonitorStopCommand.prototype.GetCommandLineNames = function () {
            return ["monitor-stop"];
        };

        MonitorStopCommand.prototype.GetHelpHTML = function () {
            return "<code>monitor-stop</code><br>Stop monitoring.";
        };

        MonitorStopCommand.prototype.Invoke = function (CommandName, Params) {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];
                if (Param == "all") {
                    // Stop all monitors
                    MNodeManager.DeleteAllMonitorNodes();
                } else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if (View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    MNodeManager.DeleteMonitorNode(Label);
                    if (MNodeManager.NodeCount < 1 && MNodeManager.IsRunning) {
                        MNodeManager.StopMonitoring();
                    }
                }
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };
        return MonitorStopCommand;
    })(AssureNote.Command);
    AssureNote.MonitorStopCommand = MonitorStopCommand;

    var MonitorNodePlugin = (function (_super) {
        __extends(MonitorNodePlugin, _super);
        function MonitorNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            MNodeManager = new MonitorNodeManager(this.AssureNoteApp);
            this.AssureNoteApp.RegistCommand(new MonitorStartCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new MonitorStopCommand(this.AssureNoteApp));
        }
        MonitorNodePlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            if (NodeView.Label in MNodeManager.RedNodeMap) {
                NodeView.ChangeColorStyle(AssureNote.ColorStyle.Danger);
            }
        };
        return MonitorNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.MonitorNodePlugin = MonitorNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
//# sourceMappingURL=MonitorNode.js.map
