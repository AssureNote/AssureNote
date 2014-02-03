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
        PastStatus: boolean[];
        PastLogs: any[];

        constructor(public App: AssureNoteApp, public Label: string) {
            this.Data = null;
            this.PastStatus = [];
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
            var TagMap = ContextModel.GetTagMapWithLexicalScope();
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

        GetLatestLog(): any {
            return this.PastLogs[0];
        }

        SetLatestLog(LatestLog: any): void {
            if(this.PastLogs.length > 10) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);
        }

        GetLatestStatus(): boolean {
            return this.PastStatus[0];
        }

        SetLatestStatus(LatestStatus: boolean): void {
            if(this.PastStatus.length > 10) {
                this.PastStatus.pop();
            }
            this.PastStatus.unshift(LatestStatus);
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

            // Don't update if latest log is same as past log
            if(JSON.stringify(LatestLog) == JSON.stringify(this.GetLatestLog())) {
                return;
            }

            // Check status
            this.Data = LatestLog.data;
            var Script = "var "+this.Type+"="+this.Data+";";
            Script += this.Condition+";";
            var LatestStatus = eval(Script);   // FIXME Don't use eval()

            // Update past logs & status
            this.SetLatestLog(LatestLog);
            this.SetLatestStatus(LatestStatus);

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
        NodeColorMap: { [key: string]: string };

        constructor(public App: AssureNote.AssureNoteApp) {
            this.MonitorNodeMap = {};
            this.NodeCount = 0;
            this.IsRunning = false;

            var RecURL = Config.RecURL;
            if(RecURL == null || RecURL == "") {
                RecURL = "http://localhost:3001/api/3.0/";   // Default REC
            }
            this.Rec = new RecApi(RecURL);

            this.NodeColorMap = {};
        }

        SetRecURL(URL: string): void {
            this.Rec = new RecApi(URL);
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
            NewView.SaveFlags(Panel.ViewMap);
            Panel.InitializeView(NewView);
        }

        UpdateView(Doc: GSNDoc): void {
            this.App.PictgramPanel.Draw(Doc.TopNode.GetLabel());
        }

        CheckPresumedNodeColor(): void {
            var self = this;
            var LabelMap = this.App.MasterRecord.GetLatestDoc().GetLabelMap();
            for(var Label in self.App.PictgramPanel.ViewMap) {
                var View = self.App.PictgramPanel.ViewMap[Label];
                var Model = View.Model;
                if(Model.HasTag) {
                    // Get presumed node label name
                    var PresumedNodeLabelName = null;
                    var TagValue = Model.GetTagMap().get("Presume");
                    if(TagValue != null) {
                        PresumedNodeLabelName = TagValue.replace(/\[|\]/g, "");
                    }

                    // Get presumed node label
                    var PresumedNodeLabel = null;
                    if(PresumedNodeLabelName != null) {
                        PresumedNodeLabel = LabelMap.get(PresumedNodeLabelName);
                    }
                    if(PresumedNodeLabel == null) {
                        PresumedNodeLabel = PresumedNodeLabelName;
                    }

                    // Check presumed node colors
                    var PresumedNodeIsColored = self.NodeColorMap[PresumedNodeLabel];
                    if((PresumedNodeIsColored != null) && PresumedNodeIsColored) {
                        var TargetView = View;

                        // Change the color of nodes that are upper than 'TargetNode' to 'Danger'
                        while(View != null) {
                            self.NodeColorMap[View.Label] = ColorStyle.Danger;
                            View = View.Parent;
                        }

                        if(TargetView.Model.IsContext()) {
                            TargetView = TargetView.Parent;
                        }

                        // Change the color of nodes that are lower than 'TargetNode' to 'Useless'
                        TargetView.ForEachVisibleChildren(function(ChildNodeView: NodeView) {
                            ChildNodeView.TraverseNode(function(SubNodeView: NodeView) {
                                self.NodeColorMap[SubNodeView.Label] = ColorStyle.Useless;
                            });
                        });
                    }
                }
            }
        }

        UpdateNodeColorMap(): void {
            this.NodeColorMap = {};
            for(var MNode in this.MonitorNodeMap) {
                if(MNode.GetLatestStatus() == false) {
                    var View = MNode.GetView();
                    while(View != null) {
                        this.NodeColorMap[View.Label] = ColorStyle.Danger;
                        View = View.Parent;
                    }
                }
            }
            this.CheckPresumedNodeColor();
        }

        StartMonitoring(Interval: number): void {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function() {
                console.log("Monitoring...")

                // Initialize red node map
                self.NodeColorMap = {};

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
                    if(MNode.GetLatestStatus() == false) {
                        var View = MNode.GetView();
                        while(View != null) {
                            self.NodeColorMap[View.Label] = ColorStyle.Danger;
                            View = View.Parent;
                        }
                    }
                }

                // Check presumed node colors
                self.CheckPresumedNodeColor();

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

    export class SetMonitorCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["set-monitor"];
        }

        public GetHelpHTML(): string {
            return "<code>set-monitor</code><br>Set node as monitor.";
        }

        public Invoke(CommandName: string, Params: any[]): void {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if(Params.length == 1) {
                var Param = Params[0];
                // check params
                if(Param == "all") {
                    // Set all monitors
                    var IsFirst = true;
                    for(var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if(!View.Model.IsEvidence()) {
                            continue;
                        }

                        var MNode = new MonitorNode(this.App, Label);
                        if(!MNode.IsValid()) {
                            this.App.DebugP("Node("+Label+") is not a monitor");
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
                        this.App.DebugP("This node is not a monitor");
                        return;
                    }

                    this.App.MasterRecord.OpenEditor("Monitor", "todo", null, "test");
                    MNodeManager.InitializeView(this.App.MasterRecord.EditingDoc);
                    MNodeManager.SetMonitorNode(MNode);
                }

                if(this.App.MasterRecord.EditingDoc != null) {
                    MNodeManager.UpdateView(this.App.MasterRecord.EditingDoc);
                    this.App.MasterRecord.CloseEditor();
                }

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

    export class UnsetMonitorCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["unset-monitor"];
        }

        public GetHelpHTML(): string {
            return "<code>unset-monitor</code><br>Unset node as monitor.";
        }

        public Invoke(CommandName: string, Params: any[]): void {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if(Params.length == 1) {
                var Param = Params[0];
                if(Param == "all") {
                    // Unset all monitors
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
                MNodeManager.UpdateNodeColorMap();
                var Doc = this.App.MasterRecord.GetLatestDoc();
                MNodeManager.InitializeView(Doc);
                MNodeManager.UpdateView(Doc);
            }
            else if(Params.length > 1) {
                console.log("Too many parameter");
            }
            else {
                console.log("Need parameter");
            }
        }

    }

    export class UseRecAtCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["use-rec-at"];
        }

        public GetHelpHTML(): string {
            return "<code>use-rec-at</code><br>Use specified REC.";
        }

        public Invoke(CommandName: string, Params: any[]): void {
            if(Params.length == 1) {
                MNodeManager.SetRecURL(Params[0]);
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
            this.AssureNoteApp.RegistCommand(new SetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UnsetMonitorCommand(this.AssureNoteApp));
            this.AssureNoteApp.RegistCommand(new UseRecAtCommand(this.AssureNoteApp));
        }

        RenderSVG(ShapeGroup: SVGGElement, NodeView: NodeView): void {
            if(NodeView.Label in MNodeManager.NodeColorMap) {
                NodeView.AddColorStyle(MNodeManager.NodeColorMap[NodeView.Label]);
            }
        }

        CreateTooltipContents(NodeView: NodeView): HTMLLIElement[]{
            if(!(NodeView.Label in MNodeManager.MonitorNodeMap)) {
                return null;
            }

            var MNode = MNodeManager.MonitorNodeMap[NodeView.Label];

            var ReturnValue: HTMLLIElement[] = [];
            var li = document.createElement('li');
            li.innerHTML = '<b>Monitor</b> is running on <b>'+MNode.Location+'<br><br></b>';
            ReturnValue.push(li);

            li = document.createElement('li');
            var table = document.createElement('table');
            table.setAttribute('border', '4');
            table.setAttribute('width', '250');
            table.setAttribute('align', 'center');

            var TableInnerHTML = '';
            TableInnerHTML += '<caption>REC Logs</caption>';
            TableInnerHTML += '<tr bgcolor="#cccccc">'
            TableInnerHTML += '<th>Timestamp</th>'
            TableInnerHTML += '<th>'+MNode.Type+'</th>'
            TableInnerHTML += '</tr>'

            for(var i: number = 0; i < MNode.PastLogs.length; i++) {
                var Log = MNode.PastLogs[i];
                var Status = MNode.PastStatus[i];
                if(Status == true) {
                    TableInnerHTML += '<tr align="center">'
                }
                else {
                    TableInnerHTML += '<tr align="center" bgcolor="#ffaa7d">'
                }
                TableInnerHTML += '<td>'+Log.timestamp+'</td>';
                TableInnerHTML += '<td>'+Log.data+'</td>';
                TableInnerHTML += '</tr>'
            }

            table.innerHTML = TableInnerHTML;
            li.innerHTML = table.outerHTML;
            ReturnValue.push(li);
            return ReturnValue;
        }

    }

}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
