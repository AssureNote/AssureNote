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
    })(AssureNote.AssureNoteUtils || (AssureNote.AssureNoteUtils = {}));
    var AssureNoteUtils = AssureNote.AssureNoteUtils;

    var AssureNoteApp = (function () {
        function AssureNoteApp() {
            //var Api = new AssureNote.ServerAPI("http://", "", "");
            this.OldPluginManager = new OldPlugInManager("");
            this.PluginManager = new PluginManager(this);
            this.PictgramPanel = new PictgramPanel(this);
            this.PluginPanel = new PluginPanel(this);
            this.GSNDoc = new GSNDoc();
        }
        AssureNoteApp.prototype.DebugP = function (Message) {
            console.log(Message);
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
                    var Case0 = new AssureNote.Case(Name, "{}", Contents, 0, 0, new AssureNote.OldPlugInManager(""));

                    var casedecoder = new AssureNote.CaseDecoder();
                    var root = casedecoder.ParseASN(Case0, Contents, null);
                    Case0.SetElementTop(root);
                    _this.Case = Case0;

                    //---
                    //var MasterRecord = new GSNRecord();
                    //MasterRecord.Parse(Contents);
                    _this.PictgramPanel.Draw(root.Label, 0, 0);
                };
                reader.readAsText(Files[0], 'utf-8');
            }
        };
        return AssureNoteApp;
    })();
    AssureNote.AssureNoteApp = AssureNoteApp;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=AssureNote.js.map
