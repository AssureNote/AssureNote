///<reference path='../d.ts/jquery.d.ts'/>
var AssureNote;
(function (AssureNote) {
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
