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
				if (TargetView.GetNodeType() == GSNType.Strategy) {
					if (TargetView.Children != null) {
						for (var i = 0; i < TargetView.Children.length; i++) {
							var SubView = TargetView.Children[i];
							if (SubView.GetNodeType() == GSNType.Goal) {
								SubView.IsFolded = true;
							}
						}
					}
				} else {
					TargetView.IsFolded = TargetView.IsFolded != true;
				}
				var TopGoalView = TargetView;
				while (TopGoalView.Parent != null) {
					TopGoalView = TopGoalView.Parent;
				}
				var wx0 = TargetView.GetGX();
				var wy0 = TargetView.GetGY();
				this.AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null, 300); //FIXME Gx, Gy
				var wx1 = TargetView.GetGX();
				var wy1 = TargetView.GetGY();
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
				var TargetType = TargetView.GetNodeType();
				if (TargetType != GSNType.Goal && TargetType != GSNType.Strategy) {
					AssureNoteApp.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
					return;
				}
				this.FoldingAction(event, TargetView);
			} else {
				AssureNoteApp.DebugP(Label + " not found.");
			}
		}

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			if (NodeView.GetNodeType() != GSNType.Goal && NodeView.GetNodeType() != GSNType.Strategy) {
				return null;
			}
			return new MenuBarButton("folded-id", "images/copy.png", "fold", this.FoldingAction);
		}
	}
}
