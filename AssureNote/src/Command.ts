///<reference path='AssureNote.ts'/>

module AssureNote {
    export class Command {
        constructor(public App: AssureNote.AssureNoteApp) {
        }

        public GetCommandLineNames(): string[] {
            return [];
        }

        public GetDisplayName(): string {
            return "";
        }

        public Invoke(ForcusedView: NodeView, Params: any[]) {

        }
    }

    export class CommandMissingCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public Invoke(Target: NodeView, Params: any[]) {
        }
    }

    export class SaveCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["w"];
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

        public GetCommandLineNames(): string[] {
            return ["new"];
        }

        public GetDisplayName(): string {
            return "New";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
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

    export class UnfoldAllCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["unfoldAll", "unfold-all"];
        }

        public GetDisplayName(): string {
            return "Unfold All";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            var TopView = this.App.PictgramPanel.MasterView;
            var unfoldAll = (TargetView: NodeView) => {
                TargetView.IsFolded = false;
                TargetView.ForEachVisibleChildren((SubNode: NodeView) => {
                    unfoldAll(SubNode);
                });
            };
            unfoldAll(TopView);
            this.App.PictgramPanel.Draw();
        }
    }

    export class SetColorCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["setcolor", "set-color"];
        }

        public GetDisplayName(): string {
            return "Set Color...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            if (Params.length > 1) {
                var TargetLabel = Params[0];
                var Color = Params[1];
                if (this.App.PictgramPanel.ViewMap == null) {
                    console.log("'set color' is disabled.");
                } else {
                    var Node = this.App.PictgramPanel.ViewMap[TargetLabel];
                    if (Node != null) {
                        $("#" + TargetLabel + " h4").css("background-color", Color);
                    }
                }
            }
        }
    }

    export class SetScaleCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["setscale", "set-scale"];
        }

        public GetDisplayName(): string {
            return "Set Scale...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            if (Params.length > 0) {
                this.App.PictgramPanel.Viewport.SetScale(<number><any>Params[0] - 0);
            }
        }
    }

    export class OpenCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["e", "open"];
        }

        public GetDisplayName(): string {
            return "Open...";
        }

        public Invoke(FocusedView: NodeView, Params: any[]) {
            $("#file-open-dialog").change((e: Event) => {
                this.App.ProcessDroppedFiles(<any>(<HTMLInputElement>e.srcElement).files);
            });
            $("#file-open-dialog").click();
        }
    }
}