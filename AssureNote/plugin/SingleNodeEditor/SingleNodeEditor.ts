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

///<reference path="../../src/AssureNoteParser.ts" />
///<reference path="../../src/Plugin.ts" />
///<reference path="../../src/Editor.ts" />

module AssureNote {

    export class SingleNodeEditorPlugin extends Plugin {
        public EditorUtil: EditorUtil;
        constructor(public AssureNoteApp: AssureNoteApp, public textarea: CodeMirror.Editor, public selector: string) {
            super();
            this.SetMenuBarButton(true);
            this.SetEditor(true);
            this.EditorUtil = new EditorUtil(AssureNoteApp, textarea, selector, {
                position: "absolute",
                //top: "5%",
                //left: "5%",
                //width: "90%",
                //height: "90%"
            });
        }

        CreateMenuBarButton(NodeView: NodeView): NodeMenuItem {
            return new NodeMenuItem("singlenodeeditor-id", "/images/pencil.png", "editor",
                (event: Event, TargetView: NodeView) => {
                    var Writer = new StringWriter();
                    TargetView.Model.FormatSubNode(1, Writer, false);
                    //var Top = this.CurrentView.GetGY() + this.CurrentView.Shape.GetNodeHeight() + 5;
                    //var Left = this.CurrentView.GetGX() + (this.CurrentView.Shape.GetNodeWidth() * 3) / 4;
                    //this.Tooltip.css({
                    //    //width: '250px',
                    //    //height: '150px',
                    //    position: 'absolute',
                    //    top: Top,
                    //    left: Left,
                    //    display: 'block',
                    //    opacity: 100
                    //});
                    var Top = this.AssureNoteApp.PictgramPanel.Viewport.PageYFromGY(NodeView.GetGY());
                    var Left = this.AssureNoteApp.PictgramPanel.Viewport.PageXFromGX(NodeView.GetGX());
                    console.log(Top, Left);
                    var Width = NodeView.GetShape().GetNodeWidth();
                    var Height = Math.max(100, NodeView.GetShape().GetNodeHeight());
                    this.EditorUtil.UpdateCSS({
                        position: "fixed",
                        top: Top,
                        left: Left,
                        width: Width,
                        height: Height,
                        background: "rgba(255, 255, 255, 1.00)",
                    });

                    this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView, false);
            });
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
});
