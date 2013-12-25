///<reference path='AssureNote.ts'/>

module AssureNote {

    export class CommandPrototype {
        constructor(public App: AssureNote.AssureNoteApp) {
        }
        
        public Instanciate(Target: NodeView, ...Params: any[]) {
            return new Command(this, Target, Params);
        }

        public GetCommandLineName(): string {
            return "";
        }

        public GetDisplayName(): string {
            return "";
        }
    }

    export class Command {
        constructor(public Proto: CommandPrototype, public Target: NodeView, Params: any[]) {

        }

        public Invoke() {
        }
        public Revert() {
        }
    }

    export class SaveCommandPrototype extends CommandPrototype{
        public Instanciate(Target: NodeView, ...Params: any[]) {
            return new SaveCommand(this, Target, Params);
        }

        public GetCommandLineName(): string {
            return "w";
        }

        public GetDisplayName(): string {
            return "Save";
        }
    }

    export class SaveCommand extends Command {
        private FileName: string;

        constructor(Proto: CommandPrototype, Target: NodeView, Params: any[]) {
            super(Proto, Target, Params);
            this.FileName = Params.length > 0 ? Params[0] : this.Proto.App.WGSNName;
        }

        public Invoke() {
            var Writer = new StringWriter();
            this.Proto.App.MasterRecord.FormatRecord(Writer);
            AssureNote.AssureNoteUtils.SaveAs(Writer.toString(), this.FileName);
        }
        public Revert() {
        }
    }

}