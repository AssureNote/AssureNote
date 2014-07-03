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
            this.Input.setAttribute('data-on-label', 'Edit');
            this.Input.setAttribute('data-off-label', 'View');

            this.Enable();
        }
        ModeManager.prototype.GetMode = function () {
            return this.Mode;
        };

        ModeManager.prototype.SetMode = function (Mode) {
            this.Mode = Mode;
            if (Mode == 0 /* Edit */) {
                this.Input.setAttribute('checked', '');
            } else {
                this.Input.removeAttribute('checked');
            }
        };

        ModeManager.prototype.ReadOnly = function (b) {
            if (b) {
                this.Input.setAttribute('disabled', '');
                this.Input.setAttribute('readonly', '');
                this.Input.className += 'disabled';
            } else {
                this.Input.removeAttribute('disabled');
                this.Input.removeAttribute('readonly');
                $(this.Input).removeClass('disabled');
            }
        };

        ModeManager.prototype.Disable = function () {
            $(this.WrapperElement.empty());
        };

        ModeManager.prototype.Enable = function () {
            var _this = this;
            $(this.Input).appendTo(this.WrapperElement.empty());
            $('#mode-switch').bootstrapSwitch();
            $('#mode-switch').bootstrapSwitch('setSizeClass', '').on('switch-change', function (e) {
                var data = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    data[_i] = arguments[_i + 1];
                }
                var value = data[0].value;
                if (_this.App.IsUserGuest() && value) {
                    AssureNote.AssureNoteUtils.Notify("Please login first");
                    _this.SetMode(1 /* View */);
                    _this.ReadOnly(true);
                } else {
                    _this.SetMode((value) ? 0 /* Edit */ : 1 /* View */);
                    _this.App.SocketManager.UpdateEditMode(_this.Mode);
                }
            });
            if (this.App.IsUserGuest()) {
                this.ReadOnly(true);
            }
        };
        return ModeManager;
    })();
    AssureNote.ModeManager = ModeManager;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=ModeManager.js.map
