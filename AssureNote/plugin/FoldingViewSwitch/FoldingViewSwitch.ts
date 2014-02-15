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
        constructor(App: AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["fold"];
        }

        public GetHelpHTML(): string {
            return "<code>fold label</code><br>Toggle folding state of Goal."
        }

        public Invoke(CommandName: string, Params: any[]) {
            if (Params.length < 1) {
                this.App.DebugP("no args");
                return;
            }
            var Label = Params[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                this.Fold(TargetView);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        }

        public Fold(TargetView: NodeView) {
            var Panel = this.App.PictgramPanel;
            var ViewPort = Panel.Viewport;

            this.App.SocketManager.FoldNode({ "IsFolded": TargetView.IsFolded(), "UID": TargetView.Model.UID});

            if (TargetView.GetNodeType() == GSNType.Strategy) {
                if (TargetView.Children != null) {
                    for (var i = 0; i < TargetView.Children.length; i++) {
                        var SubView = TargetView.Children[i];
                        if (SubView.GetNodeType() == GSNType.Goal) {
                            SubView.SetIsFolded(true);
                        }
                    }
                }
            } else if (TargetView.GetNodeType() != GSNType.Goal) {
                this.App.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                return;
            } else {
                TargetView.SetIsFolded(!TargetView.IsFolded());
            }
            Panel.Draw(Panel.MasterView.Label, 300, TargetView);
        }
    }

    export class FoldingViewSwitchPlugin extends Plugin {
        private FoldingCommand: FoldingCommand;

        constructor(AssureNoteApp: AssureNoteApp) {
            super();
            this.SetHasDoubleClicked(true);
            this.FoldingCommand = new FoldingCommand(AssureNoteApp);
            AssureNoteApp.RegistCommand(this.FoldingCommand);
        }

        OnNodeDoubleClicked(NodeView: NodeView): void {
            this.FoldingCommand.Fold(NodeView);
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(App);
    App.PluginManager.SetPlugin("fold", FoldPlugin);
});
