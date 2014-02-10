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
var AssureNote;
(function (AssureNote) {
    /**
    @class AssureNote.Panel
    */
    var Panel = (function () {
        function Panel(App) {
            /**
            @deprecated
            */
            this.IsVisible = false;
            this.App = App;
            if (!Panel.Initialized) {
                Panel.ActivePanel = this;
                document.addEventListener("keydown", function (Event) {
                    Panel.ActivePanel.OnKeyDown(Event);
                }, true);
                Panel.Initialized = true;
            }
        }
        Panel.prototype.Create = function (NodeView, ControlLayer, contents) {
            /* Do nothing */
        };

        Panel.prototype.OnKeyDown = function (Event) {
        };

        Panel.prototype.OnActivate = function () {
        };

        Panel.prototype.OnDeactivate = function () {
        };

        /**
        @deprecated
        */
        Panel.prototype.Remove = function () {
        };

        /**
        @deprecated
        */
        Panel.prototype.Show = function () {
            this.IsEnable = true;
        };

        /**
        @deprecated
        */
        Panel.prototype.Hide = function () {
            this.IsVisible = false;
        };

        Panel.prototype.Activate = function () {
            if (!this.IsActive()) {
                Panel.ActivePanel.OnDeactivate();
                Panel.ActivePanel = this;
                this.OnActivate();
            }
        };

        Panel.prototype.IsActive = function () {
            return Panel.ActivePanel == this;
        };
        Panel.Initialized = false;
        return Panel;
    })();
    AssureNote.Panel = Panel;
})(AssureNote || (AssureNote = {}));
//# sourceMappingURL=Panel.js.map
