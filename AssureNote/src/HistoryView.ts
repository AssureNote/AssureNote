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
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#history");
            this.Element.hide();
            this.Element.click((Event: JQueryEventObject) => {
            });
            this.App.HistoryPanel = this; //TODO
        }

        Show(): void {
            var t = <any>{ Message: "hello", User: "who", DateTime: Date.now(), DateTimeString: Date.now().toString() };
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            this.Element.show();
        }

        Hide(): void {
            this.Element.empty();
            this.Element.hide();
        }

        OnActivate(): void {
        }

        OnDeactivate(): void {
        }

        OnKeyDown(Event: KeyboardEvent): void {
        }

    }
}