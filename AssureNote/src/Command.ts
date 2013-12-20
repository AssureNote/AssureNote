
module AssureNote {

    export class CommandPrototype {
        constructor(private Name: string, private DisplayName: string) {
        }
        
        public Instanciate(Target: NodeView, ...Params: any[]) {
            return new Command(this, Target, Params);
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