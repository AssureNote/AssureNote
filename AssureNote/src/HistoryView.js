var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var AssureNote;
(function (AssureNote) {
    var HistoryCommand = (function (_super) {
        __extends(HistoryCommand, _super);
        function HistoryCommand(App) {
            _super.call(this, App);
            this.History = new HistoryPanel(App);
        }
        HistoryCommand.prototype.GetCommandLineNames = function () {
            return ["history"];
        };

        HistoryCommand.prototype.GetHelpHTML = function () {
            return "<code>history</code><br>.";
        };

        HistoryCommand.prototype.Invoke = function (CommandName, Params) {
            this.History.Show();
        };
        return HistoryCommand;
    })(AssureNote.Command);
    AssureNote.HistoryCommand = HistoryCommand;

    var HistoryPanel = (function (_super) {
        __extends(HistoryPanel, _super);
        function HistoryPanel(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#history");
            this.Element.hide();
            this.Element.click(function (Event) {
            });
            this.App.HistoryPanel = this; //TODO
        }
        HistoryPanel.prototype.Show = function () {
            var t = { Message: "hello", User: "who", DateTime: Date.now(), DateTimeString: Date.now().toString() };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            this.Element.show();
        };

        HistoryPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
        };

        HistoryPanel.prototype.OnActivate = function () {
        };

        HistoryPanel.prototype.OnDeactivate = function () {
        };

        HistoryPanel.prototype.OnKeyDown = function (Event) {
        };
        return HistoryPanel;
    })(AssureNote.Panel);
    AssureNote.HistoryPanel = HistoryPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=HistoryView.js.map
