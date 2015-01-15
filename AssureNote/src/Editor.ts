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
    export class WGSNEditorPanel extends Panel {
        Element: JQuery;
        Timeout: number;
        Editor: CodeMirror.Editor;
        private IsEditAppendOnly: boolean = false;
        private Wrapper: HTMLElement;
        public WrapperCSS: any;
        private IsEditRecursive: boolean;

        constructor(public App: AssureNoteApp) {
            super(App);
            var TextArea = <HTMLTextAreaElement>document.getElementById('editor');
            this.Wrapper = document.getElementById('editor-wrapper');
            var CodeMirrorConfig = { lineNumbers: true, mode: 'wgsn', lineWrapping: true, extraKeys: { "Shift-Space": "autocomplete" } };
            this.WrapperCSS = { position: "fixed", top: "5%", left: "5%", width: "90%", height: "90%" };
            this.IsEditRecursive = true;
            this.Editor = CodeMirror.fromTextArea(TextArea, CodeMirrorConfig);
            $(this.Editor.getWrapperElement()).css({
                height: "100%",
                width: "100%",
                background: "rgba(255, 255, 255, 0.85)"
            });
            this.Element = $(this.Wrapper);
            this.Element.css(this.WrapperCSS);
            this.Element.css({ display: "none" });
        }

        UpdateCSS(CSS: any) {
            this.Element.css(CSS);
        }

        private OnOutSideClicked: () => void;

        EnableEditor(WGSN: string, NodeView: NodeView, IsRecursive?: boolean, IsAppendOnly? :boolean): void {
            if (this.Timeout) {
                this.Element.removeClass();
                clearInterval(this.Timeout);
            }

            /* TODO Remove this */
            if (IsRecursive && (NodeView.Status == EditStatus.SingleEditable)) {
                return;
            }

            this.IsEditRecursive = IsRecursive;
            this.IsEditAppendOnly = IsAppendOnly;

            this.Timeout = null;
            var Model = NodeView.Model;
            this.IsVisible = false;
            this.App.SocketManager.StartEdit({ "UID": Model.UID, "IsRecursive": IsRecursive, "IsAppendOnly": IsAppendOnly, "UserName": this.App.GetUserName()});

            this.Editor.getDoc().setValue(WGSN);
            this.OnOutSideClicked = () => {
                this.DisableEditor(NodeView, WGSN);
            };

            var BackGround = $("#editor-background");
            BackGround.off("click").on("click", this.OnOutSideClicked);
            BackGround.off("contextmenu").on("contextmenu", this.OnOutSideClicked);

            BackGround.stop(true, true).css("opacity", this.DarkenBackGround() ? 0.4 : 0).show();
            this.Element.stop(true, true).css("opacity", 1).show();
            this.Editor.refresh();
            this.Editor.focus();
            this.Activate();
        }

        DisableEditor(OldNodeView: NodeView, OldWGSN: string): void {
            this.App.EditDocument("todo", "test", () => {
                var WGSN: string = this.Editor.getDoc().getValue();
                if (WGSN.length == 0) {
                    return false;
                }
                try {
                    var Node: GSNNode = this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
                    var NewNode: GSNNode;
                    NewNode = Node.ReplaceSubNodeWithText(WGSN, this.IsEditRecursive, this.IsEditAppendOnly);
                } catch (e) {
                    if (e.constructor.name == "SyntaxError" || e.constructor.name == "WGSNSyntaxError") {
                        AssureNoteUtils.Notify("Invalid WGSN is given");
                        return false;
                    }
                    throw e;
                }
                var Writer: StringWriter = new StringWriter();
                var WGSNChanged: boolean = (NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim());
                if (!NewNode || !WGSNChanged) {
                    return false;
                }
                this.App.FullScreenEditorPanel.IsVisible = true; // Why?
            });

            this.App.SocketManager.Emit('finishedit', OldNodeView.Model.UID);
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);
            $("#editor-background").animate({ opacity: 0 }, 300).hide(0);

            this.App.PictgramPanel.Activate();
        }

        OnKeyDown(Event: KeyboardEvent): void {
            this.Editor.focus();
            if (Event.keyCode == 27 /* Esc */) {
                Event.stopPropagation();
                this.OnOutSideClicked();
            }
        }

        DarkenBackGround(): boolean {
            return true;
        }
    }

    export class SingleNodeEditorPanel extends Panel {
        public WrapperCSS: any;
        private Element: JQuery;
        private Editor: HTMLTextAreaElement;
        private LabelEditor: HTMLInputElement;
        private NodeNumber: HTMLSpanElement;
        private Wrapper: HTMLElement;
        private DummyDiv: HTMLDivElement;
        private OnOutSideClicked: () => void;
        private EditorMinimumHeight: number;
        private WrapperMinimumHeight: number;
        private OnKeyUp: (e: KeyboardEvent) => any;

        constructor(App: AssureNoteApp) {
            super(App);
            var TextArea = <HTMLTextAreaElement>document.getElementById('singlenode-editor');
            this.Wrapper = document.getElementById('singlenode-editor-wrapper');
            this.Editor = TextArea;
            this.Element = $(this.Wrapper);
            this.Element.css({ position: "absolute" });
            this.LabelEditor = <HTMLInputElement>document.querySelector(".singlenode-editor.nodelabel");
            this.NodeNumber = <HTMLSpanElement>document.querySelector(".singlenode-editor.nodenumber");
            this.DummyDiv = <HTMLDivElement>document.querySelector(".singlenode-editor.dummydiv");
        }

        UpdateCSS(CSS: any) {
            this.Element.css(CSS);
        }

        EnableEditor(WGSN: string, NodeView: NodeView, IsRecursive?: boolean, IsAppendOnly?: boolean): void {
            /* TODO Remove this */
            if (IsRecursive && (NodeView.Status == EditStatus.SingleEditable)) {
                return;
            }

            var Model = NodeView.Model;
            this.IsVisible = false;
            this.App.SocketManager.StartEdit({ "UID": Model.UID, "IsRecursive": IsRecursive, "IsAppendOnly": IsAppendOnly, "UserName": this.App.GetUserName() });

            this.Editor.value = AssureNoteUtils.RemoveFirstLine(WGSN).trim();
            this.LabelEditor.value = Model.LabelName != null ? Model.LabelName.split(":")[1] : "";
            this.NodeNumber.textContent = "*" + Model.GetLabel();

            this.OnOutSideClicked = () => {
                this.DisableEditor(NodeView, WGSN);
            };

            var BackGround = $("#editor-background");
            BackGround.off("click").on("click", this.OnOutSideClicked);
            BackGround.off("contextmenu").on("contextmenu", this.OnOutSideClicked);

            BackGround.stop(true, true).css("opacity", this.DarkenBackGround() ? 0.4 : 0).show();
            this.Element.stop(true, true).css("opacity", 1).show();

            var Style = window.getComputedStyle(this.NodeNumber, null);
            this.WrapperMinimumHeight = this.Wrapper.clientHeight;
            this.EditorMinimumHeight = this.WrapperMinimumHeight - parseFloat(Style.lineHeight) - 15;
            this.Editor.style.height = this.EditorMinimumHeight.toString() + "px";
            this.DummyDiv.style.width = this.Editor.clientWidth.toString() + "px";

            this.OnKeyUp = () => {
                // Dummy Divに編集中のテキストを追加し、高さを計算する
                this.DummyDiv.textContent = this.Editor.value.replace(/^$/mg, "@");
                var height = Math.max(this.EditorMinimumHeight, this.DummyDiv.clientHeight);
                this.Editor.style.height = height.toString() + "px";
                this.Wrapper.style.height = (this.WrapperMinimumHeight - this.EditorMinimumHeight + height).toString() + "px";
            };

            this.Editor.addEventListener("keyup", this.OnKeyUp);

            this.Editor.focus()
            this.Activate();
        }

        DisableEditor(OldNodeView: NodeView, OldWGSN: string): void {
            this.App.EditDocument("todo", "test", () => {
                var Label = this.LabelEditor.value;
                
                var OldModel = OldNodeView.Model;
                var Writer = new StringWriter();
                Writer.print("* ");
                Writer.print(WikiSyntax.FormatNodeType(OldModel.NodeType));
                Writer.print(OldModel.AssignedLabelNumber);
                if (Label && Label.length > 0) {
                    Writer.print(":");
                    Writer.print(Label);
                }
                Writer.print(" &");
                Writer.print(Lib.DecToHex(OldModel.UID));
                var Header = Writer.toString();

                var WGSN: string = Header + "\n" + this.Editor.value;
                if (WGSN.length == 0) {
                    return false;
                }
                try {
                    var Node: GSNNode = this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
                    var NewNode: GSNNode;
                    NewNode = Node.ReplaceSubNodeWithText(WGSN, true, true);
                } catch (e) {
                    if (e.constructor.name == "SyntaxError" || e.constructor.name == "WGSNSyntaxError") {
                        AssureNoteUtils.Notify("Invalid WGSN is given");
                        return false;
                    }
                    throw e;
                }
                var Writer: StringWriter = new StringWriter();
                var WGSNChanged: boolean = (NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim());
                if (!NewNode || !WGSNChanged) {
                    return false;
                }
                this.App.FullScreenEditorPanel.IsVisible = true; // Why?
            });

            this.App.SocketManager.Emit('finishedit', OldNodeView.Model.UID);
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);
            $("#editor-background").animate({ opacity: 0 }, 300).hide(0);

            this.Editor.removeEventListener("keyup", this.OnKeyUp);

            this.App.PictgramPanel.Activate();
        }

        OnKeyDown(Event: KeyboardEvent): void {
            //this.Editor.focus();
            if (Event.keyCode == 27 /* Esc */) {
                Event.stopPropagation();
                this.OnOutSideClicked();
            }
        }

        DarkenBackGround(): boolean {
            return false;
        }

    }

}
