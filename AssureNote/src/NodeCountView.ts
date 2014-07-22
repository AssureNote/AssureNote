///< reference path="../d.ts/jquery_plugins.d.ts" />
module AssureNote {

    export class NodeCountCommand extends Command {
        private NodeCount: NodeCountPanel;

        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
            this.NodeCount = new NodeCountPanel(App);
        }

        public GetCommandLineNames(): string[] {
            return ["nodecount"];
        }

        public GetHelpHTML(): string {
            return "<code>nodecount</code><br>."
        }

        public Invoke(CommandName: string, Params: any[]) {
            this.NodeCount.Show();
        }

        public CanUseOnViewOnlyMode(): boolean {
            return true;
        }
    }

    export class NodeCountPanel extends Panel {
        private Element: JQuery;
        private Index: number;
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#nodecount");
            this.Element.hide();
            this.App.NodeCountPanel = this; //FIXME
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
            this.IsVisible = false;
        }

        Update(): void {
            this.Element.empty();
            var label = this.App.PictgramPanel.GetFocusedLabel();
            var head: GSNNode;
            if (label) {
                head = this.App.GetNodeFromLabel(label).Model;
            } else {
                head = this.App.MasterRecord.GetLatestDoc().TopNode;
            }

            var Counts: any = head.GetNodeCountForEachType();
            var AllCount = 0;
            for (var k in Counts) {
                AllCount += Counts[k];
            }

            var t = <any>{
                Name: head.GetLabel(),
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

            $("#nodecount_tmpl").tmpl([t]).appendTo(this.Element);
            $("#nodecount-panel-close").click(() => {
                this.Hide();
            });
        }
    }
}