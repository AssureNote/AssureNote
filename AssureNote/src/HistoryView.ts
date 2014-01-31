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
            this.Index = 0;
        }

        Show(): void {
            //var t = <any>{ Message: "hello", User: "who", DateTime: Date.now(), DateTimeString: Date.now().toString() };
            this.Update();
            this.Element.show();
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
            this.Index = this.App.MasterRecord.HistoryList.length - 1;
        }

        DrawGSN(TopGoal: GSNNode): void {
            this.App.PictgramPanel.InitializeView(new AssureNote.NodeView(TopGoal, true));
            this.App.PictgramPanel.FoldDeepSubGoals(this.App.PictgramPanel.MasterView);
            this.App.PictgramPanel.Draw();
        }

        UpdatePanelView(): void {
            //this.Element.hide();
            this.Element.empty();
            var h = this.App.MasterRecord.HistoryList[this.Index];
            var message = h.GetCommitMessage() || "(No Commit Message)";
            var t = <any>{ Message: message, User: h.Author, DateTime: h.DateString };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            //this.Element.show();
        }

        Update(): void {
            this.UpdatePanelView();
            $("#prev-revision").click(() => {
                var length = this.App.MasterRecord.HistoryList.length;
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
                var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
                this.DrawGSN(TopGoal);
                this.UpdatePanelView();
            });

            $("#next-revision").click(() => {
                var length = this.App.MasterRecord.HistoryList.length;
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
                var TopGoal = this.App.MasterRecord.HistoryList[this.Index].Doc.TopNode;
                this.DrawGSN(TopGoal);
                this.UpdatePanelView();
            });
        }
    }
}