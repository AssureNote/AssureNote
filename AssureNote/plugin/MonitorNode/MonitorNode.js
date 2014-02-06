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
            this.PastStatus = [];
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
            var TagMap = ContextModel.GetTagMapWithLexicalScope();
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

        MonitorNode.prototype.GetLatestLog = function () {
            return this.PastLogs[0];
        };

        MonitorNode.prototype.SetLatestLog = function (LatestLog) {
            if (this.PastLogs.length > 10) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);
        };

        MonitorNode.prototype.GetLatestStatus = function () {
            return this.PastStatus[0];
        };

        MonitorNode.prototype.SetLatestStatus = function (LatestStatus) {
            if (this.PastStatus.length > 10) {
                this.PastStatus.pop();
            }
            this.PastStatus.unshift(LatestStatus);
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
            Model.LastModified = Model.BaseDoc.DocHistory;
        };

        MonitorNode.prototype.Update = function (Rec, ErrorCallback) {
            // Get latest data from REC
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if (LatestLog == null) {
                return;
            }

            // Don't update if latest log is same as past log
            if (JSON.stringify(LatestLog) == JSON.stringify(this.GetLatestLog())) {
                return;
            }

            // Check status
            this.Data = LatestLog.data;
            var Script = "var " + this.Type + "=" + this.Data + ";";
            Script += this.Condition + ";";
            var LatestStatus = eval(Script);

            // Update past logs & status
            this.SetLatestLog(LatestLog);
            this.SetLatestStatus(LatestStatus);

            // Update model
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

            var RecURL = Config.RecURL;
            if (RecURL == null || RecURL == "") {
                RecURL = "http://localhost:3001/api/3.0/"; // Default REC
            }
            this.Rec = new AssureNote.RecApi(RecURL);

            this.NodeColorMap = {};
        }
        MonitorNodeManager.prototype.SetRecURL = function (URL) {
            this.Rec = new AssureNote.RecApi(URL);
        };

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
            NewView.SaveFlags(Panel.ViewMap);
            Panel.InitializeView(NewView);
        };

        MonitorNodeManager.prototype.UpdateView = function (Doc) {
            this.App.PictgramPanel.Draw(Doc.TopNode.GetLabel());
        };

        MonitorNodeManager.prototype.CheckPresumedNodeColor = function () {
            var self = this;
            var LabelMap = this.App.MasterRecord.GetLatestDoc().GetLabelMap();
            for (var Label in self.App.PictgramPanel.ViewMap) {
                var View = self.App.PictgramPanel.ViewMap[Label];
                var Model = View.Model;
                if (Model.HasTag) {
                    // Get presumed node label name
                    var PresumedNodeLabelName = null;
                    var TagValue = Model.GetTagMap().get("Presume");
                    if (TagValue != null) {
                        PresumedNodeLabelName = TagValue.replace(/\[|\]/g, "");
                    }

                    // Get presumed node label
                    var PresumedNodeLabel = null;
                    if (PresumedNodeLabelName != null) {
                        PresumedNodeLabel = LabelMap.get(PresumedNodeLabelName);
                    }
                    if (PresumedNodeLabel == null) {
                        PresumedNodeLabel = PresumedNodeLabelName;
                    }

                    // Check presumed node colors
                    var PresumedNodeIsColored = self.NodeColorMap[PresumedNodeLabel];
                    if ((PresumedNodeIsColored != null) && PresumedNodeIsColored) {
                        var TargetView = View;

                        while (View != null) {
                            self.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                            View = View.Parent;
                        }

                        if (TargetView.Model.IsContext()) {
                            TargetView = TargetView.Parent;
                        }

                        // Change the color of nodes that are lower than 'TargetNode' to 'Useless'
                        TargetView.ForEachVisibleChildren(function (ChildNodeView) {
                            ChildNodeView.TraverseNode(function (SubNodeView) {
                                self.NodeColorMap[SubNodeView.Label] = AssureNote.ColorStyle.Useless;
                            });
                        });
                    }
                }
            }
        };

        MonitorNodeManager.prototype.UpdateNodeColorMap = function () {
            this.NodeColorMap = {};
            for (var MNode in this.MonitorNodeMap) {
                if (MNode.GetLatestStatus() == false) {
                    var View = MNode.GetView();
                    while (View != null) {
                        this.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                        View = View.Parent;
                    }
                }
            }
            this.CheckPresumedNodeColor();
        };

        MonitorNodeManager.prototype.StartMonitoring = function (Interval) {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function () {
                console.log("Monitoring...");

                // Initialize red node map
                self.NodeColorMap = {};

                // Update monitor nodes
                var Doc = self.App.MasterRecord.GetLatestDoc();
                var IsFirst = true;
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

                    // Update monitoring data
                    MNode.Update(self.Rec, function (Request, Status, Error) {
                        self.StopMonitoring();
                    } /* Error handler */ );
                    if (!self.IsRunning)
                        break;

                    // Update history if last modifier wasn't 'Monitor'
                    if (IsFirst) {
                        if (Doc.DocHistory.Author != "Monitor") {
                            self.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            Doc = self.App.MasterRecord.EditingDoc;
                        }
                        IsFirst = false;
                    }

                    // Change node color recursively if node's status is 'false'
                    if (MNode.GetLatestStatus() == false) {
                        var View = MNode.GetView();
                        while (View != null) {
                            self.NodeColorMap[View.Label] = AssureNote.ColorStyle.Danger;
                            View = View.Parent;
                        }
                    }
                }

                // Check presumed node colors
                self.CheckPresumedNodeColor();

                // Update view
                self.InitializeView(Doc);
                self.UpdateView(Doc);
                if (self.App.MasterRecord.EditingDoc != null) {
                    self.App.MasterRecord.CloseEditor();
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

    var SetMonitorCommand = (function (_super) {
        __extends(SetMonitorCommand, _super);
        function SetMonitorCommand(App) {
            _super.call(this, App);
        }
        SetMonitorCommand.prototype.GetCommandLineNames = function () {
            return ["set-monitor"];
        };

        SetMonitorCommand.prototype.GetHelpHTML = function () {
            return "<code>set-monitor</code><br>Set node as monitor.";
        };

        SetMonitorCommand.prototype.Invoke = function (CommandName, Params) {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];

                // check params
                if (Param == "all") {
                    // Set all monitors
                    var IsFirst = true;
                    for (var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if (!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(this.App, Label);
                        if (!MNode.IsValid()) {
                            this.App.DebugP("Node(" + Label + ") is not a monitor");
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
                    if (!View.Model.IsEvidence()) {
                        this.App.DebugP("This node is not a monitor");
                        return;
                    }

                    var MNode = new MonitorNode(this.App, Label);
                    if (!MNode.IsValid()) {
                        this.App.DebugP("This node is not a monitor");
                        return;
                    }

                    this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                    MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                    MNodeManager.SetMonitorNode(MNode);
                }

                if (this.App.MasterRecord.EditingDoc != null) {
                    MNodeManager.UpdateView(this.App.MasterRecord.EditingDoc);
                    this.App.MasterRecord.CloseEditor();
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
        return SetMonitorCommand;
    })(AssureNote.Command);
    AssureNote.SetMonitorCommand = SetMonitorCommand;

    var UnsetMonitorCommand = (function (_super) {
        __extends(UnsetMonitorCommand, _super);
        function UnsetMonitorCommand(App) {
            _super.call(this, App);
        }
        UnsetMonitorCommand.prototype.GetCommandLineNames = function () {
            return ["unset-monitor"];
        };

        UnsetMonitorCommand.prototype.GetHelpHTML = function () {
            return "<code>unset-monitor</code><br>Unset node as monitor.";
        };

        UnsetMonitorCommand.prototype.Invoke = function (CommandName, Params) {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if (Params.length == 1) {
                var Param = Params[0];
                if (Param == "all") {
                    // Unset all monitors
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
                MNodeManager.UpdateNodeColorMap();
                var Doc = this.App.MasterRecord.GetLatestDoc();
                MNodeManager.InitializeView(Doc);
                MNodeManager.UpdateView(Doc);
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };
        return UnsetMonitorCommand;
    })(AssureNote.Command);
    AssureNote.UnsetMonitorCommand = UnsetMonitorCommand;

    var UseRecAtCommand = (function (_super) {
        __extends(UseRecAtCommand, _super);
        function UseRecAtCommand(App) {
            _super.call(this, App);
        }
        UseRecAtCommand.prototype.GetCommandLineNames = function () {
            return ["use-rec-at"];
        };

        UseRecAtCommand.prototype.GetHelpHTML = function () {
            return "<code>use-rec-at</code><br>Use specified REC.";
        };

        UseRecAtCommand.prototype.Invoke = function (CommandName, Params) {
            if (Params.length == 1) {
                MNodeManager.SetRecURL(Params[0]);
            } else if (Params.length > 1) {
                console.log("Too many parameter");
            } else {
                console.log("Need parameter");
            }
        };
        return UseRecAtCommand;
    })(AssureNote.Command);
    AssureNote.UseRecAtCommand = UseRecAtCommand;

    var ShowMonitorListCommand = (function (_super) {
        __extends(ShowMonitorListCommand, _super);
        function ShowMonitorListCommand(App) {
            _super.call(this, App);
            var Modal = $('\
<div id="monitorlist-modal" tabindex="-1" role="dialog" aria-labelledby="monitorlist-modal-label" aria-hidden="true" class="modal fade">\n\
  <div class="modal-dialog">\n\
    <div class="modal-content">\n\
      <div class="modal-header">\n\
        <button type="button" data-dismiss="modal" aria-hidden="true" class="close">&times;</button>\n\
        <h4 id="monitorlist-modal-label" class="modal-title">Active Monitor List</h4>\n\
      </div>\n\
      <div id="monitorlist-modal-body" class="modal-body">\n\
      </div>\n\
      <div class="modal-footer">\n\
        <button type="button" data-dismiss="modal" class="btn btn-default">Close</button>\n\
      </div>\n\
    </div>\n\
  </div>\n\
</div>\n\
            ');
            $('#plugin-layer').append(Modal);
        }
        ShowMonitorListCommand.prototype.GetCommandLineNames = function () {
            return ["show-monitorlist"];
        };

        ShowMonitorListCommand.prototype.GetHelpHTML = function () {
            return "<code>show-monitorlist</code><br>Show list of monitors.";
        };

        ShowMonitorListCommand.prototype.UpdateMonitorList = function () {
            var ModalBody = $("#monitorlist-modal-body")[0];

            var Table = document.createElement('table');
            Table.setAttribute('border', '4');
            Table.setAttribute('width', '90%');
            Table.setAttribute('align', 'center');

            var TableInnerHTML = '';
            TableInnerHTML += '<tr align="center" bgcolor="#cccccc">';
            TableInnerHTML += '<th>Label</th>';
            TableInnerHTML += '<th>Type</th>';
            TableInnerHTML += '<th>Location</th>';
            TableInnerHTML += '<th>AuthID</th>';
            TableInnerHTML += '<th>Last Update</th>';
            TableInnerHTML += '</tr>';

            for (var Label in MNodeManager.MonitorNodeMap) {
                var MNode = MNodeManager.MonitorNodeMap[Label];
                if (MNode.GetLatestStatus() == true) {
                    TableInnerHTML += '<tr align="center">';
                } else {
                    TableInnerHTML += '<tr align="center" bgcolor="#ffaa7d">';
                }
                TableInnerHTML += '<td>' + MNode.Label + '</td>';
                TableInnerHTML += '<td>' + MNode.Type + '</td>';
                TableInnerHTML += '<td>' + MNode.Location + '</td>';
                TableInnerHTML += '<td>' + MNode.GetLatestLog().authid + '</td>';
                TableInnerHTML += '<td>' + MNode.GetLatestLog().timestamp + '</td>';
                TableInnerHTML += '</tr>';
            }

            Table.innerHTML = TableInnerHTML;
            ModalBody.innerHTML = Table.outerHTML;
        };

        ShowMonitorListCommand.prototype.Invoke = function (CommandName, Params) {
            this.UpdateMonitorList();
            $('#monitorlist-modal').modal();
        };
        return ShowMonitorListCommand;
    })(AssureNote.Command);
    AssureNote.ShowMonitorListCommand = ShowMonitorListCommand;

    var SetMonitorMenuItem = (function (_super) {
        __extends(SetMonitorMenuItem, _super);
        function SetMonitorMenuItem() {
            _super.apply(this, arguments);
        }
        SetMonitorMenuItem.prototype.GetIconName = function () {
            if (MNodeManager.IsRunning) {
                return "minus";
            } else {
                return "plus";
            }
        };

        SetMonitorMenuItem.prototype.GetDisplayName = function () {
            if (MNodeManager.IsRunning) {
                return "Unset";
            } else {
                return "Set";
            }
        };

        SetMonitorMenuItem.prototype.Invoke = function (App) {
            if (MNodeManager.IsRunning) {
                var Command = App.FindCommandByCommandLineName("unset-monitor");
                if (Command != null) {
                    Command.Invoke(null, ["all"]);
                }
            } else {
                var Command = App.FindCommandByCommandLineName("set-monitor");
                if (Command != null) {
                    Command.Invoke(null, ["all"]);
                }
            }
            App.TopMenu.Render(App, $("#top-menu").empty()[0], true);
        };
        return SetMonitorMenuItem;
    })(AssureNote.TopMenuItem);
    AssureNote.SetMonitorMenuItem = SetMonitorMenuItem;

    var MonitorNodePlugin = (function (_super) {
        __extends(MonitorNodePlugin, _super);
        function MonitorNodePlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            MNodeManager = new MonitorNodeManager(this.AssureNoteApp);
            this.SetHasMenuBarButton(true);
            this.AssureNoteApp.RegistCommand(new SetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UnsetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UseRecAtCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new ShowMonitorListCommand(this.AssureNoteApp));
            this.AssureNoteApp.TopMenu.AppendSubMenu(new AssureNote.SubMenuItem("Monitor", "eye-open", [
                new SetMonitorMenuItem()
            ]));
        }
        MonitorNodePlugin.prototype.CreateMenuBarButton = function (View) {
            if (!View.Model.IsEvidence()) {
                return null;
            }

            var App = this.AssureNoteApp;
            var MNode = new MonitorNode(App, View.Label);

            // If it is 'MonitorNode'
            if (MNode.IsValid) {
                // If it has been already set as 'MonitorNode'
                if (MNode.Label in MNodeManager.MonitorNodeMap) {
                    return new AssureNote.NodeMenuItem("unset-monitor", "/images/monitor.png", "unset\ monitor", function (event, TargetView) {
                        var Command = App.FindCommandByCommandLineName("unset-monitor");
                        if (Command != null) {
                            Command.Invoke(null, [TargetView.Label]);
                        }
                    });
                } else {
                    return new AssureNote.NodeMenuItem("set-monitor", "/images/monitor.png", "set\ monitor", function (event, TargetView) {
                        var Command = App.FindCommandByCommandLineName("set-monitor");
                        if (Command != null) {
                            Command.Invoke(null, [TargetView.Label]);
                        }
                    });
                }
            }

            return null;
        };

        MonitorNodePlugin.prototype.CreateTooltipContents = function (NodeView) {
            if (!(NodeView.Label in MNodeManager.MonitorNodeMap)) {
                return null;
            }

            var MNode = MNodeManager.MonitorNodeMap[NodeView.Label];

            var ReturnValue = [];
            var Li = document.createElement('li');
            Li.innerHTML = '<b>Monitor</b> is running on <b>' + MNode.Location + '<br></b>';
            ReturnValue.push(Li);

            var LatestLog = MNode.GetLatestLog();
            if (LatestLog != null) {
                Li = document.createElement('li');
                Li.innerHTML = '<b>Monitor</b> is certificated by <b>' + MNode.GetLatestLog().authid + '<br></b>';
                ReturnValue.push(Li);
            }

            Li = document.createElement('li');
            Li.innerHTML = '<hr>';
            ReturnValue.push(Li);

            Li = document.createElement('li');
            var Table = document.createElement('table');
            Table.setAttribute('border', '4');
            Table.setAttribute('width', '250');
            Table.setAttribute('align', 'center');

            var TableInnerHTML = '';
            TableInnerHTML += '<caption>REC Logs</caption>';
            TableInnerHTML += '<tr align="center" bgcolor="#cccccc">';
            TableInnerHTML += '<th>Timestamp</th>';
            TableInnerHTML += '<th>' + MNode.Type + '</th>';
            TableInnerHTML += '</tr>';

            for (var i = 0; i < MNode.PastLogs.length; i++) {
                var Log = MNode.PastLogs[i];
                var Status = MNode.PastStatus[i];
                if (Status == true) {
                    TableInnerHTML += '<tr align="center">';
                } else {
                    TableInnerHTML += '<tr align="center" bgcolor="#ffaa7d">';
                }
                TableInnerHTML += '<td>' + Log.timestamp + '</td>';
                TableInnerHTML += '<td>' + Log.data + '</td>';
                TableInnerHTML += '</tr>';
            }

            Table.innerHTML = TableInnerHTML;
            Li.innerHTML = Table.outerHTML;
            ReturnValue.push(Li);
            return ReturnValue;
        };

        MonitorNodePlugin.prototype.RenderSVG = function (ShapeGroup, NodeView) {
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.Danger);
            NodeView.RemoveColorStyle(AssureNote.ColorStyle.Useless);
            if (NodeView.Label in MNodeManager.NodeColorMap) {
                NodeView.AddColorStyle(MNodeManager.NodeColorMap[NodeView.Label]);
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
