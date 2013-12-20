var AssureNote;
(function (AssureNote) {
    var CommandPrototype = (function () {
        function CommandPrototype(Name, DisplayName) {
            this.Name = Name;
            this.DisplayName = DisplayName;
        }
        CommandPrototype.prototype.Instanciate = function (Target) {
            var Params = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                Params[_i] = arguments[_i + 1];
            }
            return new Command(this, Target, Params);
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
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Command.js.map
