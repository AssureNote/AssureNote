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
        function SingleNodeEditorCommand(App) {
            _super.call(this, App);
        }
        SingleNodeEditorCommand.prototype.GetCommandLineNames = function () {
            return ["singleedit"];
        };

        SingleNodeEditorCommand.prototype.GetHelpHTML = function () {
            return "<code>singleedit [label]</code><br>Open single node editor.";
        };

        SingleNodeEditorCommand.prototype.Invoke = function (CommandName, Params) {
            var Label;
            if (Params.length < 1) {
                Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Params[0].toUpperCase();
            }
            var event = document.createEvent("UIEvents");
            var NodeView = this.App.PictgramPanel.ViewMap[Label];
            if (NodeView != null) {
                var Writer = new AssureNote.StringWriter();
                NodeView.Model.FormatSubNode(1, Writer, false);
                var Top = NodeView.GetGY();
                var Left = NodeView.GetGX();
                var Width = NodeView.GetShape().GetNodeWidth();
                var Height = Math.max(50, NodeView.GetShape().GetNodeHeight());
                var StrokeWidth = Number($(NodeView.Shape.ShapeGroup).css('stroke-width').charAt(0));
                var CSS = {
                    position: "fixed",
                    top: Top - (StrokeWidth / 2) + "px",
                    left: Left - (StrokeWidth / 2) + "px",
                    width: Width + StrokeWidth + "px",
                    height: Height + StrokeWidth + "px",
                    background: "rgba(255, 255, 255, 1.00)"
                };
                var Scale = this.App.PictgramPanel.Viewport.GetCameraScale();
                if (Scale < 1.0) {
                    CSS["mozTransform"] = CSS["msTransform"] = CSS["webkitTransform"] = CSS["transform"] = "scale(" + (1 / Scale) + ")";
                } else {
                    CSS["mozTransform"] = CSS["msTransform"] = CSS["webkitTransform"] = CSS["transform"] = "";
                }
                this.App.SingleNodeEditorPanel.UpdateCSS(CSS);
                this.App.SingleNodeEditorPanel.EnableEditor(Writer.toString().trim(), NodeView, false);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        };
        return SingleNodeEditorCommand;
    })(AssureNote.Command);
    AssureNote.SingleNodeEditorCommand = SingleNodeEditorCommand;
    var SingleNodeEditorPlugin = (function (_super) {
        __extends(SingleNodeEditorPlugin, _super);
        function SingleNodeEditorPlugin(App) {
            _super.call(this);
            this.App = App;
            this.SetHasMenuBarButton(true);
            this.SetHasEditor(true);

            this.App.RegistCommand(new SingleNodeEditorCommand(this.App));
        }
        SingleNodeEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            var _this = this;
            return new AssureNote.NodeMenuItem("singlenodeeditor-id", "/images/pencil.png", "editor", function (event, TargetView) {
                var Command = _this.App.FindCommandByCommandLineName("SingleEdit");
                if (Command) {
                    Command.Invoke(null, [TargetView.Label]);
                }
            });
        };
        return SingleNodeEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.SingleNodeEditorPlugin = SingleNodeEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
    App.PluginManager.SetPlugin("open-single", new AssureNote.SingleNodeEditorPlugin(App));
});
//# sourceMappingURL=SingleNodeEditor.js.map
