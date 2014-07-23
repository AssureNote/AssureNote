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
            this.Index = this.App.MasterRecord.HistoryList.length - 1;
            this.Update();
            this.Element.show();
            this.IsVisible = true;
        };

        HistoryPanel.prototype.Hide = function () {
            this.Element.empty();
            this.Element.hide();
            if (this.Index != this.App.MasterRecord.HistoryList.length - 1) {
                this.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
            }
            this.IsVisible = false;
        };

        HistoryPanel.prototype.DrawGSN = function (TopGoal) {
            var NewNodeView = new AssureNote.NodeView(TopGoal, true);
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw();
        };

        HistoryPanel.prototype.Update = function () {
            var _this = this;
            this.Element.empty();
            var h = this.App.MasterRecord.HistoryList[this.Index];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var Counts = h.Doc.GetNodeCountForEachType();
            var AllCount = 0;
            for (var k in Counts) {
                AllCount += Counts[k];
            }
            var t = {
                Message: message,
                User: h.Author,
                DateTime: AssureNote.AssureNoteUtils.FormatDate(h.Date.toUTCString()),
                DateTimeString: Date.toLocaleString(),
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

            if (this.Index == 0) {
                $("#prev-revision").addClass("disabled");
                $("#first-revision").addClass("disabled");
            }

            if (this.Index == this.App.MasterRecord.HistoryList.length - 1) {
                $("#next-revision").addClass("disabled");
                $("#last-revision").addClass("disabled");
            }

            $("#history-panel-close").click(function () {
                _this.Hide();
            });

            $("#prev-revision").click(function () {
                var length = _this.App.MasterRecord.HistoryList.length;
                var OldIndex = _this.Index;
                _this.Index--;
                if (_this.Index < 0) {
                    _this.Index = 0;
                }
                while (!_this.App.MasterRecord.HistoryList[_this.Index].IsCommitRevision) {
                    if (_this.Index < 0) {
                        _this.Index = 0;
                        break;
                    }
                    _this.Index--;
                }
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });

            $("#first-revision").click(function () {
                var OldIndex = _this.Index;
                _this.Index = 0;
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });

            $("#next-revision").click(function () {
                var length = _this.App.MasterRecord.HistoryList.length;
                var OldIndex = _this.Index;
                _this.Index++;
                if (_this.Index >= length) {
                    _this.Index = length - 1;
                }
                while (!_this.App.MasterRecord.HistoryList[_this.Index].IsCommitRevision) {
                    _this.Index++;
                    if (_this.Index >= length) {
                        _this.Index = length - 1;
                        break;
                    }
                }
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });

            $("#last-revision").click(function () {
                var length = _this.App.MasterRecord.HistoryList.length;
                var OldIndex = _this.Index;
                _this.Index = length - 1;
                console.log(_this.Index);
                if (OldIndex != _this.Index) {
                    var TopGoal = _this.App.MasterRecord.HistoryList[_this.Index].Doc.TopNode;
                    _this.DrawGSN(TopGoal);
                    _this.Update();
                }
            });
        };
        return HistoryPanel;
    })(AssureNote.Panel);
    AssureNote.HistoryPanel = HistoryPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=HistoryView.js.map
