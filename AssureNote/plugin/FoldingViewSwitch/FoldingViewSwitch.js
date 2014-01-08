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
    var FoldingViewSwitchPlugin = (function (_super) {
        __extends(FoldingViewSwitchPlugin, _super);
        function FoldingViewSwitchPlugin(AssureNoteApp) {
            var _this = this;
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
                _this.AssureNoteApp.PictgramPanel.Draw(TopGoalView.Label, null, null, 300);
                var wx1 = TargetView.GetGX();
                var wy1 = TargetView.GetGY();
                var ViewPort = _this.AssureNoteApp.PictgramPanel.Viewport;
                var OffX0 = ViewPort.GetLogicalOffsetX();
                var OffY0 = ViewPort.GetLogicalOffsetY();
                var Scale = ViewPort.GetScale();
                ViewPort.MoveTo(OffX0 + Scale * (wx0 - wx1), OffY0 + Scale * (wy0 - wy1), Scale, 300);
            };
        }
        FoldingViewSwitchPlugin.prototype.ExecDoubleClicked = function (NodeView) {
            var event = document.createEvent("UIEvents");
            this.FoldingAction(event, NodeView);
        };

        FoldingViewSwitchPlugin.prototype.ExecCommand = function (AssureNoteApp, Args) {
            if (Args.length < 1) {
                AssureNoteApp.DebugP("no args");
                return;
            }
            var Label = Args[0].toUpperCase();
            var event = document.createEvent("UIEvents");
            var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                var TargetType = TargetView.GetNodeType();
                if (TargetType != AssureNote.GSNType.Goal && TargetType != AssureNote.GSNType.Strategy) {
                    AssureNoteApp.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                    return;
                }
                this.FoldingAction(event, TargetView);
            } else {
                AssureNoteApp.DebugP(Label + " not found.");
            }
        };

        FoldingViewSwitchPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            if (NodeView.GetNodeType() != AssureNote.GSNType.Goal && NodeView.GetNodeType() != AssureNote.GSNType.Strategy) {
                return null;
            }
            return new AssureNote.MenuBarButton("folded-id", "images/copy.png", "fold", this.FoldingAction);
        };
        return FoldingViewSwitchPlugin;
    })(AssureNote.Plugin);
    AssureNote.FoldingViewSwitchPlugin = FoldingViewSwitchPlugin;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=FoldingViewSwitch.js.map
