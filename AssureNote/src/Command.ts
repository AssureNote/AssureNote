///<reference path='AssureNote.ts'/>

module AssureNote {

    export class Command {
        constructor(public App: AssureNote.AssureNoteApp) {
        }
        
        public GetCommandLineName(): string {
            return "";
        }

        public GetDisplayName(): string {
            return "";
        }

        public Invoke(Target: NodeView, Params: any[]) {

        }

    }

    export class SaveCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineName(): string {
            return "w";
        }

        public GetDisplayName(): string {
            return "Save";
        }

        public Invoke(Target: NodeView, Params: any[]) {
            var Writer = new StringWriter();
            this.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), Params.length > 0 ? Params[0] : this.App.WGSNName);
        }
    }

    export class NewCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineName(): string {
            return "new";
        }

        public GetDisplayName(): string {
            return "New";
        }

        public Invoke(Target: NodeView, Params: any[]) {
            if (Params.length > 0) {
                this.App.LoadNewWGSN(Params[0], "* G1");
            } else {
                var Name = prompt("Enter the file name");
                if (Name != null) {
                    if (Name == "") {
                        Name = "default.wgsn";
                    }
                    this.App.LoadNewWGSN(Name, "* G1");
                }
            }
        }
    }

}