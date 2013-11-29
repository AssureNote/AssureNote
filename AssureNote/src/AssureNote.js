///<reference path='PluginManager.ts'/>
var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function GetNodeLabel(event) {
            var element = event.srcElement;
            while (element != null) {
                if (element.id != "") {
                    return element.id;
                }
                element = element.parentElement;
            }
            return "";
        }
        AssureNoteUtils.GetNodeLabel = GetNodeLabel;

        function GetNodePosition(Label) {
            var element = document.getElementById(Label);
            var view = element.getBoundingClientRect();
            return new AssureNote.Point(view.left, view.top);
        }
        AssureNoteUtils.GetNodePosition = GetNodePosition;

        function CreateGSNShape(NodeView) {
            switch (NodeView.GetNodeType()) {
                case AssureNote.GSNType.Goal:
                    return new AssureNote.GSNGoalShape(NodeView);
                case AssureNote.GSNType.Context:
                    return new AssureNote.GSNContextShape(NodeView);
                case AssureNote.GSNType.Strategy:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case AssureNote.GSNType.Evidence:
                    return new AssureNote.GSNEvidenceShape(NodeView);
            }
        }
        AssureNoteUtils.CreateGSNShape = CreateGSNShape;

        function CreateSVGElement(name) {
            return document.createElementNS('http://www.w3.org/2000/svg', name);
        }
        AssureNoteUtils.CreateSVGElement = CreateSVGElement;
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            //var Api = new AssureNote.ServerAPI("http://", "", "");
            this.OldPluginManager = new AssureNote.OldPlugInManager("");
            this.PluginManager = new AssureNote.PluginManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
            //this.GSNRecord = new GSNRecord();
        }
        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
        };

        AssureNoteApp.Assert = function (b, message) {
            if (b == false) {
                console.log("Assert: " + message);
            }
        };

        AssureNoteApp.prototype.ExecCommand = function (CommandLine) {
            var ParsedCommand = new AssureNote.CommandParser(CommandLine);
            var Plugin = this.PluginManager.GetCommandPlugin(ParsedCommand.GetMethod());
            if (Plugin != null) {
                Plugin.ExecCommand(this, ParsedCommand.GetArgs());
            } else {
                this.DebugP("undefined command: " + ParsedCommand.GetMethod());
            }
        };

        AssureNoteApp.prototype.ProcessDroppedFiles = function (Files) {
            var _this = this;
            if (Files[0]) {
                var reader = new FileReader();
                reader.onerror = function (event) {
                    console.log('error', (event.target).error.code);
                };

                reader.onload = function (event) {
                    var Contents = (event.target).result;
                    var Name = Files[0].name;

                    // ---Deprecated--
                    //var Case0: Case = new Case(Name, "{}", Contents, 0, 0, new OldPlugInManager(""));
                    //var casedecoder = new CaseDecoder();
                    //var root: NodeModel = casedecoder.ParseASN(Case0, Contents, null);
                    //Case0.SetElementTop(root);
                    //this.Case = Case0;
                    //this.PictgramPanel.Draw(root.Label, 0, 0);
                    //---
                    //FIXME
                    _this.MasterRecord = new AssureNote.GSNRecord();
                    _this.MasterRecord.Parse(Contents);

                    //this.Viewer = new AssureNoteViewer(this);
                    var LatestDoc = _this.MasterRecord.GetLatestDoc();

                    //this.Viewer.Set(LatestDoc);
                    var TopGoalNode = LatestDoc.TopGoal;
                    _this.PictgramPanel.SetView(new AssureNote.NodeView(TopGoalNode, true));
                    _this.PictgramPanel.Draw(TopGoalNode.GetLabel(), null, null);
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
