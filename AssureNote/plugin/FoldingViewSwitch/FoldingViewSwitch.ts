///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
	export class FoldingViewSwitchPlugin extends Plugin {
		FoldingAction: (event: Event, TargetView: NodeView) => void;

		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
			this.HasMenuBarButton = true;

			this.FoldingAction = (event: Event, TargetView: NodeView) => {
				TargetView.IsFolded = TargetView.IsFolded != true;
				var TopGoalView = TargetView;
				while (TopGoalView.Parent != null) {
					TopGoalView = TopGoalView.Parent;
				}
				var wx0 = TargetView.GetGx();
				var wy0 = TargetView.GetGy();
				this.AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null, 300); //FIXME Gx, Gy
				var wx1 = TargetView.GetGx();
				var wy1 = TargetView.GetGy();
				var ViewPort = this.AssureNoteApp.PictgramPanel.ViewPort;
				var OffX0 = ViewPort.GetOffsetX();
				var OffY0 = ViewPort.GetOffsetY();
				this.AssureNoteApp.PictgramPanel.ViewPort.SetOffset(OffX0 + wx1 - wx0, OffY0 + wy1 - wy0);
			};
		}

		ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
			if (Args.length < 1) {
				AssureNoteApp.DebugP("no args");
				return;
			}
			var Label = Args[0].toUpperCase();
			var event = document.createEvent("UIEvents");
			var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
			if (TargetView != null) {
				if(TargetView.GetNodeType() != GSNType.Goal) {
					AssureNoteApp.DebugP("Only type 'Goal' can be allowed to fold.");
					return;
				}
				this.FoldingAction(event, TargetView);
			} else {
				AssureNoteApp.DebugP(Label + " not found.");
			}
		}

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			if (NodeView.GetNodeType() != GSNType.Goal) {
				return null;
			}
			return new MenuBarButton("folded-id", "images/copy.png", "fold", this.FoldingAction);
		}
	}
}
