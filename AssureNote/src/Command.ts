
module AssureNote {

    export class CommandPrototype {
        constructor(private CommandLineName: string, private DisplayName: string) {
        }
        
        public Instanciate(Target: NodeView, ...Params: any[]) {
            return new Command(this, Target, Params);
        }

        public GetCommandLineName() {
            return this.CommandLineName;
        }

        public GetDisplayName() {
            return this.DisplayName;
        }
    }

    export class Command {
        constructor(private Proto: CommandPrototype, private Target: NodeView, Params: any[]) {

        }

        public Invoke() {
        }
        public Revert() {
        }
    }

}