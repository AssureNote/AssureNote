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
///<reference path='./Plugin.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var CodeMirrorEditorPanel = (function (_super) {
        __extends(CodeMirrorEditorPanel, _super);
        function CodeMirrorEditorPanel(App, IsEditRecursive, TextArea, CodeMirrorConfig, Wrapper, WrapperCSS) {
            _super.call(this, App);
            this.App = App;
            this.IsEditRecursive = IsEditRecursive;
            this.Wrapper = Wrapper;
            this.WrapperCSS = WrapperCSS;
            this.Editor = CodeMirror.fromTextArea(TextArea, CodeMirrorConfig);
            $(this.Editor.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(Wrapper);
            this.Element.css(WrapperCSS);
            this.Element.css({ display: "none" });
        }
        CodeMirrorEditorPanel.prototype.UpdateCSS = function (CSS) {
            this.Element.css(CSS);
        };

        CodeMirrorEditorPanel.prototype.EnableEditor = function (WGSN, NodeView, IsRecursive) {
            var _this = this;
            if (this.Timeout) {
                this.Element.removeClass();
                clearInterval(this.Timeout);
            }

            /* TODO Remove this */
            if (IsRecursive && (NodeView.Status == 1 /* SingleEditable */)) {
                return;
            }

            this.Timeout = null;
            var Model = NodeView.Model;
            this.App.FullScreenEditorPanel.IsVisible = false;
            this.App.SocketManager.StartEdit({ "Label": Model.GetLabel(), "UID": Model.UID, "IsRecursive": IsRecursive, "UserName": this.App.GetUserName() });

            var Callback = function (event) {
                _this.Element.blur();
            };
            var App = this.App;

            this.Editor.setValue(WGSN);
            this.Element.show().css("opacity", 1).off("blur").on("blur", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.DisableEditor(NodeView, WGSN);
            });
            this.OnOutSideClicked = function () {
                _this.Element.blur();
            };
            this.App.PictgramPanel.ContentLayer.addEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.ContentLayer.addEventListener("contextmenu", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.addEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.addEventListener("contextmenu", this.OnOutSideClicked);
            this.Editor.refresh();
            this.Editor.focus();
            this.Activate();
        };

        CodeMirrorEditorPanel.prototype.DisableEditor = function (OldNodeView, OldWGSN) {
            var WGSN = this.Editor.getValue();
            this.App.MasterRecord.OpenEditor(this.App.GetUserName(), "todo", null, "test");
            var Node = this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
            var NewNode;
            NewNode = Node.ReplaceSubNodeAsText(WGSN, this.IsEditRecursive);
            var Writer = new AssureNote.StringWriter();
            if (NewNode && NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim()) {
                this.App.MasterRecord.EditingDoc.RenumberAll();
                var TopGoal = this.App.MasterRecord.EditingDoc.TopNode;

                var NewNodeView = new AssureNote.NodeView(TopGoal, true);
                NewNodeView.SaveFlags(this.App.PictgramPanel.ViewMap);
                this.App.PictgramPanel.InitializeView(NewNodeView);
                this.App.PictgramPanel.Draw(null);

                this.App.FullScreenEditorPanel.IsVisible = true;
                this.App.SocketManager.UpdateWGSN();
                this.App.MasterRecord.CloseEditor();
            } else {
                this.App.MasterRecord.DiscardEditor();
            }
            this.App.SocketManager.Emit('finishedit', { "Label": OldNodeView.Model.GetLabel(), "UID": OldNodeView.Model.UID });
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);

            this.App.PictgramPanel.ContentLayer.removeEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.ContentLayer.removeEventListener("contextmenu", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.removeEventListener("pointerdown", this.OnOutSideClicked);
            this.App.PictgramPanel.EventMapLayer.removeEventListener("contextmenu", this.OnOutSideClicked);

            this.App.PictgramPanel.Activate();
            return null;
        };

        CodeMirrorEditorPanel.prototype.OnKeyDown = function (Event) {
            this.Editor.focus();
            if (Event.keyCode == 27) {
                Event.stopPropagation();
                this.Element.blur();
            }
        };
        return CodeMirrorEditorPanel;
    })(AssureNote.Panel);
    AssureNote.CodeMirrorEditorPanel = CodeMirrorEditorPanel;

    var SingleNodeEditorPanel = (function (_super) {
        __extends(SingleNodeEditorPanel, _super);
        function SingleNodeEditorPanel(App) {
            var TextArea = document.getElementById('singlenode-editor');
            var Wrapper = document.getElementById('singlenode-editor-wrapper');
            _super.call(this, App, false, TextArea, { lineNumbers: false, mode: 'wgsn', lineWrapping: true }, Wrapper, { position: "absolute" });
        }
        return SingleNodeEditorPanel;
    })(CodeMirrorEditorPanel);
    AssureNote.SingleNodeEditorPanel = SingleNodeEditorPanel;

    var WGSNEditorPanel = (function (_super) {
        __extends(WGSNEditorPanel, _super);
        function WGSNEditorPanel(App) {
            var TextArea = document.getElementById('editor');
            var Wrapper = document.getElementById('editor-wrapper');
            _super.call(this, App, true, TextArea, { lineNumbers: true, mode: 'wgsn', lineWrapping: true }, Wrapper, { position: "fixed", top: "5%", left: "5%", width: "90%", height: "90%" });
        }
        return WGSNEditorPanel;
    })(CodeMirrorEditorPanel);
    AssureNote.WGSNEditorPanel = WGSNEditorPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
