///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var CommandParser = (function () {
        function CommandParser() {
        }
        CommandParser.prototype.Parse = function (line) {
            var s = line.split(" ");
            if (s.length > 0) {
                if (s[0][0].match(/\//) != null) {
                    this.Method = "search";
                    this.Args = [];
                    this.Args.push(line.slice(1));
                    return;
                } else if (s[0][0].match(/:/) != null) {
                    this.Method = s[0].slice(1);
                    if (s.length > 1) {
                        this.Args = s.slice(1);
                    }
                }
            }
        };

        CommandParser.prototype.GetMethod = function () {
            AssureNote.AssureNoteApp.Assert(this.Method != null);
            return this.Method;
        };

        CommandParser.prototype.GetArgs = function () {
            if (this.Args == null) {
                this.Args = [];
            }
            return this.Args;
        };

        CommandParser.prototype.GetArg = function (n) {
            return this.Args[n];
        };
        return CommandParser;
    })();
    AssureNote.CommandParser = CommandParser;

    var CommandLine = (function () {
        function CommandLine() {
            this.Element = $("#command-line");
            this.IsEnable = true;
            this.IsVisible = false;
        }
        CommandLine.prototype.Enable = function () {
            this.IsEnable = true;
        };

        CommandLine.prototype.Disable = function () {
            this.IsEnable = false;
            this.Hide();
        };

        CommandLine.prototype.Clear = function () {
            this.Element.val("");
        };

        CommandLine.prototype.Show = function () {
            this.Element.css("display", "block");
            this.Element.focus();
            this.IsVisible = true;
        };

        CommandLine.prototype.Hide = function () {
            this.Element.css("display", "none");
            this.IsVisible = false;
        };

        CommandLine.prototype.GetValue = function () {
            return this.Element.val();
        };
        return CommandLine;
    })();
    AssureNote.CommandLine = CommandLine;

    var CommandLineBuiltinFunctions = (function () {
        function CommandLineBuiltinFunctions() {
            this.FunctionMap = {};

            this.FunctionMap["new"] = function (AssureNoteApp, Args) {
                if (Args.length > 0) {
                    AssureNoteApp.LoadNewWGSN(Args[0], "* G1");
                } else {
                    var Name = prompt("Enter the file name");
                    if (Name != null) {
                        if (Name == "") {
                            Name = "default.wgsn";
                        }
                        AssureNoteApp.LoadNewWGSN(Name, "* G1");
                    }
                }
            };
        }
        CommandLineBuiltinFunctions.prototype.GetFunction = function (Key) {
            //FIXME
            return this.FunctionMap[Key];
        };
        return CommandLineBuiltinFunctions;
    })();
    AssureNote.CommandLineBuiltinFunctions = CommandLineBuiltinFunctions;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=CommandLine.js.map
