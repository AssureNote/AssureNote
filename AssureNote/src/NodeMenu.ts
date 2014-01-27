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

///<reference path="./AssureNote.ts" />

module AssureNote {

    export class NodeMenuItem {
        constructor(public ElementId: string, public ImagePath: string, public Title: string, public EventHandler: (event: Event, NodeView: NodeView) => void) {
        }

        EnableEventHandler(MenuBar: NodeMenu) {
            MenuBar.Menu.append('<a href="#" ><img id="' + this.ElementId + '" src="' + Config.BASEPATH + this.ImagePath + '" title="' + this.Title + '" alt="' + this.Title + '" /></a>');
            $("#" + this.ElementId).click((event: Event) => {
                this.EventHandler(event, MenuBar.CurrentView);
                MenuBar.Remove();
            });
        }
    }

    export class NodeMenu extends Panel{
        Menu: JQuery;
        CurrentView: NodeView;
        IsEnable: boolean;

        constructor(public AssureNoteApp: AssureNoteApp) {
            super(AssureNoteApp);
            this.IsEnable = false;
        }

        private CreateButtons(Contents: NodeMenuItem[]): void {
            for (var i = 0; i < Contents.length; i++) {
                var Button = Contents[i];
                Button.EnableEventHandler(this);
            }
        }

        Create(CurrentView: NodeView, ControlLayer: HTMLDivElement, Contents: NodeMenuItem[]): void {
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            $('#menu').remove();
            this.Menu = $('<div id="menu" style="display: none;"></div>');
            this.Menu.appendTo(ControlLayer);
            this.CreateButtons(Contents);

            var refresh = () => {
                AssureNoteApp.Assert(this.CurrentView != null);
                var Node = this.CurrentView;
                var Top = Node.GetGY() + Node.Shape.GetNodeHeight() + 5;
                var Left = Node.GetGX() + (Node.Shape.GetNodeWidth() - this.Menu.width()) / 2;
                this.Menu.css({ position: 'absolute', top: Top, left: Left, display: 'block', opacity: 0 });
            };

            (<any>this.Menu).jqDock({
                align: 'bottom',
                idle: 1500,
                size: 45,
                distance: 60,
                labels: 'tc',
                duration: 200,
                fadeIn: 200,
                source: function () { return this.src.replace(/(jpg|gif)$/, 'png'); },
                onReady: refresh,
            });
        }

        Remove(): void {
            this.Menu.remove();
            this.Menu = null;
            this.CurrentView = null;
            this.IsEnable = false;
        }

    }
}
