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
///<reference path="../../src/Command.ts" />
var AssureNote;
(function (AssureNote) {
    var FullScreenEditorCommand = (function (_super) {
        __extends(FullScreenEditorCommand, _super);
        function FullScreenEditorCommand() {
            _super.apply(this, arguments);
        }
        FullScreenEditorCommand.prototype.GetCommandLineNames = function () {
            return ["edit"];
        };

        FullScreenEditorCommand.prototype.GetHelpHTML = function () {
            return "<code>edit [label]</code><br>Open editor.";
        };

        FullScreenEditorCommand.prototype.Invoke = function (CommandName, Params) {
            var Label;
            if (Params.length < 1) {
                Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Params[0].toUpperCase();
            }
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                //if (TargetView.GetNodeType() == GSNType.Strategy) {
                //    AssureNoteUtils.Notify("Subtree editor cannot open at Strategy");
                //    return;
                //}
                var Writer = new AssureNote.StringWriter();
                TargetView.Model.FormatSubNode(1, Writer, true);
                this.App.FullScreenEditorPanel.EnableEditor(Writer.toString().trim(), TargetView, true);
            } else {
                AssureNote.AssureNoteUtils.Notify(Label + " is not found");
            }
        };
        return FullScreenEditorCommand;
    })(AssureNote.Command);
    AssureNote.FullScreenEditorCommand = FullScreenEditorCommand;

    var FullScreenEditorPlugin = (function (_super) {
        __extends(FullScreenEditorPlugin, _super);
        function FullScreenEditorPlugin(AssureNoteApp) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.SetHasMenuBarButton(true);
            this.SetHasEditor(true);
            this.AssureNoteApp.RegistCommand(new FullScreenEditorCommand(this.AssureNoteApp));
        }
        FullScreenEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            return new AssureNote.NodeMenuItem("fullscreeneditor-id", "/images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Command = _this.AssureNoteApp.FindCommandByCommandLineName("edit");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label]);
                }
            });
        };

        /* This focuses on the node where the cursor of CodeMirror indicate */
        FullScreenEditorPlugin.prototype.MoveBackgroundNode = function (doc) {
            var Line = doc.getCursor().line;
            var LineText = doc.getLine(Line);
            var MatchResult = LineText.match(/^\*.*?&([0-9a-fA-F]+)/);
            if (MatchResult && MatchResult[1]) {
                var UID = parseInt(MatchResult[1], 16);
                var ViewMap = this.AssureNoteApp.PictgramPanel.ViewMap;
                for (var key in ViewMap) {
                    var View = ViewMap[key];

                    /* Node exists and visible */
                    if (View && View.Model && View.Model.UID == UID) {
                        //console.log(View.GetCenterGX() + ' ' + View.GetCenterGY());
                        this.AssureNoteApp.PictgramPanel.Viewport.SetCameraPosition(View.GetCenterGX(), View.GetCenterGY());
                    }
                }
            }
        };
        return FullScreenEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.FullScreenEditorPlugin = FullScreenEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    App.PluginManager.SetPlugin("open", new AssureNote.FullScreenEditorPlugin(App));
});
//# sourceMappingURL=FullScreenEditor.js.map
