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
            this.History.Activate();
        }
    }

    export class HistoryPanel extends Panel {
        private Element: JQuery;
        constructor(public App: AssureNoteApp) {
            super(App);
            this.Element = $("#history");
            this.Element.hide();
        }

        OnActivate(): void {
            var t = <any>{ Message: "hello", User: "who", DateTime: Date.now(), DateTimeString: Date.now().toString()};
            $("#history_tmpl").tmpl([t]).appendTo(this.Element);
            this.Element.show();
        }

        OnDeactivate(): void {
            this.Element.empty();
            this.Element.hide();
        }

        OnKeyDown(Event: KeyboardEvent): void {
            switch (Event.keyCode) {
                case 27: /*Esc*/
                    this.App.PictgramPanel.Activate();
            }
        }

        Show(): void {
            this.IsEnable = true;
        }

        Hide(): void {
            this.IsVisible = false;
        }
    }
}