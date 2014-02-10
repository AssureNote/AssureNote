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

///<reference path='./AssureNote.ts'/>
///<reference path='./AssureNoteUtils.ts'/>

module AssureNote {

    /**
        @class AssureNote.Panel
    */
    export class Panel {
        private static ActivePanel: Panel;
        private static Initialized: boolean = false;
        /**
            @deprecated
        */
        IsVisible = false;
        /**
            @deprecated
        */
        IsEnable: boolean;
        public App: AssureNoteApp;
        constructor(App: AssureNoteApp) {
            this.App = App;
            if (!Panel.Initialized) {
                Panel.ActivePanel = this;
                document.addEventListener("keydown", (Event: KeyboardEvent) => {
                    Panel.ActivePanel.OnKeyDown(Event);
                }, true);
                Panel.Initialized = true;
            }
        }

        Create(NodeView: NodeView, ControlLayer: HTMLDivElement, contents: any) {
            /* Do nothing */
        }

        OnKeyDown(Event: KeyboardEvent): void {
        }

        OnActivate(): void {
        }

        OnDeactivate(): void {
        }

        /**
            @deprecated
        */
        Remove(): void {
        }

        /**
            @deprecated
        */
        Show(): void {
            this.IsEnable = true;
        }

        /**
            @deprecated
        */
        Hide(): void {
            this.IsVisible = false;
        }

        Activate(): void {
            if (!this.IsActive()) {
                Panel.ActivePanel.OnDeactivate();
                Panel.ActivePanel = this;
                this.OnActivate();
            }
        }

        IsActive(): boolean {
            return Panel.ActivePanel == this;
        }
    }
}
