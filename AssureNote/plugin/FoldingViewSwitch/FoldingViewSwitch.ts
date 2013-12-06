///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
	function Xor(a: boolean, b: boolean): boolean {
		return (a || b) && !(a && b);
	}

	export class FoldingViewSwitchPlugin extends Plugin {
		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
			this.HasMenuBarButton = true;
		}

		CreateMenuBarButton(): MenuBarButton {
			return new MenuBarButton("folded-id", "images/copy.png", "fold",
				(event: Event, TargetView: NodeView) => {
					TargetView.ForEachVisibleAllSubNodes((SubNode: NodeView) => {
						SubNode.IsFolded = Xor(SubNode.IsFolded, true);
					});
					this.AssureNoteApp.PictgramPanel.Draw(TargetView.Label, null, null); //FIXME Gx, Gy
				});
		}
	}
}
