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

    export class MonitorNode {

        Label: string;
        Location: string;
        Type: string;
        Condition: string;
        Status: boolean;
        PastLogs: any[];

        constructor(public View: NodeView) {
            this.Label = View.Label;
            this.Status = true;
            this.PastLogs = [];

            var ThisNode = View.Model;
            var GoalNode = ThisNode.GetCloseGoal();
            var ContextNode = null;
            for(var i: number = 0; i < GoalNode.SubNodeList.length; i++) {
                var BroutherNode = GoalNode.SubNodeList[i];
                if(BroutherNode.NodeType == GSNType.Context) {
                    ContextNode = BroutherNode;
                    break;
                }
            }
            if(ContextNode == null) {
                return;
            }
            var TagMap = ContextNode.GetTagMap();
            this.Location = TagMap.get("Location");
            this.Condition = TagMap.get("Condition");
            this.ExtractTypeFromCondition();
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

        Validate(): boolean {
            if(this.Location && this.Type && this.Condition) {
                return true;    
            }
            return false;    
        }

        IsDead(App: AssureNote.AssureNoteApp): boolean {
            var View = App.PictgramPanel.ViewMap[this.Label];
            if(View == null) {
                return true;
            }
            return false;    
        }

        Update(Rec: RecApi, ErrorCallback: (Request, Status, Error) => void): void {
            // Get latest data from REC
            var LatestLog = Rec.GetLatestData(this.Location, this.Type, ErrorCallback);
            if(LatestLog == null) {
                return;   // ajax error
            }

            // Update past logs
            if(!(this.PastLogs.length < 20)) {
                this.PastLogs.pop();
            }
            this.PastLogs.unshift(LatestLog);

            // Update status
            var script = "var "+this.Type+"="+LatestLog.data+";";
            script += this.Condition+";";
            this.Status = eval(script);   // TODO Don't use eval()
        }

    }

    export class MonitorNodeManager {

        MonitorNodeMap: { [key: string]: MonitorNode };
        NodeCount: number;
        IsRunning: boolean;
        Timer: number;
        Rec: RecApi;

        constructor(public App: AssureNote.AssureNoteApp) {
            this.MonitorNodeMap = {};
            this.NodeCount = 0;
            this.IsRunning = false;
            this.Rec = new RecApi("http://localhost:3001/api/3.0/");   // FIXME make it configurable
        }

        SetMonitorNode(MNode: MonitorNode): void {
            if(!(MNode.Label in this.MonitorNodeMap)) {
                this.NodeCount += 1;
            }
            this.MonitorNodeMap[MNode.Label] = MNode;
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
                if(MNode.IsDead(this.App)) {
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

        StartMonitoring(Interval: number): void {
            this.IsRunning = true;
            console.log("Start monitoring...");

            var self = this;
            this.Timer = setInterval(function() {
                console.log("Monitoring...")

                // Initialize red node map
                var RedNodeMap: { [key: string]: boolean } = {};   // value doesn't make sense

                for(var Label in self.MonitorNodeMap) {
                    var MNode = self.MonitorNodeMap[Label];
                    if(MNode.IsDead(self.App)) {
                        self.DeleteMonitorNode(Label);
                        if(self.NodeCount < 1 && self.IsRunning) {
                            self.StopMonitoring();
                            break;
                        }
                        continue;
                    }

                    // Check red nodes
                    MNode.Update(self.Rec, function(Request, Status, Error) {
                        self.StopMonitoring();
                    } /* error handler */);

                    if(!self.IsRunning) break;

                    if(MNode.Status == false) {
                        var View = MNode.View;
                        while(View != null) {
                            RedNodeMap[View.Label] = true;
                            View = View.Parent;
                        }
                    }
                }

                // Update view
                for(var Label in RedNodeMap) {
                    self.App.PictgramPanel.ViewMap[Label].ChangeColorStyle(ColorStyle.Danger);
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

        public GetDisplayName(): string {
            return "Start Monitor";
        }

        public Invoke(CommandName: string, FocuseView: NodeView, Params: any[]): void {
            // Delete dead monitors before below process
            MNodeManager.DeleteDeadMonitorNodes();

            if(Params.length == 1) {
                var Param = Params[0];
                if(Param == "all") {
                    // Start all monitors
                    for(var Label in this.App.PictgramPanel.ViewMap) {
                        var View = this.App.PictgramPanel.ViewMap[Label];
                        if(View.Model.NodeType != GSNType.Evidence) {
                            continue;
                        }

                        var MNode = new MonitorNode(View);
                        if(!MNode.Validate()) {
                            continue;
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

                    var MNode = new MonitorNode(View);
                    if(!MNode.Validate()) {
                        this.App.DebugP("This node is not monitor");
                        return;
                    }

                    MNodeManager.SetMonitorNode(MNode);
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

    export class MonitorStopCommand extends Command {

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["monitor-stop"];
        }

        public GetDisplayName(): string {
            return "Stop Monitor";
        }

        public Invoke(CommandName: string, FocuseView: NodeView, Params: any[]): void {
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

    }

}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var MonitorNodePlugin = new AssureNote.MonitorNodePlugin(App);
    App.PluginManager.SetPlugin("Monitor", MonitorNodePlugin);
});
