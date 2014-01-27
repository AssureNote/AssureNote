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
///<reference path='d.ts/jquery.d.ts'/>
///<reference path='src/AssureNote.ts'/>
///<reference path='src/AssureNoteParser.ts'/>
///<reference path='src/Panel.ts'/>
///<reference path='src/LayoutEngine.ts'/>
///<reference path='src/Viewport.ts'/>
///<reference path='plugin/FoldingViewSwitch/FoldingViewSwitch.ts'/>
///<reference path='plugin/FullScreenEditor/FullScreenEditor.ts'/>
///<reference path='plugin/MessageChat/MessageChat.ts'/>
///<reference path='plugin/VariableInterpolation/VariableInterpolation.ts'/>
///<reference path='plugin/ToDo/ToDo.ts'/>
var Debug = {};

$(function () {
    //Browser detection
    if (AssureNote.AssureNoteUtils.UserAgant.IsTrident() || AssureNote.AssureNoteUtils.UserAgant.IsPresto() || AssureNote.AssureNoteUtils.UserAgant.IsTouchDevice()) {
        alert('Not supported browser. Use Chrome/Safari/FireFox.');
        return;
    }

    //safari does not support window.performance
    if (window.performance == null) {
        window.performance = {};
        if (window.performance.now == null) {
            window.performance.now = function () {
                return Date.now();
            };
        }
    }
    var App = new AssureNote.AssureNoteApp();
    Debug.AssureNote = App;
    Debug.ShowCameraInfo = function () {
        setInterval(function () {
            var p = Debug.AssureNote.PictgramPanel.Viewport;
            var x = p.GetCameraGX();
            var y = p.GetCameraGY();
            var s = p.GetCameraScale();
            document.title = ["(", ~~x, ", ", ~~y, ") ", ~~(s * 100), "%"].join("");
        }, 100);
    };

    Debug.ShowFocusedLabel = function () {
        setInterval(function () {
            var p = Debug.AssureNote.PictgramPanel;
            document.title = p.FocusedLabel || "(not selected)";
        }, 100);
    };

    App.LoadDefaultWGSN();
    document.documentElement.scrollTop = 0;
    window.addEventListener('hashchange', function (ev) {
        document.documentElement.scrollTop = 0;
    });
});
//# sourceMappingURL=index.js.map
