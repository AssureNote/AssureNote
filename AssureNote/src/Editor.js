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
///<reference path='./Plugin.ts'/>
///<reference path='../d.ts/codemirror.d.ts'/>
var AssureNote;
(function (AssureNote) {
    var EditorUtil = (function () {
        function EditorUtil(AssureNoteApp, TextArea, Selector, CSS) {
            this.AssureNoteApp = AssureNoteApp;
            this.TextArea = TextArea;
            this.Selector = Selector;
            this.CSS = CSS;
            $(this.TextArea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(Selector);
            this.Element.css(CSS);
            this.Element.css({ display: "none" });
        }
        EditorUtil.prototype.EnableEditor = function (WGSN, NodeView) {
            var _this = this;
            var Model = NodeView.Model;
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            (this.TextArea).setValue(WGSN);
            this.Element.off("blur");
            this.Element.off("keydown");
            this.Element.css({ display: "block" }).on("keydown", function (e) {
                _this.TextArea.focus();
                if (e.keyCode == 27) {
                    e.stopPropagation();
                    _this.Element.blur();
                }
            }).on("blur", function (e) {
                e.stopPropagation();
                e.preventDefault();
                _this.DisableEditor(NodeView);
            });
            this.TextArea.refresh();
            this.TextArea.focus();
        };

        EditorUtil.prototype.DisableEditor = function (OldNodeView) {
            var _this = this;
            var WGSN = (this.TextArea).getValue();

            //Create a new GSNDoc
            //TODO input user name
            this.AssureNoteApp.MasterRecord.OpenEditor("todo", "todo", null, "test");
            var Node = this.AssureNoteApp.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
            var NewNode = Node.ReplaceSubNodeAsText(WGSN);
            console.log(NewNode);

            if (NewNode) {
                this.AssureNoteApp.MasterRecord.EditingDoc.RenumberAll();
                var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopNode;
                var NewNodeView = new AssureNote.NodeView(TopGoal, true);
                NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
                this.AssureNoteApp.PictgramPanel.SetView(NewNodeView);
                this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel(), null, null);

                this.AssureNoteApp.PluginPanel.IsVisible = true;

                /* TODO resolve conflict */
                this.AssureNoteApp.SocketManager.UpdateWGSN();
            }
            this.AssureNoteApp.MasterRecord.CloseEditor();
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            setTimeout(function () {
                _this.Element.removeClass();
                _this.Element.css({ display: "none" });
                //this.StopEventFlag = false;
            }, 1300);
            return null;
        };
        return EditorUtil;
    })();
    AssureNote.EditorUtil = EditorUtil;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
