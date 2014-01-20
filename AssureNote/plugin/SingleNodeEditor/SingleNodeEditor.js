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
        }
        SingleNodeEditorPlugin.prototype.CreateMenuBarButton = function (NodeView) {
            return null;
            //return new NodeMenuItem("singlenodeeditor-id", "/images/pencil.png", "editor",
            //    (event: Event, TargetView: NodeView) => {
            //        var Writer = new StringWriter();
            //        TargetView.Model.FormatSubNode(1, Writer, false);
            //        this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
            //});
        };
        return SingleNodeEditorPlugin;
    })(AssureNote.Plugin);
    AssureNote.SingleNodeEditorPlugin = SingleNodeEditorPlugin;
})(AssureNote || (AssureNote = {}));

AssureNote.OnLoadPlugin(function (App) {
});
//# sourceMappingURL=SingleNodeEditor.js.map
