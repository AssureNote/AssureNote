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
            //this.Index = this.App.MasterRecord.HistoryList.length - 1;
            //this.Update();
            //this.Element.show();
            //this.IsVisible = true;
        };

        NodeCountPanel.prototype.Hide = function () {
            //this.Element.empty();
            //this.Element.hide();
            //if (this.Index != this.App.MasterRecord.HistoryList.length - 1) {
            //    this.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
            //}
            //this.IsVisible = false;
        };

        NodeCountPanel.prototype.DrawGSN = function (TopGoal) {
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw();
        };

        NodeCountPanel.prototype.Update = function () {
            //this.Element.empty();
            //var h = this.App.MasterRecord.HistoryList[this.Index];
            //var message = h.GetCommitMessage() || "(No Commit Message)";
            //var t = <any>{
            //    Message: message,
            //    User: h.Author,
            //    DateTime: AssureNoteUtils.FormatDate(h.DateString),
            //    DateTimeString: new Date(h.DateString).toLocaleString(),
            //    Count: {
            //        All: h.Doc.GetNodeCount(),
            //        Goal: h.Doc.GetNodeCountTypeOf(GSNType.Goal),
            //        Evidence: h.Doc.GetNodeCountTypeOf(GSNType.Evidence),
            //        Context: h.Doc.GetNodeCountTypeOf(GSNType.Context),
            //        Strategy: h.Doc.GetNodeCountTypeOf(GSNType.Strategy)
            //    }
            //};
            //$("#nodecount_tmpl").tmpl([t]).appendTo(this.Element);
            //$("#history-panel-date").tooltip({});
            //$("#history-panel-count").tooltip({
            //    html: true,
            //    title:
            //    "Goal: " + t.Count.Goal + ""
            //    + "<br>Evidence: " + t.Count.Evidence + ""
            //    + "<br>Context: " + t.Count.Context + ""
            //    + "<br>Strategy: " + t.Count.Strategy + ""
            //});
            //if (this.Index == 0) {
            //    $("#prev-revision").addClass("disabled");
            //    $("#first-revision").addClass("disabled");
            //}
            //if (this.Index == this.App.MasterRecord.HistoryList.length - 1) {
            //    $("#next-revision").addClass("disabled");
            //    $("#last-revision").addClass("disabled");
            //}
            //$("#history-panel-close").click(() => {
            //    this.Hide();
            //});
            //$("#prev-revision")
            //    .click(() => {
            //        var length = this.App.MasterRecord.HistoryList.length;
            //        var OldIndex = this.Index;
            //        this.Index--;
            //        if (this.Index < 0) {
            //            this.Index = 0;
            //        }
            //        while (!this.App.MasterRecord.HistoryList[this.Index].IsCommitRevision) {
            //            if (this.Index < 0) {
            //                this.Index = 0;
            //                break;
            //            }
            //            this.Index--;
            //        }
            //        console.log(this.Index);
            //        if (OldIndex != this.Index) {
            //            var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
            //            this.DrawGSN(TopGoal);
            //            this.Update();
            //        }
            //    });
            //$("#first-revision")
            //    .click(() => {
            //        var OldIndex = this.Index;
            //        this.Index = 0;
            //        console.log(this.Index);
            //        if (OldIndex != this.Index) {
            //            var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
            //            this.DrawGSN(TopGoal);
            //            this.Update();
            //        }
            //    });
            //$("#next-revision").click(() => {
            //    var length = this.App.MasterRecord.HistoryList.length;
            //    var OldIndex = this.Index;
            //    this.Index++;
            //    if (this.Index >= length) {
            //        this.Index = length - 1;
            //    }
            //    while (!this.App.MasterRecord.HistoryList[this.Index].IsCommitRevision) {
            //        this.Index++;
            //        if (this.Index >= length) {
            //            this.Index = length - 1;
            //            break;
            //        }
            //    }
            //    console.log(this.Index);
            //    if (OldIndex != this.Index) {
            //        var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
            //        this.DrawGSN(TopGoal);
            //        this.Update();
            //    }
            //});
            //$("#last-revision").click(() => {
            //    var length = this.App.MasterRecord.HistoryList.length;
            //    var OldIndex = this.Index;
            //    this.Index = length - 1;
            //    console.log(this.Index);
            //    if (OldIndex != this.Index) {
            //        var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
            //        this.DrawGSN(TopGoal);
            //        this.Update();
            //    }
            //});
        };
        return NodeCountPanel;
    })(AssureNote.Panel);
    AssureNote.NodeCountPanel = NodeCountPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=NodeCountView.js.map
