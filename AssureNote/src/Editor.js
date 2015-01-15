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
    var WGSNEditorPanel = (function (_super) {
        __extends(WGSNEditorPanel, _super);
        function WGSNEditorPanel(App) {
            _super.call(this, App);
            this.App = App;
            this.IsEditAppendOnly = false;
            var TextArea = document.getElementById('editor');
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
        WGSNEditorPanel.prototype.UpdateCSS = function (CSS) {
            this.Element.css(CSS);
        };

        WGSNEditorPanel.prototype.EnableEditor = function (WGSN, NodeView, IsRecursive, IsAppendOnly) {
            var _this = this;
            if (this.Timeout) {
                this.Element.removeClass();
                clearInterval(this.Timeout);
            }

            /* TODO Remove this */
            if (IsRecursive && (NodeView.Status == 1 /* SingleEditable */)) {
                return;
            }

            this.IsEditRecursive = IsRecursive;
            this.IsEditAppendOnly = IsAppendOnly;

            this.Timeout = null;
            var Model = NodeView.Model;
            this.IsVisible = false;
            this.App.SocketManager.StartEdit({ "UID": Model.UID, "IsRecursive": IsRecursive, "IsAppendOnly": IsAppendOnly, "UserName": this.App.GetUserName() });

            this.Editor.getDoc().setValue(WGSN);
            this.OnOutSideClicked = function () {
                _this.DisableEditor(NodeView, WGSN);
            };

            var BackGround = $("#editor-background");
            BackGround.off("click").on("click", this.OnOutSideClicked);
            BackGround.off("contextmenu").on("contextmenu", this.OnOutSideClicked);

            BackGround.stop(true, true).css("opacity", this.DarkenBackGround() ? 0.4 : 0).show();
            this.Element.stop(true, true).css("opacity", 1).show();
            this.Editor.refresh();
            this.Editor.focus();
            this.Activate();
        };

        WGSNEditorPanel.prototype.DisableEditor = function (OldNodeView, OldWGSN) {
            var _this = this;
            this.App.EditDocument("todo", "test", function () {
                var WGSN = _this.Editor.getDoc().getValue();
                if (WGSN.length == 0) {
                    return false;
                }
                try  {
                    var Node = _this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
                    var NewNode;
                    NewNode = Node.ReplaceSubNodeWithText(WGSN, _this.IsEditRecursive, _this.IsEditAppendOnly);
                } catch (e) {
                    if (e.constructor.name == "SyntaxError" || e.constructor.name == "WGSNSyntaxError") {
                        AssureNote.AssureNoteUtils.Notify("Invalid WGSN is given");
                        return false;
                    }
                    throw e;
                }
                var Writer = new AssureNote.StringWriter();
                var WGSNChanged = (NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim());
                if (!NewNode || !WGSNChanged) {
                    return false;
                }
                _this.App.FullScreenEditorPanel.IsVisible = true; // Why?
            });

            this.App.SocketManager.Emit('finishedit', OldNodeView.Model.UID);
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);
            $("#editor-background").animate({ opacity: 0 }, 300).hide(0);

            this.App.PictgramPanel.Activate();
        };

        WGSNEditorPanel.prototype.OnKeyDown = function (Event) {
            this.Editor.focus();
            if (Event.keyCode == 27) {
                Event.stopPropagation();
                this.OnOutSideClicked();
            }
        };

        WGSNEditorPanel.prototype.DarkenBackGround = function () {
            return true;
        };
        return WGSNEditorPanel;
    })(AssureNote.Panel);
    AssureNote.WGSNEditorPanel = WGSNEditorPanel;

    var SingleNodeEditorPanel = (function (_super) {
        __extends(SingleNodeEditorPanel, _super);
        function SingleNodeEditorPanel(App) {
            _super.call(this, App);
            var TextArea = document.getElementById('singlenode-editor');
            this.Wrapper = document.getElementById('singlenode-editor-wrapper');
            this.Editor = TextArea;
            this.Element = $(this.Wrapper);
            this.Element.css({ position: "absolute" });
            this.LabelEditor = document.querySelector(".singlenode-editor.nodelabel");
            this.NodeNumber = document.querySelector(".singlenode-editor.nodenumber");
            this.DummyDiv = document.querySelector(".singlenode-editor.dummydiv");
        }
        SingleNodeEditorPanel.prototype.UpdateCSS = function (CSS) {
            this.Element.css(CSS);
        };

        SingleNodeEditorPanel.prototype.EnableEditor = function (WGSN, NodeView, IsRecursive, IsAppendOnly) {
            var _this = this;
            /* TODO Remove this */
            if (IsRecursive && (NodeView.Status == 1 /* SingleEditable */)) {
                return;
            }

            var Model = NodeView.Model;
            this.IsVisible = false;
            this.App.SocketManager.StartEdit({ "UID": Model.UID, "IsRecursive": IsRecursive, "IsAppendOnly": IsAppendOnly, "UserName": this.App.GetUserName() });

            this.Editor.value = AssureNote.AssureNoteUtils.RemoveFirstLine(WGSN).trim();
            this.LabelEditor.value = Model.LabelName != null ? Model.LabelName.split(":")[1] : "";
            this.NodeNumber.textContent = "*" + Model.GetLabel();

            this.OnOutSideClicked = function () {
                _this.DisableEditor(NodeView, WGSN);
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

            this.OnKeyUp = function () {
                // Dummy Div�ɕҏW���̃e�L�X�g��ǉ����A������v�Z����
                _this.DummyDiv.textContent = _this.Editor.value.replace(/^$/mg, "@");
                var height = Math.max(_this.EditorMinimumHeight, _this.DummyDiv.clientHeight);
                _this.Editor.style.height = height.toString() + "px";
                _this.Wrapper.style.height = (_this.WrapperMinimumHeight - _this.EditorMinimumHeight + height).toString() + "px";
            };

            this.Editor.addEventListener("keyup", this.OnKeyUp);

            this.Editor.focus();
            this.Activate();
        };

        SingleNodeEditorPanel.prototype.DisableEditor = function (OldNodeView, OldWGSN) {
            var _this = this;
            this.App.EditDocument("todo", "test", function () {
                var Label = _this.LabelEditor.value;

                var OldModel = OldNodeView.Model;
                var Writer = new AssureNote.StringWriter();
                Writer.print("* ");
                Writer.print(AssureNote.WikiSyntax.FormatNodeType(OldModel.NodeType));
                Writer.print(OldModel.AssignedLabelNumber);
                if (Label && Label.length > 0) {
                    Writer.print(":");
                    Writer.print(Label);
                }
                Writer.print(" &");
                Writer.print(AssureNote.Lib.DecToHex(OldModel.UID));
                var Header = Writer.toString();

                var WGSN = Header + "\n" + _this.Editor.value;
                if (WGSN.length == 0) {
                    return false;
                }
                try  {
                    var Node = _this.App.MasterRecord.EditingDoc.GetNode(OldNodeView.Model.UID);
                    var NewNode;
                    NewNode = Node.ReplaceSubNodeWithText(WGSN, true, true);
                } catch (e) {
                    if (e.constructor.name == "SyntaxError" || e.constructor.name == "WGSNSyntaxError") {
                        AssureNote.AssureNoteUtils.Notify("Invalid WGSN is given");
                        return false;
                    }
                    throw e;
                }
                var Writer = new AssureNote.StringWriter();
                var WGSNChanged = (NewNode.FormatSubNode(1, Writer, true), Writer.toString().trim() != OldWGSN.trim());
                if (!NewNode || !WGSNChanged) {
                    return false;
                }
                _this.App.FullScreenEditorPanel.IsVisible = true; // Why?
            });

            this.App.SocketManager.Emit('finishedit', OldNodeView.Model.UID);
            $(this.Wrapper).animate({ opacity: 0 }, 300).hide(0);
            $("#editor-background").animate({ opacity: 0 }, 300).hide(0);

            this.Editor.removeEventListener("keyup", this.OnKeyUp);

            this.App.PictgramPanel.Activate();
        };

        SingleNodeEditorPanel.prototype.OnKeyDown = function (Event) {
            //this.Editor.focus();
            if (Event.keyCode == 27) {
                Event.stopPropagation();
                this.OnOutSideClicked();
            }
        };

        SingleNodeEditorPanel.prototype.DarkenBackGround = function () {
            return false;
        };
        return SingleNodeEditorPanel;
    })(AssureNote.Panel);
    AssureNote.SingleNodeEditorPanel = SingleNodeEditorPanel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Editor.js.map
