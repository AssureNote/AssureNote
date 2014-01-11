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
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />
var AssureNote;
(function (AssureNote) {
    var FoldingCommand = (function (_super) {
        __extends(FoldingCommand, _super);
        function FoldingCommand(App, FoldingAction) {
            _super.call(this, App);
            this.FoldingAction = FoldingAction;
        }
        FoldingCommand.prototype.GetCommandLineNames = function () {
            return ["fold"];
        };

        FoldingCommand.prototype.GetDisplayName = function () {
            return "FoldingView";
        };

        FoldingCommand.prototype.Invoke = function (CommandName, FocusedView, Params) {
            if (Params.length < 1) {
                this.App.DebugP("no args");
                return;
            }
            var Label = Params[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                var TargetType = TargetView.GetNodeType();
                if (TargetType != AssureNote.GSNType.Goal && TargetType != AssureNote.GSNType.Strategy) {
                    this.App.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                    return;
                }
                this.FoldingAction(event, TargetView);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        };
        return FoldingCommand;
    })(AssureNote.Command);
    AssureNote.FoldingCommand = FoldingCommand;

    var FoldingViewSwitchPlugin = (function (_super) {
        __extends(FoldingViewSwitchPlugin, _super);
        function FoldingViewSwitchPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.HasMenuBarButton = true;
            this.HasDoubleClicked = true;

            this.FoldingAction = function (event, TargetView) {
                if (TargetView.GetNodeType() == AssureNote.GSNType.Strategy) {
                    if (TargetView.Children != null) {
                        for (var i = 0; i < TargetView.Children.length; i++) {
                            var SubView = TargetView.Children[i];
                            if (SubView.GetNodeType() == AssureNote.GSNType.Goal) {
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
                AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null, 300);
                var wx1 = TargetView.GetGX();
                var wy1 = TargetView.GetGY();
                var ViewPort = AssureNoteApp.PictgramPanel.Viewport;
                var OffX0 = ViewPort.GetLogicalOffsetX();
                var OffY0 = ViewPort.GetLogicalOffsetY();
                var Scale = ViewPort.GetScale();
                ViewPort.MoveTo(OffX0 + Scale * (wx0 - wx1), OffY0 + Scale * (wy0 - wy1), Scale, 300);
            };
            this.AssureNoteApp.RegistCommand(new FoldingCommand(this.AssureNoteApp, this.FoldingAction));
        }
        FoldingViewSwitchPlugin.prototype.ExecDoubleClicked = function (NodeView) {
            var event = document.createEvent("UIEvents");
            this.FoldingAction(event, NodeView);
        };

        FoldingViewSwitchPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            if (NodeView.GetNodeType() != AssureNote.GSNType.Goal && NodeView.GetNodeType() != AssureNote.GSNType.Strategy) {
                return null;
            }
            return new AssureNote.NodeMenuItem("folded-id", "images/copy.png", "fold", this.FoldingAction);
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    var FoldPlugin = new AssureNote.FoldingViewSwitchPlugin(App);
    App.PluginManager.SetPlugin("fold", FoldPlugin);
});
//# sourceMappingURL=FoldingViewSwitch.js.map
