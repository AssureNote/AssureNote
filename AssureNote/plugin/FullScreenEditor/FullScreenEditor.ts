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
					alert(TargetView.Label);
			});
		}
	}
}
