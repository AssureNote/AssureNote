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
    export class Tooltip extends Panel{
        Tooltip: JQuery;
        CurrentView: NodeView;
        constructor(public AssureNoteApp: AssureNoteApp) {
            super(AssureNoteApp);
            this.Tooltip = null;
            this.CurrentView = null;
        }

        Enable() {
        }

        /**
        * Remove Tooltip from Content layer.
        * @param none
        */
        Remove() {
            this.Tooltip.remove();
            this.Tooltip = null;
            this.CurrentView = null;
            this.IsEnable = false;
        }

        Create(CurrentView: NodeView, ControlLayer: HTMLDivElement, Contents: HTMLLIElement[]): void {
            if (this.Tooltip != null) this.Remove();
            this.IsEnable = true;
            this.CurrentView = CurrentView;
            this.Tooltip = $('<div"></div>');
            var pre = $('<pre id="tooltip"></pre>');

            var ul: JQuery = $(document.createElement('ul'));
            ul.addClass('list-unstyled');
            for (var i = 0; i < Contents.length; i++) {
                ul.append(Contents[i]);
            }
            pre.append(ul);
            this.Tooltip.append(pre);
            this.Tooltip.appendTo(ControlLayer);

            var Top = this.CurrentView.GetGY() + this.CurrentView.Shape.GetNodeHeight() - this.Tooltip.height() / 2;
            var Left = this.CurrentView.GetGX() + this.CurrentView.Shape.GetNodeWidth() - this.Tooltip.width() + 10;
            this.Tooltip.css({
                position: 'absolute',
                top: Top,
                left: Left,
                display: 'block',
                opacity: 100
            });
        }
    }
}
