///<reference path='AssureNote.ts'/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var CommandPrototype = (function () {
        function CommandPrototype(App) {
            this.App = App;
        }
        CommandPrototype.prototype.Instanciate = function (Target) {
            var Params = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                Params[_i] = arguments[_i + 1];
            }
            return new Command(this, Target, Params);
        };

        CommandPrototype.prototype.GetCommandLineName = function () {
            return "";
        };

        CommandPrototype.prototype.GetDisplayName = function () {
            return "";
        };
        return CommandPrototype;
    })();
    AssureNote.CommandPrototype = CommandPrototype;

    var Command = (function () {
        function Command(Proto, Target, Params) {
            this.Proto = Proto;
            this.Target = Target;
        }
        Command.prototype.Invoke = function () {
        };
        Command.prototype.Revert = function () {
        };
        return Command;
    })();
    AssureNote.Command = Command;

    var SaveCommandPrototype = (function (_super) {
        __extends(SaveCommandPrototype, _super);
        function SaveCommandPrototype() {
            _super.apply(this, arguments);
        }
        SaveCommandPrototype.prototype.Instanciate = function (Target) {
            var Params = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                Params[_i] = arguments[_i + 1];
            }
            return new SaveCommand(this, Target, Params);
        };

        SaveCommandPrototype.prototype.GetCommandLineName = function () {
            return "w";
        };

        SaveCommandPrototype.prototype.GetDisplayName = function () {
            return "Save";
        };
        return SaveCommandPrototype;
    })(CommandPrototype);
    AssureNote.SaveCommandPrototype = SaveCommandPrototype;

    var SaveCommand = (function (_super) {
        __extends(SaveCommand, _super);
        function SaveCommand(Proto, Target, Params) {
            _super.call(this, Proto, Target, Params);
            this.FileName = Params.length > 0 ? Params[0] : this.Proto.App.WGSNName;
        }
        SaveCommand.prototype.Invoke = function () {
            var Writer = new StringWriter();
            this.Proto.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), this.FileName);
        };
        SaveCommand.prototype.Revert = function () {
        };
        return SaveCommand;
    })(Command);
    AssureNote.SaveCommand = SaveCommand;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
