// ***************************************************************************
// Copyright (c) 2014, AssureNote project authors. All rights reserved.
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
// *  Redistributions of source code must retain the above copyright notice,
//    this list of conditions and the following disclaimer.
// *  Redistributions in binary form must reproduce the above copyright
//    notice, this list of conditions and the following disclaimer in the
//    documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
// TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
// PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
// CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
// EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// **************************************************************************

///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {

    export class FoldingCommand extends Command {
        constructor(App: AssureNoteApp, public FoldingAction: (event: Event, TargetView: NodeView) => void) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["fold"];
        }

        public GetDisplayName(): string {
            return "FoldingView";
        }

        public Invoke(CommandName: string, FocusedView: NodeView, Params: any[]) {
            if (Params.length < 1) {
                this.App.DebugP("no args");
                return;
            }
            var Label = Params[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                var TargetType = TargetView.GetNodeType();
                if (TargetType != GSNType.Goal && TargetType != GSNType.Strategy) {
                    this.App.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                    return;
                }
                this.FoldingAction(event, TargetView);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        }
    }

    export class FoldingViewSwitchPlugin extends Plugin {
		FoldingAction: (event: Event, TargetView: NodeView) => void;

		constructor(public AssureNoteApp: AssureNoteApp) {
			super();
            this.SetMenuBarButton(true);
			this.SetDoubleClicked(true);

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
				var X0 = TargetView.GetGX();
				var Y0 = TargetView.GetGY();
				AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null, 300);
				var X1 = TargetView.GetGX();
				var Y1 = TargetView.GetGY();
				var ViewPort = AssureNoteApp.PictgramPanel.Viewport;
                var Scale = ViewPort.GetCameraScale();
                ViewPort.Move(X1 - X0, Y1 - Y0, Scale, 300);
            };
            this.AssureNoteApp.RegistCommand(new FoldingCommand(this.AssureNoteApp, this.FoldingAction));
		}

		ExecDoubleClicked(NodeView: NodeView): void {
			var event = document.createEvent("UIEvents");
			this.FoldingAction(event, NodeView);
		}

		CreateMenuBarButton(NodeView: NodeView): NodeMenuItem {
			if (NodeView.GetNodeType() != GSNType.Goal && NodeView.GetNodeType() != GSNType.Strategy) {
				return null;
			}
            //return new NodeMenuItem("folded-id", "images/copy.png", "fold", this.FoldingAction);
            return null;
		}
	}
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(App);
    App.PluginManager.SetPlugin("fold", FoldPlugin);
});
