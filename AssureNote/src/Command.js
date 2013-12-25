///<reference path='AssureNote.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var Command = (function () {
        function Command(App) {
            this.App = App;
        }
        Command.prototype.GetCommandLineName = function () {
            return "";
        };

        Command.prototype.GetDisplayName = function () {
            return "";
        };

        Command.prototype.Invoke = function (Target, Params) {
        };
        return Command;
    })();
    AssureNote.Command = Command;

    var SaveCommand = (function (_super) {
        __extends(SaveCommand, _super);
        function SaveCommand(App) {
            _super.call(this, App);
        }
        SaveCommand.prototype.GetCommandLineName = function () {
            return "w";
        };

        SaveCommand.prototype.GetDisplayName = function () {
            return "Save";
        };

        SaveCommand.prototype.Invoke = function (Target, Params) {
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Params.length > 0 ? Params[0] : this.App.WGSNName);
        };
        return SaveCommand;
    })(Command);
    AssureNote.SaveCommand = SaveCommand;

    var NewCommand = (function (_super) {
        __extends(NewCommand, _super);
        function NewCommand(App) {
            _super.call(this, App);
        }
        NewCommand.prototype.GetCommandLineName = function () {
            return "new";
        };

        NewCommand.prototype.GetDisplayName = function () {
            return "New";
        };

        NewCommand.prototype.Invoke = function (Target, Params) {
            if (Params.length > 0) {
                this.App.LoadNewWGSN(Params[0], "* G1");
            } else {
                var Name = prompt("Enter the file name");
                if (Name != null) {
                    if (Name == "") {
                        Name = "default.wgsn";
                    }
                    this.App.LoadNewWGSN(Name, "* G1");
                }
            }
        };
        return NewCommand;
    })(Command);
    AssureNote.NewCommand = NewCommand;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
