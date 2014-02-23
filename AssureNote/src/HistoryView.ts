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
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#history");
            this.Element.hide();
            this.App.HistoryPanel = this; //FIXME
        }

        Show(): void {
            this.Index = this.App.MasterRecord.HistoryList.length - 1;
            this.Update();
            this.Element.show();
            this.IsVisible = true;
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
            if (this.Index != this.App.MasterRecord.HistoryList.length - 1) {
                this.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
            }
            this.IsVisible = false;
        }

        DrawGSN(TopGoal: GSNNode): void {
            var NewNodeView: NodeView = new NodeView(TopGoal, true);
            this.App.PictgramPanel.InitializeView(NewNodeView);
            this.App.PictgramPanel.Draw();
        }

        Update(): void {
            this.Element.empty();
            var h = this.App.MasterRecord.HistoryList[this.Index];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var t = <any>{
                Message: message,
                User: h.Author,
                DateTime: AssureNoteUtils.FormatDate(h.DateString),
                DateTimeString: new Date(h.DateString).toLocaleString(),
                Count: {
                    All: h.Doc.GetNodeCount(),
                    Goal:     h.Doc.GetNodeCountTypeOf(GSNType.Goal),
                    Evidence: h.Doc.GetNodeCountTypeOf(GSNType.Evidence),
                    Context:  h.Doc.GetNodeCountTypeOf(GSNType.Context),
                    Strategy: h.Doc.GetNodeCountTypeOf(GSNType.Strategy)
                }
            };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            $("#history-panel-date").tooltip({});
            $("#history-panel-count").tooltip({
                html: true,
                title: 
                      "Goal: " + t.Count.Goal + ""
                    + "<br>Evidence: " + t.Count.Evidence + ""
                    + "<br>Context: "  + t.Count.Context  + ""
                    + "<br>Strategy: " + t.Count.Strategy + ""
            });

            if (this.Index == 0) {
                $("#prev-revision").addClass("disabled");
            }

            if (this.Index == this.App.MasterRecord.HistoryList.length - 1) {
                $("#next-revision").addClass("disabled");
            }

            $("#history-panel-close").click(()=>{
                this.Hide();
            });

            $("#prev-revision")
                .click(() => {
                var length = this.App.MasterRecord.HistoryList.length;
                var OldIndex = this.Index;
                this.Index--;
                if (this.Index < 0) {
                    this.Index = 0;
                }
                while (!this.App.MasterRecord.HistoryList[this.Index].IsCommitRevision) {
                    if (this.Index < 0) {
                        this.Index = 0;
                        break;
                    }
                    this.Index--;
                }
                console.log(this.Index);
                if (OldIndex != this.Index) {
                    var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
                    this.DrawGSN(TopGoal);
                    this.Update();
                }
            });

            $("#next-revision").click(() => {
                var length = this.App.MasterRecord.HistoryList.length;
                var OldIndex = this.Index;
                this.Index++;
                if (this.Index >= length) {
                    this.Index = length - 1;
                }
                while (!this.App.MasterRecord.HistoryList[this.Index].IsCommitRevision) {
                    this.Index++;
                    if (this.Index >= length) {
                        this.Index = length - 1;
                        break;
                    }
                }
                console.log(this.Index);
                if (OldIndex != this.Index) {
                    var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
                    this.DrawGSN(TopGoal);
                    this.Update();
                }
            });
        }
    }
}
