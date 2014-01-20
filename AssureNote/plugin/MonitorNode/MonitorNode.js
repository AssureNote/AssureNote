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
        function MonitorNode(View) {
            this.View = View;
            this.Label = View.Label;
            this.Status = true;
            this.PastLogs = [];

            var ThisNode = View.Model;
            var GoalNode = ThisNode.GetCloseGoal();
            var ContextNode = null;
            for (var i = 0; i < GoalNode.SubNodeList.length; i++) {
                var BroutherNode = GoalNode.SubNodeList[i];
                if (BroutherNode.IsContext()) {
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
        };

        MonitorNode.prototype.Validate = function () {
            if (this.Location && this.Type && this.Condition) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.IsDead = function (App) {
            var View = App.PictgramPanel.ViewMap[this.Label];
            if (View == null) {
                return true;
            }
            return false;
        };

        MonitorNode.prototype.Update = function (Rec, ErrorCallback) {
            // Get latest data from REC
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if (LatestLog == null) {
                return;
            }

            // Update past logs
            if (!(this.PastLogs.length < 20)) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);

            // Update status
            var script = "var " + this.Type + "=" + LatestLog.data + ";";
            script += this.Condition + ";";
            this.Status = eval(script); // TODO Don't use eval()
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
        }
        MonitorNodeManager.prototype.SetMonitorNode = function (MNode) {
            if (!(MNode.Label in this.MonitorNodeMap)) {
                this.NodeCount += 1;
            }
            this.MonitorNodeMap[MNode.Label] = MNode;
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
                if (MNode.IsDead(this.App)) {
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

        MonitorNodeManager.prototype.StartMonitoring = function (Interval) {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function () {
                console.log("Monitoring...");

                // Initialize red node map
                var RedNodeMap = {};

                for (var Label in self.MonitorNodeMap) {
                    var MNode = self.MonitorNodeMap[Label];
                    if (MNode.IsDead(self.App)) {
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
                        var View = MNode.View;
                        while (View != null) {
                            RedNodeMap[View.Label] = true;
                            View = View.Parent;
                        }
                    }
                }

                for (var Label in RedNodeMap) {
                    self.App.PictgramPanel.ViewMap[Label].ChangeColorStyle(AssureNote.ColorStyle.Danger);
                }
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

        MonitorStartCommand.prototype.GetDisplayName = function () {
            return "Start Monitor";
        };

        MonitorStartCommand.prototype.GetHelpHTML = function () {
            return "<code>monitor-start</code><br>Start monitoring.";
        };

        MonitorStartCommand.prototype.Invoke = function (CommandName, Params) {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];
                if (Param == "all") {
                    for (var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if (!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(View);
                        if (!MNode.Validate()) {
                            continue;
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

                    var MNode = new MonitorNode(View);
                    if (!MNode.Validate()) {
                        this.App.DebugP("This node is not monitor");
                        return;
                    }

                    MNodeManager.SetMonitorNode(MNode);
                }

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

        MonitorStopCommand.prototype.GetDisplayName = function () {
            return "Stop Monitor";
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
        return MonitorNodePlugin;
    })(AssureNote.Plugin);
    AssureNote.MonitorNodePlugin = MonitorNodePlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
//# sourceMappingURL=MonitorNode.js.map
