///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />


module AssureNote {
    export class VariableInterpolationPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        Supplant(str: string, map: any) {
            return str.replace(/\[([^\[\]]*)\]/g,
                (v: string, b: string) => {
                   var res = map[b];
                   return typeof res === 'string' || typeof res === 'number' ? res : v;
                }
            );
        }
	}
}
