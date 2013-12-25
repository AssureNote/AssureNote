///<reference path='SideMenu.ts'/>
///<reference path='Socket.ts'/>
var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.PluginManager = new AssureNote.PluginManager(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
            this.Commands = new AssureNote.CommandLineBuiltinFunctions();
            this.CommandPrototypes = [];
        }
        AssureNoteApp.prototype.RegistCommand = function (Command) {
            this.CommandPrototypes.push(Command);
        };

        // Deprecated
        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
        };

        AssureNoteApp.Assert = function (b, message) {
            if (b == false) {
                console.log("Assert: " + message);
                throw "Assert: " + message;
            }
        };

        AssureNoteApp.prototype.ExecDoubleClicked = function (NodeView) {
            var Plugin = this.PluginManager.GetDoubleClicked();
            Plugin.ExecDoubleClicked(NodeView);
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var Method = ParsedCommand.GetMethod();
            if (Method == "search") {
                return;
            }
            var BuiltinCommand = this.Commands.GetFunction(Method);
            if (BuiltinCommand != null) {
                BuiltinCommand(this, ParsedCommand.GetArgs());
                return;
            }
            var Plugin = this.PluginManager.GetCommandPlugin(Method);
            if (Plugin != null) {
                Plugin.ExecCommand(this, ParsedCommand.GetArgs());
            } else {
                //TODO split jump-node function
                var Label = Method.toUpperCase();
                if (this.PictgramPanel.ViewMap == null) {
                    this.DebugP("Jump is diabled.");
                    return;
                }
                var Node = this.PictgramPanel.ViewMap[Label];
                if (Method == "" && Node == null) {
                    Label = this.PictgramPanel.FocusedLabel;
                    Node = this.PictgramPanel.ViewMap[Label];
                }
                if (Node != null) {
                    if ($("#" + Label.replace(/\./g, "\\.")).length > 0) {
                        this.PictgramPanel.Viewport.SetCaseCenter(Node.GetCenterGX(), Node.GetCenterGY());
                    } else {
                        this.DebugP("Invisible node " + Label + " Selected.");
                    }
                    return;
                }
                this.DebugP("undefined command: " + Method);
            }
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            this.MasterRecord.Parse(WGSN);

            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopGoal;

            this.PictgramPanel.SetView(new NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw();

            var Shape = this.PictgramPanel.MasterView.GetShape();
            var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);
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

                    /* TODO resolve conflict */
                    _this.SocketManager.UpdateWGSN();
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
