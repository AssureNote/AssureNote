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
///<reference path="../../src/RecApi.ts" />

module AssureNote {

    export class MonitorNode {

        Location: string;
        Type: string;
        Condition: string;
        Data: number;
        Status: boolean;
        PastLogs: any[];

        constructor(public App: AssureNoteApp, public Label: string) {
            this.Data = null;
            this.Status = true;
            this.PastLogs = [];

            var ThisModel = this.GetModel();
            var GoalModel = ThisModel.GetCloseGoal();
            var ContextModel = null;
            for(var i: number = 0; i < GoalModel.SubNodeList.length; i++) {
                var BroutherModel = GoalModel.SubNodeList[i];
                if(BroutherModel.IsContext()) {
                    ContextModel = BroutherModel;
                    break;
                }
            }
            if(ContextModel == null) {
                return;
            }
            var TagMap = ContextModel.GetTagMap();
            this.Location = TagMap.get("Location");
            this.Condition = TagMap.get("Condition");
            this.ExtractTypeFromCondition();
        }

        GetView(): NodeView {
            return this.App.PictgramPanel.ViewMap[this.Label];
        }

        GetModel(): GSNNode {
            return this.GetView().Model;
        }

        ExtractTypeFromCondition(): void {
            var text: string = this.Condition.replace(/\{|\}|\(|\)|==|<=|>=|<|>/g, " ");
            var words: string[] = text.split(" ");
            this.Type = null;
            for(var i: number = 0; i < words.length; i++) {
                if(words[i] != "" && !$.isNumeric(words[i])) {
                    this.Type = words[i];
                    break;
                }

            }
        }

        IsValid(): boolean {
            if(this.Location && this.Type && this.Condition) {
                return true;
            }
            return false;
        }

        IsDead(): boolean {
            if(this.GetView() == null) {
                return true;
            }
            return false;
        }

        UpdateModel(): void {
            var Model = this.GetModel();
            if(Model.TagMap == null) {
               Model.TagMap = new HashMap<string, string>();
            }
            var Value = this.Data ? this.Data+"" : "";
            Model.TagMap.put(this.Type, Value);
            Model.HasTag = true;

            var NodeDoc = Model.NodeDoc+Lib.LineFeed;;
            var Regex = new RegExp(this.Type+"\\s*::.*\\n", "g");
            if(NodeDoc.match(Regex)) {
                NodeDoc = NodeDoc.replace(Regex, this.Type+"::"+Value+Lib.LineFeed);
                NodeDoc = NodeDoc.slice(0, -1);
            }
            else {
                if(NodeDoc == Lib.LineFeed) {
                    NodeDoc = "";
                }
                NodeDoc += this.Type+"::"+Value;
            }
            Model.NodeDoc = NodeDoc;
            Model.LastModified = Model.BaseDoc.DocHistory;
        }

        Update(Rec: RecApi, ErrorCallback: (Request, Status, Error) => void): void {
            // Get latest data from REC
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if(LatestLog == null) {
                return;   // Ajax error
            }

            // Update past logs
            if(!(this.PastLogs.length < 20)) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);

            // Update status
            this.Data = LatestLog.data;
            var script = "var "+this.Type+"="+this.Data+";";
            script += this.Condition+";";
            this.Status = eval(script);   // FIXME Don't use eval()

            // Update model
            this.UpdateModel();
        }

    }

    export class MonitorNodeManager {

        MonitorNodeMap: { [key: string]: MonitorNode };
        NodeCount: number;
        IsRunning: boolean;
        Timer: number;
        Rec: RecApi;
        RedNodeMap: { [key: string]: boolean };   // Value doesn't make sense

        constructor(public App: AssureNote.AssureNoteApp) {
            this.MonitorNodeMap = {};
            this.NodeCount = 0;
            this.IsRunning = false;
            this.Rec = new RecApi("http://localhost:3001/api/3.0/");   // FIXME Make it configurable
            this.RedNodeMap = {};
        }

        SetMonitorNode(MNode: MonitorNode): void {
            if(!(MNode.Label in this.MonitorNodeMap)) {
                this.NodeCount += 1;
            }
            this.MonitorNodeMap[MNode.Label] = MNode;

            MNode.UpdateModel();
        }

        DeleteMonitorNode(Label: string): void {
            if(Label in this.MonitorNodeMap) {
                this.NodeCount -= 1;
                delete this.MonitorNodeMap[Label];
            }
        }

        DeleteDeadMonitorNodes(): void {
            for(var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                if(MNode.IsDead()) {
                    this.DeleteMonitorNode(Label);
                    if(this.NodeCount < 1 && this.IsRunning) {
                        this.StopMonitoring();
                        break;
                    }
                }
            }
        }

        DeleteAllMonitorNodes(): void {
            for(var Label in this.MonitorNodeMap) {
                var MNode = this.MonitorNodeMap[Label];
                this.DeleteMonitorNode(Label);
                if(this.NodeCount < 1 && this.IsRunning) {
                    this.StopMonitoring();
                    break;
                }
            }
        }

        InitializeView(Doc: GSNDoc): void {
            var Panel = this.App.PictgramPanel;
            Doc.RenumberAll();
            var NewView = new NodeView(Doc.TopNode, true);
            NewView.SaveFoldedFlag(Panel.ViewMap);
            Panel.InitializeView(NewView);
        }

        UpdateView(Doc: GSNDoc): void {
            this.App.PictgramPanel.Draw(Doc.TopNode.GetLabel());
        }

        StartMonitoring(Interval: number): void {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function() {
                console.log("Monitoring...")

                // Initialize red node map
                self.RedNodeMap = {};

                // Update monitor nodes
                var Doc = self.App.MasterRecord.GetLatestDoc();
                var IsFirst = true;
                for(var Label in self.MonitorNodeMap) {
                    var MNode = self.MonitorNodeMap[Label];
                    if(MNode.IsDead()) {
                        self.DeleteMonitorNode(Label);
                        if(self.NodeCount < 1 && self.IsRunning) {
                            self.StopMonitoring();
                            break;
                        }
                        continue;
                    }

                    // Update monitoring data
                    MNode.Update(self.Rec, function(Request, Status, Error) {
                        self.StopMonitoring();
                    } /* Error handler */);
                    if(!self.IsRunning) break;

                    // Update history if last modifier wasn't 'Monitor'
                    if(IsFirst) {
                        if(Doc.DocHistory.Author != "Monitor") {
                            self.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            Doc = self.App.MasterRecord.EditingDoc;
                        }
                        IsFirst = false;
                    }

                    // Change node color recursively if node's status is 'false'
                    if(MNode.Status == false) {
                        var View = MNode.GetView();
                        while(View != null) {
                            self.RedNodeMap[View.Label] = true;
                            View = View.Parent;
                        }
                    }
                }

                // Update view
                self.InitializeView(Doc);
                self.UpdateView(Doc);
                if(self.App.MasterRecord.EditingDoc != null) {
                    self.App.MasterRecord.CloseEditor();
                }
            }, Interval);
        }

        StopMonitoring(): void {
            this.IsRunning = false;
            console.log("Stop monitoring...");
            clearTimeout(this.Timer);
        }

    }

    var MNodeManager: MonitorNodeManager = null;

    export class MonitorStartCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["monitor-start"];
        }

        public GetHelpHTML(): string {
            return "<code>monitor-start</code><br>Start monitoring."
        }

        public Invoke(CommandName: string, Params: any[]): void {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if(Params.length == 1) {
                var Param = Params[0];
                // check params
                if(Param == "all") {
                    // Start all monitors
                    var IsFirst = true;
                    for(var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if(!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(this.App, Label);
                        if(!MNode.IsValid()) {
                            continue;
                        }

                        if(IsFirst) {
                            this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                            MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                            IsFirst = false;
                        }
                        MNodeManager.SetMonitorNode(MNode);
                    }
                }
                else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if(View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    var MNode = new MonitorNode(this.App, Label);
                    if(!MNode.IsValid()) {
                        this.App.DebugP("This node is not monitor");
                        return;
                    }

                    this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                    MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                    MNodeManager.SetMonitorNode(MNode);
                }

                MNodeManager.UpdateView(this.App.MasterRecord.EditingDoc);
                this.App.MasterRecord.CloseEditor();

                if(MNodeManager.NodeCount > 0 && !MNodeManager.IsRunning) {
                    MNodeManager.StartMonitoring(5000);
                }
            }
            else if(Params.length > 1) {
                console.log("Too many parameter");
            }
            else {
                console.log("Need parameter");
            }
        }

    }

    export class MonitorStopCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["monitor-stop"];
        }

        public GetHelpHTML(): string {
            return "<code>monitor-stop</code><br>Stop monitoring."
        }

        public Invoke(CommandName: string, Params: any[]): void {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if(Params.length == 1) {
                var Param = Params[0];
                if(Param == "all") {
                    // Stop all monitors
                    MNodeManager.DeleteAllMonitorNodes();
                }
                else {
                    var Label = Param;
                    var View = this.App.PictgramPanel.ViewMap[Label];
                    if(View == null) {
                        this.App.DebugP("Node not found");
                        return;
                    }

                    MNodeManager.DeleteMonitorNode(Label);
                    if(MNodeManager.NodeCount < 1 && MNodeManager.IsRunning) {
                        MNodeManager.StopMonitoring();
                    }
                }
            }
            else if(Params.length > 1) {
                console.log("Too many parameter");
            }
            else {
                console.log("Need parameter");
            }
        }

    }

    export class MonitorNodePlugin extends Plugin {

        constructor(public AssureNoteApp: AssureNoteApp) {
            super();
            MNodeManager = new MonitorNodeManager(this.AssureNoteApp);
            this.AssureNoteApp.RegistCommand(new MonitorStartCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new MonitorStopCommand(this.AssureNoteApp));
        }

        RenderSVG(ShapeGroup: SVGGElement, NodeView: NodeView): void {
            if(NodeView.Label in MNodeManager.RedNodeMap) {
                NodeView.ChangeColorStyle(ColorStyle.Danger);
            }
        }

    }

}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
