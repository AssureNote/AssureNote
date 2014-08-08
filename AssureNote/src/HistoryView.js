var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///< reference path="../d.ts/jquery_plugins.d.ts" />
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

        HistoryCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
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
            this.App.HistoryPanel = this; //FIXME
        }
        HistoryPanel.prototype.Show = function () {
            var HistoryList = this.App.MasterRecord.HistoryList;
            this.VisibleRevisionList = HistoryList.filter(function (rev) {
                return rev.IsCommitRevision;
            }).map(function (rev) {
                return rev.Rev;
            });
            this.VisibleRevisionList.push(HistoryList.length - 1);
            this.Index = this.VisibleRevisionList.length - 1;
            this.Update();
            this.Element.show();
            this.IsVisible = true;
            var ModeManager = this.App.ModeManager;
            this.IsModeEditBeforeHistoryPanelOpened = ModeManager.GetMode() == 0 /* Edit */;
            ModeManager.ChangeMode(1 /* View */);
            ModeManager.SetReadOnly(true);
        };

        HistoryPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
            if (this.Index != this.VisibleRevisionList.length - 1) {
                this.App.PictgramPanel.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
            }
            this.IsVisible = false;
            this.VisibleRevisionList = null;
            var ModeManager = this.App.ModeManager;
            ModeManager.SetReadOnly(false);
            if (this.IsModeEditBeforeHistoryPanelOpened) {
                ModeManager.ChangeMode(0 /* Edit */);
            }
        };

        HistoryPanel.prototype.OnRevisionChanged = function (OldRevision) {
            if (OldRevision != this.Index) {
                var TopGoal = this.App.MasterRecord.HistoryList[this.VisibleRevisionList[this.Index]].Doc.TopNode;
                this.App.PictgramPanel.DrawGSN(TopGoal);
                $("#history-panel-close").off("click");
                $("#prev-revision").off("click");
                $("#first-revision").off("click");
                $("#next-revision").off("click");
                $("#last-revision").off("click");
                this.Update();
            }
        };

        HistoryPanel.prototype.Update = function () {
            var _this = this;
            this.Element.empty();
            var HistoryList = this.App.MasterRecord.HistoryList;
            var h = HistoryList[this.VisibleRevisionList[this.Index]];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var Counts = h.Doc.GetNodeCountForEachType();
            var AllCount = 0;
            for (var k in Counts) {
                AllCount += Counts[k];
            }
            var t = {
                Rev: this.Index + 1,
                Message: message,
                User: h.Author,
                DateTime: AssureNote.AssureNoteUtils.FormatDate(h.Date.toUTCString()),
                DateTimeString: h.Date.toLocaleString(),
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

            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            $("#history-panel-date").tooltip({});
            $("#history-panel-count").tooltip({
                html: true,
                title: "Goal: " + t.Count.Goal + "<br>Evidence: " + t.Count.Evidence + "<br>Context: " + t.Count.Context + "<br>Assumption: " + t.Count.Assumption + "<br>Justification: " + t.Count.Justification + "<br>Exception: " + t.Count.Exception + "<br>Strategy: " + t.Count.Strategy
            });

            if (this.Index <= 0) {
                $("#prev-revision").addClass("disabled");
                $("#first-revision").addClass("disabled");
            } else {
                $("#prev-revision").on("click", function () {
                    var OldIndex = _this.Index;
                    _this.Index--;
                    _this.OnRevisionChanged(OldIndex);
                });

                $("#first-revision").on("click", function () {
                    var OldIndex = _this.Index;
                    _this.Index = 0;
                    _this.OnRevisionChanged(OldIndex);
                });
            }

            if (this.Index >= this.VisibleRevisionList.length - 1) {
                $("#next-revision").addClass("disabled");
                $("#last-revision").addClass("disabled");
            } else {
                $("#next-revision").on("click", function () {
                    var OldIndex = _this.Index;
                    _this.Index++;
                    _this.OnRevisionChanged(OldIndex);
                });

                $("#last-revision").on("click", function () {
                    var length = _this.VisibleRevisionList.length;
                    var OldIndex = _this.Index;
                    _this.Index = length - 1;
                    _this.OnRevisionChanged(OldIndex);
                });
            }

            $("#history-panel-close").on("click", function () {
                _this.Hide();
            });
        };
        return HistoryPanel;
    })(AssureNote.Panel);
    AssureNote.HistoryPanel = HistoryPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=HistoryView.js.map
