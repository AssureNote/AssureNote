///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />

module AssureNote {
	export class FullScreenEditorPlugin extends Plugin {
		constructor() {
			super();
			this.HasMenuBarButton = true;
		}

		CreateMenuBarButton(): MenuBarButton {
			return new MenuBarButton("fullscreeneditor", "images/editor.png", "fullscreeneditor",
				(event: Event, TargetView: NodeView) => {
					var Writer = new StringWriter();
					TargetView.Model.FormatSubNode(1, Writer);
					console.log(Writer.toString());
			});
		}
	}
}
