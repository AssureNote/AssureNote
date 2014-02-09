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
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
            this.DrawGSN(this.App.MasterRecord.GetLatestDoc().TopNode);
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
                Count: h.Doc.GetNodeCount()
            };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);

            if (this.Index == 0) {
                $("#prev-revision").addClass("disabled");
            }

            if (this.Index == this.App.MasterRecord.HistoryList.length - 1) {
                $("#next-revision").addClass("disabled");
            }

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
