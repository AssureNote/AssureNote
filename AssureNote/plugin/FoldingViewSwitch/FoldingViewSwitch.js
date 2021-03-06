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
        function FoldingCommand(App) {
            _super.call(this, App);
        }
        FoldingCommand.prototype.GetCommandLineNames = function () {
            return ["fold"];
        };

        FoldingCommand.prototype.GetHelpHTML = function () {
            return "<code>fold label</code><br>Toggle folding state of Goal.";
        };

        FoldingCommand.prototype.Invoke = function (CommandName, Params) {
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
        };

        FoldingCommand.prototype.Fold = function (TargetView) {
            var Panel = this.App.PictgramPanel;
            var ViewPort = Panel.Viewport;

            this.App.SocketManager.FoldNode({ "IsFolded": TargetView.IsFolded(), "UID": TargetView.Model.UID });

            if (TargetView.GetNodeType() == 2 /* Strategy */) {
                if (TargetView.Children != null) {
                    for (var i = 0; i < TargetView.Children.length; i++) {
                        var SubView = TargetView.Children[i];
                        if (SubView.GetNodeType() == 0 /* Goal */) {
                            SubView.SetIsFolded(true);
                        }
                    }
                }
            } else if (TargetView.GetNodeType() != 0 /* Goal */) {
                this.App.DebugP("Only type 'Strategy' or 'Goal' can be allowed to fold.");
                return;
            } else {
                TargetView.SetIsFolded(!TargetView.IsFolded());
            }
            Panel.Draw(Panel.TopNodeView.Label, 300, TargetView);
        };

        FoldingCommand.prototype.CanUseOnViewOnlyMode = function () {
            return true;
        };
        return FoldingCommand;
    })(AssureNote.Command);
    AssureNote.FoldingCommand = FoldingCommand;

    var FoldingViewSwitchPlugin = (function (_super) {
        __extends(FoldingViewSwitchPlugin, _super);
        function FoldingViewSwitchPlugin(AssureNoteApp) {
            _super.call(this);
            this.SetHasDoubleClicked(true);
            this.FoldingCommand = new FoldingCommand(AssureNoteApp);
            AssureNoteApp.RegistCommand(this.FoldingCommand);
        }
        FoldingViewSwitchPlugin.prototype.OnNodeDoubleClicked = function (NodeView) {
            if (AssureNote.AssureNoteApp.Current.ModeManager.GetMode() == 1 /* View */) {
                this.FoldingCommand.Fold(NodeView);
            }
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
