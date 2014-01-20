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

module AssureNote {
    export class EditorUtil {
        Element: JQuery;

        constructor(public AssureNoteApp: AssureNoteApp, public TextArea: CodeMirror.Editor, public Selector: string, public CSS: any) {
            $(this.TextArea.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(Selector);
            this.Element.css(CSS);
            this.Element.css({ display: "none" });
        }

        EnableEditor(WGSN: string, NodeView: NodeView, IsRecursive: boolean): void {
            var Model = NodeView.Model;
            this.AssureNoteApp.PluginPanel.IsVisible = false;
            this.AssureNoteApp.SocketManager.StartEdit({Label: Model.GetLabel(), UID: Model.UID});

            var Callback = (event: MouseEvent) => {
                this.Element.blur();
            };
            var App = this.AssureNoteApp;

            (<any>this.TextArea).setValue(WGSN);
            this.Element.off("blur");
            this.Element.off("keydown");
            this.Element.css({ display: "block" }).on("keydown", (e: JQueryEventObject) => {
                this.TextArea.focus();
                if (e.keyCode == 27 /* Esc */) {
                    e.stopPropagation();
                    this.Element.blur();
                }
            }).on("blur", (e: JQueryEventObject) => {
                e.stopPropagation();
                e.preventDefault();
                this.DisableEditor(NodeView, IsRecursive);
                this.AssureNoteApp.SocketManager.Emit('finishedit', {Label: NodeView.Model.GetLabel(), UID:  NodeView.Model.UID});
                App.PictgramPanel.EventMapLayer.removeEventListener("pointerdown", Callback);
            });
            this.AssureNoteApp.PictgramPanel.EventMapLayer.addEventListener("pointerdown", Callback);
            this.TextArea.refresh();
            this.TextArea.focus();
        }
        DisableEditor(OldNodeView: NodeView, IsRecursive: boolean): void {
            var WGSN: string = (<any>this.TextArea).getValue();
            this.AssureNoteApp.MasterRecord.OpenEditor(this.AssureNoteApp.GetUserName(), "todo", null, "test");
            var Node: GSNNode = this.AssureNoteApp.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
            var NewNode: GSNNode;
            NewNode = Node.ReplaceSubNodeAsText(WGSN, IsRecursive);
            console.log(Node);
            console.log(NewNode);
            if (NewNode) {
                this.AssureNoteApp.MasterRecord.EditingDoc.RenumberAll();
                var TopGoal = this.AssureNoteApp.MasterRecord.EditingDoc.TopNode;
                var NewNodeView: NodeView = new NodeView(TopGoal, true);
                NewNodeView.SaveFoldedFlag(this.AssureNoteApp.PictgramPanel.ViewMap);
                this.AssureNoteApp.PictgramPanel.InitializeView(NewNodeView);
                this.AssureNoteApp.PictgramPanel.Draw(TopGoal.GetLabel());

                this.AssureNoteApp.PluginPanel.IsVisible = true;
                /* TODO resolve conflict */
                this.AssureNoteApp.SocketManager.UpdateWGSN();
            }
            this.AssureNoteApp.MasterRecord.CloseEditor();
            $(this.Selector).addClass("animated fadeOutUp");

            /* Need to wait a bit for the end of animation */
            setTimeout(() => {
                this.Element.removeClass();
                this.Element.css({ display: "none" });
                //this.StopEventFlag = false;
            }, 1300);
            return null;
        }
    }
}
