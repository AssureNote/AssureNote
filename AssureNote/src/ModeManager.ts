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

///<reference path='../d.ts/jquery_plugins.d.ts'/>

module AssureNote {
    export class ModeManager {
        private Mode: AssureNoteMode;
        private WrapperElement: JQuery;
        private Input: HTMLInputElement;
        constructor(public App: AssureNoteApp, Mode: AssureNoteMode) {
            this.Mode = Mode;
            this.WrapperElement = $('.edit-mode');
            this.Input = document.createElement('input');
            this.Input.id = 'mode-switch';
            this.Input.setAttribute('type', 'checkbox');
            if (Mode == AssureNoteMode.Edit) {
                this.Input.setAttribute('checked', '');
            }
            this.Input.setAttribute('data-on-label', 'Edit');
            this.Input.setAttribute('data-off-label', 'View');

            this.Enable();
        }

        GetMode(): AssureNoteMode {
            return this.Mode;
        }

        SetMode(Mode: AssureNoteMode): void {
            this.Mode = Mode;
            if (Mode == AssureNoteMode.Edit) {
                this.Input.setAttribute('checked', '');
            } else {
                this.Input.removeAttribute('checked');
            }
        }

        ReadOnly(b: boolean) {
            if (b) {
                this.Input.setAttribute('disabled', '');
                this.Input.setAttribute('readonly', '');
                this.Input.className += 'disabled';
            } else {
                this.Input.removeAttribute('disabled');
                this.Input.removeAttribute('readonly');
                $(this.Input).removeClass('disabled');
            }
        }

        Disable(): void {
            $(this.WrapperElement.empty());
        }

        Enable(): void {
            $(this.Input).appendTo(this.WrapperElement.empty());
            $('#mode-switch').bootstrapSwitch();
            $('#mode-switch').bootstrapSwitch('setSizeClass', '')
                .on('switch-change', (e, ...data) => {
                    var value = data[0].value;
                    if (this.App.IsUserGuest() && value) {
                        AssureNoteUtils.Notify("Please login first");
                        this.SetMode(AssureNoteMode.View);
                        this.ReadOnly(true);
                    } else {
                        this.SetMode((value) ? AssureNoteMode.Edit : AssureNoteMode.View);
                        this.App.SocketManager.UpdateEditMode(this.Mode);
                    }
                });
            if (this.App.IsUserGuest()) {
                this.ReadOnly(true);
            }
        }
    }
}