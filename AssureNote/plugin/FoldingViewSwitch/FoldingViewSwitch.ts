///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {
	export class FoldingViewSwitchPlugin extends Plugin {
		FoldingAction: (event: Event, TargetView: NodeView) => void;
		StrategyFoldingFlag: boolean;

		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
			this.HasMenuBarButton = true;
			this.StrategyFoldingFlag = false;

			this.FoldingAction = (event: Event, TargetView: NodeView) => {
				if (TargetView.GetNodeType() == GSNType.Strategy) {
					if (TargetView.Children != null) {
						this.StrategyFoldingFlag = this.StrategyFoldingFlag != true;
						for (var i = 0; i < TargetView.Children.length; i++) {
							var SubView = TargetView.Children[i];
							if (SubView.GetNodeType() == GSNType.Goal) {
								SubView.IsFolded = this.StrategyFoldingFlag;
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
				var wx0 = TargetView.GetGx();
				var wy0 = TargetView.GetGy();
				this.AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null); //FIXME Gx, Gy
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
			if (NodeView.GetNodeType() != GSNType.Goal) {
				return null;
			}
			return new MenuBarButton("folded-id", "images/copy.png", "fold", this.FoldingAction);
		}
	}
}
