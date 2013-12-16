///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />


module AssureNote {
    export class VariableInterpolationPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        Style(str: string, cls: string): string {
            console.log('Match: ' + str);
            var div: HTMLSpanElement = document.createElement('span');
            div.className = cls;
            div.textContent = str;
            return div.outerHTML;
        }

        Supplant(str: string, map: any) {
            return str.replace(/\[([^\[\]]*)\]/g,
                (v: string, b: string) => {
                    var value = map[b];
                    if (typeof value === 'string' || typeof value === 'number') {
                        return this.Style(value, 'node-variable');
                    } else {
                        return this.Style(v, 'node-variable-undefined');
                    }
                }
            );
        }

        RenderHTML(NodeDoc: string, Model: GSNNode): string {
            var Map: HashMap<String, String> = Model.GetTagMapWithLexicalScope();
            return this.Supplant(NodeDoc, Map ? Map.hash : {});
        }
	}
}
