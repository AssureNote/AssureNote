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
    export class SingleNodeEditorCommand extends Command {
        constructor(App: AssureNote.AssureNoteApp) {
            super(App);
        }

        public GetCommandLineNames(): string[] {
            return ["singleedit"];
        }

        public GetHelpHTML(): string {
            return "<code>singleedit [label]</code><br>Open single node editor."
        }

        public Invoke(CommandName: string, Params: any[]) {
            var Label: string;
            if (Params.length < 1) {
                Label = this.App.MasterRecord.GetLatestDoc().TopNode.GetLabel();
            } else {
                Label = Params[0].toUpperCase();
            }
            var event = document.createEvent("UIEvents");
            var TargetView = this.App.PictgramPanel.ViewMap[Label];
            if (TargetView != null) {
                var Writer = new StringWriter();
                TargetView.Model.FormatSubNode(1, Writer, false);
                var Top = this.App.PictgramPanel.Viewport.PageYFromGY(TargetView.GetGY());
                var Left = this.App.PictgramPanel.Viewport.PageXFromGX(TargetView.GetGX());
                var Width = TargetView.GetShape().GetNodeWidth();
                var Height = Math.max(100, TargetView.GetShape().GetNodeHeight());
                this.App.SingleNodeEditorPanel.UpdateCSS({
                    position: "fixed",
                    top: Top,
                    left: Left,
                    width: Width,
                    height: Height,
                    background: "rgba(255, 255, 255, 1.00)",
                });
                this.App.SingleNodeEditorPanel.EnableEditor(Writer.toString().trim(), TargetView, false);
            } else {
                this.App.DebugP(Label + " not found.");
            }
        }
    }
    export class SingleNodeEditorPlugin extends Plugin {
        constructor(public App: AssureNoteApp) {
            super();
            this.SetHasMenuBarButton(true);
            this.SetHasEditor(true);

            this.App.RegistCommand(new SingleNodeEditorCommand(this.App));
        }

        CreateMenuBarButton(NodeView: NodeView): NodeMenuItem {
            return new NodeMenuItem("singlenodeeditor-id", "/images/pencil.png", "editor",
                (event: Event, TargetView: NodeView) => {
                    var Command = this.App.FindCommandByCommandLineName("SingleEdit");
                    if (Command) {
                        Command.Invoke(null, [TargetView.Label]);
                    }
            });
        }
    }
}

AssureNote.OnLoadPlugin((App: AssureNote.AssureNoteApp) => {
    App.PluginManager.SetPlugin("open-single", new AssureNote.SingleNodeEditorPlugin(App));
});
