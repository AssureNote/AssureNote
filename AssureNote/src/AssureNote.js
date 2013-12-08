///<reference path='SideMenu.ts'/>
var AssureNote;
(function (AssureNote) {
    (function (AssureNoteUtils) {
        function SaveAs(ContentString, FileName) {
            var blob = new Blob([ContentString], { type: 'text/plain; charset=UTF-8' });
            saveAs(blob, FileName);
        }
        AssureNoteUtils.SaveAs = SaveAs;

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
                case GSNType.Goal:
                    return new AssureNote.GSNGoalShape(NodeView);
                case GSNType.Context:
                    return new AssureNote.GSNContextShape(NodeView);
                case GSNType.Strategy:
                    return new AssureNote.GSNStrategyShape(NodeView);
                case GSNType.Evidence:
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
            this.PluginManager = new AssureNote.PluginManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
        }
        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
        };

        AssureNoteApp.Assert = function (b, message) {
            if (b == false) {
                console.log("Assert: " + message);
                throw "Assert: " + message;
            }
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var Method = ParsedCommand.GetMethod();
            if (Method == "search") {
                return;
            }
            var Plugin = this.PluginManager.GetCommandPlugin(ParsedCommand.GetMethod());
            if (Plugin != null) {
                Plugin.ExecCommand(this, ParsedCommand.GetArgs());
            } else {
                this.DebugP("undefined command: " + ParsedCommand.GetMethod());
            }
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            this.MasterRecord.Parse(WGSN);

            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopGoal;

            this.PictgramPanel.SetView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw(TopGoalNode.GetLabel(), null, null);

            var Shape = this.PictgramPanel.MasterView.GetShape();
            var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.ViewPort.SetOffset(WX, WY);
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
                    _this.LoadNewWGSN(Name, Contents);
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
