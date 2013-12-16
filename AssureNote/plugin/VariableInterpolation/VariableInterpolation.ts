///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />


module AssureNote {
    export class VariableInterpolationPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        Style(str: string): string {
            console.log('Match: ' + str);
            var div: HTMLSpanElement = document.createElement('span');
            div.className = 'node-variable';
            div.textContent = str;
            return div.outerHTML;
        }

        Supplant(str: string, map: any) {
            return str.replace(/\[([^\[\]]*)\]/g,
                (v: string, b: string) => {
                    var value = map[b];
                    var res: string = typeof value === 'string' || typeof value === 'number' ? value : v;
                    return this.Style(res);
                }
            );
        }

        RenderHTML(NodeDoc: string): string {
            return this.Supplant(NodeDoc, {age: 10});
        }
	}
}
