///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
    export class ToDoPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
            super();
        }

        RenderSVG(ShapeGroup: SVGGElement, NodeView: NodeView): void {
            var TagMap: HashMap<string, string> = NodeView.Model.GetTagMap();
            if (TagMap && TagMap.get('TODO')) {
                ShapeGroup.setAttribute('class', 'assurenote-todo');
            }
        }
	}
}