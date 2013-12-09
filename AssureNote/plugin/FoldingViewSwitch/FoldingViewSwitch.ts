///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
	export class FoldingViewSwitchPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
			this.HasMenuBarButton = true;
		}

		CreateMenuBarButton(): MenuBarButton {
			return new MenuBarButton("folded-id", "images/copy.png", "fold",
                (event: Event, TargetView: NodeView) => {
                    TargetView.IsFolded = TargetView.IsFolded != true;
                    var wx0 = TargetView.GetGx();
                    var wy0 = TargetView.GetGy();
                    this.AssureNoteApp.PictgramPanel.Draw();
                    var wx1 = TargetView.GetGx();
                    var wy1 = TargetView.GetGy();
                    var ViewPort = this.AssureNoteApp.PictgramPanel.ViewPort;
                    var OffX0 = ViewPort.GetOffsetX();
                    var OffY0 = ViewPort.GetOffsetY();
                    ViewPort.SetOffset(OffX0 + wx1 - wx0, OffY0 + wy1 - wy0);
				});
		}
	}
}
