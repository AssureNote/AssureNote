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
    export class FullScreenEditorPlugin extends Plugin {
        public EditorUtil: EditorUtil;
		constructor(public AssureNoteApp: AssureNoteApp, public textarea: CodeMirror.Editor, public selector: string) {
			super();
            this.HasMenuBarButton = true;
            this.HasEditor = true;
            this.EditorUtil = new EditorUtil(AssureNoteApp, textarea, selector, {
                position: "fixed",
                top: "5%",
                left: "5%",
                width: "90%",
                height: "90%"
            });
            CodeMirror.on(this.textarea, 'cursorActivity', (doc: CodeMirror.Doc) => this.MoveBackgroundNode(doc));
        }

		ExecCommand(AssureNoteApp: AssureNoteApp, Args: string[]): void {
			var Label: string;
			if (Args.length < 1) {
				Label = AssureNoteApp.MasterRecord.GetLatestDoc().TopNode.GetLabel();
			} else {
				Label = Args[0].toUpperCase();
			}
			var event = document.createEvent("UIEvents");
			var TargetView = AssureNoteApp.PictgramPanel.ViewMap[Label];
			if (TargetView != null) {
				if (TargetView.GetNodeType() == GSNType.Strategy) {
					AssureNoteApp.DebugP("Strategy " + Label+ " cannot open FullScreenEditor.");
					return;
				}
				var Writer = new StringWriter();
				TargetView.Model.FormatSubNode(1, Writer);
                this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
			} else {
				AssureNoteApp.DebugP(Label + " not found.");
			}
		}

		CreateMenuBarButton(NodeView: NodeView): MenuBarButton {
			if (NodeView.GetNodeType() == GSNType.Strategy) {
				return null;
			}
			return new MenuBarButton("fullscreeneditor-id", "images/editor.png", "fullscreeneditor",
				(event: Event, TargetView: NodeView) => {
					var Writer = new StringWriter();
					TargetView.Model.FormatSubNode(1, Writer);
                    this.EditorUtil.EnableEditor(Writer.toString().trim(), TargetView);
			});
        }

        /* This focuses on the node where the cursor of CodeMirror indicate */
        MoveBackgroundNode(doc: CodeMirror.Doc) {
            var UID: string = null;
            var line = doc.getCursor().line;
            while (line >= 0) {
                var LineString: string = doc.getLine(line);
                if (LineString.indexOf('*') == 0) {
                    UID = WikiSyntax.ParseUID(LineString);
                    break;
                }
                line -= 1;
            }
            if (UID != null) {
                var Keys: string[] = Object.keys(this.AssureNoteApp.PictgramPanel.ViewMap);
                for (var i in Keys) {
                    var View: NodeView = this.AssureNoteApp.PictgramPanel.ViewMap[Keys[i]];
                    /* Node exists and visible */
                    if (View && View.Model && Lib.DecToHex(View.Model.UID) == UID) {
                        console.log(View.GetCenterGX() + ' ' + View.GetCenterGY());
                        this.AssureNoteApp.PictgramPanel.Viewport.SetCaseCenter(View.GetCenterGX(), View.GetCenterGY());
                    }
                }
            }
        }
	}
}
