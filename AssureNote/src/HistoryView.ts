///< reference path="../d.ts/jquery_plugins.d.ts" />
module AssureNote {
    export class HistoryCommand extends Command {
        private History: HistoryPanel;

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
            this.History = new HistoryPanel(App);
        }

        public GetCommandLineNames(): string[] {
            return ["history"];
        }

        public GetHelpHTML(): string {
            return "<code>history</code><br>."
        }

        public Invoke(CommandName: string, Params: any[]) {
            this.History.Show();
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class HistoryPanel extends Panel {
        private Element: JQuery;
        private Index: number;
        private VisibleRevisionList: number[];
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#history");
            this.Element.hide();
            this.App.HistoryPanel = this; //FIXME
        }

        Show(): void {
            var HistoryList = this.App.MasterRecord.HistoryList;
            this.VisibleRevisionList = HistoryList.filter(rev => rev.IsCommitRevision).map(rev => rev.Rev);
            this.VisibleRevisionList.push(HistoryList.length - 1);
            this.Index = this.VisibleRevisionList.length - 1;
            this.Update();
            this.Element.show();
            this.IsVisible = true;
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
            if (this.Index != this.VisibleRevisionList.length - 1) {
                this.App.PictgramPanel.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
            }
            this.IsVisible = false;
            this.VisibleRevisionList = null;
        }

        private OnRevisionChanged(OldRevision: number): void {
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
        }

        Update(): void {
            this.Element.empty();
            var HistoryList = this.App.MasterRecord.HistoryList;
            var h = HistoryList[this.VisibleRevisionList[this.Index]];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var Counts: any = h.Doc.GetNodeCountForEachType();
            var AllCount = 0;
            for (var k in Counts) {
                AllCount += Counts[k];
            }
            var t = <any>{
                Rev: this.Index + 1,
                Message: message,
                User: h.Author,
                DateTime: AssureNoteUtils.FormatDate(h.Date.toUTCString()),
                DateTimeString: h.Date.toLocaleString(),
                Count: {
                    All: AllCount,
                    Goal: Counts[GSNType.Goal],
                    Evidence: Counts[GSNType.Evidence],
                    Context: Counts[GSNType.Context],
                    Assumption: Counts[GSNType.Assumption],
                    Justification: Counts[GSNType.Justification],
                    Exception: Counts[GSNType.Exception],
                    Strategy: Counts[GSNType.Strategy]
                }
            };

            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            $("#history-panel-date").tooltip({});
            $("#history-panel-count").tooltip({
                html: true,
                title: 
                      "Goal: " + t.Count.Goal
                      + "<br>Evidence: " + t.Count.Evidence
                      + "<br>Context: " + t.Count.Context
                      + "<br>Assumption: " + t.Count.Assumption
                      + "<br>Justification: " + t.Count.Justification
                      + "<br>Exception: " + t.Count.Exception
                      + "<br>Strategy: " + t.Count.Strategy
            });

            if (this.Index <= 0) {
                $("#prev-revision").addClass("disabled");
                $("#first-revision").addClass("disabled");
            } else {
                $("#prev-revision").on("click", () => {
                    var OldIndex = this.Index;
                    this.Index--;
                    this.OnRevisionChanged(OldIndex);
                });

                $("#first-revision").on("click", () => {
                    var OldIndex = this.Index;
                    this.Index = 0;
                    this.OnRevisionChanged(OldIndex);
                });
            }

            if (this.Index >= this.VisibleRevisionList.length - 1) {
                $("#next-revision").addClass("disabled");
                $("#last-revision").addClass("disabled");
            } else {
                $("#next-revision").on("click", () => {
                    var OldIndex = this.Index;
                    this.Index++;
                    this.OnRevisionChanged(OldIndex);
                });

                $("#last-revision").on("click", () => {
                    var length = this.VisibleRevisionList.length;
                    var OldIndex = this.Index;
                    this.Index = length - 1;
                    this.OnRevisionChanged(OldIndex);
                });
            }

            $("#history-panel-close").on("click", () => {
                this.Hide();
            });
        }
    }
}
