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
var AssureNote;
(function (AssureNote) {
    var ModeManager = (function () {
        function ModeManager(App, Mode) {
            this.App = App;
            this.Mode = Mode;
            this.WrapperElement = $('.edit-mode');
            this.Input = document.createElement('input');
            this.Input.id = 'mode-switch';
            this.Input.setAttribute('type', 'checkbox');
            if (Mode == 0 /* Edit */) {
                this.Input.setAttribute('checked', '');
            }
            this.Input.setAttribute('data-on-text', 'Edit');
            this.Input.setAttribute('data-off-text', 'View');

            this.Enable();
        }
        ModeManager.prototype.GetMode = function () {
            return this.Mode;
        };

        ModeManager.prototype.ChangeMode = function (Mode) {
            if (this.Mode != Mode) {
                $('#mode-switch').bootstrapSwitch('state', Mode == 0 /* Edit */);
                this.SetMode(Mode);
            }
        };

        ModeManager.prototype.SetMode = function (Mode) {
            if (this.Mode != Mode) {
                this.Mode = Mode;
                this.App.TopMenu.Update();
                this.App.TopMenuRight.Update();
                this.App.SocketManager.UpdateEditMode(this.Mode);
            }
        };

        ModeManager.prototype.SetReadOnly = function (b) {
            $('#mode-switch').bootstrapSwitch('disabled', b).bootstrapSwitch('readonly', b);
        };

        ModeManager.prototype.Disable = function () {
            $(this.WrapperElement.empty());
        };

        ModeManager.prototype.Enable = function () {
            var _this = this;
            $(this.Input).appendTo(this.WrapperElement.empty());
            $('#mode-switch').bootstrapSwitch().on('switchChange.bootstrapSwitch', function (e, state) {
                if (!_this.App.IsOfflineVersion() && _this.App.IsUserGuest() && state) {
                    AssureNote.AssureNoteUtils.Notify("Please login first");
                    _this.SetMode(1 /* View */);
                    _this.SetReadOnly(true);
                } else {
                    _this.SetMode(state ? 0 /* Edit */ : 1 /* View */);
                }
            });
            if (!this.App.IsOfflineVersion() && this.App.IsUserGuest()) {
                this.SetReadOnly(true);
            }
        };
        return ModeManager;
    })();
    AssureNote.ModeManager = ModeManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=ModeManager.js.map
