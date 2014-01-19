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
    var SingleNodeEditorCommand = (function (_super) {
        __extends(SingleNodeEditorCommand, _super);
        function SingleNodeEditorCommand(App, EditorUtil) {
            _super.call(this, App);
            this.EditorUtil = EditorUtil;
        }
        SingleNodeEditorCommand.prototype.GetCommandLineNames = function () {
            return ["edit"];
        };

        SingleNodeEditorCommand.prototype.GetDisplayName = function () {
            return "Editor";
        };

        SingleNodeEditorCommand.prototype.GetHelpHTML = function () {
            return "<code>edit [label]</code><br>Open editor.";
        };

        SingleNodeEditorCommand.prototype.Invoke = function (CommandName, Target, Params) {
            //var Label: string;
            //if (Params.length < 1) {
            //    Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            //} else {
            //    Label = Params[0].toUpperCase();
            //}
            //var event = document.createEvent("UIEvents");
            //var TargetView = this.App.PictgramPanel.ViewMap[Label];
            //if (TargetView != null) {
            //    if (TargetView.GetNodeType() == GSNType.Strategy) {
            //        this.App.DebugP("Strategy " + Label + " cannot open FullScreenEditor.");
            //        return;
            //    }
            //    var Writer = new StringWriter();
            //    TargetView.Model.FormatSubNode(1, Writer);
            //    this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
            //} else {
            //    this.App.DebugP(Label + " not found.");
            //}
        };
        return SingleNodeEditorCommand;
    })(AssureNote.Command);
    AssureNote.SingleNodeEditorCommand = SingleNodeEditorCommand;

    var SingleNodeEditorPlugin = (function (_super) {
        __extends(SingleNodeEditorPlugin, _super);
        function SingleNodeEditorPlugin(AssureNoteApp, textarea, selector) {
            _super.call(this);
            this.AssureNoteApp = AssureNoteApp;
            this.textarea = textarea;
            this.selector = selector;
            this.SetMenuBarButton(true);
            this.SetEditor(true);
            this.EditorUtil = new AssureNote.EditorUtil(AssureNoteApp, textarea, selector, {
                position: "fixed",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
            this.AssureNoteApp.RegistCommand(new SingleNodeEditorCommand(this.AssureNoteApp, this.EditorUtil));
        }
        SingleNodeEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            if (NodeView.GetNodeType() == 2 /* Strategy */) {
                return null;
            }
            return new AssureNote.NodeMenuItem("fullscreeneditor-id", "/images/editor.png", "fullscreeneditor", function (event, TargetView) {
                var Writer = new AssureNote.StringWriter();
                TargetView.Model.FormatSubNode(1, Writer);
                _this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
            });
        };
        return SingleNodeEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.SingleNodeEditorPlugin = SingleNodeEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
});
//# sourceMappingURL=SingleNodeEditor.js.map
