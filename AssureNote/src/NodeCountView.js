var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///< reference path="../d.ts/jquery_plugins.d.ts" />
var AssureNote;
(function (AssureNote) {
    var NodeCountCommand = (function (_super) {
        __extends(NodeCountCommand, _super);
        function NodeCountCommand(App) {
            _super.call(this, App);
            this.NodeCount = new NodeCountPanel(App);
        }
        NodeCountCommand.prototype.GetCommandLineNames = function () {
            return ["nodecount"];
        };

        NodeCountCommand.prototype.GetHelpHTML = function () {
            return "<code>nodecount</code><br>.";
        };

        NodeCountCommand.prototype.Invoke = function (CommandName, Params) {
            this.NodeCount.Show();
        };

        NodeCountCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return NodeCountCommand;
    })(AssureNote.Command);
    AssureNote.NodeCountCommand = NodeCountCommand;

    var NodeCountPanel = (function (_super) {
        __extends(NodeCountPanel, _super);
        function NodeCountPanel(App) {
            _super.call(this, App);
            this.App = App;
            this.Element = $("#nodecount");
            this.Element.hide();
            this.App.NodeCountPanel = this; //FIXME
        }
        NodeCountPanel.prototype.Show = function () {
            this.Index = this.App.MasterRecord.HistoryList.length - 1;
            this.Update();
            this.Element.show();
            this.IsVisible = true;
        };

        NodeCountPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
            this.IsVisible = false;
        };

        NodeCountPanel.prototype.Update = function () {
            var _this = this;
            this.Element.empty();
            var label = this.App.PictgramPanel.GetFocusedLabel();
            var head;
            if (label) {
                head = this.App.GetNodeFromLabel(label).Model;
            } else {
                head = this.App.MasterRecord.GetLatestDoc().TopNode;
            }

            var Counts = head.GetNodeCountForEachType();
            var AllCount = 0;
            for (var k in Counts) {
                AllCount += Counts[k];
            }

            var t = {
                Name: head.GetLabel(),
                Count: {
                    All: AllCount,
                    Goal: Counts[0 /* Goal */],
                    Evidence: Counts[3 /* Evidence */],
                    Context: Counts[1 /* Context */],
                    Assumption: Counts[6 /* Assumption */],
                    Justification: Counts[5 /* Justification */],
                    Exception: Counts[7 /* Exception */],
                    Strategy: Counts[2 /* Strategy */]
                }
            };

            $("#nodecount_tmpl").tmpl([t]).appendTo(this.Element);
            $("#nodecount-panel-close").click(function () {
                _this.Hide();
            });
        };
        return NodeCountPanel;
    })(AssureNote.Panel);
    AssureNote.NodeCountPanel = NodeCountPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=NodeCountView.js.map
