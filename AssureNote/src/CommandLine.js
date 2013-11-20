///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var CommandParser = (function () {
        function CommandParser(line) {
            this.Args = [];
            var s = line.split(" ");
            this.Method = s[0].slice(1);
            if (s.length > 1) {
                this.Args = s.slice(1);
            }
        }
        CommandParser.prototype.GetMethod = function () {
            return this.Method;
        };

        CommandParser.prototype.GetArgs = function () {
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
        }
        CommandLine.prototype.IsEnable = function () {
            return this.Element.css("display") == "block";
        };

        CommandLine.prototype.Clear = function () {
            this.Element.val("");
        };

        CommandLine.prototype.Show = function () {
            this.Element.css("display", "block");
            this.Element.focus();
        };

        CommandLine.prototype.Hide = function () {
            this.Element.css("display", "none");
        };

        CommandLine.prototype.GetValue = function () {
            return this.Element.val();
        };
        return CommandLine;
    })();
    AssureNote.CommandLine = CommandLine;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=CommandLine.js.map
