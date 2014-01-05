///<reference path='Socket.ts'/>
///<reference path='Command.ts'/>
///<reference path='DCaseModelXMLParser.ts'/>
var AssureNote;
(function (AssureNote) {
    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            this.PluginManager = new AssureNote.PluginManager(this);
            this.SocketManager = new AssureNote.SocketManager(this);
            this.PictgramPanel = new AssureNote.PictgramPanel(this);
            this.PluginPanel = new AssureNote.PluginPanel(this);
            this.Commands = {};

            this.DefaultCommand = new AssureNote.CommandMissingCommand(this);
            this.RegistCommand(new AssureNote.SaveCommand(this));
            this.RegistCommand(new AssureNote.OpenCommand(this));
            this.RegistCommand(new AssureNote.NewCommand(this));
            this.RegistCommand(new AssureNote.UnfoldAllCommand(this));
            this.RegistCommand(new AssureNote.SetColorCommand(this));
            this.RegistCommand(new AssureNote.SetScaleCommand(this));
            this.RegistCommand(new AssureNote.HelpCommand(this));
        }
        AssureNoteApp.prototype.RegistCommand = function (Command) {
            var Names = Command.GetCommandLineNames();
            for (var i = 0; i < Names.length; ++i) {
                this.Commands[Names[i]] = Command;
            }
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

        AssureNoteApp.prototype.FindCommandByCommandLineName = function (Name) {
            return this.Commands[Name] || this.DefaultCommand;
        };

        AssureNoteApp.prototype.ExecTopMenu = function (Id) {
            var Command = null;
            var Args = [];
            switch (Id) {
                case "create-wgsn-menu":
                    Command = this.FindCommandByCommandLineName("new");
                    break;
                case "open-menu":
                    Command = this.FindCommandByCommandLineName("open");
                    break;
                case "save-wgsn-menu":
                    Command = this.FindCommandByCommandLineName("w");
                    var Name = prompt("Enter the file name");
                    if (Name == null) {
                        return;
                    }
                    if (Name != "") {
                        Args = [Name.replace(/(\.\w+)?$/, ".wgsn")];
                    }
                    break;
                case "save-xmi-menu":
                    Command = this.FindCommandByCommandLineName("w");
                    var Name = prompt("Enter the file name");
                    if (Name == null) {
                        return;
                    }
                    if (Name == "") {
                        Args = [this.WGSNName.replace(/(\.\w+)?$/, ".dcase_model")];
                    } else {
                        Args = [Name.replace(/(\.\w+)?$/, ".dcase_model")];
                    }
                    break;
            }
            if (Command != null) {
                Command.Invoke(Id, this.PictgramPanel.MasterView, Args);
            }
        };

        AssureNoteApp.prototype.ExecCommand = function (ParsedCommand) {
            var CommandName = ParsedCommand.GetMethod();
            if (CommandName == "search") {
                return;
            }

            var Command = this.FindCommandByCommandLineName(CommandName);
            Command.Invoke(CommandName, this.PictgramPanel.GetFocusedView(), ParsedCommand.GetArgs());
        };

        AssureNoteApp.prototype.LoadNewWGSN = function (Name, WGSN) {
            var Extention = Name.split(".").pop();
            this.WGSNName = Name;
            this.MasterRecord = new GSNRecord();
            switch (Extention) {
                case "dcase_model":
                    new AssureNote.DCaseModelXMLParser(this.MasterRecord).Parse(WGSN);
                    break;
                default:
                case "wgsn":
                    this.MasterRecord.Parse(WGSN);
                    this.MasterRecord.RenumberAll();
                    break;
            }
            var LatestDoc = this.MasterRecord.GetLatestDoc();
            var TopGoalNode = LatestDoc.TopNode;

            this.PictgramPanel.SetView(new AssureNote.NodeView(TopGoalNode, true));
            this.PictgramPanel.SetFoldedAllGoalNode(this.PictgramPanel.MasterView);

            this.PictgramPanel.Draw();

            var Shape = this.PictgramPanel.MasterView.GetShape();
            var WX = window.innerWidth / 2 - Shape.GetNodeWidth() / 2;
            var WY = window.innerHeight / 3 - Shape.GetNodeHeight() / 2;
            this.PictgramPanel.Viewport.SetScale(1);
            this.PictgramPanel.Viewport.SetOffset(WX, WY);
        };

        AssureNoteApp.prototype.LoadFiles = function (Files) {
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
